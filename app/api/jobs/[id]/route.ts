// app/api/jobs/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { JobCategory } from "@prisma/client";
import { hasRole } from "@/lib/roleHelpers";

function normalizeCategorySlug(slug: string): JobCategory {
  const normalized = slug.replace(/-/g, "_").toUpperCase();
  return Object.values(JobCategory).includes(normalized as JobCategory)
    ? (normalized as JobCategory)
    : JobCategory.OTHER;
}

function getCategorySlugFromEnum(category: string | null | undefined) {
  if (!category) return null;
  return category.toLowerCase().replace(/_/g, "-");
}

function getCategoryLabelFromEnum(category: string | null | undefined) {
  if (!category) return null;
  return category
    .toLowerCase()
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

async function resolveJobCategoryId(
  category: string | null | undefined,
  explicitId?: string | null,
) {
  if (explicitId) {
    const jobCategory = await prisma.jobCategoryModel.findUnique({
      where: { id: explicitId },
    });
    if (jobCategory) return jobCategory.id;
  }

  const slug = getCategorySlugFromEnum(category);
  const name = getCategoryLabelFromEnum(category);
  if (!slug && !name) return null;

  const jobCategory = await prisma.jobCategoryModel.findFirst({
    where: {
      OR: [
        ...(slug ? [{ slug }] : []),
        ...(name ? [{ name: { equals: name, mode: "insensitive" } }] : []),
      ],
    },
  });

  return jobCategory?.id || null;
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        applications: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ job });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !hasRole(session.user.role, "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await req.json();

    const jobCategoryId = await resolveJobCategoryId(
      data.category,
      data.jobCategoryId || null,
    );

    const categoryValue = jobCategoryId
      ? normalizeCategorySlug(
          (
            await prisma.jobCategoryModel.findUnique({
              where: { id: jobCategoryId },
            })
          )?.slug || data.category,
        )
      : (data.category as JobCategory);

    const job = await prisma.job.update({
      where: { id },
      data: {
        title: data.title,
        company: data.company,
        companyLogo: data.companyLogo,
        description: data.description,
        category: categoryValue,
        jobCategoryId,
        type: data.type,
        salaryMin: data.salaryMin,
        salaryMax: data.salaryMax,
        location: data.location,
        skills: data.skills || [],
        active: data.active ?? true,
        featured: data.featured || false,
        expiresAt: data.expiresAt,
      },
    });

    return NextResponse.json({ job });
  } catch (error: any) {
    console.error("Update job error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !hasRole(session.user.role, "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.job.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete job error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
