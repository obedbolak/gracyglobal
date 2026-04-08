// app/api/communities/[slug]/resources/route.ts
// Resources = community posts of type DOCUMENT.
// If you later add a dedicated Resource model, update this query.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const community = await prisma.community.findUnique({ where: { slug } });
    if (!community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 },
      );
    }

    const posts = await prisma.communityPost.findMany({
      where: {
        communityId: community.id,
        type: "DOCUMENT",
        published: true,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        content: true,
        mediaUrl: true,
        mediaType: true,
        tags: true,
        createdAt: true,
        _count: { select: { reactions: true } },
      },
    });

    // Shape to match the CommunityResource type in the hook
    const resources = posts.map((p) => ({
      id: p.id,
      communityId: community.id,
      title: p.title ?? "Untitled Resource",
      description: p.content ?? null,
      fileUrl: p.mediaUrl ?? "",
      fileType: p.mediaType ?? "application/octet-stream",
      downloads: p._count.reactions, // using reactions as a proxy for downloads
      tags: p.tags,
      createdAt: p.createdAt.toISOString(),
    }));

    return NextResponse.json(resources);
  } catch (error) {
    console.error("GET /api/communities/[slug]/resources error:", error);
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 500 },
    );
  }
}
