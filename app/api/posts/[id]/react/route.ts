import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReactionType } from "@prisma/client";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }, // ✅ Promise type
) {
  try {
    const { id: postId } = await params; // ✅ Await params

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { type } = await req.json();

    if (!["LIKE", "LOVE", "SUPPORT"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid reaction type" },
        { status: 400 },
      );
    }

    const existing = await prisma.postReaction.findUnique({
      where: {
        userId_postId_type: { userId, postId, type: type as ReactionType }, // ✅ Use destructured postId
      },
    });

    if (existing) {
      await prisma.postReaction.delete({ where: { id: existing.id } });
      return NextResponse.json({ reacted: false, type });
    } else {
      await prisma.postReaction.create({
        data: { userId, postId, type: type as ReactionType }, // ✅ Use destructured postId
      });
      return NextResponse.json({ reacted: true, type });
    }
  } catch (error) {
    console.error("POST /api/posts/[id]/react error:", error);
    return NextResponse.json({ error: "Failed to react" }, { status: 500 });
  }
}
