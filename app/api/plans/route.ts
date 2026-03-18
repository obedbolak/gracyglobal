import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/data/plans";

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ plans });
  } catch (error) {
    console.error("Get plans error:", error);
    return NextResponse.json(
      { error: "Failed to get plans" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Sync plans from data file to database
    for (const planData of PLANS) {
      await prisma.plan.upsert({
        where: { name: planData.id },
        update: {
          displayName: planData.name,
          description: planData.description,
          priceMonthly: planData.priceMonthly,
          priceAnnual: planData.priceAnnual,
          pricePerSession: planData.pricePerSession,
          highlighted: planData.highlighted,
          active: true,
        },
        create: {
          name: planData.id,
          displayName: planData.name,
          description: planData.description,
          priceMonthly: planData.priceMonthly,
          priceAnnual: planData.priceAnnual,
          pricePerSession: planData.pricePerSession,
          counselorSessions: planData.id === "free" ? 0 : 
                           planData.id === "starter" ? 2 :
                           planData.id === "growth" ? 5 : 0,
          highlighted: planData.highlighted,
          active: true,
          sortOrder: PLANS.findIndex(p => p.id === planData.id),
        },
      });
    }

    const plans = await prisma.plan.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ 
      message: "Plans synced successfully",
      plans 
    });
  } catch (error) {
    console.error("Sync plans error:", error);
    return NextResponse.json(
      { error: "Failed to sync plans" },
      { status: 500 }
    );
  }
}