// app/api/user/route.ts
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ok, err, requireUser } from "@/lib/api";

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
            bio: true,
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

        paymentMethods: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            method: true,
            label: true,
            details: true,
            isDefault: true,
            createdAt: true,
          },
        },

        // ✅ Updated: was `subscription` (singular), now `subscriptions` (array)
        subscriptions: {
          where: { status: "ACTIVE" }, // only return active ones
          select: {
            id: true,
            status: true,
            currentPeriodStart: true,
            currentPeriodEnd: true,
            cancelAtPeriodEnd: true,
            sessionsUsed: true,
            leadsUsed: true,
            productsUsed: true,
            coursesUsed: true,
            plan: {
              select: {
                id: true,
                planCode: true,
                name: true,
                category: true,
                price: true,
                interval: true,
                features: true,
                commissionRate: true,
                productLimit: true,
                leadLimit: true,
                courseLimit: true,
              },
            },
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

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireUser();
    if (!user) return err("Unauthorized", 401);

    const body = await req.json();
    const { name, phone, country, image, password } = body;

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

    if (password !== undefined && password !== null) {
      if (typeof password !== "string" || password.length < 8) {
        return err("Password must be at least 8 characters");
      }
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(country !== undefined ? { country } : {}),
        ...(image !== undefined ? { image } : {}),
        ...(password !== undefined
          ? { password: await bcrypt.hash(password, 12) }
          : {}),
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
