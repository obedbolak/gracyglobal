import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { COURSES } from "@/data/courses";

export async function GET() {
  try {
    return NextResponse.json({ success: true, data: COURSES });
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
