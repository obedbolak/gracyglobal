// app/api/services/[id]/options/[optionId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT - Update option
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; optionId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { optionId } = await params;
    const data = await req.json();

    const option = await prisma.serviceOption.update({
      where: { id: optionId },
      data: {
        name: data.name,
        description: data.description,
        pricingType: data.pricingType,
        amount: data.amount,
        yearlyAmount: data.yearlyAmount,
        label: data.label,
        duration: data.duration,
        popular: data.popular,
      },
    });

    return NextResponse.json({ option });
  } catch (error: any) {
    console.error("PUT /api/services/[id]/options/[optionId] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete option
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; optionId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { optionId } = await params;

    await prisma.serviceOption.delete({
      where: { id: optionId },
    });

    return NextResponse.json({ message: "Option deleted successfully" });
  } catch (error: any) {
    console.error("DELETE /api/services/[id]/options/[optionId] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
