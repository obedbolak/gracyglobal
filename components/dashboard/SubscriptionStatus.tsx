"use client";

import Link from "next/link";
import { 
  Crown,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ArrowRight
} from "lucide-react";

interface SubscriptionStatusProps {
  subscription?: {
    plan: {
      name: string;
      displayName: string;
      counselorSessions: number;
      priceMonthly: number;
    };
    status: string;
    currentPeriodEnd: string;
    sessionsUsed: number;
    cancelAtPeriodEnd: boolean;
  };
}

export default function SubscriptionStatus({ subscription }: SubscriptionStatusProps) {
  if (!subscription) {
    return (
      <div className="p-6 rounded-2xl border-dashed border-2" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
        <div className="text-center">
          <Crown className="w-12 h-12 mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            No Active Subscription
          </h3>
          <p className="mb-4" style={{ color: "var(--text-secondary)" }}>
            Upgrade to unlock premium features and unlimited access
          </p>
          <Link href="/community">
            <button className="inline-flex items-center px-4 py-2 text-white rounded-lg transition-all" style={{ background: "linear-gradient(135deg, var(--purple), var(--blue))" }}>
              View Plans
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const { plan, status, currentPeriodEnd, sessionsUsed, cancelAtPeriodEnd } = subscription;
  const sessionsRemaining = plan.counselorSessions - sessionsUsed;
  const usagePercentage = plan.counselorSessions > 0 
    ? (sessionsUsed / plan.counselorSessions) * 100 
    : 0;

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return { background: "var(--success-bg)", color: "var(--green)" };
      case 'past_due':
        return { background: "var(--error-bg)", color: "var(--error-text)" };
      case 'cancelled':
        return { background: "var(--glass-bg)", color: "var(--text-secondary)" };
      case 'trialing':
        return { background: "var(--info-bg)", color: "var(--blue)" };
      default:
        return { background: "var(--warning-bg)", color: "var(--yellow)" };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return CheckCircle;
      case 'past_due':
      case 'cancelled':
        return AlertTriangle;
      default:
        return TrendingUp;
    }
  };

  const StatusIcon = getStatusIcon(status);
  const statusStyle = getStatusStyle(status);

  return (
    <div className="p-6 rounded-2xl" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Subscription</h3>
        <span className="px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1" style={statusStyle}>
          <StatusIcon className="w-3 h-3" />
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>

      <div className="space-y-4">
        {/* Plan Info */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium" style={{ color: "var(--text-primary)" }}>{plan.displayName}</h4>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {plan.priceMonthly > 0 
                ? `${plan.priceMonthly.toLocaleString()} CFA/month`
                : 'Free Plan'
              }
            </p>
          </div>
          <Crown className="w-6 h-6" style={{ color: "var(--yellow)" }} />
        </div>

        {/* Session Usage */}
        {plan.counselorSessions > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                Counseling Sessions
              </span>
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {sessionsUsed} / {plan.counselorSessions}
              </span>
            </div>
            <div className="w-full rounded-full h-2" style={{ background: "var(--glass-bg-subtle)" }}>
              <div 
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(usagePercentage, 100)}%`,
                  background: usagePercentage >= 90 ? "var(--error-text)" :
                             usagePercentage >= 70 ? "var(--yellow)" : "var(--green)"
                }}
              />
            </div>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              {sessionsRemaining > 0 
                ? `${sessionsRemaining} sessions remaining`
                : 'No sessions remaining'
              }
            </p>
          </div>
        )}

        {/* Renewal Info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center" style={{ color: "var(--text-secondary)" }}>
            <Calendar className="w-4 h-4 mr-1" />
            {cancelAtPeriodEnd ? 'Expires' : 'Renews'} on
          </div>
          <span className="font-medium" style={{ color: "var(--text-primary)" }}>
            {new Date(currentPeriodEnd).toLocaleDateString()}
          </span>
        </div>

        {/* Warnings */}
        {cancelAtPeriodEnd && (
          <div className="p-3 rounded-lg" style={{ background: "var(--warning-bg)", border: "1px solid var(--yellow)" }}>
            <div className="flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" style={{ color: "var(--yellow)" }} />
              <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                Your subscription will not renew automatically
              </p>
            </div>
          </div>
        )}

        {usagePercentage >= 90 && plan.counselorSessions > 0 && (
          <div className="p-3 rounded-lg" style={{ background: "var(--error-bg)", border: "1px solid var(--error-text)" }}>
            <div className="flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" style={{ color: "var(--error-text)" }} />
              <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                You're running low on counseling sessions
              </p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <Link href="/community">
          <button className="w-full mt-4 px-4 py-2 text-sm font-medium rounded-lg transition-colors" style={{ background: "var(--info-bg)", color: "var(--blue)" }}>
            Manage Subscription
          </button>
        </Link>
      </div>
    </div>
  );
}