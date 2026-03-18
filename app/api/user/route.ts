// app/api/user/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireUser, validateEmail } from "@/lib/api";

// ── GET /api/user — get current user's full profile ───────────────────────────
export async function GET() {
  try {
    const user = await requireUser();
    if (!user) return err("Unauthorized", 401);

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        country: true,
        phone: true,
        createdAt: true,
        emailVerified: true,
        counselorProfile: {
          select: {
            id: true,
            specialty: true,
            rating: true,
            reviews: true,
            pricePerHour: true,
            available: true,
            verified: true,
          },
        },
        affiliate: {
          select: {
            id: true,
            code: true,
            tier: true,
            totalReferrals: true,
            totalEarnings: true,
            pendingPayout: true,
          },
        },
        _count: {
          select: {
            bookings: true,
            orders: true,
            communityPosts: true,
            jobApplications: true,
          },
        },
      },
    });

    if (!profile) return err("User not found", 404);
    return ok(profile);
  } catch (e) {
    console.error("[GET /api/user]", e);
    return err("Internal server error", 500);
  }
}

// ── PATCH /api/user — update profile ─────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    const user = await requireUser();
    if (!user) return err("Unauthorized", 401);

    const body = await req.json();
    const { name, phone, country, image } = body;

    // Validate fields that were provided
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length < 2) {
        return err("Name must be at least 2 characters");
      }
    }
    if (phone !== undefined && phone !== null) {
      if (typeof phone !== "string" || !/^\+?[\d\s\-()]{7,20}$/.test(phone)) {
        return err("Invalid phone number format");
      }
    }
    if (country !== undefined && typeof country !== "string") {
      return err("Country must be a string");
    }
    if (image !== undefined && image !== null) {
      if (typeof image !== "string" || !image.startsWith("http")) {
        return err("Image must be a valid URL");
      }
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(country !== undefined ? { country } : {}),
        ...(image !== undefined ? { image } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        country: true,
        phone: true,
        updatedAt: true,
      },
    });

    return ok(updated);
  } catch (e) {
    console.error("[PATCH /api/user]", e);
    return err("Internal server error", 500);
  }
}
