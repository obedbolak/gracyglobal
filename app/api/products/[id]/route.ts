// app/api/products/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ── GET /api/products/[id] — get single product ──────────────────────────────
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error: any) {
    console.error("[GET /api/products/[id]]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ── PUT /api/products/[id] — update product (ADMIN ONLY) ─────────────────────
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await req.json();

    const product = await prisma.product.update({
      where: { id },
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
        badge: data.badge || null,
        benefits: data.benefits || [],
        ingredients: data.ingredients || [],
      },
    });

    return NextResponse.json({ product });
  } catch (error: any) {
    console.error("[PUT /api/products/[id]]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ── DELETE /api/products/[id] — delete product (ADMIN ONLY) ──────────────────
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[DELETE /api/products/[id]]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
