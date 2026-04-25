// app/api/jobs/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { JobCategory, JobType } from "@prisma/client";
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
        ...(name
          ? [
              {
                name: {
                  equals: name,
                  mode: "insensitive" as const,
                },
              },
            ]
          : []),
      ],
    },
  });

  return jobCategory?.id || null;
}

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
      : (data.category as JobCategory) || JobCategory.OTHER;

    const job = await prisma.job.create({
      data: {
        title: data.title,
        company: data.company,
        companyLogo: data.companyLogo || null,
        description: data.description,
        category: categoryValue,
        jobCategoryId,
        type: data.type as JobType,
        salaryMin: data.salaryMin || null,
        salaryMax: data.salaryMax || null,
        location: data.location || null,
        skills: data.skills || [],
        active: data.active ?? true,
        featured: data.featured || false,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        posterId: session.user.id,
      },
    });

    return NextResponse.json({ job }, { status: 201 });
  } catch (error: any) {
    console.error("Create job error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
