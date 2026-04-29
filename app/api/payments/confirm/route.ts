// app/api/payments/confirm/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST /api/payments/confirm
// Called after successful CamPay collection to update subscription status
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    const { subscriptionId, paymentReference, status } = await req.json();

    if (!subscriptionId || !paymentReference) {
      return NextResponse.json(
        {
          success: false,
          error: "subscriptionId and paymentReference are required",
        },
        { status: 400 },
      );
    }

    const subscription = await prisma.userSubscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: "Subscription not found" },
        { status: 404 },
      );
    }

    if (subscription.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    // Update subscription + payment in a transaction
    const updated = await prisma.$transaction(async (tx) => {
      const sub = await tx.userSubscription.update({
        where: { id: subscriptionId },
        data: { status: "ACTIVE" },
        include: { plan: true },
      });

      const payment = await tx.payment.updateMany({
        where: {
          subscriptionId,
          reference: paymentReference,
        },
        data: { status: "PAID" },
      });

      return sub;
    });

    // ── Affiliate commission handling ────────────────────────────────────────
    try {
      // Check if this user was referred by an affiliate
      const referral = await prisma.affiliateReferral.findUnique({
        where: { referredUserId: user.id },
        include: { affiliate: true },
      });

      if (referral) {
        // Find the payment record we just marked PAID
        const payment = await prisma.payment.findFirst({
          where: {
            subscriptionId,
            reference: paymentReference,
            status: "PAID",
          },
        });

        if (payment) {
          const commissionAmount = Math.floor(
            payment.amount * referral.affiliate.commissionRate,
          );

          // Create commission record (idempotent — paymentId is @unique)
          await prisma.affiliateCommission.create({
            data: {
              affiliateId: referral.affiliateId,
              referralId: referral.id,
              paymentId: payment.id,
              amount: commissionAmount,
              status: "PENDING",
            },
          });

          // Mark referral as CONVERTED on first payment
          if (referral.status === "PENDING") {
            await prisma.affiliateReferral.update({
              where: { id: referral.id },
              data: { status: "CONVERTED", convertedAt: new Date() },
            });
          }

          // Add to affiliate's pending payout balance
          await prisma.affiliate.update({
            where: { id: referral.affiliateId },
            data: {
              totalEarnings: { increment: commissionAmount },
              pendingPayout: { increment: commissionAmount },
            },
          });

          console.log(
            `✅ Commission created: ${commissionAmount} XAF for affiliate ${referral.affiliate.code}`,
          );
        }
      }
    } catch (commissionErr) {
      // Don't fail the payment confirmation if commission tracking fails
      console.error(
        "⚠️ Commission creation failed (non-fatal):",
        commissionErr,
      );
    }
    // ────────────────────────────────────────────────────────────────────────

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Subscription activated successfully!",
    });
  } catch (error) {
    console.error("Error confirming payment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to confirm payment" },
      { status: 500 },
    );
  }
}
