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

    // Find the subscription
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

    // Update subscription status to ACTIVE
    const updated = await prisma.$transaction(async (tx) => {
      // Update subscription to ACTIVE
      const sub = await tx.userSubscription.update({
        where: { id: subscriptionId },
        data: {
          status: "ACTIVE",
        },
        include: { plan: true },
      });

      // Update payment status
      await tx.payment.updateMany({
        where: {
          subscriptionId: subscriptionId,
          reference: paymentReference,
        },
        data: {
          status: "PAID",
        },
      });

      return sub;
    });

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
