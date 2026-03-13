// app/api/bookings/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireUser, parsePagination } from "@/lib/api";

// ── GET /api/bookings — get current user's bookings ───────────────────────────
export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    if (!user) return err("Unauthorized", 401);

    const { skip, limit, page } = parsePagination(req.nextUrl.searchParams);
    const status = req.nextUrl.searchParams.get("status") ?? undefined;

    const where = {
      userId: user.id,
      ...(status ? { status: status as any } : {}),
    };

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledAt: "desc" },
        include: {
          counselor: {
            include: { user: { select: { name: true, image: true } } },
          },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return ok({
      items: bookings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (e) {
    console.error("[GET /api/bookings]", e);
    return err("Internal server error", 500);
  }
}

// ── POST /api/bookings — create a booking ─────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    if (!user) return err("Unauthorized", 401);

    const body = await req.json();
    const { counselorId, type, scheduledAt, duration = 60, notes } = body;

    // Validation
    if (!counselorId) return err("'counselorId' is required");
    if (!type) return err("'type' is required (TEXT | VIDEO | SUPPORT_GROUP)");
    if (!scheduledAt) return err("'scheduledAt' is required");

    const validTypes = ["TEXT", "VIDEO", "SUPPORT_GROUP"];
    if (!validTypes.includes(type)) {
      return err(`'type' must be one of: ${validTypes.join(", ")}`);
    }

    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime())) return err("'scheduledAt' must be a valid date");
    if (scheduledDate <= new Date()) return err("Booking must be in the future");

    // Check counselor exists and is available
    const counselor = await prisma.counselor.findUnique({
      where: { id: counselorId },
    });
    if (!counselor) return err("Counselor not found", 404);
    if (!counselor.available) return err("This counselor is currently unavailable");

    // Check for conflicting bookings
    const conflict = await prisma.booking.findFirst({
      where: {
        counselorId,
        status: { in: ["PENDING", "CONFIRMED"] },
        scheduledAt: {
          gte: new Date(scheduledDate.getTime() - duration * 60000),
          lte: new Date(scheduledDate.getTime() + duration * 60000),
        },
      },
    });
    if (conflict) return err("This time slot is already booked");

    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        counselorId,
        type,
        scheduledAt: scheduledDate,
        duration,
        price: counselor.pricePerHour,
        notes: notes ?? null,
        status: "PENDING",
      },
      include: {
        counselor: {
          include: { user: { select: { name: true, image: true } } },
        },
      },
    });

    return ok(booking, 201);
  } catch (e) {
    console.error("[POST /api/bookings]", e);
    return err("Internal server error", 500);
  }
}
