// app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, err, parsePagination } from "@/lib/api";
import { hasRole } from "@/lib/roleHelpers";

// ── GET /api/products ─────────────────────────────────────────────────────────
// Query params: category, group, featured, minPrice, maxPrice, search, sort, page, limit
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const { skip, limit, page } = parsePagination(sp);

    const category = sp.get("category");
    const group = sp.get("group");
    const featured = sp.get("featured");
    const search = sp.get("search");
    const sort = sp.get("sort") ?? "featured";
    const minPrice = sp.get("minPrice")
      ? parseInt(sp.get("minPrice")!)
      : undefined;
    const maxPrice = sp.get("maxPrice")
      ? parseInt(sp.get("maxPrice")!)
      : undefined;

    // ── Where clause ──────────────────────────────────────────────────────────
    const where: any = { active: true, stock: { gt: 0 } };

    if (category)
      where.category = {
        is: { name: { equals: category, mode: "insensitive" } },
      };
    if (group) where.group = { equals: group, mode: "insensitive" };
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

    // ── Order clause ──────────────────────────────────────────────────────────
    const orderBy: any[] = (() => {
      switch (sort) {
        case "price-asc":
          return [{ price: "asc" }];
        case "price-desc":
          return [{ price: "desc" }];
        case "newest":
          return [{ createdAt: "desc" }];
        case "rating":
          return [{ rating: "desc" }];
        case "featured":
        default:
          return [{ featured: "desc" }, { createdAt: "desc" }];
      }
    })();

    // ── Query ─────────────────────────────────────────────────────────────────
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: {
            select: { id: true, name: true, icon: true, color: true },
          },
        },
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
    const session = await getServerSession(authOptions);
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!hasRole(session.user.role, "ADMIN"))
      return NextResponse.json(
        { error: "Forbidden - Admin required" },
        { status: 403 },
      );

    const data = await req.json();

    if (
      !data.name ||
      !data.description ||
      !data.categoryId ||
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
        images: data.images ?? [],
        categoryId: data.categoryId,
        group: data.group ?? "",
        stock: parseInt(data.stock),
        featured: data.featured ?? false,
        active: data.active ?? true,
        rating: 0,
        reviews: 0,
        badge: data.badge ?? null,
        benefits: data.benefits ?? [],
        ingredients: data.ingredients ?? [],
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/products]", error);
    return NextResponse.json(
      { error: error.message ?? "Failed to create product" },
      { status: 500 },
    );
  }
}
