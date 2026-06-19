import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  if (!slug) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const store = await prisma.store.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      businessName: true,
      businessType: true,
      image: true,
      location: true,
      quarter: true,
      openingHours: true,
      description: true,
      phone: true,
      whatsapp: true,
      active: true,
      createdAt: true,
      userId: true,
    },
  });

  // Hide non-existent or deactivated stores from the public.
  if (!store || !store.active) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  // A store's products are the products sold by the store owner.
  const products = await prisma.product.findMany({
    where: { sellerId: store.userId, active: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      price: true,
      images: true,
      rating: true,
      reviews: true,
      stock: true,
      badge: true,
      featured: true,
      category: { select: { id: true, name: true, icon: true } },
    },
  });

  // Strip userId from the public response.
  const { userId, ...publicStore } = store;

  return NextResponse.json({ store: publicStore, products });
}
