// app/plans/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Crown,
  CheckCircle,
  Loader2,
  ArrowLeft,
  Zap,
  Star,
  Rocket,
} from "lucide-react";

// Matches PricingPlan model in schema.prisma exactly
interface Plan {
  id: string;
  planCode: string;
  category: "COUNSELLOR" | "MARKETPLACE" | "SERVICE" | "TEACHER" | "STUDENT";
  name: string;
  price: number;
  interval: "MONTHLY" | "YEARLY" | "ONGOING" | "PER_LEAD" | "PER_USE";
  commissionRate: number | null;
  productLimit: number | null;
  leadLimit: number | null;
  courseLimit: number | null;
  features: string[];
  active: boolean;
  sortOrder: number;
}

// Matches UserSubscription model in schema.prisma
interface CurrentSubscription {
  id: string;
  planId: string;
  status: "ACTIVE" | "PAST_DUE" | "CANCELLED" | "EXPIRED" | "TRIALING";
  currentPeriodEnd: string;
  plan: Plan;
}

const planIcons: Record<string, React.ElementType> = {
  free: Crown,
  starter: Zap,
  growth: Star,
  elite: Rocket,
  "elite / pro": Rocket,
  monthly: Zap,
  yearly: Rocket,
};

// Highlighted plans by planCode
const HIGHLIGHTED_PLANS = ["C2", "M2", "S2", "T2"];

export default function PlansPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSub, setCurrentSub] = useState<CurrentSubscription | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [session]);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/plans");
      const data = await res.json();

      if (data.success) {
        setPlans(data.data.plans || []);
        if (data.data.subscription) {
          setCurrentSub(data.data.subscription);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planCode: string, planName: string) => {
    if (!session) {
      router.push("/login?callbackUrl=/plans");
      return;
    }

    setSubscribing(planCode);
    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planCode }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        await fetchData();
        // Force session refresh from database
        await update();
        // Force full page reload to ensure server-side session updates
        window.location.href = "/dashboard";
      } else if (
        res.status === 400 &&
        data.error === "You already have this subscription"
      ) {
        // Already subscribed - treat as success
        await fetchData();
        await update();
        window.location.href = "/dashboard";
      } else {
        throw new Error(data.error || "Failed to subscribe");
      }
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Failed to subscribe. Please try again.");
    } finally {
      setSubscribing(null);
    }
  };

  const getButtonLabel = (plan: Plan) => {
    if (!session) return "Sign up to subscribe";
    if (currentSub?.planId === plan.id && currentSub.status === "ACTIVE")
      return "Current Plan";
    if (plan.price === 0) return "Get Started Free";
    return `Subscribe – ${plan.price.toLocaleString()} XAF`;
  };

  const isCurrentPlan = (plan: Plan) =>
    currentSub?.planId === plan.id && currentSub.status === "ACTIVE";

  const getIntervalLabel = (interval: Plan["interval"]) => {
    switch (interval) {
      case "MONTHLY":
        return "/mo";
      case "YEARLY":
        return "/yr";
      case "PER_LEAD":
        return "/lead";
      case "PER_USE":
        return "/use";
      case "ONGOING":
        return "";
    }
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: "var(--background)" }}
      >
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: "var(--blue)" }}
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-12"
      style={{ background: "var(--background)" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm mb-6 transition-all hover:opacity-70"
            style={{ color: "var(--text-muted)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1
            className="text-4xl font-bold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Choose Your Plan
          </h1>
          <p
            className="text-lg max-w-xl mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            Unlock counseling sessions, creator tools, and premium features.
          </p>
        </div>

        {/* Plans grid */}
        {plans.length === 0 ? (
          <p className="text-center" style={{ color: "var(--text-muted)" }}>
            No plans available at the moment.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => {
              const Icon = planIcons[plan.name.toLowerCase()] ?? Crown;
              // Use features from DB (plan.features array from schema)
              const features = plan.features ?? [];
              const current = isCurrentPlan(plan);
              const highlighted = HIGHLIGHTED_PLANS.includes(plan.planCode);

              return (
                <div
                  key={plan.id}
                  className="relative flex flex-col p-6 rounded-2xl transition-all"
                  style={{
                    background: highlighted
                      ? "linear-gradient(135deg, var(--purple-faint), var(--glass-bg))"
                      : "var(--glass-bg)",
                    border: `2px solid ${
                      current
                        ? "var(--green)"
                        : highlighted
                          ? "var(--purple)"
                          : "var(--glass-border)"
                    }`,
                  }}
                >
                  {highlighted && !current && (
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap"
                      style={{ background: "var(--purple)", color: "white" }}
                    >
                      Most Popular
                    </div>
                  )}
                  {current && (
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1"
                      style={{ background: "var(--green)", color: "white" }}
                    >
                      <CheckCircle className="w-3 h-3" />
                      Current Plan
                    </div>
                  )}

                  <div className="mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                      style={{
                        background: highlighted
                          ? "var(--purple-faint)"
                          : "var(--glass-bg-subtle)",
                      }}
                    >
                      <Icon
                        className="w-5 h-5"
                        style={{
                          color: highlighted
                            ? "var(--purple)"
                            : "var(--text-secondary)",
                        }}
                      />
                    </div>
                    <h3
                      className="text-lg font-bold mb-1"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {plan.name}
                    </h3>
                    <p
                      className="text-xs font-medium uppercase tracking-wide"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {plan.category}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    {plan.price === 0 ? (
                      <p
                        className="text-3xl font-bold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Free
                      </p>
                    ) : (
                      <div className="flex items-end gap-1">
                        <span
                          className="text-3xl font-bold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {plan.price.toLocaleString()}
                        </span>
                        <span
                          className="text-sm mb-1"
                          style={{ color: "var(--text-muted)" }}
                        >
                          XAF{getIntervalLabel(plan.interval)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Limits (from schema fields) */}
                  {(plan.courseLimit ||
                    plan.productLimit ||
                    plan.leadLimit ||
                    plan.commissionRate) && (
                    <div className="mb-4 space-y-1">
                      {plan.courseLimit != null && (
                        <p
                          className="text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Up to {plan.courseLimit} courses
                        </p>
                      )}
                      {plan.productLimit != null && (
                        <p
                          className="text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Up to {plan.productLimit} products
                        </p>
                      )}
                      {plan.leadLimit != null && (
                        <p
                          className="text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Up to {plan.leadLimit} leads
                        </p>
                      )}
                      {plan.commissionRate != null && (
                        <p
                          className="text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {plan.commissionRate}% commission
                        </p>
                      )}
                    </div>
                  )}

                  {/* Features from DB */}
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <CheckCircle
                          className="w-4 h-4 mt-0.5 flex-shrink-0"
                          style={{
                            color: highlighted
                              ? "var(--purple)"
                              : "var(--green)",
                          }}
                        />
                        <span style={{ color: "var(--text-secondary)" }}>
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(plan.planCode, plan.name)}
                    disabled={current || subscribing === plan.planCode}
                    className="w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      background: current
                        ? "var(--success-bg)"
                        : highlighted
                          ? "var(--purple)"
                          : "var(--glass-bg-subtle)",
                      color: current
                        ? "var(--green)"
                        : highlighted
                          ? "white"
                          : "var(--text-primary)",
                      border: current ? "1px solid var(--green)" : "none",
                    }}
                  >
                    {subscribing === plan.planCode ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      getButtonLabel(plan)
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <p
          className="text-center text-sm mt-8"
          style={{ color: "var(--text-muted)" }}
        >
          All prices are in XAF. You can cancel or change your plan at any time
          from your dashboard.
        </p>
      </div>
    </div>
  );
}
