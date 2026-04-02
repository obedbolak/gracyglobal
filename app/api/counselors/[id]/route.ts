// app/api/counselors/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { hasRole } from "@/lib/roleHelpers";

// GET /api/counselors/:id — Get counselor + optional sub-resources
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const include = searchParams.get("include"); // "bookings" | "clients" | "earnings"

    // ── Bookings for this counselor ────────────────────────────────────
    if (include === "bookings") {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Verify this counselor belongs to the logged-in user OR is admin
      const counselor = await prisma.counselor.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (
        !counselor ||
        (counselor.userId !== session.user.id &&
          !hasRole(session.user.role, "ADMIN"))
      ) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const status = searchParams.get("status");

      const bookings = await prisma.booking.findMany({
        where: {
          counselorId: id,
          ...(status && status !== "ALL" && { status: status as any }),
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
        orderBy: { scheduledAt: "desc" },
      });

      return NextResponse.json({ success: true, data: bookings });
    }

    // ── Clients for this counselor ─────────────────────────────────────
    if (include === "clients") {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const counselor = await prisma.counselor.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (
        !counselor ||
        (counselor.userId !== session.user.id &&
          !hasRole(session.user.role, "ADMIN"))
      ) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Get all bookings grouped by user
      const bookings = await prisma.booking.findMany({
        where: { counselorId: id },
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

      // Build unique client list with stats
      const clientMap = new Map<
        string,
        {
          id: string;
          name: string | null;
          email: string;
          image: string | null;
          sessionsCount: number;
          lastSession: string | null;
        }
      >();

      for (const booking of bookings) {
        const existing = clientMap.get(booking.userId);
        if (existing) {
          existing.sessionsCount++;
          if (
            !existing.lastSession ||
            new Date(booking.scheduledAt) > new Date(existing.lastSession)
          ) {
            existing.lastSession = booking.scheduledAt.toISOString();
          }
        } else {
          clientMap.set(booking.userId, {
            id: booking.user.id,
            name: booking.user.name,
            email: booking.user.email,
            image: booking.user.image,
            sessionsCount: 1,
            lastSession: booking.scheduledAt.toISOString(),
          });
        }
      }

      const clients = Array.from(clientMap.values()).sort(
        (a, b) =>
          new Date(b.lastSession || 0).getTime() -
          new Date(a.lastSession || 0).getTime(),
      );

      return NextResponse.json({ success: true, data: clients });
    }

    // ── Earnings for this counselor ────────────────────────────────────
    if (include === "earnings") {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const counselor = await prisma.counselor.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (
        !counselor ||
        (counselor.userId !== session.user.id &&
          !hasRole(session.user.role, "ADMIN"))
      ) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const completedBookings = await prisma.booking.findMany({
        where: {
          counselorId: id,
          status: "COMPLETED",
        },
        include: {
          user: {
            select: { name: true },
          },
        },
        orderBy: { scheduledAt: "desc" },
      });

      const totalEarnings = completedBookings.reduce(
        (acc, b) => acc + b.price,
        0,
      );

      // This month's earnings
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const monthlyEarnings = completedBookings
        .filter((b) => new Date(b.scheduledAt) >= startOfMonth)
        .reduce((acc, b) => acc + b.price, 0);

      // Pending payouts (confirmed but not completed yet — future sessions)
      const pendingBookings = await prisma.booking.findMany({
        where: {
          counselorId: id,
          status: "CONFIRMED",
        },
      });
      const pendingPayouts = pendingBookings.reduce(
        (acc, b) => acc + b.price,
        0,
      );

      // Recent payments (last 20 completed sessions)
      const recentPayments = completedBookings.slice(0, 20).map((b) => ({
        id: b.id,
        amount: b.price,
        date: b.scheduledAt.toISOString(),
        status: "Completed",
        clientName: b.user.name || "Unknown",
      }));

      return NextResponse.json({
        success: true,
        data: {
          totalEarnings,
          monthlyEarnings,
          pendingPayouts,
          completedPayouts: totalEarnings, // All completed = paid out for now
          recentPayments,
        },
      });
    }

    // ── Default: Get single counselor profile ──────────────────────────
    const counselor = await prisma.counselor.findUnique({
      where: { id },
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
        bookings: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        _count: {
          select: { bookings: true },
        },
      },
    });

    if (!counselor) {
      return NextResponse.json(
        { error: "Counselor not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ counselor });
  } catch (error: any) {
    console.error("GET /api/counselors/[id] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/counselors/:id - Update counselor (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !hasRole(session.user.role, "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await req.json();

    const counselor = await prisma.counselor.update({
      where: { id },
      data: {
        bio: data.bio,
        specialty: data.specialty,
        pricePerHour: data.pricePerHour,
        available: data.available,
        verified: data.verified,
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json({ counselor });
  } catch (error: any) {
    console.error("PUT /api/counselors/[id] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/counselors/:id - Delete counselor (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !hasRole(session.user.role, "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.counselor.findUnique({
      where: { id },
      include: { _count: { select: { bookings: true } } },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Counselor not found" },
        { status: 404 },
      );
    }

    if (existing._count.bookings > 0) {
      await prisma.booking.deleteMany({
        where: { counselorId: id },
      });
    }

    await prisma.user.update({
      where: { id: existing.userId },
      data: { role: [UserRole.USER] },
    });

    await prisma.counselor.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Counselor deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE /api/counselors/[id] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
