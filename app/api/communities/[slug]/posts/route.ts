import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PostType } from "@prisma/client";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }, // ✅ Promise type
) {
  try {
    const { slug } = await params; // ✅ Await params
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const community = await prisma.community.findUnique({
      where: { slug }, // ✅ Use destructured slug
    });

    if (!community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 },
      );
    }

    const posts = await prisma.communityPost.findMany({
      where: { communityId: community.id, published: true },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, image: true } },
        _count: { select: { comments: true, reactions: true } },
        reactions: userId
          ? { where: { userId }, select: { type: true } }
          : false,
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("GET /api/communities/[slug]/posts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 },
    );
  }
}

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

    const membership = await prisma.communityMember.findUnique({
      where: { userId_communityId: { userId, communityId: community.id } },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You must join this community to post" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const {
      title,
      content,
      type,
      mediaUrl,
      mediaType,
      linkUrl,
      linkPreview,
      tags,
    } = body;

    if (!type) {
      return NextResponse.json(
        { error: "Post type is required" },
        { status: 400 },
      );
    }

    const post = await prisma.communityPost.create({
      data: {
        userId,
        communityId: community.id,
        title: title || null,
        content: content || null,
        type: type as PostType,
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || null,
        linkUrl: linkUrl || null,
        linkPreview: linkPreview || null,
        tags: tags || [],
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("POST /api/communities/[slug]/posts error:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 },
    );
  }
}
