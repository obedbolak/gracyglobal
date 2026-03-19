// app/api/live-sessions/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/live-sessions/[id] — get session details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    const liveSession = await prisma.liveSession.findUnique({
      where: { id },
      include: {
        course: {
          select: { id: true, title: true, thumbnail: true },
        },
        _count: {
          select: { attendances: true },
        },
      },
    });

    if (!liveSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    let isRegistered = false;
    if (session?.user?.id) {
      const attendance = await prisma.liveAttendance.findUnique({
        where: {
          liveSessionId_userId: {
            liveSessionId: id,
            userId: session.user.id,
          },
        },
      });
      isRegistered = !!attendance;
    }

    // Only reveal meetingUrl to registered users or admins
    const isAdmin = session?.user?.role === "ADMIN";
    return NextResponse.json({
      liveSession: {
        ...liveSession,
        meetingUrl: isRegistered || isAdmin ? liveSession.meetingUrl : null,
      },
      isRegistered,
    });
  } catch (error) {
    console.error("[GET /api/live-sessions/[id]]", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 },
    );
  }
}

// POST /api/live-sessions/[id] — register attendance
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const liveSession = await prisma.liveSession.findUnique({
      where: { id },
      include: {
        course: { select: { id: true, isFree: true, price: true } },
      },
    });

    if (!liveSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Check user is enrolled in the course
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: liveSession.courseId,
        },
      },
    });

    if (!enrollment && !liveSession.course.isFree) {
      return NextResponse.json(
        {
          error:
            "You must be enrolled in the course to register for this session",
        },
        { status: 403 },
      );
    }

    // Register attendance
    const attendance = await prisma.liveAttendance.upsert({
      where: {
        liveSessionId_userId: {
          liveSessionId: id,
          userId: session.user.id,
        },
      },
      update: {},
      create: {
        liveSessionId: id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      attendance,
      meetingUrl: liveSession.meetingUrl,
    });
  } catch (error) {
    console.error("[POST /api/live-sessions/[id]]", error);
    return NextResponse.json({ error: "Failed to register" }, { status: 500 });
  }
}

// PATCH /api/live-sessions/[id] — update session status (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const liveSession = await prisma.liveSession.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ liveSession });
  } catch (error) {
    console.error("[PATCH /api/live-sessions/[id]]", error);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 },
    );
  }
}
