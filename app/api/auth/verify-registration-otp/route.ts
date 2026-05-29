// app/api/auth/verify-registration-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { verifyOtp as verifyTwilioOtp } from "@/lib/twilio";

export async function POST(req: NextRequest) {
  try {
    const { email, phone, otp, channel = "email" } = await req.json();

    if (!otp) {
      return NextResponse.json(
        { error: "OTP code is required" },
        { status: 400 },
      );
    }

    if (channel === "email" && !email) {
      return NextResponse.json(
        { error: "Email is required for email verification" },
        { status: 400 },
      );
    }

    if ((channel === "sms" || channel === "whatsapp") && !phone) {
      return NextResponse.json(
        { error: "Phone number is required for phone verification" },
        { status: 400 },
      );
    }

    const otpRecord = await prisma.verificationOTP.findFirst({
      where: {
        type: "registration",
        used: false,
        expiresAt: { gt: new Date() },
        ...(email ? { email } : {}),
        ...(phone ? { phone } : {}),
      },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 },
      );
    }

    if (channel === "email") {
      if (otpRecord.code !== otp) {
        return NextResponse.json(
          { error: "Invalid or expired OTP" },
          { status: 400 },
        );
      }
    } else if (channel === "sms" || channel === "whatsapp") {
      const verifyResult = await verifyTwilioOtp(phone as string, otp);
      if (verifyResult.status !== "approved") {
        return NextResponse.json(
          { error: "Invalid or expired OTP" },
          { status: 400 },
        );
      }
    } else {
      return NextResponse.json(
        { error: "Unsupported verification channel" },
        { status: 400 },
      );
    }

    const data = otpRecord.data as any;
    if (!data) {
      return NextResponse.json(
        { error: "Registration data not found" },
        { status: 400 },
      );
    }

    const hashed = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: data.name || null,
        email: data.email,
        password: hashed,
        phone: data.phone || null,
        country: data.country || null,
        role: data.role || ["USER"],
        image: data.image || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        country: true,
        image: true,
        createdAt: true,
      },
    });

    await prisma.verificationOTP.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    const cookieHeader = req.headers.get("cookie") || "";
    const refMatch = cookieHeader.match(/(?:^|;\s*)ref=([^;]+)/);
    const refCode = refMatch ? decodeURIComponent(refMatch[1]) : null;

    if (refCode) {
      try {
        const affiliate = await prisma.affiliate.findUnique({
          where: { code: refCode, active: true },
        });

        if (affiliate && affiliate.userId !== user.id) {
          await prisma.affiliateReferral.create({
            data: {
              affiliateId: affiliate.id,
              referredUserId: user.id,
              status: "PENDING",
            },
          });

          await prisma.affiliate.update({
            where: { id: affiliate.id },
            data: { totalReferrals: { increment: 1 } },
          });

          console.log(
            `✅ Referral created: user ${user.id} referred by affiliate ${affiliate.code}`,
          );
        }
      } catch (refErr) {
        console.error("⚠️ Referral tracking failed (non-fatal):", refErr);
      }
    }

    console.log("✅ User created via OTP:", user);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("❌ [POST /api/auth/verify-registration-otp]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
