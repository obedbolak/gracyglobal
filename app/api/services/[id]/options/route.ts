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

    // ✅ Return ALL options (not just active) so creators can edit inactive ones too
    const options = await prisma.serviceOption.findMany({
      where: {
        serviceId: id,
      },
      orderBy: { amount: "asc" },
    });

    return NextResponse.json({ options, service });
  } catch (error: any) {
    console.error("GET /api/services/[id]/options error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/services/:id/options - Create new option (admin or service owner)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const service = await prisma.service.findUnique({
      where: { id },
      select: { sellerId: true },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // ✅ Fixed auth logic: Admin can edit any service, Creator can only edit their own
    const userRoles = Array.isArray(session.user.role)
      ? session.user.role
      : [session.user.role];

    const isAdmin = userRoles.includes("ADMIN");
    const isOwner = service.sellerId === session.user.id;
    const isCreator = userRoles.includes("CREATOR");

    // Allow if: (1) Admin can create for any service, OR (2) Creator can create for their own
    if (!isAdmin && !(isCreator && isOwner)) {
      return NextResponse.json(
        { error: "You can only add options to your own services" },
        { status: 403 },
      );
    }

    const data = await req.json();

    if (
      !data.name ||
      !data.description ||
      !data.pricingType ||
      data.amount === undefined
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: name, description, pricingType, amount",
        },
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
