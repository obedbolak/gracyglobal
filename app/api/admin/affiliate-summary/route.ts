import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function quoteCsv(value: string | number | null | undefined) {
  if (value === null || value === undefined) return "";
  const text = String(value);
  if (text.includes(",") || text.includes("\n") || text.includes('"')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRoles = Array.isArray(session.user.role)
      ? session.user.role
      : [session.user.role];

    if (!userRoles.includes("ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const rawMonth = searchParams.get("month") || "";
    const monthMatch = rawMonth.match(/^(\d{4})-(\d{2})$/);

    if (!monthMatch) {
      return NextResponse.json(
        { error: "Use month=YYYY-MM" },
        { status: 400 },
      );
    }

    const year = Number(monthMatch[1]);
    const month = Number(monthMatch[2]);
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endDate = new Date(startDate);
    endDate.setUTCMonth(endDate.getUTCMonth() + 1);

    const [commissions, payouts] = await Promise.all([
      prisma.affiliateCommission.findMany({
        where: { createdAt: { gte: startDate, lt: endDate } },
        include: {
          affiliate: { include: { user: true } },
          referral: { include: { referredUser: true } },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.affiliatePayout.findMany({
        where: { requestedAt: { gte: startDate, lt: endDate } },
        include: { affiliate: { include: { user: true } } },
        orderBy: { requestedAt: "asc" },
      }),
    ]);

    const rows = [
      [
        "Type",
        "Affiliate",
        "Affiliate Email",
        "Amount",
        "Status",
        "Created At",
        "Reference",
        "Referral User",
        "Referral Email",
      ],
    ];

    for (const commission of commissions) {
      rows.push([
        "Commission",
        commission.affiliate.user.name ?? "-",
        commission.affiliate.user.email,
        `CFA ${commission.amount}`,
        commission.status,
        commission.createdAt.toISOString(),
        commission.paymentId,
        commission.referral.referredUser.name ?? "-",
        commission.referral.referredUser.email,
      ]);
    }

    for (const payout of payouts) {
      rows.push([
        "Payout",
        payout.affiliate.user.name ?? "-",
        payout.affiliate.user.email,
        `CFA ${payout.amount}`,
        payout.status,
        payout.requestedAt.toISOString(),
        payout.reference ?? "-",
        "-",
        "-",
      ]);
    }

    const csv = rows.map((row) => row.map(quoteCsv).join(",")).join("\n");
    const filename = `affiliate-summary-${rawMonth}.csv`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("[GET /api/admin/affiliate-summary]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
