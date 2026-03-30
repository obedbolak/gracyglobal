// app/api/users/route.ts
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
    const search = searchParams.get("search");
    const excludeCounselors = searchParams.get("excludeCounselors") === "true";

    const users = await prisma.user.findMany({
      where: {
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }),
        // ✅ correct relation name from your schema
        ...(excludeCounselors && {
          counselorProfile: null,
        }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        country: true,
        role: true,
      },
      orderBy: { name: "asc" },
      take: 10,
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("GET /api/users error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
