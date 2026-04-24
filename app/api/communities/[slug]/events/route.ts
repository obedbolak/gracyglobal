// app/api/communities/[slug]/events/route.ts
// Events are LiveSession records whose course belongs to this community category.
// If you later add a direct community→events relation, update this query.

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

    // Fetch live sessions whose course category matches the community category
    // Adjust this query once you have a direct CommunityEvent model
    const liveSessions = await prisma.liveSession.findMany({
      where: {
        course: {
          category: {
            name: community.category, // ← wrap in object with 'name' field
          },
        },
        status: { not: "CANCELLED" },
      },
      orderBy: { scheduledAt: "asc" },
      select: {
        id: true,
        title: true,
        description: true,
        scheduledAt: true,
        duration: true,
        meetingUrl: true,
        status: true,
        createdAt: true,
        courseId: true,
      },
    });

    // Shape to match the CommunityEvent type in the hook
    const events = liveSessions.map((s) => ({
      id: s.id,
      communityId: community.id,
      title: s.title,
      description: s.description ?? null,
      scheduledAt: s.scheduledAt.toISOString(),
      duration: s.duration,
      meetingUrl: s.meetingUrl ?? null,
      status: s.status,
      createdAt: s.createdAt.toISOString(),
    }));

    return NextResponse.json(events);
  } catch (error) {
    console.error("GET /api/communities/[slug]/events error:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 },
    );
  }
}
