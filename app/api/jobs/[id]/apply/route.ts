// app/api/jobs/[id]/apply/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: jobId } = await params;
    const { coverNote } = await req.json();

    // Check if already applied
    const existing = await prisma.jobApplication.findUnique({
      where: {
        userId_jobId: {
          userId: session.user.id,
          jobId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already applied to this job" },
        { status: 400 },
      );
    }

    // Create application
    const application = await prisma.jobApplication.create({
      data: {
        userId: session.user.id,
        jobId,
        coverNote: coverNote || null,
        status: "APPLIED",
      },
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch (error: any) {
    console.error("Job application error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
