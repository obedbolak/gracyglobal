// app/api/user/subscriptions/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireUser } from "@/lib/api";

export async function GET() {
  try {
    const user = await requireUser();
    if (!user) return err("Unauthorized", 401);

    const subscriptions = await prisma.userSubscription.findMany({
      where: { userId: user.id },
      include: {
        plan: true,
        payments: {
          orderBy: { createdAt: "desc" },
          take: 5, // Last 5 payments
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return ok({ subscriptions });
  } catch (error: any) {
    console.error("Error fetching user subscriptions:", error);
    return err("Failed to fetch subscriptions", 500);
  }
}
