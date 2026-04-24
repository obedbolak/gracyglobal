// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/api";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ── GET /api/products/[id] ────────────────────────────────────────────────────
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true, icon: true, color: true },
        },
      },
    });

    if (!product) return err("Product not found", 404);

    return ok({ product });
  } catch (error: any) {
    console.error("[GET /api/products/[id]]", error);
    return err(error.message ?? "Internal server error", 500);
  }
}

// ── PUT /api/products/[id] — update (ADMIN or OWNER) ─────────────────────────
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return err("Unauthorized", 401);

    const { id } = await params;

    const existing = await prisma.product.findUnique({
      where: { id },
      select: { sellerId: true },
    });

    if (!existing) return err("Product not found", 404);

    // ✅ Check permissions: Admin or product owner
    const userRoles = Array.isArray(session.user.role)
      ? session.user.role
      : [session.user.role];

    const isAdmin = userRoles.includes("ADMIN");
    const isOwner = existing.sellerId === session.user.id;
    const isCreator = userRoles.includes("MARKETPLACE");

    if (!isAdmin && !(isCreator && isOwner)) {
      return err("You can only edit your own products", 403);
    }

    const data = await req.json();

    if (
      !data.name ||
      !data.description ||
      !data.categoryId ||
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
        categoryId: data.categoryId,
        group: data.group ?? "",
        stock: parseInt(data.stock),
        featured: data.featured ?? false,
        active: data.active ?? true,
        badge: data.badge ?? null,
        benefits: data.benefits ?? [],
        ingredients: data.ingredients ?? [],
      },
      include: {
        category: true,
      },
    });

    return ok({ product });
  } catch (error: any) {
    console.error("[PUT /api/products/[id]]", error);
    return err(error.message ?? "Failed to update product", 500);
  }
}

// ✅ Add PATCH method
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  return PUT(req, { params });
}

// ── DELETE /api/products/[id] — delete (ADMIN or OWNER) ──────────────────────
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return err("Unauthorized", 401);

    const { id } = await params;

    const existing = await prisma.product.findUnique({
      where: { id },
      select: { sellerId: true },
    });

    if (!existing) return err("Product not found", 404);

    // ✅ Check permissions: Admin or product owner
    const userRoles = Array.isArray(session.user.role)
      ? session.user.role
      : [session.user.role];

    const isAdmin = userRoles.includes("ADMIN");
    const isOwner = existing.sellerId === session.user.id;
    const isCreator = userRoles.includes("MARKETPLACE");

    if (!isAdmin && !(isCreator && isOwner)) {
      return err("You can only delete your own products", 403);
    }

    await prisma.product.delete({ where: { id } });

    return ok({ deleted: true });
  } catch (error: any) {
    console.error("[DELETE /api/products/[id]]", error);
    return err(error.message ?? "Failed to delete product", 500);
  }
}
