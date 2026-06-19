// lib/rateLimiter.ts
// Rate limiting for OTP sends using the existing VerificationOTP table.
// No extra packages or Redis needed.

import { prisma } from "@/lib/prisma";

interface RateLimitOptions {
  /** identifier: phone number or email */
  identifier: string;
  /** max sends allowed within the window */
  maxRequests?: number;
  /** window in minutes */
  windowMinutes?: number;
}

interface RateLimitResult {
  limited: boolean;
  remaining: number;
  retryAfterMinutes?: number;
}

export async function checkOtpRateLimit({
  identifier,
  maxRequests = 3,
  windowMinutes = 10,
}: RateLimitOptions): Promise<RateLimitResult> {
  const since = new Date(Date.now() - windowMinutes * 60 * 1000);

  const recentCount = await prisma.verificationOTP.count({
    where: {
      OR: [{ email: identifier }, { phone: identifier }],
      type: "registration",
      createdAt: { gte: since },
    },
  });

  const remaining = Math.max(0, maxRequests - recentCount);
  const limited = recentCount >= maxRequests;

  return {
    limited,
    remaining,
    retryAfterMinutes: limited ? windowMinutes : undefined,
  };
}
