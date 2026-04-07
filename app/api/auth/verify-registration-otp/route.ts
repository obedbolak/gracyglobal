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

    // Get data
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
