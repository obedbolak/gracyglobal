// app/api/live-sessions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/live-sessions — list upcoming live sessions
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    const liveSessions = await prisma.liveSession.findMany({
      where: {
        ...(courseId && { courseId }),
        status: { in: ["SCHEDULED", "LIVE"] },
      },
      include: {
        course: {
          select: { id: true, title: true, thumbnail: true },
        },
        _count: {
          select: { attendances: true },
        },
      },
      orderBy: { scheduledAt: "asc" },
    });

    // Check if current user has registered for each session
    let userAttendances: string[] = [];
    if (session?.user?.id) {
      const attendances = await prisma.liveAttendance.findMany({
        where: { userId: session.user.id },
        select: { liveSessionId: true },
      });
      userAttendances = attendances.map((a) => a.liveSessionId);
    }

    const sessions = liveSessions.map((s) => ({
      ...s,
      isRegistered: userAttendances.includes(s.id),
    }));

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("[GET /api/live-sessions]", error);
    return NextResponse.json(
      { error: "Failed to fetch live sessions" },
      { status: 500 },
    );
  }
}
