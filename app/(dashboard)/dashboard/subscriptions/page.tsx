"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Crown,
  Calendar,
  CreditCard,
  Loader2,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Package,
  Zap,
  Clock,
  XCircle,
  BookOpen,
  Briefcase,
  ShoppingBag,
  Users,
} from "lucide-react";
import SubscriptionPaymentModal from "@/components/payment/SubscriptionPaymentModal";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Plan {
  id: string;
  planCode: string;
  name: string;
  category: "COUNSELLOR" | "MARKETPLACE" | "SERVICE" | "TEACHER" | "STUDENT";
  price: number;
  interval: "MONTHLY" | "YEARLY" | "ONGOING" | "PER_LEAD" | "PER_USE";
  features: string[];
  commissionRate?: number | null;
  productLimit?: number | null;
  leadLimit?: number | null;
  courseLimit?: number | null;
}

interface Payment {
  id: string;
  amount: number;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "CANCELLED";
  createdAt: string;
  reference?: string;
}

interface Subscription {
  id: string;
  status: "ACTIVE" | "PAST_DUE" | "CANCELLED" | "EXPIRED" | "TRIALING";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  plan: Plan;
  payments: Payment[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SubscriptionPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [expandedSubs, setExpandedSubs] = useState<Set<string>>(new Set());
  const [showPlans, setShowPlans] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlanCode, setSelectedPlanCode] = useState("");
  const [selectedSubId, setSelectedSubId] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      setLoading(true);

      // Fetch user's subscriptions
      const subsRes = await fetch("/api/user/subscriptions");
      const subsData = await subsRes.json();

      if (!subsRes.ok || !subsData.success) {
        throw new Error(subsData.error || "Failed to load subscriptions");
      }

      setSubscriptions(subsData.data.subscriptions || []);

      // Fetch available plans
      const plansRes = await fetch("/api/plans");
      const plansData = await plansRes.json();

