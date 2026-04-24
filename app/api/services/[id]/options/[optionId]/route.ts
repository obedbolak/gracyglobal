// app/api/services/[id]/options/[optionId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Get single option
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; optionId: string }> },
) {
  try {
    const { id, optionId } = await params;

    const option = await prisma.serviceOption.findUnique({
      where: { id: optionId, serviceId: id },
    });

    if (!option) {
      return NextResponse.json({ error: "Option not found" }, { status: 404 });
    }

    return NextResponse.json({ option });
  } catch (error: any) {
    console.error("GET /api/services/[id]/options/[optionId] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update option (admin or service owner)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; optionId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, optionId } = await params;

    // ✅ Check if service exists and get owner
    const service = await prisma.service.findUnique({
      where: { id },
      select: { sellerId: true },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // ✅ Check permissions: Admin or service owner
    const userRoles = Array.isArray(session.user.role)
      ? session.user.role
      : [session.user.role];

    const isAdmin = userRoles.includes("ADMIN");
    const isOwner = service.sellerId === session.user.id;
    const isCreator = userRoles.includes("CREATOR");

    if (!isAdmin && !(isCreator && isOwner)) {
      return NextResponse.json(
        { error: "You can only edit options for your own services" },
        { status: 403 },
      );
    }

    // ✅ Check if option exists
    const existing = await prisma.serviceOption.findUnique({
      where: { id: optionId, serviceId: id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Option not found" }, { status: 404 });
    }

    const data = await req.json();

    const option = await prisma.serviceOption.update({
      where: { id: optionId },
      data: {
        name: data.name ?? existing.name,
        description: data.description ?? existing.description,
        pricingType: data.pricingType ?? existing.pricingType,
        amount: data.amount ?? existing.amount,
        yearlyAmount: data.yearlyAmount ?? existing.yearlyAmount,
        label: data.label ?? existing.label,
        duration: data.duration ?? existing.duration,
        popular: data.popular ?? existing.popular,
        active: data.active ?? existing.active, // ✅ Allow toggling active state
      },
    });

    return NextResponse.json({ option });
  } catch (error: any) {
    console.error("PUT /api/services/[id]/options/[optionId] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ✅ PATCH - Alias for PUT (this was missing and caused the 405 error)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; optionId: string }> },
) {
  return PUT(req, { params });
}

// DELETE - Delete option (admin or service owner)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; optionId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, optionId } = await params;

    // ✅ Check if service exists and get owner
    const service = await prisma.service.findUnique({
      where: { id },
      select: { sellerId: true },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // ✅ Check permissions: Admin or service owner
    const userRoles = Array.isArray(session.user.role)
      ? session.user.role
      : [session.user.role];

    const isAdmin = userRoles.includes("ADMIN");
    const isOwner = service.sellerId === session.user.id;
    const isCreator = userRoles.includes("CREATOR");

    if (!isAdmin && !(isCreator && isOwner)) {
      return NextResponse.json(
        { error: "You can only delete options for your own services" },
        { status: 403 },
      );
    }

    // ✅ Check if option exists
    const existing = await prisma.serviceOption.findUnique({
      where: { id: optionId, serviceId: id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Option not found" }, { status: 404 });
    }

    await prisma.serviceOption.delete({
      where: { id: optionId },
    });

    return NextResponse.json({ message: "Option deleted successfully" });
  } catch (error: any) {
    console.error("DELETE /api/services/[id]/options/[optionId] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
