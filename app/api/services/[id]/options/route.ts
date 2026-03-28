// app/api/services/[id]/options/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/services/:id/options - Get all options for a service
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const service = await prisma.service.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const options = await prisma.serviceOption.findMany({
      where: {
        serviceId: id,
        active: true,
      },
      orderBy: { amount: "asc" },
    });

    return NextResponse.json({ options, service });
  } catch (error: any) {
    console.error("GET /api/services/[id]/options error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/services/:id/options - Create new option (admin only)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await req.json();

    // Verify service exists
    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Validate required fields
    if (
      !data.name ||
      !data.description ||
      !data.pricingType ||
      data.amount === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const option = await prisma.serviceOption.create({
      data: {
        serviceId: id,
        name: data.name,
        description: data.description,
        pricingType: data.pricingType,
        amount: data.amount,
        yearlyAmount: data.yearlyAmount || null,
        label: data.label || null,
        duration: data.duration || null,
        popular: data.popular || false,
        active: data.active ?? true,
      },
    });

    return NextResponse.json({ option }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/services/[id]/options error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
