// app/api/courses/[id]/enroll/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/courses/[id]/enroll — enroll the current user in a course
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

    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (!course.published) {
      return NextResponse.json(
        { error: "Course not available" },
        { status: 403 },
      );
    }

    // Check if already enrolled
    const existing = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: id,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Already enrolled" }, { status: 409 });
    }

    // For paid courses, verify payment reference (integrate your payment gateway here)
    if (!course.isFree && course.price > 0) {
      const { paymentReference } = await req.json().catch(() => ({}));

      // TODO: verify paymentReference with your payment gateway (e.g. CinetPay, MTN MoMo)
      // For now we accept any reference as a placeholder
      if (!paymentReference) {
        return NextResponse.json(
          { error: "Payment reference required for paid courses" },
          { status: 402 },
        );
      }

      const enrollment = await prisma.enrollment.create({
        data: {
          userId: session.user.id,
          courseId: id,
          paidAmount: course.price,
          status: "ACTIVE",
        },
      });

      return NextResponse.json({ enrollment }, { status: 201 });
    }

    // Free course — enroll immediately
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: session.user.id,
        courseId: id,
        paidAmount: 0,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ enrollment }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/courses/[id]/enroll]", error);
    return NextResponse.json({ error: "Failed to enroll" }, { status: 500 });
  }
}

// GET /api/courses/[id]/enroll — check enrollment status
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ enrolled: false });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: id,
        },
      },
      include: {
        progress: true,
      },
    });

    return NextResponse.json({ enrolled: !!enrollment, enrollment });
  } catch (error) {
    console.error("[GET /api/courses/[id]/enroll]", error);
    return NextResponse.json(
      { error: "Failed to check enrollment" },
      { status: 500 },
    );
  }
}
