import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();

    if (!q) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    const term = q;

    // Basic, limited searches across several resources.
    const [communities, posts, products, counselors, services, courses, jobs] =
      await Promise.all([
        prisma.community.findMany({
          where: {
            OR: [
              { name: { contains: term, mode: "insensitive" } },
              { description: { contains: term, mode: "insensitive" } },
            ],
          },
          take: 6,
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            image: true,
          },
        }),

        prisma.communityPost.findMany({
          where: {
            OR: [
              { title: { contains: term, mode: "insensitive" } },
              { content: { contains: term, mode: "insensitive" } },
            ],
          },
          take: 8,
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { id: true, name: true, image: true } },
            community: { select: { id: true, name: true, slug: true } },
          },
        }),

        prisma.product.findMany({
          where: {
            OR: [
              { name: { contains: term, mode: "insensitive" } },
              { description: { contains: term, mode: "insensitive" } },
            ],
            active: true,
          },
          take: 6,
          select: { id: true, name: true, images: true, price: true },
        }),

        prisma.counselor.findMany({
          where: {
            OR: [
              { specialty: { contains: term, mode: "insensitive" } },
              { bio: { contains: term, mode: "insensitive" } },
              { user: { name: { contains: term, mode: "insensitive" } } },
            ],
          },
          take: 6,
          include: { user: { select: { id: true, name: true, image: true } } },
        }),
        // Services
        prisma.service.findMany({
          where: {
            OR: [
              { name: { contains: term, mode: "insensitive" } },
              { description: { contains: term, mode: "insensitive" } },
            ],
            active: true,
          },
          take: 6,
          select: { id: true, name: true, images: true },
        }),

        // Courses
        prisma.course.findMany({
          where: {
            OR: [
              { title: { contains: term, mode: "insensitive" } },
              { description: { contains: term, mode: "insensitive" } },
            ],
            published: true,
          },
          take: 6,
          select: {
            id: true,
            title: true,
            thumbnail: true,
            price: true,
            isFree: true,
          },
        }),

        // Jobs
        prisma.job.findMany({
          where: {
            OR: [
              { title: { contains: term, mode: "insensitive" } },
              { company: { contains: term, mode: "insensitive" } },
            ],
            active: true,
          },
          take: 6,
          select: { id: true, title: true, company: true, location: true },
        }),
      ]);

    return NextResponse.json({
      products,
      services,
      courses,
      jobs,
      communities,
      counselors,
    });
  } catch (err: any) {
    console.error("/api/search error:", err?.message || err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
