// app/api/jobs/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { JobCategory, JobType } from "@prisma/client";
import { hasRole } from "@/lib/roleHelpers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") as JobCategory | null;
    const type = searchParams.get("type") as JobType | null;
    const featured = searchParams.get("featured");

    const jobs = await prisma.job.findMany({
      where: {
        active: true,
        ...(category && { category: category as JobCategory }),
        ...(type && { type: type as JobType }),
        ...(featured === "true" && { featured: true }),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ jobs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    const job = await prisma.job.create({
      data: {
        title: data.title,
        company: data.company,
        companyLogo: data.companyLogo || null,
        description: data.description,
        category: data.category as JobCategory,
        type: data.type as JobType,
        salaryMin: data.salaryMin || null,
        salaryMax: data.salaryMax || null,
        location: data.location || null,
        skills: data.skills || [],
        active: data.active ?? true,
        featured: data.featured || false,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        posterId: session.user.id, // ← ADD THIS
      },
    });

    return NextResponse.json({ job }, { status: 201 });
  } catch (error: any) {
    console.error("Create job error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
