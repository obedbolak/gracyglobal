import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; lessonId: string }> }
) {
  try {
    const { id, lessonId } = await params;
    // For demo purposes, just return success
    return NextResponse.json({ 
      success: true, 
      data: { completed: true } 
    });
  } catch (error) {
    console.error("Failed to mark complete:", error);
    return NextResponse.json(
      { success: false, error: "Failed to mark complete" },
      { status: 500 }
    );
  }
}
