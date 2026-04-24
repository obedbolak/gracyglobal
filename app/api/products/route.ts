// app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, err, parsePagination } from "@/lib/api";

// ── GET /api/products (same as before)
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const { skip, limit, page } = parsePagination(sp);

    const category = sp.get("category");
    const group = sp.get("group");
    const featured = sp.get("featured");
    const search = sp.get("search");
    const sort = sp.get("sort") ?? "featured";
    const mine = sp.get("mine"); // ✅ Add mine parameter
    const minPrice = sp.get("minPrice")
      ? parseInt(sp.get("minPrice")!)
      : undefined;
    const maxPrice = sp.get("maxPrice")
      ? parseInt(sp.get("maxPrice")!)
      : undefined;

    // ✅ Handle mine=true for creator dashboard
    if (mine === "true") {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const products = await prisma.product.findMany({
        where: { sellerId: session.user.id },
        include: {
          category: {
            select: { id: true, name: true, icon: true, color: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ products, count: products.length });
    }

    // ── Where clause for public listing ──────────────────────────────────────
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

// ── POST /api/products — create product (ADMIN or CREATOR) ───────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Allow ADMIN or CREATOR
    const userRoles = Array.isArray(session.user.role)
      ? session.user.role
      : [session.user.role];

    if (!userRoles.some((r) => ["ADMIN", "MARKETPLACE"].includes(r))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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

    // Verify the category exists
    const categoryExists = await prisma.productCategory.findUnique({
      where: { id: data.categoryId },
    });
    if (!categoryExists) {
      return NextResponse.json(
        { error: "Invalid categoryId" },
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
        sellerId: session.user.id, // ✅ Set the creator as seller
      },
      include: {
        category: true,
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
