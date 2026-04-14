import { NextRequest, NextResponse } from "next/server";
import { getTransactionStatus } from "@/lib/campay";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { reference: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reference } = params;

    if (!reference) {
      return NextResponse.json(
        { error: "Reference is required" },
        { status: 400 },
      );
    }

    console.log(`🔍 Checking status for reference: ${reference}`);

    // Get transaction status from CamPay
    const result = await getTransactionStatus(reference);

    console.log(`📊 Transaction status:`, result);

    // Update database based on status
    if (result.status === "SUCCESSFUL") {
      console.log(`✅ Payment successful: ${reference}`);

      // Update subscription payment if exists
      const payment = await prisma.subscriptionPayment.findFirst({
        where: { reference },
        include: { subscription: true },
      });

      if (payment && payment.status !== "PAID") {
        // Update payment status
        await prisma.subscriptionPayment.update({
          where: { id: payment.id },
          data: {
            status: "PAID",
            paidAt: new Date(),
          },
        });

        // Update subscription to ACTIVE
        await prisma.subscription.update({
          where: { id: payment.subscriptionId },
          data: {
            status: "ACTIVE",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
          },
        });

        console.log(`💳 Subscription payment updated: ${payment.id}`);
      }

      // Check if this is an order payment (using external_reference)
      if (result.external_reference) {
        const order = await prisma.order.findFirst({
          where: {
            OR: [
              { id: result.external_reference },
              // Match if external_reference contains order ID
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

      // Update payment as failed
      const payment = await prisma.subscriptionPayment.findFirst({
        where: { reference },
      });

      if (payment && payment.status !== "FAILED") {
        await prisma.subscriptionPayment.update({
          where: { id: payment.id },
          data: { status: "FAILED" },
        });
        console.log(`💔 Payment marked as FAILED: ${payment.id}`);
      }

      // Update order as cancelled if failed
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
      {
        error: err.message || "Status check failed",
        details: err.toString(),
      },
      { status: 500 },
    );
  }
}
