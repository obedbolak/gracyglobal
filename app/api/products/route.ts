// app/api/products/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, err, parsePagination } from "@/lib/api";

// ── GET /api/products — list products ────────────────────────────────────────
// Query params: category, featured, minPrice, maxPrice, search, page, limit
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const { skip, limit, page } = parsePagination(sp);

    const category = sp.get("category");
    const featured = sp.get("featured");
    const search = sp.get("search");
    const minPrice = sp.get("minPrice")
      ? parseInt(sp.get("minPrice")!)
      : undefined;
    const maxPrice = sp.get("maxPrice")
      ? parseInt(sp.get("maxPrice")!)
      : undefined;

    const where: any = { active: true, stock: { gt: 0 } };

    if (category) where.category = { equals: category, mode: "insensitive" };
    if (featured === "true") where.featured = true;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {
        ...(minPrice !== undefined ? { gte: minPrice } : {}),
        ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
      };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      }),
      prisma.product.count({ where }),
    ]);

    return ok({
      items: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (e) {
    console.error("[GET /api/products]", e);
    return err("Internal server error", 500);
  }
}

// ── POST /api/products — create product (ADMIN ONLY) ─────────────────────────
export async function POST(req: NextRequest) {
  try {
    console.log("📦 POST /api/products - Starting...");

    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      console.log("❌ No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      console.log("❌ User is not admin:", session.user.role);
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 },
      );
    }

    const data = await req.json();
    console.log("📝 Received data:", {
      name: data.name,
      category: data.category,
      price: data.price,
      stock: data.stock,
    });

    // Validate required fields
    if (
      !data.name ||
      !data.description ||
      !data.category ||
      data.price === undefined ||
      data.stock === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: parseInt(data.price),
        images: data.images || [],
        category: data.category,
        group: data.group || "",
        stock: parseInt(data.stock),
        featured: data.featured || false,
        active: data.active ?? true,
        rating: 0,
        reviews: 0,
        badge: data.badge || null,
        benefits: data.benefits || [],
        ingredients: data.ingredients || [],
      },
    });

    console.log("✅ Product created:", product.id);

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: any) {
    console.error("❌ Create product error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create product" },
      { status: 500 },
    );
  }
}
