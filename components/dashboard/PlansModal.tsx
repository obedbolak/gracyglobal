// components/dashboard/PlansModal.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Crown,
  CheckCircle,
  Loader2,
  Zap,
  Star,
  Rocket,
} from "lucide-react";
import SubscriptionPaymentModal from "@/components/payment/SubscriptionPaymentModal";

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

interface Props {
  open: boolean;
  onClose: () => void;
  filterCategory: "MARKETPLACE" | "SERVICE";
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

const HIGHLIGHTED_PLANS = ["C2", "M2", "S2", "T2"];

function getIntervalLabel(interval: Plan["interval"]) {
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
}

export default function PlansModal({ open, onClose, filterCategory }: Props) {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSub, setCurrentSub] = useState<CurrentSubscription | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  // ── Payment modal state ───────────────────────────────────────────────────
  const [pendingPlan, setPendingPlan] = useState<Plan | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    fetchPlans();
  }, [open]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/plans");
      const data = await res.json();
      if (data.success) {
        const filtered = (data.data.plans as Plan[]).filter(
          (p) => p.category === filterCategory,
        );
        setPlans(filtered);
        if (data.data.subscription) setCurrentSub(data.data.subscription);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // ── Subscribe button clicked ──────────────────────────────────────────────
  const handleSubscribe = (plan: Plan) => {
    // Free plans — no payment needed
    if (plan.price === 0 || plan.name.toLowerCase() === "free") {
      onClose();
      return;
    }
    // Open payment modal for paid plans
    setPaymentError(null);
    setPendingPlan(plan);
  };

  // ── Payment succeeded ─────────────────────────────────────────────────────
  const handlePaymentSuccess = (transactionId: string) => {
    setPendingPlan(null);
    onClose();
    router.refresh(); // Re-fetch server data so subscription state updates
  };

  // ── Payment failed ────────────────────────────────────────────────────────
  const handlePaymentError = (error: string) => {
    setPaymentError(error);
    setPendingPlan(null); // Close payment modal, keep plans modal open
  };

  const isCurrentPlan = (plan: Plan) =>
    currentSub?.planId === plan.id && currentSub.status === "ACTIVE";

  const getButtonLabel = (plan: Plan) => {
    if (isCurrentPlan(plan)) return "Current Plan";
    if (plan.price === 0) return "Get Started Free";
    return `Subscribe – ${plan.price.toLocaleString()} XAF`;
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
        // ✅ Hide plans modal while payment is in progress — no z-index fighting
        style={{ visibility: pendingPlan ? "hidden" : "visible" }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative z-10 w-full max-w-3xl max-h-[90vh] flex flex-col bg-[var(--bg-base)] border border-[var(--divider)] rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--divider)] flex-shrink-0">
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                {filterCategory === "MARKETPLACE"
                  ? "Marketplace Plans"
                  : "Service Plans"}
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                {filterCategory === "MARKETPLACE"
                  ? "Choose a plan to start listing your products"
                  : "Choose a plan to start offering your services"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[var(--sidebar-item-hover)] transition-colors"
            >
              <X className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Payment error banner */}
            {paymentError && (
              <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-[var(--error-bg)] border border-[var(--error-border)] text-[var(--error-text)] text-sm">
                <span className="flex-shrink-0 mt-0.5">⚠️</span>
                <span>{paymentError}</span>
                <button
                  onClick={() => setPaymentError(null)}
                  className="ml-auto flex-shrink-0 opacity-60 hover:opacity-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-7 h-7 animate-spin text-[var(--purple)]" />
              </div>
            ) : plans.length === 0 ? (
              <p className="text-center text-[var(--text-secondary)] py-20">
                No plans available at the moment.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.map((plan) => {
                  const Icon = planIcons[plan.name.toLowerCase()] ?? Crown;
                  const current = isCurrentPlan(plan);
                  const highlighted = HIGHLIGHTED_PLANS.includes(plan.planCode);
                  const isPending = pendingPlan?.planCode === plan.planCode;

                  return (
                    <div
                      key={plan.id}
                      className="relative flex flex-col p-5 rounded-2xl transition-all"
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
                      {/* Badges */}
                      {highlighted && !current && (
                        <div
                          className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap"
                          style={{
                            background: "var(--purple)",
                            color: "white",
                          }}
                        >
                          Most Popular
                        </div>
                      )}
                      {current && (
                        <div
                          className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap flex items-center gap-1"
                          style={{ background: "var(--green)", color: "white" }}
                        >
                          <CheckCircle className="w-3 h-3" /> Current Plan
                        </div>
                      )}

                      {/* Icon + name */}
                      <div className="mb-4">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                          style={{
                            background: highlighted
                              ? "var(--purple-faint)"
                              : "var(--glass-bg-subtle)",
                          }}
                        >
                          <Icon
                            className="w-4 h-4"
                            style={{
                              color: highlighted
                                ? "var(--purple)"
                                : "var(--text-secondary)",
                            }}
                          />
                        </div>
                        <h3
                          className="text-base font-bold mb-0.5"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {plan.name}
                        </h3>
                        <p
                          className="text-[10px] font-medium uppercase tracking-wide"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {plan.category}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="mb-4">
                        {plan.price === 0 ? (
                          <p
                            className="text-2xl font-bold"
                            style={{ color: "var(--text-primary)" }}
                          >
                            Free
                          </p>
                        ) : (
                          <div className="flex items-end gap-1">
                            <span
                              className="text-2xl font-bold"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {plan.price.toLocaleString()}
                            </span>
                            <span
                              className="text-xs mb-1"
                              style={{ color: "var(--text-muted)" }}
                            >
                              XAF{getIntervalLabel(plan.interval)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Limits */}
                      {(plan.productLimit != null ||
                        plan.leadLimit != null ||
                        plan.commissionRate != null) && (
                        <div className="mb-3 space-y-1">
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

                      {/* Features */}
                      <ul className="space-y-2 mb-5 flex-1">
                        {plan.features.map((f) => (
                          <li
                            key={f}
                            className="flex items-start gap-2 text-xs"
                          >
                            <CheckCircle
                              className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
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

                      {/* CTA */}
                      <button
                        onClick={() => handleSubscribe(plan)}
                        disabled={current || isPending}
                        className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
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
                        {isPending ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Opening payment...
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
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[var(--divider)] flex-shrink-0">
            <p className="text-xs text-center text-[var(--text-secondary)]">
              All prices in XAF. Cancel or change your plan anytime from your
              dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* ── Payment modal — mounts on top when a paid plan is selected ── */}
      {pendingPlan && (
        <SubscriptionPaymentModal
          planCode={pendingPlan.planCode}
          paymentMethodId="MOBILE_MONEY"
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          onClose={() => setPendingPlan(null)}
        />
      )}
    </>
  );
}
