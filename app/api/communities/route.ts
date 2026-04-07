import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const communities = await prisma.community.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { members: true, posts: true } },
        members: userId ? { where: { userId }, select: { id: true } } : false,
      },
    });

    const data = communities.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      image: c.image,
      category: c.category,
      memberCount: c._count.members,
      postCount: c._count.posts,
      isJoined: userId ? c.members.length > 0 : false,
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/communities error:", error);
    return NextResponse.json(
      { error: "Failed to fetch communities" },
      { status: 500 },
    );
  }
}
