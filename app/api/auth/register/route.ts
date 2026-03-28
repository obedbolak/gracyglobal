// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone, country, role, image } =
      await req.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 12);

    // Create user with all fields
    const user = await prisma.user.create({
      data: {
        name: name || null,
        email,
        password: hashed,
        phone: phone || null,
        country: country || null,
        role: role || "USER", // Support COUNSELOR, ADMIN, etc.
        image: image || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        country: true,
        image: true,
        createdAt: true,
      },
    });

    console.log("✅ User created:", user);

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("❌ [POST /api/auth/register]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
