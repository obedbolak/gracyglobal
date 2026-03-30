// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/api";
import { hasRole } from "@/lib/roleHelpers";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ── GET /api/products/[id] ────────────────────────────────────────────────────
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) return err("Product not found", 404);

    // Wrap in { success: true, data: { product } } — matches useProduct() fetcher
    return ok({ product });
  } catch (error: any) {
    console.error("[GET /api/products/[id]]", error);
    return err(error.message ?? "Internal server error", 500);
  }
}

// ── PUT /api/products/[id] — update (ADMIN ONLY) ──────────────────────────────
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return err("Unauthorized", 401);
    if (!hasRole(session.user.role, "ADMIN"))
      return err("Forbidden - Admin required", 403);

    const { id } = await params;
    const data = await req.json();

    if (
      !data.name ||
      !data.description ||
      !data.category ||
      data.price === undefined ||
      data.stock === undefined
    ) {
      return err("Missing required fields", 400);
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: parseInt(data.price),
        images: data.images ?? [],
        category: data.category,
        group: data.group ?? "",
        stock: parseInt(data.stock),
        featured: data.featured ?? false,
        active: data.active ?? true,
        badge: data.badge ?? null,
        benefits: data.benefits ?? [],
        ingredients: data.ingredients ?? [],
      },
    });

    return ok({ product });
  } catch (error: any) {
    console.error("[PUT /api/products/[id]]", error);
    return err(error.message ?? "Failed to update product", 500);
  }
}

// ── DELETE /api/products/[id] — delete (ADMIN ONLY) ───────────────────────────
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return err("Unauthorized", 401);
    if (!hasRole(session.user.role, "ADMIN"))
      return err("Forbidden - Admin required", 403);

    const { id } = await params;

    await prisma.product.delete({ where: { id } });

    return ok({ deleted: true });
  } catch (error: any) {
    console.error("[DELETE /api/products/[id]]", error);
    return err(error.message ?? "Failed to delete product", 500);
  }
}