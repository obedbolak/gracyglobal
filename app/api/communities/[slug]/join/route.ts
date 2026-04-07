import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { slug: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const community = await prisma.community.findUnique({
      where: { slug: params.slug },
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
      // Already a member → leave
      await prisma.communityMember.delete({ where: { id: existing.id } });
      return NextResponse.json({ joined: false, message: "Left community" });
    } else {
      // Not a member → join
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
