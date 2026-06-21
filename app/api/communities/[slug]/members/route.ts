// app/api/communities/[slug]/members/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";

    const community = await prisma.community.findUnique({ where: { slug } });
    if (!community) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    const members = await prisma.communityMember.findMany({
      where: {
        communityId: community.id,
        ...(search ? { user: { OR: [{ name: { contains: search, mode: "insensitive" } }, { country: { contains: search, mode: "insensitive" } }] } } : {}),
      },
      orderBy: { joinedAt: "asc" },
      include: { user: { select: { id: true, name: true, image: true, country: true } } },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("GET /api/communities/[slug]/members error:", error);
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  }
}

// PATCH — change a member's role (admin only)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { slug } = await params;
    const { memberId, role } = await req.json();

    if (!memberId || !role) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const updated = await prisma.communityMember.update({
      where: { id: memberId },
      data: { role },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/communities/[slug]/members error:", error);
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}

// DELETE — remove a member (admin only)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { memberId } = await req.json();
    if (!memberId) return NextResponse.json({ error: "Missing memberId" }, { status: 400 });

    await prisma.communityMember.delete({ where: { id: memberId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/communities/[slug]/members error:", error);
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
  }
}
