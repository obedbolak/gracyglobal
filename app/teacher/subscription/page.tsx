"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSubscription } from "@/hooks/useSubscription";
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

export default function TeacherSubscriptionPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { subscription: currentSub, getCurrentPlanCode } = useSubscription();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/plans?category=TEACHER");
      const data = await res.json();

      if (data.success) {
        setPlans(data.data.plans || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planCode: string) => {
    if (!session) {
      router.push("/login?callbackUrl=/teacher/subscription");
      return;
    }

    // Don't allow subscribing to the same plan
    if (planCode === getCurrentPlanCode()) {
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

      if (data.success) {
        // Refresh subscription
        router.refresh();
        // Show success message
        alert("Subscription updated! Redirecting...");
        setTimeout(() => router.push("/teacher"), 1000);
      } else {
        alert(data.message || "Failed to subscribe");
      }
    } catch (e) {
      console.error(e);
      alert("Error subscribing");
    } finally {
      setSubscribing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--purple)]" />
      </div>
    );
  }

  const currentPlanCode = getCurrentPlanCode() || "free";
  const activeTeacherPlans = plans
    .filter((p) => p.category === "TEACHER")
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/teacher"
          className="flex items-center gap-2 text-[var(--purple)] hover:opacity-80 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
        <p className="text-[var(--text-secondary)]">
          Select a plan to unlock features and grow your teaching business
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTeacherPlans.map((plan) => {
          const Icon = planIcons[plan.planCode.toLowerCase()] || Crown;
          const isCurrentPlan = plan.planCode === currentPlanCode;

          return (
            <div
              key={plan.id}
              className={`glass p-6 rounded-lg relative overflow-hidden transition-all hover:shadow-lg ${
                isCurrentPlan ? "ring-2 ring-[var(--purple)]" : ""
              }`}
            >
              {/* Top gradient strip */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{
                  background: `linear-gradient(135deg, var(--purple), var(--scarlet))`,
                }}
              />

              {/* Badge */}
              {isCurrentPlan && (
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-[var(--purple)] text-white px-3 py-1 rounded-full text-xs font-semibold">
                  <CheckCircle className="w-3 h-3" />
                  Current
                </div>
              )}

              {/* Plan header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="p-2 rounded-lg"
                  style={{ background: "rgba(147, 51, 234, 0.1)" }}
                >
                  <Icon className="w-6 h-6 text-[var(--purple)]" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {plan.interval === "MONTHLY"
                      ? "Monthly"
                      : plan.interval === "YEARLY"
                        ? "Yearly"
                        : plan.interval}
                  </p>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  {plan.interval === "MONTHLY" && (
                    <span className="text-[var(--text-secondary)]">/month</span>
                  )}
                  {plan.interval === "YEARLY" && (
                    <span className="text-[var(--text-secondary)]">/year</span>
                  )}
                </div>
              </div>

              {/* Limits */}
              <div className="mb-6 space-y-2">
                <div className="text-sm">
                  <span className="font-semibold text-[var(--text-primary)]">
                    {plan.courseLimit === null || plan.courseLimit === undefined
                      ? "Unlimited"
                      : plan.courseLimit}{" "}
                  </span>
                  <span className="text-[var(--text-secondary)]">Courses</span>
                </div>
                {plan.features && plan.features.length > 0 && (
                  <div className="text-xs text-[var(--text-secondary)]">
                    {plan.features.slice(0, 3).map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-[var(--purple)]" />
                        <span>{feature}</span>
                      </div>
                    ))}
                    {plan.features.length > 3 && (
                      <div className="text-xs text-[var(--text-muted)]">
                        +{plan.features.length - 3} more features
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handleSubscribe(plan.planCode)}
                disabled={isCurrentPlan || subscribing === plan.planCode}
                className={`w-full py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  isCurrentPlan
                    ? "bg-[var(--sidebar-item-hover)] text-[var(--text-secondary)] cursor-default"
                    : subscribing === plan.planCode
                      ? "bg-[var(--purple)] text-white opacity-50"
                      : "bg-[var(--purple)] text-white hover:opacity-90"
                }`}
              >
                {subscribing === plan.planCode && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {isCurrentPlan
                  ? "Current Plan"
                  : subscribing === plan.planCode
                    ? "Subscribing..."
                    : "Subscribe"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
