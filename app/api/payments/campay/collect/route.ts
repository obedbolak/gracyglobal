import { NextRequest, NextResponse } from "next/server";
import { initiateCollection, formatPhoneNumber } from "@/lib/campay";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      amount,
      phone,
      description,
      externalReference,
      orderId,
      subscriptionId,
    } = await req.json();

    if (!amount || !phone || !description) {
      return NextResponse.json(
        { error: "amount, phone, and description are required" },
        { status: 400 },
      );
    }

    const isDemoMode = process.env.CAMPAY_ENV !== "PROD";
    const minAmount = isDemoMode ? 5 : 100;
    const maxAmount = isDemoMode ? 25 : 10000000;

    if (amount < minAmount) {
      return NextResponse.json(
        {
          error: `Amount must be at least ${minAmount} XAF${isDemoMode ? " (Demo Mode)" : ""}`,
          isDemoMode,
          limits: { min: minAmount, max: maxAmount },
        },
        { status: 400 },
      );
    }

    if (amount > maxAmount) {
      return NextResponse.json(
        {
          error: `Amount exceeds maximum of ${maxAmount} XAF${isDemoMode ? " (Demo Mode)" : ""}`,
          isDemoMode,
          limits: { min: minAmount, max: maxAmount },
        },
        { status: 400 },
      );
    }

    let formattedPhone: string;
    try {
      formattedPhone = formatPhoneNumber(phone);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log("📱 Initiating payment:", {
      amount,
      phone: formattedPhone,
      description,
      externalReference,
      userId: session.user.id,
      environment: isDemoMode ? "DEMO" : "PRODUCTION",
    });

    const result = await initiateCollection({
      amount: parseInt(amount),
      from: formattedPhone,
      description,
      externalReference: externalReference || `pay_${Date.now()}`,
    });

    console.log("✅ CamPay response:", result);

    // ✅ was: prisma.subscriptionPayment → prisma.payment
    // ✅ added: userId (required field)
    // ✅ fixed: method "MOBILE_MONEY" → "MOBILE_MONEY_MTN" (must match PaymentMethod enum)
    // ✅ added: description (good practice, optional but in schema)
    if (subscriptionId) {
      await prisma.payment.create({
        data: {
          userId: session.user.id,
          subscriptionId,
          amount: parseInt(amount),
          method: "MOBILE_MONEY_MTN", // ⚠️ or MOBILE_MONEY_ORANGE — detect from phone if needed
          reference: result.reference,
          status: "PENDING",
          description,
        },
      });
      console.log(`💾 Payment record created: ${result.reference}`);
    }

    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "PENDING" },
      });
      console.log(`📦 Order ${orderId} marked as PENDING`);
    }

    return NextResponse.json({
      success: true,
      reference: result.reference,
      ussdCode: result.ussd_code,
      operator: result.operator,
      message: "Payment initiated. Please complete on your phone.",
      isDemoMode,
    });
  } catch (err: any) {
    console.error("❌ CamPay collect error:", err);
    return NextResponse.json(
      {
        error: err.message || "Payment initiation failed",
        details: err.toString(),
      },
      { status: 500 },
    );
  }
}
