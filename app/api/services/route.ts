// app/api/services/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/services - List all services with filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category"); // filter by category name
    const categoryId = searchParams.get("categoryId"); // filter by category id
    const group = searchParams.get("group");
    const featured = searchParams.get("featured");
    const search = searchParams.get("search");
    const mine = searchParams.get("mine");

    // ── ?mine=true — logged-in user's own services (creator dashboard) ────────
    if (mine === "true") {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const services = await prisma.service.findMany({
        where: { sellerId: session.user.id },
        include: {
          category: true,
          seller: {
            select: {
              id: true,
              name: true,
              image: true,
              store: true,
            },
          },
          options: { orderBy: { amount: "asc" } },
          _count: { select: { bookings: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ services, count: services.length });
    }

    // ── Public listing — active services only ─────────────────────────────────
    const services = await prisma.service.findMany({
      where: {
        active: true,
        // Filter by categoryId directly
        ...(categoryId && { categoryId }),
        // Filter by category name via relation
        ...(category && {
          category: { name: { equals: category, mode: "insensitive" } },
        }),
        ...(group && { group }),
        ...(featured === "true" && { featured: true }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            {
              category: {
                is: { name: { contains: search, mode: "insensitive" } },
              },
            },
          ],
        }),
      },
      include: {
        // ✅ Include full category relation so frontend gets name + icon + color
        category: true,
        seller: {
          select: {
            id: true,
            name: true,
            image: true,
            store: true,
          },
        },
        options: { where: { active: true }, orderBy: { amount: "asc" } },
        _count: { select: { bookings: true } },
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

// POST /api/services - Create new service (admin or creator only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRoles = Array.isArray(session.user.role)
      ? session.user.role
      : [session.user.role];

    if (!userRoles.some((r) => ["ADMIN", "CREATOR"].includes(r))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await req.json();

    const categoryId =
      data.categoryId ||
      (data.category
        ? (
            await prisma.serviceCategory.findUnique({
              where: { name: data.category },
            })
          )?.id
        : null);

    if (!data.name || !data.description || !categoryId || !data.group) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: name, description, categoryId, group",
        },
        { status: 400 },
      );
    }

    // Verify the category exists
    const categoryExists = await prisma.serviceCategory.findUnique({
      where: { id: categoryId },
    });
    if (!categoryExists) {
      return NextResponse.json(
        { error: "Invalid categoryId" },
        { status: 400 },
      );
    }

    const service = await prisma.service.create({
      data: {
        name: data.name,
        description: data.description,
        images: data.images || [],
        categoryId,
        group: data.group,
        featured: data.featured || false,
        rating: 0,
        reviews: 0,
        badge: data.badge || null,
        includes: data.includes || [],
        availability: data.availability || null,
        active: data.active ?? true,
        sellerId: session.user.id,
      },
      include: {
        category: true,
        options: true,
      },
    });

    return NextResponse.json({ service }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/services error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
