// app/api/admin/free-plans/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasRole } from "@/lib/roleHelpers";

// GET /api/admin/free-plans - Get all free plans for service activation
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !hasRole(session.user.role, "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const freePlans = await prisma.pricingPlan.findMany({
      where: {
        price: 0,
        active: true,
      },
      select: {
        id: true,
        planCode: true,
        category: true,
        name: true,
        features: true,
      },
      orderBy: [
        { category: "asc" },
        { sortOrder: "asc" },
      ],
    });

    return NextResponse.json({ 
      success: true,
      plans: freePlans 
    });

  } catch (error: any) {
    console.error("Get free plans error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}