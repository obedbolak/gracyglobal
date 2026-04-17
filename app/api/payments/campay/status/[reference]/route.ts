import { NextRequest, NextResponse } from "next/server";
import { getTransactionStatus } from "@/lib/campay";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ reference: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reference } = await params;
    if (!reference) {
      return NextResponse.json(
        { error: "Reference is required" },
        { status: 400 },
      );
    }

    console.log(`🔍 Checking status for reference: ${reference}`);
    const result = await getTransactionStatus(reference);
    console.log(`📊 Transaction status:`, result);

    if (result.status === "SUCCESSFUL") {
      console.log(`✅ Payment successful: ${reference}`);

      // ✅ was: prisma.subscriptionPayment → correct model is prisma.payment
      const payment = await prisma.payment.findFirst({
        where: { reference },
        include: { subscription: true },
      });

      if (payment && payment.status !== "PAID") {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: "PAID", paidAt: new Date() },
        });

        // ✅ was: prisma.subscription → correct model is prisma.userSubscription
        await prisma.userSubscription.update({
          where: { id: payment.subscriptionId! },
          data: {
            status: "ACTIVE",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });

        console.log(`💳 Subscription payment updated: ${payment.id}`);
      }

      if (result.external_reference) {
        const order = await prisma.order.findFirst({
          where: {
            OR: [
              { id: result.external_reference },
              {
                id: {
                  contains: result.external_reference.replace("order_", ""),
                },
              },
            ],
          },
        });

        if (order && order.status !== "PAID") {
          await prisma.order.update({
            where: { id: order.id },
            data: { status: "PAID" },
          });
          console.log(`📦 Order marked as PAID: ${order.id}`);
        }
      }
    } else if (result.status === "FAILED") {
      console.log(`❌ Payment failed: ${reference}`);

      // ✅ was: prisma.subscriptionPayment → correct model is prisma.payment
      const payment = await prisma.payment.findFirst({
        where: { reference },
      });

      if (payment && payment.status !== "FAILED") {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: "FAILED" },
        });
        console.log(`💔 Payment marked as FAILED: ${payment.id}`);
      }

      if (result.external_reference) {
        const order = await prisma.order.findFirst({
          where: { id: result.external_reference },
        });

        if (order && order.status === "PENDING") {
          await prisma.order.update({
            where: { id: order.id },
            data: { status: "CANCELLED" },
          });
        }
      }
    }

    return NextResponse.json({
      status: result.status,
      amount: result.amount,
      reference: result.reference,
      externalReference: result.external_reference,
      operator: result.operator,
      date: result.date,
    });
  } catch (err: any) {
    console.error("❌ Status check error:", err);
    return NextResponse.json(
      { error: err.message || "Status check failed", details: err.toString() },
      { status: 500 },
    );
  }
}
