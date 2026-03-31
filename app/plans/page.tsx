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

interface CurrentSubscription {
  planId: string;
  status: string;
}

const planIcons: Record<string, React.ElementType> = {
  free: Crown,
  starter: Zap,
  growth: Star,
  elite: Rocket,
  "elite / pro": Rocket,
};

const planFeatures: Record<string, string[]> = {
  free: [
    "Access to free courses",
    "Community access",
    "Job board browsing",
    "Basic marketplace access",
  ],
  starter: [
    "Everything in Free",
    "2 counselor sessions/month",
    "Priority support",
    "Exclusive community content",
  ],
  growth: [
    "Everything in Starter",
    "5 counselor sessions/month",
    "Create & sell services",
    "List products on marketplace",
    "Advanced analytics",
  ],
  elite: [
    "Everything in Growth",
    "Unlimited counselor sessions",
    "Featured listings",
    "Dedicated account manager",
    "Early access to new features",
  ],
  "elite / pro": [
    "Everything in Growth",
    "Unlimited counselor sessions",
    "Featured listings",
    "Dedicated account manager",
    "Early access to new features",
  ],
};

export default function PlansPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSub, setCurrentSub] = useState<CurrentSubscription | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [billing, setBilling] = useState<"MONTHLY" | "ANNUAL">("MONTHLY");

  useEffect(() => {
    fetchData();
  }, [session]);

  const fetchData = async () => {
    try {
      const [plansRes, subRes] = await Promise.all([
        fetch("/api/plans"),
        session ? fetch("/api/subscriptions") : Promise.resolve(null),
      ]);

      const plansData = await plansRes.json();
      setPlans(plansData.plans || []);

      if (subRes) {
        const subData = await subRes.json();
        if (subData.subscription) {
          setCurrentSub({
            planId: subData.subscription.planId,
            status: subData.subscription.status,
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string, planName: string) => {
    if (!session) {
      router.push("/login?callbackUrl=/plans");
      return;
    }
    if (planName.toLowerCase() === "free") {
      router.push("/dashboard");
      return;
    }

    setSubscribing(planId);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, billing }),
      });
      if (!res.ok) throw new Error("Failed to subscribe");
      await fetchData();
      router.push("/dashboard");
    } catch (e) {
      console.error(e);
      alert("Failed to subscribe. Please try again.");
    } finally {
      setSubscribing(null);
    }
  };

  const getButtonLabel = (plan: Plan) => {
    if (!session) return "Sign up to subscribe";
    if (currentSub?.planId === plan.id && currentSub.status === "ACTIVE")
      return "Current Plan";
    if (plan.name.toLowerCase() === "free") return "Get Started Free";
    return `Subscribe to ${plan.displayName}`;
  };

  const isCurrentPlan = (plan: Plan) =>
    currentSub?.planId === plan.id && currentSub.status === "ACTIVE";

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

          {/* Billing toggle */}
          <div
            className="inline-flex items-center gap-1 mt-8 p-1 rounded-xl"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
            }}
          >
            {(["MONTHLY", "ANNUAL"] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: billing === b ? "var(--purple)" : "transparent",
                  color: billing === b ? "white" : "var(--text-secondary)",
                }}
              >
                {b === "MONTHLY" ? "Monthly" : "Annual"}
                {b === "ANNUAL" && (
                  <span
                    className="ml-1.5 px-1.5 py-0.5 rounded text-xs"
                    style={{
                      background: "var(--success-bg)",
                      color: "var(--green)",
                    }}
                  >
                    Save 20%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const Icon = planIcons[plan.name.toLowerCase()] ?? Crown;
            const features =
              planFeatures[plan.name.toLowerCase()] ?? planFeatures["free"];
            const current = isCurrentPlan(plan);
            const price =
              billing === "ANNUAL" && plan.priceAnnual > 0
                ? plan.priceAnnual
                : plan.priceMonthly;

            return (
              <div
                key={plan.id}
                className="relative flex flex-col p-6 rounded-2xl transition-all"
                style={{
                  background: plan.highlighted
                    ? "linear-gradient(135deg, var(--purple-faint), var(--glass-bg))"
                    : "var(--glass-bg)",
                  border: `2px solid ${
                    current
                      ? "var(--green)"
                      : plan.highlighted
                        ? "var(--purple)"
                        : "var(--glass-border)"
                  }`,
                }}
              >
                {plan.highlighted && !current && (
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
                    className="text-lg font-bold mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {plan.displayName}
                  </h3>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6">
                  {price === 0 ? (
                    <p
                      className="text-3xl font-bold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Free
                    </p>
                  ) : (
                    <div>
                      <span
                        className="text-3xl font-bold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {price.toLocaleString()}
                      </span>
                      <span
                        className="text-sm ml-1"
                        style={{ color: "var(--text-muted)" }}
                      >
                        XAF/mo
                      </span>
                    </div>
                  )}
                </div>

                <ul className="space-y-2.5 mb-6 flex-1">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle
                        className="w-4 h-4 mt-0.5 flex-shrink-0"
                        style={{
                          color: plan.highlighted
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
                  onClick={() => handleSubscribe(plan.id, plan.name)}
                  disabled={current || subscribing === plan.id}
                  className="w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    background: current
                      ? "var(--success-bg)"
                      : plan.highlighted
                        ? "var(--purple)"
                        : "var(--glass-bg-subtle)",
                    color: current
                      ? "var(--green)"
                      : plan.highlighted
                        ? "white"
                        : "var(--text-primary)",
                    border: current ? "1px solid var(--green)" : "none",
                  }}
                >
                  {subscribing === plan.id ? (
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
