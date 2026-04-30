import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, DollarSign, Download, Clock3 } from "lucide-react";
import StatsCard from "@/components/admin/StatsCard";
import { AffiliateApprovalTable } from "./_components/AffiliateApprovalTable";

function formatMonthLabel(date: Date) {
  return date.toLocaleString("default", { month: "long", year: "numeric" });
}

export default async function AdminAffiliatesPage() {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));
  const monthEnd = new Date(monthStart);
  monthEnd.setUTCMonth(monthEnd.getUTCMonth() + 1);

  const [affiliates, pendingCommissions, monthlyCommissionSummary, monthlyPayoutSummary] =
    await Promise.all([
      prisma.affiliate.findMany({
        include: { user: true },
        orderBy: { totalEarnings: "desc" },
      }),
      prisma.affiliateCommission.findMany({
        where: { status: "PENDING" },
        include: {
          affiliate: { include: { user: true } },
          referral: { include: { referredUser: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.affiliateCommission.aggregate({
        where: { createdAt: { gte: monthStart, lt: monthEnd } },
        _sum: { amount: true },
        _count: { _all: true },
      }),
      prisma.affiliatePayout.aggregate({
        where: { requestedAt: { gte: monthStart, lt: monthEnd } },
        _sum: { amount: true },
        _count: { _all: true },
      }),
    ]);

  const pendingCommissionsData = pendingCommissions.map((commission) => ({
    ...commission,
    createdAt: commission.createdAt.toISOString(),
  }));

  const summary = {
    affiliates: affiliates.length,
    pendingCommissions: pendingCommissions.length,
    monthlyCommissionTotal: monthlyCommissionSummary._sum.amount ?? 0,
    monthlyPayoutRequests: monthlyPayoutSummary._count._all,
    monthlyPayoutTotal: monthlyPayoutSummary._sum.amount ?? 0,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Affiliates</h1>
          <p className="text-[var(--text-muted)] mt-2">
            Manage affiliate users, approve commission payments, and download monthly summary reports.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/api/admin/affiliate-summary?month=${month}`}
            className="btn-secondary flex items-center gap-2 px-6 py-3 rounded-lg"
          >
            <Download className="w-4 h-4" />
            Download {formatMonthLabel(monthStart)} Summary
          </Link>
          <Link
            href="/admin/users"
            className="btn-primary flex items-center gap-2 px-6 py-3 rounded-lg"
          >
            <Users className="w-4 h-4" />
            View Users
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Affiliates"
          value={summary.affiliates}
          icon={Users}
          color="purple"
        />
        <StatsCard
          title="Pending Commissions"
          value={summary.pendingCommissions}
          icon={Clock3}
          color="scarlet"
        />
        <StatsCard
          title="Month Commission Total"
          value={`CFA ${summary.monthlyCommissionTotal.toLocaleString()}`}
          icon={DollarSign}
          color="blue"
        />
        <StatsCard
          title="Payout Requests"
          value={summary.monthlyPayoutRequests}
          icon={DollarSign}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">
        <div className="glass p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                Pending Commission Approvals
              </h2>
              <p className="text-[var(--text-muted)] mt-1">
                Review and approve affiliate commission payments before they are paid out.
              </p>
            </div>
          </div>
          <AffiliateApprovalTable commissions={pendingCommissionsData} />
        </div>

        <div className="space-y-4">
          <div className="glass p-6 rounded-3xl">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
              Top Affiliates
            </h3>
            <div className="space-y-3">
              {affiliates.slice(0, 5).map((affiliate) => (
                <div
                  key={affiliate.id}
                  className="border border-[var(--divider)] rounded-2xl p-4"
                >
                  <p className="font-semibold text-[var(--text-primary)]">
                    {affiliate.user.name ?? affiliate.user.email}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">
                    {affiliate.user.email}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="px-3 py-1 rounded-full bg-[var(--sidebar-item-active)] text-[var(--purple)]">
                      Tier: {affiliate.tier}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-[var(--sidebar-item-active)] text-[var(--purple)]">
                      Earnings: CFA {affiliate.totalEarnings.toLocaleString()}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-[var(--sidebar-item-active)] text-[var(--purple)]">
                      Pending: CFA {affiliate.pendingPayout.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass p-6 rounded-3xl">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
              Monthly Snapshot
            </h3>
            <p className="text-[var(--text-muted)] leading-7">
              The download button exports a CSV file with all commissions and payout requests for the selected month.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
