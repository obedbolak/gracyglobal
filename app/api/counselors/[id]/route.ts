// app/api/counselors/[id]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/api";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const counselor = await prisma.counselor.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true, image: true, country: true, createdAt: true },
        },
        bookings: {
          where: { status: "COMPLETED" },
          select: { scheduledAt: true },
          orderBy: { scheduledAt: "desc" },
          take: 5,
        },
      },
    });

    if (!counselor) return err("Counselor not found", 404);

    const bookedSlots = await prisma.booking.findMany({
      where: {
        counselorId: id,
        status: { in: ["PENDING", "CONFIRMED"] },
        scheduledAt: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      },
      select: { scheduledAt: true, duration: true },
    });

    return ok({ ...counselor, bookedSlots });
  } catch (e) {
    console.error("[GET /api/counselors/[id]]", e);
    return err("Internal server error", 500);
  }
}
