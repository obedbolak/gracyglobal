import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get total members across all communities
    const totalMembers = await prisma.communityMember.count();

    // Get total posts across all communities
    const totalPosts = await prisma.communityPost.count();

    // Get unique countries from users who are community members
    const uniqueCountries = await prisma.user.findMany({
      where: {
        communityMembers: {
          some: {}, // Users who are members of at least one community
        },
      },
      select: {
        country: true,
      },
      distinct: ["country"],
    });

    const totalCountries = uniqueCountries.filter((u) => u.country).length;

    // Get total communities
    const totalCommunities = await prisma.community.count();

    const stats = {
      members: totalMembers,
      posts: totalPosts,
      countries: totalCountries,
      communities: totalCommunities,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("GET /api/community/stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch community stats" },
      { status: 500 },
    );
  }
}
