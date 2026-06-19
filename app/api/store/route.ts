import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Turn "Gracy Electronics!" → "gracy-electronics"
function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^a-z0-9]+/g, "-") // non-alphanumeric → hyphen
    .replace(/^-+|-+$/g, "") // trim leading/trailing hyphens
    .slice(0, 60);
}

// Ensure the slug is unique across stores, excluding the current user's own store.
async function uniqueSlug(base: string, userId: string): Promise<string> {
  const root = base || "store";
  let candidate = root;
  let n = 1;
  // Loop until we find a slug not used by another store.
  while (true) {
    const existing = await prisma.store.findUnique({
      where: { slug: candidate },
      select: { userId: true },
    });
    if (!existing || existing.userId === userId) return candidate;
    n += 1;
    candidate = `${root}-${n}`;
  }
}

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

  const userId = session.user.id;
  const cleanName = businessName.trim();

  // Keep an existing slug stable; only generate one if the store has none yet.
  const current = await prisma.store.findUnique({
    where: { userId },
    select: { slug: true },
  });
  const slug = current?.slug ?? (await uniqueSlug(slugify(cleanName), userId));

  const data = {
    businessName: cleanName,
    businessType: businessType?.trim() || null,
    image: image?.trim() || null,
    location: location?.trim() || null,
    quarter: quarter?.trim() || null,
    openingHours: openingHours?.trim() || null,
    description: description?.trim() || null,
    phone: phone?.trim() || null,
    whatsapp: whatsapp?.trim() || null,
    slug,
  };

  const store = await prisma.store.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });

  return NextResponse.json({ store });
}
