"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSubscription } from "@/hooks/useSubscription";
import SubscriptionPaymentModal from "@/components/payment/SubscriptionPaymentModal";
import {
  Crown,
  CheckCircle,
  Loader2,
  ArrowLeft,
  Zap,
  Star,
  Rocket,
  AlertTriangle,
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

const planIcons: Record<string, React.ElementType> = {
  free: Crown,
  starter: Zap,
  growth: Star,
  elite: Rocket,
  "elite / pro": Rocket,
  monthly: Zap,
  yearly: Rocket,
};

export default function CounselorSubscriptionPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const { subscription: currentSub, getCurrentPlanCode } = useSubscription();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Payment modal state
  const [pendingPlanCode, setPendingPlanCode] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/plans?category=COUNSELLOR");
      const data = await res.json();
      if (data.success) setPlans(data.data.plans || []);
    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to load plans. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (planCode: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!session) {
      router.push("/login?callbackUrl=/counselor/subscription");
      return;
    }

    const currentPlanCode = getCurrentPlanCode();
    if (planCode === currentPlanCode) return;

    const selectedPlan = plans.find((p) => p.planCode === planCode);

    // Free plan — activate directly, no payment modal needed
    if (selectedPlan && selectedPlan.price === 0) {
      setActivating(true);
      try {
        const res = await fetch("/api/plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planCode }),
        });
        const data = await res.json();

        if (data.success) {
          setSuccessMsg("Free plan activated! Redirecting...");
          router.refresh();
          setTimeout(() => router.push("/counselor"), 1500);
        } else if (data.error === "You already have this subscription") {
          router.push("/counselor");
        } else {
          setErrorMsg(data.error || "Failed to activate plan");
        }
      } catch (e) {
        console.error(e);
        setErrorMsg("Network error. Please try again.");
      } finally {
        setActivating(false);
      }
      return;
    }

    // Paid plan — open payment modal
    // NOTE: SubscriptionPaymentModal handles the POST /api/plans internally
    // after payment is confirmed. Do NOT call it again in handlePaymentSuccess.
    setPendingPlanCode(planCode);
  };

  // ✅ Called AFTER SubscriptionPaymentModal has already activated the subscription.
  // Just close the modal and redirect — do NOT post to /api/plans again.
  const handlePaymentSuccess = async (transactionId: string) => {
    setPendingPlanCode(null);
    await update(); // Refresh session to get new subscription
    setSuccessMsg("Subscription activated! Redirecting...");
    router.refresh();
    setTimeout(() => router.push("/counselor"), 1500);
  };

  const handlePaymentError = (error: string) => {
    setPendingPlanCode(null);
    setErrorMsg(error);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--purple)]" />
      </div>
    );
  }

  const currentPlanCode = getCurrentPlanCode() || "free";
  const activeCounselorPlans = plans
    .filter((p) => p.category === "COUNSELLOR")
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/counselor"
          className="flex items-center gap-2 text-[var(--purple)] hover:opacity-80 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
        <p className="text-[var(--text-secondary)]">
          Select a plan to unlock features and grow your counseling business
        </p>
      </div>

      {/* Error / success banners */}
      {errorMsg && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-[var(--error-bg)] border border-[var(--error-border)] text-[var(--error-text)] text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
          <button
            onClick={() => setErrorMsg(null)}
            className="ml-auto opacity-60 hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}
      {successMsg && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-[var(--success-bg)] border border-[var(--success-border)] text-[var(--success-text)] text-sm">
          <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeCounselorPlans.map((plan) => {
          const Icon = planIcons[plan.name.toLowerCase()] ?? Crown;
          const isCurrentPlan = plan.planCode === currentPlanCode;
          const isFree = plan.price === 0;
          const isPending = pendingPlanCode === plan.planCode;

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
                  background:
                    "linear-gradient(135deg, var(--purple), var(--scarlet))",
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
                    {isFree
                      ? "Free"
                      : plan.interval === "MONTHLY"
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
                  {isFree ? (
                    <span className="text-3xl font-bold">Free</span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold">
                        {plan.price.toLocaleString()} XAF
                      </span>
                      {plan.interval === "MONTHLY" && (
                        <span className="text-[var(--text-secondary)]">
                          /month
                        </span>
                      )}
                      {plan.interval === "YEARLY" && (
                        <span className="text-[var(--text-secondary)]">
                          /year
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Features */}
              {plan.features && plan.features.length > 0 && (
                <div className="mb-6 space-y-2">
                  {plan.features.slice(0, 3).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <CheckCircle className="w-3 h-3 text-[var(--purple)] flex-shrink-0" />
                      <span className="text-[var(--text-secondary)]">
                        {feature}
                      </span>
                    </div>
                  ))}
                  {plan.features.length > 3 && (
                    <p className="text-xs text-[var(--text-muted)] pl-5">
                      +{plan.features.length - 3} more features
                    </p>
                  )}
                </div>
              )}

              {/* CTA */}
              <button
                onClick={() => handleSelectPlan(plan.planCode)}
                disabled={isCurrentPlan || activating || isPending}
                className={`w-full py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                  isCurrentPlan
                    ? "bg-[var(--sidebar-item-hover)] text-[var(--text-secondary)] cursor-default"
                    : "bg-[var(--purple)] text-white hover:opacity-90"
                }`}
              >
                {activating && !isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Activating...
                  </>
                ) : isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Opening payment...
                  </>
                ) : isCurrentPlan ? (
                  "Current Plan"
                ) : isFree ? (
                  "Get Started Free"
                ) : (
                  "Subscribe"
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Payment Modal */}
      {pendingPlanCode && (
        <SubscriptionPaymentModal
          planCode={pendingPlanCode}
          paymentMethodId="MOBILE_MONEY_MTN"
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          onClose={() => setPendingPlanCode(null)}
        />
      )}
    </div>
  );
}
