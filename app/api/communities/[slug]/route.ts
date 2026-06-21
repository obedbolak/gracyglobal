import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const membership = await prisma.communityMember.findFirst({
      where: { userId: session.user.id, community: { slug }, role: "ADMIN" },
    });

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, description, category, image } = await req.json();

    const updated = await prisma.community.update({
      where: { slug },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(category && { category }),
        image: image || null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/communities/[slug] error:", error);
    return NextResponse.json({ error: "Failed to update community" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.community.delete({ where: { slug } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/communities/[slug] error:", error);
    return NextResponse.json({ error: "Failed to delete community" }, { status: 500 });
  }
}
