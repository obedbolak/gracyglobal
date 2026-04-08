// app/api/communities/my/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const memberships = await prisma.communityMember.findMany({
      where: { userId: session.user.id },
      include: {
        community: {
          include: {
            _count: {
              select: { members: true, posts: true },
            },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    });

    const data = memberships.map((m) => ({
      membershipId: m.id,
      joinedAt: m.joinedAt,
      role: m.role,
      community: {
        id: m.community.id,
        name: m.community.name,
        slug: m.community.slug,
        description: m.community.description,
        image: m.community.image,
        category: m.community.category,
        memberCount: m.community._count.members,
        postCount: m.community._count.posts,
      },
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/communities/my error:", error);
    return NextResponse.json(
      { error: "Failed to fetch communities" },
      { status: 500 },
    );
  }
}
