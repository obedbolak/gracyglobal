// app/api/bookings/[id]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireUser } from "@/lib/api";

// ── GET /api/bookings/[id] ────────────────────────────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await requireUser();
    if (!user) return err("Unauthorized", 401);

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        counselor: {
          include: {
            user: { select: { name: true, image: true, email: true } },
          },
        },
      },
    });

    if (!booking) return err("Booking not found", 404);
    if (booking.userId !== user.id && !user.role.includes("ADMIN")) {
      return err("Forbidden", 403);
    }

    return ok(booking);
  } catch (e) {
    console.error("[GET /api/bookings/[id]]", e);
    return err("Internal server error", 500);
  }
}

// ── PATCH /api/bookings/[id] — cancel a booking ───────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await requireUser();
    if (!user) return err("Unauthorized", 401);

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return err("Booking not found", 404);
    if (booking.userId !== user.id && !user.role.includes("ADMIN")) {
      return err("Forbidden", 403);
    }

    if (booking.status === "CANCELLED")
      return err("Booking is already cancelled");
    if (booking.status === "COMPLETED")
      return err("Cannot cancel a completed booking");

    const hoursUntilSession =
      (new Date(booking.scheduledAt).getTime() - Date.now()) / 36e5;
    if (hoursUntilSession < 24 && user.role.includes("ADMIN")) {
      return err(
        "Cancellations must be made at least 24 hours before the session",
      );
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    return ok(updated);
  } catch (e) {
    console.error("[PATCH /api/bookings/[id]]", e);
    return err("Internal server error", 500);
  }
}
