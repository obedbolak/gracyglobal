import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applications = await prisma.jobApplication.findMany({
      where: { userId: session.user.id },
      include: {
        job: true,
      },
      orderBy: { appliedAt: "desc" },
    });

    return NextResponse.json({ applications });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
