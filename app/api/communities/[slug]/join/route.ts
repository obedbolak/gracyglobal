import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }, // ✅ Promise type
) {
  try {
    const { slug } = await params; // ✅ Await params

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const community = await prisma.community.findUnique({
      where: { slug }, // ✅ Use destructured slug
    });

    if (!community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 },
      );
    }

    const existing = await prisma.communityMember.findUnique({
      where: { userId_communityId: { userId, communityId: community.id } },
    });

    if (existing) {
      await prisma.communityMember.delete({ where: { id: existing.id } });
      return NextResponse.json({ joined: false, message: "Left community" });
    } else {
      await prisma.communityMember.create({
        data: { userId, communityId: community.id },
      });
      return NextResponse.json({ joined: true, message: "Joined community" });
    }
  } catch (error) {
    console.error("POST /api/communities/[slug]/join error:", error);
    return NextResponse.json(
      { error: "Failed to update membership" },
      { status: 500 },
    );
  }
}
