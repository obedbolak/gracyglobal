// app/api/services/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasRole } from "@/lib/roleHelpers";

// GET /api/services - List all services with filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const group = searchParams.get("group");
    const featured = searchParams.get("featured");
    const search = searchParams.get("search");

    const services = await prisma.service.findMany({
      where: {
        active: true,
        ...(category && { category }),
        ...(group && { group }),
        ...(featured === "true" && { featured: true }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { category: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        options: {
          where: { active: true },
          orderBy: { amount: "asc" },
        },
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: [
        { featured: "desc" },
        { rating: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ services, count: services.length });
  } catch (error: any) {
    console.error("GET /api/services error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/services - Create new service (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !hasRole(session.user.role, "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    // Validate required fields
    if (!data.name || !data.description || !data.category || !data.group) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const service = await prisma.service.create({
      data: {
        name: data.name,
        description: data.description,
        images: data.images || [],
        category: data.category,
        group: data.group,
        featured: data.featured || false,
        rating: 0,
        reviews: 0,
        badge: data.badge || null,
        includes: data.includes || [],
        availability: data.availability || null,
        active: data.active ?? true,
      },
      include: {
        options: true,
      },
    });

    return NextResponse.json({ service }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/services error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}