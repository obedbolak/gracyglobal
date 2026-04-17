"use client";

import { useState } from "react";
import { useSubscription } from "@/hooks/useSubscription"; // ✅ correct import
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Crown, Calendar, Zap, Users, AlertCircle } from "lucide-react";
import SubscriptionPaymentModal from "@/components/payment/SubscriptionPaymentModal";

export default function SubscriptionCard() {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const { data: session } = useSession();
  const {
    subscription,
    loading,
    getCurrentPlanCode,
    getSessionsRemaining,
    canAccessFeature,
    isTrialing,
  } = useSubscription();

  if (!session || loading) {
    return (
      <div className="glass p-6 animate-pulse">
        <div className="h-4 bg-gray-300 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-gray-300 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-2/3"></div>
      </div>
    );
  }

  const currentPlan = getCurrentPlanCode() ?? "free"; // ✅ null-safe
  const sessionsRemaining = getSessionsRemaining();
  const planDisplayName = subscription?.plan?.name || "Free";

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "starter":
        return "var(--blue)";
      case "growth":
        return "var(--purple)";
      case "elite":
        return "var(--scarlet)";
      default:
        return "var(--text-secondary)";
    }
  };

  const getPlanGradient = (plan: string) => {
    switch (plan) {
      case "starter":
        return "linear-gradient(135deg, var(--blue), var(--purple))";
      case "growth":
        return "linear-gradient(135deg, var(--scarlet), var(--purple))";
      case "elite":
        return "linear-gradient(135deg, var(--purple-light), var(--scarlet-light))";
      default:
        return "linear-gradient(135deg, var(--blue), var(--purple))";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-6 relative overflow-hidden"
    >
      {/* Top gradient strip */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
        style={{ background: getPlanGradient(currentPlan) }}
      />

      {/* Plan badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Crown size={20} style={{ color: getPlanColor(currentPlan) }} />
          <span
            className="text-lg font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {planDisplayName} Plan
          </span>
        </div>

        {isTrialing() && (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-800">
            Pending Payment
          </span>
        )}
        {!isTrialing() && currentPlan !== "free" && (
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
            style={{ background: getPlanGradient(currentPlan) }}
          >
            Active
          </span>
        )}
      </div>

      {/* Plan details */}
      <div className="space-y-3">
        {isTrialing() && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle
              size={16}
              className="text-yellow-600 mt-0.5 flex-shrink-0"
            />
            <div>
              <p className="text-sm font-semibold text-yellow-900">
                Payment Pending
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Complete your payment to activate this subscription and start
                using all features.
              </p>
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="mt-2 text-sm font-semibold text-yellow-900 hover:text-yellow-800 underline"
              >
                Complete Payment →
              </button>
            </div>
          </div>
        )}

        {subscription && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={16} style={{ color: "var(--text-muted)" }} />
            <span style={{ color: "var(--text-secondary)" }}>
              Renews{" "}
              {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </span>
          </div>
        )}

        {currentPlan !== "free" && (
          <div className="flex items-center gap-2 text-sm">
            <Zap size={16} style={{ color: "var(--text-muted)" }} />
            <span style={{ color: "var(--text-secondary)" }}>
              {sessionsRemaining === Infinity
                ? "Unlimited counselor sessions"
                : `${sessionsRemaining} sessions remaining this month`}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm">
          <Users size={16} style={{ color: "var(--text-muted)" }} />
          <span style={{ color: "var(--text-secondary)" }}>
            {canAccessFeature("lead_projects")
              ? "Can lead community projects"
              : canAccessFeature("join_projects")
                ? "Can join community projects"
                : "View-only access"}
          </span>
        </div>
      </div>

      {/* Upgrade CTA for free users */}
      {currentPlan === "free" && (
        <div
          className="mt-4 pt-4 border-t"
          style={{ borderColor: "var(--divider)" }}
        >
          <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
            Upgrade to unlock counselor sessions, project participation, and
            more.
          </p>
          <button
            className="w-full py-2 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02]"
            style={{ background: getPlanGradient("starter") }}
          >
            Upgrade Plan
          </button>
        </div>
      )}

      {/* Payment Modal */}
      {isPaymentModalOpen && subscription && (
        <SubscriptionPaymentModal
          planCode={subscription.plan.planCode} // ✅ correct props
          paymentMethodId="MOBILE_MONEY_MTN"
          onSuccess={() => setIsPaymentModalOpen(false)}
          onError={(err) => console.error(err)}
          onClose={() => setIsPaymentModalOpen(false)}
        />
      )}
    </motion.div>
  );
}
