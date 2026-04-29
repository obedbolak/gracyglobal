// app/api/auth/verify-registration-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 },
      );
    }

    // Find the OTP
    const otpRecord = await prisma.verificationOTP.findFirst({
      where: {
        email,
        type: "registration",
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otpRecord || otpRecord.code !== otp) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
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

    // Hash password
    const hashed = await bcrypt.hash(data.password, 12);

    // Create user
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

    // Mark OTP as used
    await prisma.verificationOTP.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    // ── Affiliate referral handling ─────────────────────────────────────────
    // Read the ref cookie from the request headers
    const cookieHeader = req.headers.get("cookie") || "";
    const refMatch = cookieHeader.match(/(?:^|;\s*)ref=([^;]+)/);
    const refCode = refMatch ? decodeURIComponent(refMatch[1]) : null;

    if (refCode) {
      try {
        const affiliate = await prisma.affiliate.findUnique({
          where: { code: refCode, active: true },
        });

        if (affiliate && affiliate.userId !== user.id) {
          // Create the referral record
          await prisma.affiliateReferral.create({
            data: {
              affiliateId: affiliate.id,
              referredUserId: user.id,
              status: "PENDING", // becomes CONVERTED on first payment
            },
          });

          // Bump totalReferrals counter
          await prisma.affiliate.update({
            where: { id: affiliate.id },
            data: { totalReferrals: { increment: 1 } },
          });

          console.log(
            `✅ Referral created: user ${user.id} referred by affiliate ${affiliate.code}`,
          );
        }
      } catch (refErr) {
        // Don't fail registration if referral tracking fails
        console.error("⚠️ Referral tracking failed (non-fatal):", refErr);
      }
    }
    // ───────────────────────────────────────────────────────────────────────

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
