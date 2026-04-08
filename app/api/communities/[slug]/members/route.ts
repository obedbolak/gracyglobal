// app/api/communities/[slug]/members/route.ts

import { NextResponse } from "next/server";
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
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 },
      );
    }

    const members = await prisma.communityMember.findMany({
      where: {
        communityId: community.id,
        ...(search
          ? {
              user: {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { country: { contains: search, mode: "insensitive" } },
                ],
              },
            }
          : {}),
      },
      orderBy: { joinedAt: "asc" },
      include: {
        user: {
          select: { id: true, name: true, image: true, country: true },
        },
      },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("GET /api/communities/[slug]/members error:", error);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 },
    );
  }
}
