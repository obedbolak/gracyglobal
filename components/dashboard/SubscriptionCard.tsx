"use client";

import { useSubscription } from "@/context/SubscriptionContext";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Crown, Calendar, Zap, Users } from "lucide-react";

export default function SubscriptionCard() {
  const { data: session } = useSession();
  const { subscription, loading, getCurrentPlan, getSessionsRemaining, canAccessFeature } = useSubscription();

  if (!session || loading) {
    return (
      <div className="glass p-6 animate-pulse">
        <div className="h-4 bg-gray-300 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-gray-300 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-2/3"></div>
      </div>
    );
  }

  const currentPlan = getCurrentPlan();
  const sessionsRemaining = getSessionsRemaining();
  const planDisplayName = subscription?.plan?.displayName || "Free";

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "starter": return "var(--blue)";
      case "growth": return "var(--purple)";
      case "elite": return "var(--scarlet)";
      default: return "var(--text-secondary)";
    }
  };

  const getPlanGradient = (plan: string) => {
    switch (plan) {
      case "starter": return "linear-gradient(135deg, var(--blue), var(--purple))";
      case "growth": return "linear-gradient(135deg, var(--scarlet), var(--purple))";
      case "elite": return "linear-gradient(135deg, var(--purple-light), var(--scarlet-light))";
      default: return "linear-gradient(135deg, var(--blue), var(--purple))";
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
          <Crown 
            size={20} 
            style={{ color: getPlanColor(currentPlan) }}
          />
          <span 
            className="text-lg font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {planDisplayName} Plan
          </span>
        </div>
        
        {currentPlan !== "free" && (
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
        {subscription && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={16} style={{ color: "var(--text-muted)" }} />
            <span style={{ color: "var(--text-secondary)" }}>
              Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </span>
          </div>
        )}

        {currentPlan !== "free" && (
          <div className="flex items-center gap-2 text-sm">
            <Zap size={16} style={{ color: "var(--text-muted)" }} />
            <span style={{ color: "var(--text-secondary)" }}>
              {sessionsRemaining === Infinity 
                ? "Unlimited counselor sessions"
                : `${sessionsRemaining} sessions remaining this month`
              }
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
              : "View-only access"
            }
          </span>
        </div>
      </div>

      {/* Upgrade CTA for free users */}
      {currentPlan === "free" && (
        <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--divider)" }}>
          <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
            Upgrade to unlock counselor sessions, project participation, and more.
          </p>
          <button 
            className="w-full py-2 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02]"
            style={{ background: getPlanGradient("starter") }}
          >
            Upgrade Plan
          </button>
        </div>
      )}
    </motion.div>
  );
}