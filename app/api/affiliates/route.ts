import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ── Helpers ────────────────────────────────────────────────────────────────

function generateCode(name: string): string {
  const base = name.split(" ")[0].toUpperCase().slice(0, 6);
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${base}-${suffix}`;
}

function getTier(referrals: number): "STARTER" | "GROWTH" | "ELITE" {
  if (referrals >= 51) return "ELITE";
  if (referrals >= 11) return "GROWTH";
  return "STARTER";
}

// ── GET /api/affiliates — fetch current user's affiliate profile ────────────

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        affiliate: {
          include: {
            referrals: {
              orderBy: { createdAt: "desc" },
              take: 10,
            },
            payouts: { orderBy: { requestedAt: "desc" }, take: 5 },
          },
        },
      },
    });

    if (!user?.affiliate) {
      return NextResponse.json({ affiliate: null }, { status: 200 });
    }

    // ── Enrich referrals with referred user's name/email ──────────────────
    const enrichedReferrals = await Promise.all(
      user.affiliate.referrals.map(async (referral) => {
        const referred = await prisma.user.findUnique({
          where: { id: referral.referredUserId },
          select: { name: true, email: true, createdAt: true },
        });
        return {
          ...referral,
          name: referred?.name ?? "Unknown",
          email: referred?.email ?? "—",
          joinedAt: referred?.createdAt ?? referral.createdAt,
        };
      }),
    );

    return NextResponse.json(
      {
        affiliate: {
          ...user.affiliate,
          referrals: enrichedReferrals,
          // commissions not yet in schema — return empty array so
          // dashboard doesn't crash while accessing .length
          commissions: [],
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[GET /api/affiliates]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ── POST /api/affiliates — register as an affiliate ───────────────────────

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { affiliate: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.affiliate) {
      return NextResponse.json(
        { error: "Already registered as an affiliate" },
        { status: 409 },
      );
    }

    const code = generateCode(user.name ?? user.email);

    const affiliate = await prisma.affiliate.create({
      data: {
        userId: user.id,
        code,
        tier: "STARTER",
      },
    });

    return NextResponse.json(
      {
        affiliate: {
          ...affiliate,
          referrals: [],
          payouts: [],
          commissions: [],
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/affiliates]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ── PATCH /api/affiliates — recalculate tier ──────────────────────────────

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { affiliate: true },
    });

    if (!user?.affiliate) {
      return NextResponse.json({ error: "Not an affiliate" }, { status: 404 });
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyReferrals = await prisma.affiliateReferral.count({
      where: {
        affiliateId: user.affiliate.id,
        status: "CONVERTED",
        convertedAt: { gte: startOfMonth },
      },
    });

    const newTier = getTier(monthlyReferrals);

    const updated = await prisma.affiliate.update({
      where: { id: user.affiliate.id },
      data: { tier: newTier },
    });

    return NextResponse.json({ affiliate: updated }, { status: 200 });
  } catch (error) {
    console.error("[PATCH /api/affiliates]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
