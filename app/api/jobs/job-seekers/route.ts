import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { JobCategory, JobType } from "@prisma/client";

// GET — list all active job seekers (public) or current user's profile
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") as JobCategory | null;
    const type = searchParams.get("type") as JobType | null;
    const mine = searchParams.get("mine");

    const session = await getServerSession(authOptions);

    // If ?mine=true, return the current user's profile
    if (mine === "true") {
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const profile = await prisma.jobSeeker.findUnique({
        where: { userId: session.user.id },
      });
      return NextResponse.json({ profile });
    }

    // Otherwise return all active job seekers
    const jobSeekers = await prisma.jobSeeker.findMany({
      where: {
        active: true,
        ...(category && { category: category as JobCategory }),
        ...(type && { type: type as JobType }),
      },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ jobSeekers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST — create or update job seeker profile
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    const profile = await prisma.jobSeeker.upsert({
      where: { userId: session.user.id },
      update: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        category: data.category as JobCategory,
        type: data.type as JobType,
        expectedSalary: data.expectedSalary || null,
        location: data.location || null,
        skills: data.skills || [],
        experience: data.experience,
        portfolio: data.portfolio || null,
        resume: data.resume || null,
        availability: data.availability || null,
        active: data.active ?? true,
      },
      create: {
        userId: session.user.id,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        category: data.category as JobCategory,
        type: data.type as JobType,
        expectedSalary: data.expectedSalary || null,
        location: data.location || null,
        skills: data.skills || [],
        experience: data.experience,
        portfolio: data.portfolio || null,
        resume: data.resume || null,
        availability: data.availability || null,
        active: data.active ?? true,
      },
    });

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error: any) {
    console.error("Job seeker profile error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE — remove job seeker profile
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.jobSeeker.delete({
      where: { userId: session.user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
