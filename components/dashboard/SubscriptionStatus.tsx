// components/dashboard/SubscriptionStatus.tsx
"use client";

import Link from "next/link";
import {
  Crown,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowUpRight,
  Zap,
  Package,
  BookOpen,
} from "lucide-react";

interface PricingPlan {
  id: string;
  planCode: string;
  category: string;
  name: string;
  price: number;
  interval: string;
  commissionRate: number | null;
  productLimit: number | null;
  leadLimit: number | null;
  courseLimit: number | null;
  features: string[];
}

interface UserSubscription {
  id: string;
  status: string;
  currentPeriodEnd: string;
  sessionsUsed: number;
  leadsUsed: number;
  productsUsed: number;
  coursesUsed: number;
  cancelAtPeriodEnd: boolean;
  plan: PricingPlan;
}

interface SubscriptionStatusProps {
  subscription?: UserSubscription;
}

export default function SubscriptionStatus({
  subscription,
}: SubscriptionStatusProps) {
  if (!subscription) {
    return (
      <div
        className="p-6 rounded-2xl"
        style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
        }}
      >
        <div className="text-center py-8">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ background: "var(--glass-bg-subtle)" }}
          >
            <Crown className="w-8 h-8" style={{ color: "var(--text-muted)" }} />
          </div>
          <h3
            className="font-bold text-lg mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            No Active Subscription
          </h3>
          <p
            className="text-sm mb-6"
            style={{ color: "var(--text-secondary)" }}
          >
            Unlock premium features and grow faster with a subscription plan.
          </p>
          <Link
            href="/plans"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, var(--purple), var(--blue))",
            }}
          >
            <Sparkles className="w-4 h-4" />
            View Plans
          </Link>
        </div>
      </div>
    );
  }

  const { plan, status, currentPeriodEnd, cancelAtPeriodEnd } = subscription;
  const isFree = plan.price === 0;
  const isActive = status === "ACTIVE";
  const isPastDue = status === "PAST_DUE";
  const daysUntilRenewal = Math.ceil(
    (new Date(currentPeriodEnd).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24),
  );

  const getStatusBadge = () => {
    switch (status) {
      case "ACTIVE":
        return {
          icon: CheckCircle2,
          text: "Active",
          color: "var(--green)",
          bg: "var(--success-bg)",
        };
      case "PAST_DUE":
        return {
          icon: AlertCircle,
          text: "Past Due",
          color: "var(--yellow)",
          bg: "var(--warning-bg)",
        };
      case "CANCELLED":
        return {
          icon: XCircle,
          text: "Cancelled",
          color: "var(--error-text)",
          bg: "var(--error-bg)",
        };
      case "TRIALING":
        return {
          icon: Sparkles,
          text: "Trial",
          color: "var(--purple)",
          bg: "rgba(99,74,221,0.1)",
        };
      default:
        return {
          icon: AlertCircle,
          text: status,
          color: "var(--text-muted)",
          bg: "var(--glass-bg-subtle)",
        };
    }
  };

  const statusBadge = getStatusBadge();
  const StatusIcon = statusBadge.icon;

  const getIntervalLabel = (interval: string) => {
    switch (interval) {
      case "MONTHLY":
        return "month";
      case "YEARLY":
        return "year";
      default:
        return "";
    }
  };

  // Calculate usage percentages
  const usageStats = [
    plan.leadLimit && {
      icon: Zap,
      label: "Leads",
      used: subscription.leadsUsed,
      total: plan.leadLimit,
      color: "var(--blue)",
    },
    plan.productLimit && {
      icon: Package,
      label: "Products",
      used: subscription.productsUsed,
      total: plan.productLimit,
      color: "var(--yellow)",
    },
    plan.courseLimit && {
      icon: BookOpen,
      label: "Courses",
      used: subscription.coursesUsed,
      total: plan.courseLimit,
      color: "var(--purple)",
    },
  ].filter(Boolean);

  return (
    <div
      className="p-6 rounded-2xl"
      style={{
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: isFree
                ? "var(--glass-bg-subtle)"
                : "linear-gradient(135deg, var(--purple), var(--blue))",
            }}
          >
            <Crown
              className="w-6 h-6"
              style={{ color: isFree ? "var(--text-muted)" : "#fff" }}
            />
          </div>
          <div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {plan.category}
            </p>
            <h3
              className="font-bold text-lg"
              style={{ color: "var(--text-primary)" }}
            >
              {plan.name}
            </h3>
          </div>
        </div>
        <span
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{
            background: statusBadge.bg,
            color: statusBadge.color,
          }}
        >
          <StatusIcon className="w-3.5 h-3.5" />
          {statusBadge.text}
        </span>
      </div>

      {/* Price */}
      {!isFree && (
        <div className="mb-4">
          <p className="text-2xl font-bold" style={{ color: "var(--purple)" }}>
            {plan.price.toLocaleString()}{" "}
            <span
              className="text-sm font-normal"
              style={{ color: "var(--text-muted)" }}
            >
              FCFA/{getIntervalLabel(plan.interval)}
            </span>
          </p>
        </div>
      )}

      {/* Commission Rate */}
      {plan.commissionRate !== null && (
        <div
          className="p-3 rounded-xl mb-4 flex items-center justify-between"
          style={{ background: "var(--glass-bg-subtle)" }}
        >
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Commission Rate
          </span>
          <span className="font-bold" style={{ color: "var(--text-primary)" }}>
            {plan.commissionRate}%
          </span>
        </div>
      )}

      {/* Usage Stats */}
      {usageStats.length > 0 && (
        <div className="space-y-3 mb-4">
          {usageStats.map((stat: any, idx) => {
            const Icon = stat.icon;
            const percentage =
              stat.total > 0 ? (stat.used / stat.total) * 100 : 0;
            const isNearLimit = percentage >= 80;

            return (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" style={{ color: stat.color }} />
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {stat.label}
                    </span>
                  </div>
                  <span
                    className="text-sm font-semibold"
                    style={{
                      color: isNearLimit
                        ? "var(--yellow)"
                        : "var(--text-secondary)",
                    }}
                  >
                    {stat.used} / {stat.total === 0 ? "∞" : stat.total}
                  </span>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: "var(--glass-bg-subtle)" }}
                >
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${Math.min(percentage, 100)}%`,
                      background: isNearLimit
                        ? "var(--yellow)"
                        : `linear-gradient(90deg, ${stat.color}, ${stat.color})`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Renewal Info */}
      {isActive && !isFree && (
        <div
          className="p-3 rounded-xl mb-4 flex items-start gap-3"
          style={{
            background: cancelAtPeriodEnd
              ? "var(--warning-bg)"
              : "var(--info-bg)",
          }}
        >
          <Calendar
            className="w-4 h-4 mt-0.5 flex-shrink-0"
            style={{
              color: cancelAtPeriodEnd ? "var(--yellow)" : "var(--blue)",
            }}
          />
          <div>
            <p
              className="text-sm font-semibold mb-0.5"
              style={{
                color: cancelAtPeriodEnd ? "var(--yellow)" : "var(--blue)",
              }}
            >
              {cancelAtPeriodEnd ? "Ends" : "Renews"} in {daysUntilRenewal} days
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {new Date(currentPeriodEnd).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      )}

      {/* Past Due Warning */}
      {isPastDue && (
        <div
          className="p-3 rounded-xl mb-4 flex items-start gap-3"
          style={{ background: "var(--error-bg)" }}
        >
          <AlertCircle
            className="w-4 h-4 mt-0.5 flex-shrink-0"
            style={{ color: "var(--error-text)" }}
          />
          <div>
            <p
              className="text-sm font-semibold mb-0.5"
              style={{ color: "var(--error-text)" }}
            >
              Payment Required
            </p>
            <p className="text-xs" style={{ color: "var(--error-text)" }}>
              Please update your payment method to continue using this plan.
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {isPastDue && (
          <Link
            href="/plans/payment"
            className="flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold text-center text-white transition-all hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, var(--purple), var(--blue))",
            }}
          >
            Update Payment
          </Link>
        )}
        {isActive && !isFree && (
          <Link
            href="/plans"
            className="flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold text-center transition-all hover:opacity-90 flex items-center justify-center gap-1.5"
            style={{
              background: "var(--glass-bg-subtle)",
              border: "1px solid var(--divider)",
              color: "var(--text-primary)",
            }}
          >
            <TrendingUp className="w-4 h-4" />
            Upgrade
          </Link>
        )}
        <Link
          href="/dashboard/subscriptions"
          className="py-2.5 px-4 rounded-lg text-sm font-semibold transition-all hover:opacity-80"
          style={{
            background: "var(--glass-bg-subtle)",
            color: "var(--text-secondary)",
          }}
        >
          Manage
        </Link>
      </div>

      {/* View All Plans Link */}
      {!isFree && (
        <Link
          href="/plans"
          className="mt-4 flex items-center justify-center gap-1 text-xs font-semibold transition-opacity hover:opacity-80"
          style={{ color: "var(--blue)" }}
        >
          View all plans
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}
