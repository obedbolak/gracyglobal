// Example API route for sending successful registration email
// app/api/auth/register-welcome-example.ts

import { NextRequest } from "next/server";
import { ok, err } from "@/lib/api";
import { sendSuccessfulRegistrationEmail } from "@/lib/emailService";

// This would be called after successful user registration
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, userName } = body;

    if (!email || !userName) {
      return err("Email and name are required");
    }

    // Send welcome email
    const emailSent = await sendSuccessfulRegistrationEmail(email, userName);

    if (!emailSent) {
      console.warn("Failed to send welcome email, but registration succeeded");
      // Don't fail registration if email fails
    }

    return ok({
      message: "Welcome email sent",
      email,
    });
  } catch (error) {
    console.error("[POST /api/auth/register-welcome]", error);
    return err("Internal server error", 500);
  }
}
