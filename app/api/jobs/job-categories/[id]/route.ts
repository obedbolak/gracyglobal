// app/api/jobs/job-categories/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasRole } from "@/lib/roleHelpers";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !hasRole(session.user.role, "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await req.json();

    const category = await prisma.jobCategoryModel.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        icon: data.icon,
        color: data.color,
        description: data.description,
        sortOrder: data.sortOrder,
        active: data.active,
      },
    });

    return NextResponse.json({ category });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !hasRole(session.user.role, "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.jobCategoryModel.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
