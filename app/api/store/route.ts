import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const store = await prisma.store.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json({ store });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    businessName,
    businessType,
    image,
    location,
    quarter,
    openingHours,
    description,
    phone,
    whatsapp,
  } = body;

  if (
    !businessName ||
    typeof businessName !== "string" ||
    !businessName.trim()
  ) {
    return NextResponse.json(
      { error: "Business name is required" },
      { status: 400 },
    );
  }

  const data = {
    businessName: businessName.trim(),
    businessType: businessType?.trim() || null,
    image: image?.trim() || null,
    location: location?.trim() || null,
    quarter: quarter?.trim() || null,
    openingHours: openingHours?.trim() || null,
    description: description?.trim() || null,
    phone: phone?.trim() || null,
    whatsapp: whatsapp?.trim() || null,
  };

  const store = await prisma.store.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...data },
    update: data,
  });

  return NextResponse.json({ store });
}
