// app/api/counselors/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasRole } from "@/lib/roleHelpers";

// GET - List counselors OR get own profile (via ?me=true)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const me = searchParams.get("me");
    const dashboard = searchParams.get("dashboard");

    // ── Counselor's own profile ────────────────────────────────────────
    if (me === "true") {
      const session = await getServerSession(authOptions);
      if (!session?.user || !hasRole(session.user.role, "COUNSELOR")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const counselor = await prisma.counselor.findUnique({
        where: { userId: session.user.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              country: true,
              phone: true,
            },
          },
        },
      });

      if (!counselor) {
        return NextResponse.json(
          { error: "Counselor profile not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({ success: true, data: counselor });
    }

    // ── Counselor dashboard data ───────────────────────────────────────
    if (dashboard === "true") {
      const session = await getServerSession(authOptions);
      if (!session?.user || !hasRole(session.user.role, "COUNSELOR")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const counselor = await prisma.counselor.findUnique({
        where: { userId: session.user.id },
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
      });

      if (!counselor) {
        return NextResponse.json(
          { error: "Counselor profile not found" },
          { status: 404 },
        );
      }

      // Get all bookings for this counselor
      const allBookings = await prisma.booking.findMany({
        where: { counselorId: counselor.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: { scheduledAt: "desc" },
      });

      const now = new Date();

      // Stats
      const totalBookings = allBookings.length;
      const upcomingBookings = allBookings.filter(
        (b) =>
          (b.status === "CONFIRMED" || b.status === "PENDING") &&
          new Date(b.scheduledAt) > now,
      ).length;
      const completedSessions = allBookings.filter(
        (b) => b.status === "COMPLETED",
      ).length;
      const totalEarnings = allBookings
        .filter((b) => b.status === "COMPLETED")
        .reduce((acc, b) => acc + b.price, 0);

      // Unique clients
      const clientIds = new Set(allBookings.map((b) => b.userId));
      const totalClients = clientIds.size;

      // Recent bookings (last 10)
      const recentBookings = allBookings.slice(0, 10);

      return NextResponse.json({
        success: true,
        data: {
          counselor: {
            id: counselor.id,
            specialty: counselor.specialty,
            rating: counselor.rating,
            reviews: counselor.reviews,
            pricePerHour: counselor.pricePerHour,
            available: counselor.available,
            verified: counselor.verified,
          },
          stats: {
            totalBookings,
            upcomingBookings,
            completedSessions,
            totalEarnings,
            totalClients,
          },
          recentBookings,
        },
      });
    }

    // ── Public counselor listing ────────────────────────────────────────
    const specialty = searchParams.get("specialty");
    const available = searchParams.get("available");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const search = searchParams.get("search");

    const counselors = await prisma.counselor.findMany({
      where: {
        ...(specialty && { specialty }),
        ...(available === "true" && { available: true }),
        ...(minPrice &&
          maxPrice && {
            pricePerHour: {
              gte: parseInt(minPrice),
              lte: parseInt(maxPrice),
            },
          }),
        ...(search && {
          user: {
            name: { contains: search, mode: "insensitive" as const },
          },
        }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            country: true,
          },
        },
      },
      orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ counselors, count: counselors.length });
  } catch (error: any) {
    console.error("GET /api/counselors error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update own counselor profile
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !hasRole(session.user.role, "COUNSELOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    const counselor = await prisma.counselor.findUnique({
      where: { userId: session.user.id },
    });

    if (!counselor) {
      return NextResponse.json(
        { error: "Counselor profile not found" },
        { status: 404 },
      );
    }

    const updated = await prisma.counselor.update({
      where: { id: counselor.id },
      data: {
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.specialty !== undefined && { specialty: data.specialty }),
        ...(data.pricePerHour !== undefined && {
          pricePerHour: data.pricePerHour,
        }),
        ...(data.available !== undefined && { available: data.available }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("PATCH /api/counselors error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create counselor (admin only) — keep existing
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !hasRole(session.user.role, "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    if (!data.userId || !data.specialty || !data.pricePerHour) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const existing = await prisma.counselor.findUnique({
      where: { userId: data.userId },
    });

    if (existing) {
      return NextResponse.json(
        { error: "User already has a counselor profile" },
        { status: 400 },
      );
    }

    const counselor = await prisma.counselor.create({
      data: {
        userId: data.userId,
        bio: data.bio || "",
        specialty: data.specialty,
        pricePerHour: data.pricePerHour,
        rating: 0,
        reviews: 0,
        available: data.available ?? true,
        verified: data.verified ?? false,
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json({ counselor }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/counselors error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
