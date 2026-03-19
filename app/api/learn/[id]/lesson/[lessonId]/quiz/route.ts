import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; lessonId: string }> }
) {
  try {
    const { id, lessonId } = await params;
    const { answers } = await request.json();

    // For demo purposes, calculate a random score
    const score = Math.floor(Math.random() * 40) + 60; // 60-100%
    const passed = score >= 70;

    return NextResponse.json({
      success: true,
      data: { score, passed },
    });
  } catch (error) {
    console.error("Failed to submit quiz:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit quiz" },
      { status: 500 }
    );
  }
}
