"use client";

import { DollarSign, TrendingUp, Calendar, ArrowUpRight } from "lucide-react";

interface EarningsData {
  totalEarnings: number;
  monthlyEarnings: number;
  pendingPayouts: number;
  completedPayouts: number;
  recentPayments: {
    id: string;
    amount: number;
    date: string;
    status: string;
    clientName: string;
  }[];
}

export default function EarningsChart({
  totalEarnings,
  monthlyEarnings,
  pendingPayouts,
  completedPayouts,
  recentPayments,
}: EarningsData) {
  const summaryCards = [
    {
      title: "Total Earnings",
      value: `${totalEarnings.toLocaleString()} XAF`,
      icon: DollarSign,
      color: "var(--success-text)",
      bg: "var(--success-bg)",
    },
    {
      title: "This Month",
      value: `${monthlyEarnings.toLocaleString()} XAF`,
      icon: TrendingUp,
      color: "var(--blue)",
      bg: "var(--info-bg)",
    },
    {
      title: "Pending Payout",
      value: `${pendingPayouts.toLocaleString()} XAF`,
      icon: Calendar,
      color: "var(--warning-text)",
      bg: "var(--warning-bg)",
    },
    {
      title: "Paid Out",
      value: `${completedPayouts.toLocaleString()} XAF`,
      icon: ArrowUpRight,
      color: "var(--purple)",
      bg: "var(--badge-purple-bg)",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="p-5 rounded-2xl"
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-xs font-medium"
                  style={{ color: "var(--text-muted)" }}
                >
                  {card.title}
                </span>
                <div className="p-2 rounded-lg" style={{ background: card.bg }}>
                  <Icon className="w-4 h-4" style={{ color: card.color }} />
                </div>
              </div>
              <p
                className="text-xl font-extrabold"
                style={{ color: "var(--text-primary)" }}
              >
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent payments table */}
      <div
        className="p-5 rounded-2xl"
        style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
        }}
      >
        <h3
          className="text-sm font-bold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Recent Payments
        </h3>
        <div className="space-y-3">
          {recentPayments.length === 0 ? (
            <p
              className="text-sm text-center py-6"
              style={{ color: "var(--text-muted)" }}
            >
              No payments yet
            </p>
          ) : (
            recentPayments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: "var(--glass-bg-subtle)" }}
              >
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {payment.clientName}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {new Date(payment.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="text-sm font-bold"
                    style={{ color: "var(--success-text)" }}
                  >
                    +{payment.amount.toLocaleString()} XAF
                  </p>
                  <p
                    className="text-[10px] font-medium"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {payment.status}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
