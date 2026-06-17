// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasRole } from "@/lib/roleHelpers";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !hasRole(session.user.role, "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const status = searchParams.get("status") || "";

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    if (role) {
      where.role = { has: role };
    }
    if (status) {
      if (status === "active") {
        where.subscriptions = {
          some: { status: { in: ["ACTIVE", "TRIALING"] } },
        };
      } else if (status === "inactive") {
        where.subscriptions = {
          none: { status: { in: ["ACTIVE", "TRIALING"] } },
        };
      }
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            enrollments: true,
            bookings: true,
            orders: true,
          },
        },
        subscriptions: {
          where: {
            status: { in: ["ACTIVE", "TRIALING"] },
          },
          include: { plan: true },
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    const usersWithSubscription = users.map((u) => ({
      ...u,
      subscription: u.subscriptions[0] || null,
    }));

    return NextResponse.json({ users: usersWithSubscription });
  } catch (error: any) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
