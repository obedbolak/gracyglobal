// app/api/auth/send-registration-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOTP, sendOTPVerificationEmail } from "@/lib/emailService";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone, country, role, image } =
      await req.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    // Delete any existing unused registration OTP for this email
    await prisma.verificationOTP.deleteMany({
      where: { email, type: "registration", used: false },
    });

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store OTP with data
    const registrationData = {
      name,
      email,
      password,
      ...(phone && { phone }),
      ...(country && { country }),
      ...(role && { role }),
      ...(image && { image }),
    };
    await prisma.verificationOTP.create({
      data: {
        email,
        code: otp,
        type: "registration",
        data: registrationData,
        expiresAt,
      },
    });

    // Send OTP email
    const emailSent = await sendOTPVerificationEmail(email, otp, name);
    if (!emailSent) {
      console.error("Failed to send OTP email to", email);
      // For now, don't fail the request, just log
      // return NextResponse.json(
      //   { error: "Failed to send OTP email" },
      //   { status: 500 },
      // );
    }

    return NextResponse.json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("❌ [POST /api/auth/send-registration-otp]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
