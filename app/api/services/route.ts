// app/api/services/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");

    const services = await prisma.product.findMany({
      where: {
        active: true,
        // Filter services - adjust based on your schema
        group: { not: "" }, // or use a specific marker
        ...(category && { category }),
        ...(featured === "true" && { featured: true }),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ services });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    const service = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        images: data.images || [],
        category: data.category,
        group: data.group || "service", // Mark as service
        stock: data.stock || 999,
        featured: data.featured || false,
        active: data.active ?? true,
        benefits: data.benefits || [],
        ingredients: data.ingredients || [],
      },
    });

    return NextResponse.json({ service }, { status: 201 });
  } catch (error: any) {
    console.error("Create service error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
