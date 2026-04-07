// Example API route for sending OTP verification email
// app/api/auth/send-otp/route.ts

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/api";
import { sendOTPVerificationEmail, generateOTP } from "@/lib/emailService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return err("Email is required");
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return err("User not found", 404);
    }

    // Generate OTP
    const otp = generateOTP(6);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database (you need to add this to your User model)
    // For now, this is a placeholder - extend your User model with:
    // otp: String? @default(null)
    // otpExpiresAt: DateTime?
    // otpVerified: Boolean @default(false)

    // Updated: Store in a separate OTP table if you prefer
    // await prisma.otp.create({
    //   data: {
    //     userId: user.id,
    //     code: otp,
    //     expiresAt,
    //     type: "VERIFICATION",
    //   },
    // });

    // Send email
    const emailSent = await sendOTPVerificationEmail(
      email,
      otp,
      user.name || undefined,
    );

    if (!emailSent) {
      return err("Failed to send OTP email");
    }

    return ok({ message: "OTP sent to email", expiresIn: "10 minutes" });
  } catch (error) {
    console.error("[POST /api/auth/send-otp]", error);
    return err("Internal server error", 500);
  }
}
