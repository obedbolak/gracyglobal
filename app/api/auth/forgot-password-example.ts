// Example API route for sending forgot password OTP email
// app/api/auth/forgot-password-example.ts

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/api";
import { sendForgotPasswordOTPEmail, generateOTP } from "@/lib/emailService";

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
      // Don't reveal if email exists for security
      return ok({ message: "If email exists, OTP has been sent" });
    }

    // Generate OTP
    const otp = generateOTP(6);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store OTP in database - create a PasswordResetOTP table or similar:
    // await prisma.passwordResetOTP.create({
    //   data: {
    //     userId: user.id,
    //     code: otp,
    //     expiresAt,
    //     used: false,
    //   },
    // });

    // Send email
    const emailSent = await sendForgotPasswordOTPEmail(
      email,
      otp,
      user.name || undefined,
    );

    if (!emailSent) {
      return err("Failed to send password reset email");
    }

    return ok({
      message: "Password reset OTP sent to email",
      expiresIn: "15 minutes",
    });
  } catch (error) {
    console.error("[POST /api/auth/forgot-password]", error);
    return err("Internal server error", 500);
  }
}
