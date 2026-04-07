// app/api/community/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ok,
  err,
  requireUser,
  parsePagination,
  validateRequired,
} from "@/lib/api";

// ── GET /api/community — list posts ──────────────────────────────────────────
// Query params: category, tag, search, page, limit
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const { skip, limit, page } = parsePagination(sp);

    const category = sp.get("category");
    const tag = sp.get("tag");
    const search = sp.get("search");

    const where: any = { published: true };

    if (category) where.category = { equals: category, mode: "insensitive" };
    if (tag) where.tags = { has: tag };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.communityPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, image: true } },
        },
      }),
      prisma.communityPost.count({ where }),
    ]);

    return ok({
      items: posts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (e) {
    console.error("[GET /api/community]", e);
    return err("Internal server error", 500);
  }
}

// ── POST /api/community — create a post ──────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    if (!user) return err("Unauthorized", 401);

    const body = await req.json();
    const { title, content, category, tags = [], communityId } = body; // ✅ Add communityId

    const missing = validateRequired(body, [
      "title",
      "content",
      "category",
      "communityId",
    ]); // ✅
    if (missing) return err(missing);

    if (typeof title !== "string" || title.trim().length < 5) {
      return err("Title must be at least 5 characters");
    }
    if (typeof content !== "string" || content.trim().length < 20) {
      return err("Content must be at least 20 characters");
    }
    if (!Array.isArray(tags) || tags.some((t) => typeof t !== "string")) {
      return err("'tags' must be an array of strings");
    }
    if (tags.length > 8) return err("Maximum 8 tags allowed");

    // ✅ Verify community exists
    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });
    if (!community) return err("Community not found", 404);

    const post = await prisma.communityPost.create({
      data: {
        userId: user.id,
        communityId, // ✅ Required field
        title: title.trim(),
        content: content.trim(),
        category: category.trim(),
        tags,
        published: true,
      },
      include: {
        user: { select: { name: true, image: true } },
      },
    });

    return ok(post, 201);
  } catch (e) {
    console.error("[POST /api/community]", e);
    return err("Internal server error", 500);
  }
}