      if (plansRes.ok && plansData.success) {
        setAvailablePlans(plansData.data.plans || []);
      }
    } catch (err: any) {
      console.error("Failed to fetch data:", err);
      setError(err.message || "Failed to load subscription data");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (subId: string) => {
    setExpandedSubs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(subId)) {
        newSet.delete(subId);
      } else {
        newSet.add(subId);
      }
      return newSet;
    });
  };

  const handlePaymentClick = (subscription: Subscription) => {
    setSelectedPlanCode(subscription.plan.planCode);
    setSelectedSubId(subscription.id);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (transactionId: string) => {
    setShowPaymentModal(false);
    setSelectedPlanCode("");
    setSelectedSubId("");
    await fetchData(); // Refresh data
  };

  const handlePaymentError = (error: string) => {
    setError(error);
    setShowPaymentModal(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return {
          icon: CheckCircle,
          text: "ACTIVE",
          bg: "var(--success-bg)",
          color: "var(--success-text)",
        };
      case "TRIALING":
        return {
          icon: Clock,
          text: "PENDING PAYMENT",
          bg: "var(--warning-bg)",
          color: "var(--warning-text)",
        };
      case "PAST_DUE":
        return {
          icon: AlertTriangle,
          text: "PAST DUE",
          bg: "var(--error-bg)",
          color: "var(--error-text)",
        };
      case "CANCELLED":
      case "EXPIRED":
        return {
          icon: XCircle,
          text: status,
          bg: "var(--glass-bg)",
          color: "var(--text-muted)",
        };
      default:
        return {
          icon: Clock,
          text: status,
          bg: "var(--glass-bg-subtle)",
          color: "var(--text-secondary)",
        };
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return { text: "Paid", color: "var(--success-text)" };
      case "PENDING":
        return { text: "Pending", color: "var(--warning-text)" };
      case "FAILED":
        return { text: "Failed", color: "var(--error-text)" };
      default:
        return { text: status, color: "var(--text-muted)" };
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "COUNSELLOR":
        return Users;
      case "TEACHER":
        return BookOpen;
      case "MARKETPLACE":
        return ShoppingBag;
      case "SERVICE":
        return Briefcase;
      case "STUDENT":
        return BookOpen;
      default:
        return Crown;
    }
  };

  // Group subscriptions
  const activeSubscriptions = subscriptions.filter(
    (s) => s.status === "ACTIVE",
  );
  const pendingSubscriptions = subscriptions.filter(
    (s) => s.status === "TRIALING",
  );
  const inactiveSubscriptions = subscriptions.filter(
    (s) => s.status === "CANCELLED" || s.status === "EXPIRED",
  );

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          My Subscriptions
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Manage your active and pending subscriptions
        </p>
      </div>

      {/* Error */}
      {error && (
        <div
          className="p-4 rounded-xl flex items-center gap-3"
          style={{ background: "var(--error-bg)", color: "var(--error-text)" }}
        >
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Active Subscriptions */}
      {activeSubscriptions.length > 0 && (
        <div>
          <h2
            className="text-xl font-semibold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Active Plans ({activeSubscriptions.length})
          </h2>
          <div className="space-y-3">
            {activeSubscriptions.map((sub) => {
              const isExpanded = expandedSubs.has(sub.id);
              const statusBadge = getStatusBadge(sub.status);
              const StatusIcon = statusBadge.icon;

              return (
                <div
                  key={sub.id}
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: "var(--glass-bg)",
                    border: "1px solid var(--glass-border)",
                  }}
                >
                  {/* Header - Always visible */}
                  <button
                    onClick={() => toggleExpand(sub.id)}
                    className="w-full p-4 flex items-center justify-between hover:opacity-80 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown
                          className="w-5 h-5"
                          style={{ color: "var(--text-secondary)" }}
                        />
                      ) : (
                        <ChevronRight
                          className="w-5 h-5"
                          style={{ color: "var(--text-secondary)" }}
                        />
                      )}
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: "var(--glass-bg-subtle)" }}
                      >
                        <Crown
                          className="w-5 h-5"
                          style={{ color: "var(--purple)" }}
                        />
                      </div>
                      <div className="text-left">
                        <h3
                          className="font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {sub.plan.name} - {sub.plan.category}
                        </h3>
                        <p
                          className="text-sm"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {sub.plan.price.toLocaleString()} XAF/
                          {sub.plan.interval}
                        </p>
                      </div>
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
                      style={{
                        background: statusBadge.bg,
                        color: statusBadge.color,
                      }}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {statusBadge.text}
                    </span>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div
                      className="px-4 pb-4 space-y-4 border-t"
                      style={{ borderColor: "var(--divider)" }}
                    >
                      {/* Billing Period */}
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <p
                            className="text-xs mb-1"
                            style={{ color: "var(--text-muted)" }}
                          >
                            Period Start
                          </p>
                          <p
                            className="text-sm font-semibold"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {new Date(
                              sub.currentPeriodStart,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p
                            className="text-xs mb-1"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {sub.cancelAtPeriodEnd ? "Expires On" : "Renews On"}
                          </p>
                          <p
                            className="text-sm font-semibold"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {new Date(
                              sub.currentPeriodEnd,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Features */}
                      {sub.plan.features?.length > 0 && (
                        <div>
                          <p
                            className="text-xs font-semibold mb-2"
                            style={{ color: "var(--text-muted)" }}
                          >
                            Features
                          </p>
                          <ul className="grid grid-cols-2 gap-2">
                            {sub.plan.features.slice(0, 4).map((feature, i) => (
                              <li
                                key={i}
                                className="flex items-center gap-2 text-xs"
                                style={{ color: "var(--text-secondary)" }}
                              >
                                <CheckCircle
                                  className="w-3 h-3"
                                  style={{ color: "var(--success-text)" }}
                                />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Payment History */}
                      {sub.payments?.length > 0 && (
                        <div>
                          <p
                            className="text-xs font-semibold mb-2"
                            style={{ color: "var(--text-muted)" }}
                          >
                            Recent Payments
                          </p>
                          <div className="space-y-2">
                            {sub.payments.slice(0, 3).map((payment) => {
                              const paymentStatus = getPaymentStatusBadge(
                                payment.status,
                              );
                              return (
                                <div
                                  key={payment.id}
                                  className="flex items-center justify-between p-2 rounded-lg"
                                  style={{
                                    background: "var(--glass-bg-subtle)",
                                  }}
                                >
                                  <div>
                                    <p
                                      className="text-sm font-medium"
                                      style={{ color: "var(--text-primary)" }}
                                    >
                                      {payment.amount.toLocaleString()} XAF
                                    </p>
                                    <p
                                      className="text-xs"
                                      style={{ color: "var(--text-muted)" }}
                                    >
                                      {new Date(
                                        payment.createdAt,
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <span
                                    className="text-xs font-semibold"
                                    style={{ color: paymentStatus.color }}
                                  >
                                    {paymentStatus.text}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pending Payment Subscriptions */}
      {pendingSubscriptions.length > 0 && (
        <div>
          <h2
            className="text-xl font-semibold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Pending Payment ({pendingSubscriptions.length})
          </h2>
          <div className="space-y-3">
            {pendingSubscriptions.map((sub) => {
              const isExpanded = expandedSubs.has(sub.id);
              const statusBadge = getStatusBadge(sub.status);
              const StatusIcon = statusBadge.icon;

              return (
                <div
                  key={sub.id}
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: "var(--warning-bg)",
                    border: "2px solid var(--warning-border)",
                  }}
                >
                  {/* Header */}
                  <button
                    onClick={() => toggleExpand(sub.id)}
                    className="w-full p-4 flex items-center justify-between hover:opacity-80 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown
                          className="w-5 h-5"
                          style={{ color: "var(--text-secondary)" }}
                        />
                      ) : (
                        <ChevronRight
                          className="w-5 h-5"
                          style={{ color: "var(--text-secondary)" }}
                        />
                      )}
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: "rgba(255,255,255,0.5)" }}
                      >
                        <Clock
                          className="w-5 h-5"
                          style={{ color: "var(--warning-text)" }}
                        />
                      </div>
                      <div className="text-left">
                        <h3
                          className="font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {sub.plan.name} - {sub.plan.category}
                        </h3>
                        <p
                          className="text-sm"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {sub.plan.price.toLocaleString()} XAF/
                          {sub.plan.interval}
                        </p>
                      </div>
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
                      style={{
                        background: statusBadge.bg,
                        color: statusBadge.color,
                      }}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {statusBadge.text}
                    </span>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div
                      className="px-4 pb-4 space-y-4 border-t"
                      style={{ borderColor: "rgba(245,158,11,0.3)" }}
                    >
                      <div
                        className="mt-4 p-3 rounded-lg flex items-start justify-between"
                        style={{ background: "rgba(255,255,255,0.5)" }}
                      >
                        <div>
                          <p
                            className="font-semibold mb-1"
                            style={{ color: "var(--text-primary)" }}
                          >
                            Complete Your Payment
                          </p>
                          <p
                            className="text-sm"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            Pay {sub.plan.price.toLocaleString()} XAF to
                            activate this plan
                          </p>
                        </div>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePaymentClick(sub);
                          }}
                        >
                          Pay Now
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Inactive Subscriptions */}
      {inactiveSubscriptions.length > 0 && (
        <div>
          <h2
            className="text-xl font-semibold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Past Subscriptions ({inactiveSubscriptions.length})
          </h2>
          <div className="space-y-3">
            {inactiveSubscriptions.map((sub) => {
              const statusBadge = getStatusBadge(sub.status);
              const StatusIcon = statusBadge.icon;

              return (
                <div
                  key={sub.id}
                  className="p-4 rounded-xl flex items-center justify-between opacity-60"
                  style={{
                    background: "var(--glass-bg)",
                    border: "1px solid var(--divider)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: "var(--glass-bg-subtle)" }}
                    >
                      <XCircle
                        className="w-5 h-5"
                        style={{ color: "var(--text-muted)" }}
                      />
                    </div>
                    <div>
                      <h3
                        className="font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {sub.plan.name}
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Ended{" "}
                        {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: statusBadge.bg,
                      color: statusBadge.color,
                    }}
                  >
                    {statusBadge.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No Subscriptions */}
      {subscriptions.length === 0 && (
        <div
          className="p-8 rounded-2xl text-center"
          style={{
            background: "var(--glass-bg)",
            border: "2px dashed var(--glass-border)",
          }}
        >
          <Package
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: "var(--text-muted)" }}
          />
          <h3
            className="text-xl font-semibold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            No Subscriptions Yet
          </h3>
          <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
            Browse available plans below to get started
          </p>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* Available Plans Section with Full Details */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
        }}
      >
        <button
          onClick={() => setShowPlans(!showPlans)}
          className="w-full p-5 flex items-center justify-between hover:opacity-80 transition-all"
        >
          <div className="flex items-center gap-3">
            {showPlans ? (
              <ChevronDown
                className="w-5 h-5"
                style={{ color: "var(--text-secondary)" }}
              />
            ) : (
              <ChevronRight
                className="w-5 h-5"
                style={{ color: "var(--text-secondary)" }}
              />
            )}
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "var(--glass-bg-subtle)" }}
            >
              <Zap className="w-5 h-5" style={{ color: "var(--purple)" }} />
            </div>
            <h2
              className="text-xl font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Browse Available Plans ({availablePlans.length})
            </h2>
          </div>
          <span
            className="text-sm font-medium px-3 py-1 rounded-full"
            style={{
              background: "var(--badge-purple-bg)",
              color: "var(--badge-purple-text)",
            }}
          >
            {showPlans ? "Hide" : "Show"} Plans
          </span>
        </button>

        {showPlans && (
          <div
            className="px-5 pb-5 border-t"
            style={{ borderColor: "var(--divider)" }}
          >
            {/* Group by category */}
            {(() => {
              const categories = [
                ...new Set(availablePlans.map((p) => p.category)),
              ];

              return categories.map((category) => {
                const categoryPlans = availablePlans.filter(
                  (p) => p.category === category,
                );
                const CategoryIcon = getCategoryIcon(category);

                return (
                  <div key={category} className="mt-6 first:mt-5">
                    {/* Category Header */}
                    <div className="flex items-center gap-2 mb-4">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: "var(--glass-bg-subtle)" }}
                      >
                        <CategoryIcon
                          className="w-4 h-4"
                          style={{ color: "var(--text-secondary)" }}
                        />
                      </div>
                      <h3
                        className="text-lg font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {category} Plans
                      </h3>
                    </div>

                    {/* Plans Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryPlans.map((plan) => {
                        const hasSubscription = subscriptions.some(
                          (s) => s.plan.id === plan.id,
                        );
                        const isActive = subscriptions.some(
                          (s) => s.plan.id === plan.id && s.status === "ACTIVE",
                        );
                        const isPending = subscriptions.some(
                          (s) =>
                            s.plan.id === plan.id && s.status === "TRIALING",
                        );

                        return (
                          <div
                            key={plan.id}
                            className="p-5 rounded-xl transition-all"
                            style={{
                              background: isActive
                                ? "var(--success-bg)"
                                : "var(--glass-bg-subtle)",
                              border: isActive
                                ? "2px solid var(--success-border)"
                                : "1px solid var(--divider)",
                            }}
                          >
                            {/* Plan Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center"
                                style={{ background: "var(--glass-bg)" }}
                              >
                                <Crown
                                  className="w-6 h-6"
                                  style={{ color: "var(--purple)" }}
                                />
                              </div>
                              {isActive && (
                                <span
                                  className="px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
                                  style={{
                                    background: "var(--success-bg)",
                                    color: "var(--success-text)",
                                  }}
                                >
                                  <CheckCircle className="w-3 h-3" />
                                  Active
                                </span>
                              )}
                              {isPending && (
                                <span
                                  className="px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
                                  style={{
                                    background: "var(--warning-bg)",
                                    color: "var(--warning-text)",
                                  }}
                                >
                                  <Clock className="w-3 h-3" />
                                  Pending
                                </span>
                              )}
                            </div>

                            {/* Plan Name & Code */}
                            <h4
                              className="font-bold text-lg mb-1"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {plan.name}
                            </h4>
                            <p
                              className="text-xs mb-3"
                              style={{ color: "var(--text-muted)" }}
                            >
                              {plan.planCode}
                            </p>

                            {/* Price */}
                            <div className="mb-4">
                              <p
                                className="text-3xl font-bold"
                                style={{ color: "var(--text-primary)" }}
                              >
                                {plan.price > 0
                                  ? plan.price.toLocaleString()
                                  : "Free"}
                                {plan.price > 0 && (
                                  <span
                                    className="text-sm font-normal ml-1"
                                    style={{ color: "var(--text-muted)" }}
                                  >
                                    XAF
                                  </span>
                                )}
                              </p>
                              <p
                                className="text-xs mt-1"
                                style={{ color: "var(--text-secondary)" }}
                              >
                                {plan.interval === "MONTHLY"
                                  ? "per month"
                                  : plan.interval === "YEARLY"
                                    ? "per year"
                                    : plan.interval === "PER_LEAD"
                                      ? "per lead"
                                      : "ongoing"}
                              </p>
                            </div>

                            {/* Plan Limits */}
                            <div className="space-y-2 mb-4">
                              {plan.commissionRate !== null && (
                                <div className="flex items-center justify-between text-sm">
                                  <span
                                    style={{ color: "var(--text-secondary)" }}
                                  >
                                    Commission:
                                  </span>
                                  <span
                                    className="font-semibold"
                                    style={{ color: "var(--text-primary)" }}
                                  >
                                    {plan.commissionRate}%
                                  </span>
                                </div>
                              )}
                              {plan.productLimit !== null && (
                                <div className="flex items-center justify-between text-sm">
                                  <span
                                    style={{ color: "var(--text-secondary)" }}
                                  >
                                    Products:
                                  </span>
                                  <span
                                    className="font-semibold"
                                    style={{ color: "var(--text-primary)" }}
                                  >
                                    {plan.productLimit === 0
                                      ? "Unlimited"
                                      : plan.productLimit}
                                  </span>
                                </div>
                              )}
                              {plan.leadLimit !== null && (
                                <div className="flex items-center justify-between text-sm">
                                  <span
                                    style={{ color: "var(--text-secondary)" }}
                                  >
                                    Leads/month:
                                  </span>
                                  <span
                                    className="font-semibold"
                                    style={{ color: "var(--text-primary)" }}
                                  >
                                    {plan.leadLimit}
                                  </span>
                                </div>
                              )}
                              {plan.courseLimit !== null && (
                                <div className="flex items-center justify-between text-sm">
                                  <span
                                    style={{ color: "var(--text-secondary)" }}
                                  >
                                    Courses:
                                  </span>
                                  <span
                                    className="font-semibold"
                                    style={{ color: "var(--text-primary)" }}
                                  >
                                    {plan.courseLimit === 0
                                      ? "Unlimited"
                                      : plan.courseLimit}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Features */}
                            {plan.features && plan.features.length > 0 && (
                              <div className="mb-4">
                                <p
                                  className="text-xs font-semibold mb-2"
                                  style={{ color: "var(--text-muted)" }}
                                >
                                  Features:
                                </p>
                                <ul className="space-y-1.5">
                                  {plan.features
                                    .slice(0, 4)
                                    .map((feature, i) => (
                                      <li
                                        key={i}
                                        className="flex items-start gap-2 text-xs"
                                        style={{
                                          color: "var(--text-secondary)",
                                        }}
                                      >
                                        <CheckCircle
                                          className="w-3 h-3 flex-shrink-0 mt-0.5"
                                          style={{
                                            color: "var(--success-text)",
                                          }}
                                        />
                                        <span className="leading-tight">
                                          {feature}
                                        </span>
                                      </li>
                                    ))}
                                  {plan.features.length > 4 && (
                                    <li
                                      className="text-xs"
                                      style={{ color: "var(--text-muted)" }}
                                    >
                                      +{plan.features.length - 4} more features
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}

                            {/* Subscribe Button */}
                            {isActive ? (
                              <Button
                                variant="outline"
                                size="lg"
                                className="w-full"
                                disabled
                              >
                                <CheckCircle className="w-4 h-4" />
                                Current Plan
                              </Button>
                            ) : isPending ? (
                              <Button
                                variant="default"
                                size="lg"
                                className="w-full"
                                onClick={() => {
                                  const sub = subscriptions.find(
                                    (s) => s.plan.id === plan.id,
                                  );
                                  if (sub) handlePaymentClick(sub);
                                }}
                              >
                                <CreditCard className="w-4 h-4" />
                                Complete Payment
                              </Button>
                            ) : (
                              <Button
                                variant="default"
                                size="lg"
                                className="w-full"
                                onClick={() => {
                                  setSelectedPlanCode(plan.planCode);
                                  setSelectedSubId("");
                                  setShowPaymentModal(true);
                                }}
                              >
                                Subscribe Now
                                <ChevronRight className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPlanCode && (
        <SubscriptionPaymentModal
          planCode={selectedPlanCode}
          subscriptionId={selectedSubId}
          paymentMethodId=""
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPlanCode("");
            setSelectedSubId("");
          }}
        />
      )}
    </div>
  );
}
