// app/api/auth/send-registration-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOTP, sendOTPVerificationEmail } from "@/lib/emailService";
import { sendOtp as sendTwilioOtp } from "@/lib/twilio";
import { checkOtpRateLimit } from "@/lib/rateLimiter";

export async function POST(req: NextRequest) {
  try {
    const {
      name,
      email,
      password,
      phone,
      country,
      role,
      image,
      channel = "email",
    } = await req.json();

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    if (channel === "email") {
      if (!email) {
        return NextResponse.json(
          { error: "Email is required for email registration" },
          { status: 400 },
        );
      }
    } else if (channel === "sms" || channel === "whatsapp") {
      if (!phone) {
        return NextResponse.json(
          { error: "Phone number is required for phone registration" },
          { status: 400 },
        );
      }
    } else {
      return NextResponse.json(
        { error: "Unsupported verification channel" },
        { status: 400 },
      );
    }

    let existingUser = null;
    if (email) {
      existingUser = await prisma.user.findUnique({ where: { email } });
    }
    if (!existingUser && phone) {
      existingUser = await prisma.user.findFirst({ where: { phone } });
    }

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email or phone already exists" },
        { status: 409 },
      );
    }

    await prisma.verificationOTP.deleteMany({
      where: {
        type: "registration",
        used: false,
        ...(email ? { email } : {}),
        ...(phone ? { phone } : {}),
      },
    });

    // ── Rate limit: max 3 sends per 10 minutes per identifier ──
    const identifier = phone ?? email ?? "";
    const { limited, retryAfterMinutes } = await checkOtpRateLimit({
      identifier,
      maxRequests: 3,
      windowMinutes: 10,
    });

    if (limited) {
      return NextResponse.json(
        {
          error: `Too many OTP requests. Please wait ${retryAfterMinutes} minutes before trying again.`,
        },
        { status: 429 },
      );
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const registrationData = {
      name,
      email: email ?? phone,
      password,
      ...(phone && { phone }),
      ...(country && { country }),
      ...(role && { role }),
      ...(image && { image }),
      channel,
    };

    await prisma.verificationOTP.create({
      data: {
        email: email ?? phone ?? null,
        phone: phone ?? null,
        code: otp,
        type: "registration",
        data: registrationData,
        expiresAt,
      },
    });

    if (channel === "email") {
      const emailSent = await sendOTPVerificationEmail(
        email as string,
        otp,
        name,
      );
      if (!emailSent) {
        console.error("Failed to send OTP email to", email);
      }
      return NextResponse.json({ message: "OTP sent to your email" });
    }

    await sendTwilioOtp(phone as string, channel);
    return NextResponse.json({
      message: `OTP sent to your phone via ${channel === "sms" ? "SMS" : "WhatsApp"}`,
    });
  } catch (error) {
    console.error("❌ [POST /api/auth/send-registration-otp]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
