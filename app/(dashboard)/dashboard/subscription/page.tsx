"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Crown,
  Calendar,
  CreditCard,
  Loader2,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Zap,
  Star,
  Rocket,
  XCircle,
} from "lucide-react";

interface Plan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  priceMonthly: number;
  priceAnnual: number;
  counselorSessions: number;
  highlighted: boolean;
}

interface Subscription {
  id: string;
  status: string;
  billing: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  sessionsUsed: number;
  cancelAtPeriodEnd: boolean;
  plan: Plan;
}

const planIcons: Record<string, React.ElementType> = {
  free: Crown,
  starter: Zap,
  growth: Star,
  elite: Rocket,
  "elite / pro": Rocket,
};

export default function SubscriptionPage() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subRes, plansRes] = await Promise.all([
        fetch("/api/subscriptions"),
        fetch("/api/plans"),
      ]);

      const subData = await subRes.json();
      const plansData = await plansRes.json();

      if (subData.subscription) {
        setSubscription(subData.subscription);
      }
      setPlans(plansData.plans || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePlan = async (planId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          billing: subscription?.billing || "MONTHLY",
        }),
      });

      if (!res.ok) throw new Error("Failed to change plan");
      await fetchData();
    } catch (error) {
      console.error("Failed to change plan:", error);
      alert("Failed to change plan. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return { background: "var(--success-bg)", color: "var(--green)" };
      case "past_due":
        return { background: "var(--error-bg)", color: "var(--error-text)" };
      case "cancelled":
        return { background: "var(--glass-bg)", color: "var(--text-muted)" };
      default:
        return { background: "var(--warning-bg)", color: "var(--yellow)" };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: "var(--blue)" }}
        />
      </div>
    );
  }

  const sessionsRemaining = subscription
    ? subscription.plan.counselorSessions - subscription.sessionsUsed
    : 0;
  const usagePercentage = subscription
    ? (subscription.sessionsUsed / subscription.plan.counselorSessions) * 100
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          Subscription
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Manage your subscription and billing
        </p>
      </div>

      {/* Current Subscription */}
      {subscription ? (
        <div
          className="p-6 rounded-2xl"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-xl font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Current Plan
            </h2>
            <span
              className="px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1"
              style={getStatusStyle(subscription.status)}
            >
              <CheckCircle className="w-3 h-3" />
              {subscription.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              className="p-5 rounded-xl"
              style={{ background: "var(--glass-bg-subtle)" }}
            >
              <div className="flex items-center gap-3 mb-4">
                {(() => {
                  const Icon =
                    planIcons[subscription.plan.name.toLowerCase()] || Crown;
                  return (
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: "var(--glass-bg)" }}
                    >
                      <Icon
                        className="w-6 h-6"
                        style={{ color: "var(--purple)" }}
                      />
                    </div>
                  );
                })()}
                <div>
                  <h3
                    className="text-lg font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {subscription.plan.displayName}
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {subscription.billing === "ANNUAL" ? "Annual" : "Monthly"}{" "}
                    billing
                  </p>
                </div>
              </div>
              <p
                className="text-2xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {subscription.plan.priceMonthly > 0
                  ? `${subscription.plan.priceMonthly.toLocaleString()} XAF/mo`
                  : "Free"}
              </p>
            </div>

            <div
              className="p-5 rounded-xl"
              style={{ background: "var(--glass-bg-subtle)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Calendar
                  className="w-5 h-5"
                  style={{ color: "var(--text-muted)" }}
                />
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Billing Cycle
                </p>
              </div>
              <p
                className="text-sm mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                Started:{" "}
                {new Date(subscription.currentPeriodStart).toLocaleDateString()}
              </p>
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {subscription.cancelAtPeriodEnd ? "Expires" : "Renews"}:{" "}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Session Usage */}
          {subscription.plan.counselorSessions > 0 && (
            <div
              className="mt-6 p-5 rounded-xl"
              style={{ background: "var(--glass-bg-subtle)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3
                  className="font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Counseling Sessions
                </h3>
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {subscription.sessionsUsed} /{" "}
                  {subscription.plan.counselorSessions}
                </span>
              </div>
              <div
                className="w-full rounded-full h-2 mb-2"
                style={{ background: "var(--glass-bg)" }}
              >
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(usagePercentage, 100)}%`,
                    background:
                      usagePercentage >= 90
                        ? "var(--error-text)"
                        : usagePercentage >= 70
                          ? "var(--yellow)"
                          : "var(--green)",
                  }}
                />
              </div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {sessionsRemaining > 0
                  ? `${sessionsRemaining} sessions remaining this period`
                  : "No sessions remaining"}
              </p>
            </div>
          )}

          {/* Warnings */}
          {subscription.cancelAtPeriodEnd && (
            <div
              className="mt-6 p-4 rounded-xl flex items-start gap-3"
              style={{
                background: "var(--warning-bg)",
                border: "1px solid var(--yellow)",
              }}
            >
              <AlertTriangle
                className="w-5 h-5 flex-shrink-0"
                style={{ color: "var(--yellow)" }}
              />
              <div>
                <p
                  className="font-semibold mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  Subscription Ending
                </p>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Your subscription will not renew automatically and will expire
                  on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}.
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          className="p-8 rounded-2xl text-center"
          style={{
            background: "var(--glass-bg)",
            border: "2px dashed var(--glass-border)",
          }}
        >
          <Crown
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: "var(--text-muted)" }}
          />
          <h3
            className="text-xl font-semibold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            No Active Subscription
          </h3>
          <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
            Choose a plan below to unlock premium features
          </p>
        </div>
      )}

      {/* Available Plans */}
      <div>
        <h2
          className="text-xl font-semibold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          {subscription ? "Change Plan" : "Available Plans"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => {
            const Icon = planIcons[plan.name.toLowerCase()] || Crown;
            const isCurrent = subscription?.plan.id === plan.id;

            return (
              <div
                key={plan.id}
                className="p-5 rounded-xl transition-all"
                style={{
                  background: plan.highlighted
                    ? "linear-gradient(135deg, var(--purple-faint), var(--glass-bg))"
                    : "var(--glass-bg)",
                  border: `2px solid ${
                    isCurrent
                      ? "var(--green)"
                      : plan.highlighted
                        ? "var(--purple)"
                        : "var(--glass-border)"
                  }`,
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                  style={{
                    background: plan.highlighted
                      ? "var(--purple-faint)"
                      : "var(--glass-bg-subtle)",
                  }}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{
                      color: plan.highlighted
                        ? "var(--purple)"
                        : "var(--text-secondary)",
                    }}
                  />
                </div>
                <h3
                  className="font-bold mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  {plan.displayName}
                </h3>
                <p
                  className="text-xs mb-3"
                  style={{ color: "var(--text-muted)" }}
                >
                  {plan.description}
                </p>
                <p
                  className="text-2xl font-bold mb-4"
                  style={{ color: "var(--text-primary)" }}
                >
                  {plan.priceMonthly > 0
                    ? `${plan.priceMonthly.toLocaleString()} XAF`
                    : "Free"}
                  {plan.priceMonthly > 0 && (
                    <span
                      className="text-xs font-normal"
                      style={{ color: "var(--text-muted)" }}
                    >
                      /mo
                    </span>
                  )}
                </p>
                <button
                  onClick={() => handleChangePlan(plan.id)}
                  disabled={isCurrent || actionLoading}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    background: isCurrent
                      ? "var(--success-bg)"
                      : plan.highlighted
                        ? "var(--purple)"
                        : "var(--glass-bg-subtle)",
                    color: isCurrent
                      ? "var(--green)"
                      : plan.highlighted
                        ? "white"
                        : "var(--text-primary)",
                    border: isCurrent ? "1px solid var(--green)" : "none",
                  }}
                >
                  {isCurrent ? "Current Plan" : "Select Plan"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Method */}
      <div
        className="p-6 rounded-2xl"
        style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-xl font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Payment Method
          </h2>
          <button
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
            style={{ background: "var(--info-bg)", color: "var(--blue)" }}
          >
            Update
          </button>
        </div>
        <div
          className="flex items-center gap-4 p-4 rounded-xl"
          style={{ background: "var(--glass-bg-subtle)" }}
        >
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ background: "var(--glass-bg)" }}
          >
            <CreditCard
              className="w-6 h-6"
              style={{ color: "var(--text-muted)" }}
            />
          </div>
          <div>
            <p
              className="font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              No payment method on file
            </p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Add a payment method to enable automatic billing
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/plans"
          className="p-5 rounded-xl flex items-center justify-between transition-all hover:scale-[1.02]"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "var(--info-bg)" }}
            >
              <Star className="w-5 h-5" style={{ color: "var(--blue)" }} />
            </div>
            <div>
              <p
                className="font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                View All Plans
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Compare features & pricing
              </p>
            </div>
          </div>
          <ArrowRight
            className="w-5 h-5"
            style={{ color: "var(--text-muted)" }}
          />
        </Link>

        <Link
          href="/counselors"
          className="p-5 rounded-xl flex items-center justify-between transition-all hover:scale-[1.02]"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "var(--success-bg)" }}
            >
              <Calendar className="w-5 h-5" style={{ color: "var(--green)" }} />
            </div>
            <div>
              <p
                className="font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Book a Session
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Use your counseling sessions
              </p>
            </div>
          </div>
          <ArrowRight
            className="w-5 h-5"
            style={{ color: "var(--text-muted)" }}
          />
        </Link>
      </div>
    </div>
  );
}
