// app/api/courses/[id]/sections/[sectionId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasRole } from "@/lib/roleHelpers";

interface RouteParams {
  params: Promise<{ id: string; sectionId: string }>;
}

// PUT — rename section
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !hasRole(session.user.role, "ADMIN"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { sectionId } = await params;
    const { title } = await req.json();
    if (!title?.trim())
      return NextResponse.json({ error: "Title is required" }, { status: 400 });

    const section = await prisma.courseSection.update({
      where: { id: sectionId },
      data: { title: title.trim() },
    });

    return NextResponse.json({ section });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE — delete section and its lessons
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !hasRole(session.user.role, "ADMIN"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { sectionId } = await params;
    await prisma.courseSection.delete({ where: { id: sectionId } });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
