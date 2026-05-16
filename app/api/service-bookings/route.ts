// app/api/service-bookings/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireUser, parsePagination } from "@/lib/api";

// GET /api/service-bookings - Get current user's service bookings
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

    const [serviceBookings, total] = await Promise.all([
      prisma.serviceBooking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          service: {
            select: {
              id: true,
              name: true,
              images: true,
              seller: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
          serviceOption: {
            select: {
              id: true,
              name: true,
              amount: true,
              pricingType: true,
              duration: true,
            },
          },
        },
      }),
      prisma.serviceBooking.count({ where }),
    ]);

    return ok({
      items: serviceBookings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (e) {
    console.error("[GET /api/service-bookings]", e);
    return err("Internal server error", 500);
  }
}

// POST /api/service-bookings - Create a service booking
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    if (!user) return err("Unauthorized", 401);

    const body = await req.json();
    const { serviceId, serviceOptionId, scheduledAt, notes } = body;

    // Validation
    if (!serviceId) return err("'serviceId' is required");

    // Check service exists and is active
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        options: {
          where: { active: true },
        },
      },
    });

    if (!service) return err("Service not found", 404);
    if (!service.active) return err("This service is currently unavailable");

    let selectedOption = null;
    let totalPrice = 0;

    if (serviceOptionId) {
      selectedOption = service.options.find(opt => opt.id === serviceOptionId);
      if (!selectedOption) return err("Service option not found", 404);
      totalPrice = selectedOption.amount;
    } else if (service.options.length > 0) {
      // Use the first available option if none specified
      selectedOption = service.options[0];
      totalPrice = selectedOption.amount;
    }

    // Validate scheduled date if provided
    let scheduledDate = null;
    if (scheduledAt) {
      scheduledDate = new Date(scheduledAt);
      if (isNaN(scheduledDate.getTime())) return err("'scheduledAt' must be a valid date");
      if (scheduledDate <= new Date()) return err("Booking must be in the future");
    }

    const serviceBooking = await prisma.serviceBooking.create({
      data: {
        userId: user.id,
        serviceId,
        serviceOptionId: selectedOption?.id || null,
        scheduledAt: scheduledDate,
        totalPrice,
        notes: notes ?? null,
        status: "PENDING",
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            images: true,
            seller: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        serviceOption: {
          select: {
            id: true,
            name: true,
            amount: true,
            pricingType: true,
            duration: true,
          },
        },
      },
    });

    return ok(serviceBooking, 201);
  } catch (e) {
    console.error("[POST /api/service-bookings]", e);
    return err("Internal server error", 500);
  }
}