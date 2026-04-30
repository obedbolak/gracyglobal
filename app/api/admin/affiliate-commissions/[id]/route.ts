import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRoles = Array.isArray(session.user.role)
      ? session.user.role
      : [session.user.role];

    if (!userRoles.includes("ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const commission = await prisma.affiliateCommission.findUnique({
      where: { id },
    });

    if (!commission) {
      return NextResponse.json(
        { error: "Commission not found" },
        { status: 404 },
      );
    }

    if (commission.status !== "PENDING") {
      return NextResponse.json(
        { error: "Only pending commissions can be approved" },
        { status: 400 },
      );
    }

    const updatedCommission = await prisma.affiliateCommission.update({
      where: { id },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
      },
    });

    return NextResponse.json({ commission: updatedCommission });
  } catch (error: any) {
    console.error("[PATCH /api/admin/affiliate-commissions/:id]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
