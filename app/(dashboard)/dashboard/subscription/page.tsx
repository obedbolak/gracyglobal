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
  ArrowRight,
  Zap,
  Star,
  Rocket,
  Users,
  BookOpen,
  ShoppingBag,
  Briefcase,
} from "lucide-react";
import { UserRole } from "@prisma/client";
import SubscriptionPaymentModal from "@/components/payment/SubscriptionPaymentModal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserPaymentMethod {
  id: string;
  type: "MOBILE_MONEY" | "BANK_TRANSFER" | "CARD";
  phoneNumber?: string;
  accountNumber?: string;
  isDefault: boolean;
}

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

interface Subscription {
  id: string;
  status: "ACTIVE" | "PAST_DUE" | "CANCELLED" | "EXPIRED" | "TRIALING";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  sessionsUsed: number;
  leadsUsed: number;
  productsUsed: number;
  coursesUsed: number;
  plan: Plan;
}

interface UserPaymentMethod {
  id: string;
  method: string;
  label: string;
  details?: { value?: string } | null;
  isDefault: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const planIcons: Record<string, React.ElementType> = {
  free: Crown,
  starter: Zap,
  growth: Star,
  elite: Rocket,
  monthly: Zap,
  yearly: Rocket,
};

function getPlanIcon(plan: Plan): React.ElementType {
  const key = plan.name.toLowerCase();
  return planIcons[key] || Crown;
}

function formatPrice(price: number, interval: string) {
  if (price === 0) return "Free";
  const suffix =
    interval === "MONTHLY"
      ? "/mo"
      : interval === "YEARLY"
        ? "/yr"
        : interval === "PER_LEAD"
          ? "/lead"
          : "";
  return `${price.toLocaleString()} XAF${suffix}`;
}

function getUsageLabel(
  plan: Plan,
): { label: string; used: number; limit: number } | null {
  switch (plan.category) {
    case "COUNSELLOR":
      return null; // sessions tracked via Booking model, not subscription
    case "TEACHER":
      return plan.courseLimit
        ? { label: "Courses uploaded", used: 0, limit: plan.courseLimit }
        : null;
    case "MARKETPLACE":
      return plan.productLimit
        ? { label: "Products listed", used: 0, limit: plan.productLimit }
        : null;
    case "SERVICE":
      return plan.leadLimit
        ? { label: "Leads used", used: 0, limit: plan.leadLimit }
        : null;
    default:
      return null;
  }
}

function getCategoryIcon(category: string): React.ElementType {
  switch (category) {
    case "COUNSELLOR":
      return Users;
    case "TEACHER":
      return BookOpen;
    case "MARKETPLACE":
      return ShoppingBag;
    case "SERVICE":
      return Briefcase;
    default:
      return Crown;
  }
}

function getCategoryTitle(category: string): string {
  switch (category) {
    case "COUNSELLOR":
      return "Counselor Plans";
    case "TEACHER":
      return "Teacher Plans";
    case "MARKETPLACE":
      return "Marketplace Plans";
    case "SERVICE":
      return "Service Plans";
    default:
      return "Plans";
  }
}

function getPlansForRole(plans: Plan[], userRoles: UserRole[]): Plan[] {
  // If user has no special roles, show STUDENT plans
  if (
    !userRoles ||
    userRoles.length === 0 ||
    userRoles.includes(UserRole.USER)
  ) {
    return plans.filter((plan) => plan.category === "STUDENT");
  }

  // Show plans based on user roles
  const relevantCategories: string[] = [];

  if (userRoles.includes(UserRole.COUNSELOR)) {
    relevantCategories.push("COUNSELLOR");
  }
  if (userRoles.includes(UserRole.TEACHER)) {
    relevantCategories.push("TEACHER");
  }
  if (userRoles.includes(UserRole.MARKETPLACE)) {
    relevantCategories.push("MARKETPLACE");
  }
  if (userRoles.includes(UserRole.CREATOR)) {
    relevantCategories.push("SERVICE");
  }

  // If no specific roles, show STUDENT plans
  if (relevantCategories.length === 0) {
    return plans.filter((plan) => plan.category === "STUDENT");
  }

  return plans.filter((plan) => relevantCategories.includes(plan.category));
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SubscriptionPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<UserPaymentMethod[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [paymentChoice, setPaymentChoice] = useState<"default" | "new">(
    "default",
  );
  const [newPaymentPhone, setNewPaymentPhone] = useState<string>("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingPlanCode, setPendingPlanCode] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError(null);

      // Fetch user profile for roles and payment methods
      const userRes = await fetch("/api/user");
      const userData = await userRes.json();
      if (userRes.ok) {
        setUserRoles(userData.data.role || []);
        setPaymentMethods(userData.data.paymentMethods || []);
        if (userData.data.paymentMethods?.length > 0) {
          const defaultMethod = userData.data.paymentMethods.find(
            (m: UserPaymentMethod) => m.isDefault,
          );
          setSelectedPaymentMethod(
            defaultMethod?.id || userData.data.paymentMethods[0].id,
          );
        }
      }

      // One call without ?category → returns { data: { plans, subscription } }
      const res = await fetch("/api/plans");
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load data");
      }

      // ✅ API returns { plans: Plan[], subscription: Subscription | null }
      const { plans: fetchedPlans, subscription } = json.data;

      setPlans(Array.isArray(fetchedPlans) ? fetchedPlans : []);

      // API returns a single subscription (or null) — wrap in array for component state
      setSubscriptions(subscription ? [subscription] : []);
    } catch (err: any) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load subscription data.");
      setSubscriptions([]);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };
  const handleSubscribe = async (planCode: string) => {
    if (!selectedPaymentMethod) {
      setError("Please select a payment method.");
      return;
    }

    if (
      paymentChoice === "new" &&
      (!newPaymentPhone || newPaymentPhone.trim().length === 0)
    ) {
      setError("Please enter a phone number for mobile money payment.");
      return;
    }

    setPendingPlanCode(planCode);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (transactionId: string) => {
    try {
      setActionLoading(true);
      setError(null);

      // Refresh data after successful payment
      await fetchData();

      setShowPaymentModal(false);
      setPendingPlanCode("");
    } catch (err: any) {
      console.error("Failed to refresh after payment:", err);
      setError(
        "Payment successful but failed to refresh data. Please refresh the page.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handlePaymentError = (error: string) => {
    setError(error);
    setShowPaymentModal(false);
    setPendingPlanCode("");
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!confirm("Are you sure you want to cancel this subscription?")) return;

    try {
      setActionLoading(true);
      setError(null);

      const res = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to cancel subscription");
      }

      await fetchData();
    } catch (err: any) {
      console.error("Failed to cancel subscription:", err);
      setError("Failed to cancel subscription.");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return { background: "var(--success-bg)", color: "var(--green)" };
      case "PAST_DUE":
        return { background: "var(--error-bg)", color: "var(--error-text)" };
      case "CANCELLED":
      case "EXPIRED":
        return { background: "var(--glass-bg)", color: "var(--text-muted)" };
      case "TRIALING":
        return { background: "var(--info-bg)", color: "var(--blue)" };
      default:
        return { background: "var(--warning-bg)", color: "var(--yellow)" };
    }
  };

  // Use the first active subscription as the "primary" one for display
  const primarySub =
    subscriptions.find((s) => s.status === "ACTIVE") ??
    subscriptions[0] ??
    null;

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
          Subscription
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Manage your subscription and billing
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

      {/* Current Subscription */}
      {primarySub ? (
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
              style={getStatusStyle(primarySub.status)}
            >
              <CheckCircle className="w-3 h-3" />
              {primarySub.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Plan info */}
            <div
              className="p-5 rounded-xl"
              style={{ background: "var(--glass-bg-subtle)" }}
            >
              <div className="flex items-center gap-3 mb-4">
                {(() => {
                  const Icon = getPlanIcon(primarySub.plan);
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
                    {primarySub.plan.name}
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {primarySub.plan.category} ·{" "}
                    {primarySub.plan.interval === "MONTHLY"
                      ? "Monthly billing"
                      : primarySub.plan.interval === "YEARLY"
                        ? "Yearly billing"
                        : primarySub.plan.interval}
                  </p>
                </div>
              </div>
              <p
                className="text-2xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {formatPrice(primarySub.plan.price, primarySub.plan.interval)}
              </p>
            </div>

            {/* Billing cycle */}
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
                {new Date(primarySub.currentPeriodStart).toLocaleDateString()}
              </p>
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {primarySub.cancelAtPeriodEnd ? "Expires" : "Renews"}:{" "}
                {new Date(primarySub.currentPeriodEnd).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Usage bar — category-aware */}
          {(() => {
            const usage = getUsageLabel(primarySub.plan);
            if (!usage) return null;
            const pct = Math.min((usage.used / usage.limit) * 100, 100);
            return (
              <div
                className="mt-6 p-5 rounded-xl"
                style={{ background: "var(--glass-bg-subtle)" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3
                    className="font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {usage.label}
                  </h3>
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {usage.used} / {usage.limit}
                  </span>
                </div>
                <div
                  className="w-full rounded-full h-2 mb-2"
                  style={{ background: "var(--glass-bg)" }}
                >
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      background:
                        pct >= 90
                          ? "var(--error-text)"
                          : pct >= 70
                            ? "var(--yellow)"
                            : "var(--green)",
                    }}
                  />
                </div>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {usage.limit - usage.used > 0
                    ? `${usage.limit - usage.used} remaining`
                    : "Limit reached"}
                </p>
              </div>
            );
          })()}

          {/* Features */}
          {primarySub.plan.features?.length > 0 && (
            <div className="mt-6">
              <h3
                className="text-sm font-semibold mb-3"
                style={{ color: "var(--text-secondary)" }}
              >
                Included features
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {primarySub.plan.features.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    <CheckCircle
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: "var(--green)" }}
                    />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Cancellation warning */}
          {primarySub.cancelAtPeriodEnd && (
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
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Your subscription will not renew and will expire on{" "}
                  {new Date(primarySub.currentPeriodEnd).toLocaleDateString()}.
                </p>
              </div>
            </div>
          )}

          {/* Pending payment warning */}
          {primarySub.status === "TRIALING" && (
            <div
              className="mt-6 p-4 rounded-xl flex items-start justify-between"
              style={{
                background: "var(--info-bg)",
                border: "1px solid var(--blue)",
              }}
            >
              <div className="flex items-start gap-3">
                <CreditCard
                  className="w-5 h-5 flex-shrink-0"
                  style={{ color: "var(--blue)" }}
                />
                <div>
                  <p
                    className="font-semibold mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Payment Pending
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Complete your payment to activate this subscription.
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleSubscribe(primarySub.plan.planCode)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: "var(--blue)",
                  color: "white",
                }}
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  "Complete Payment"
                )}
              </button>
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

      {/* Payment Choice - Default or New */}
      {paymentMethods.length > 0 && (
        <div
          className="p-6 rounded-2xl"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <h2
            className="text-xl font-semibold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Payment Option
          </h2>
          <div className="space-y-3">
            {/* Default Payment */}
            <label
              className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all hover:opacity-80"
              style={{
                background:
                  paymentChoice === "default"
                    ? "var(--glass-bg-subtle)"
                    : "var(--glass-bg)",
                border:
                  paymentChoice === "default"
                    ? "2px solid var(--blue)"
                    : "1px solid var(--glass-border)",
              }}
            >
              <input
                type="radio"
                name="paymentChoice"
                value="default"
                checked={paymentChoice === "default"}
                onChange={() => setPaymentChoice("default")}
                className="w-4 h-4"
              />
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: "var(--glass-bg)" }}
              >
                <CreditCard
                  className="w-5 h-5"
                  style={{ color: "var(--text-muted)" }}
                />
              </div>
              <div className="flex-1">
                <p
                  className="font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Use Default Payment
                </p>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {paymentMethods.find((m) => m.isDefault)?.phoneNumber ||
                    paymentMethods.find((m) => m.isDefault)?.accountNumber ||
                    "Default method"}
                </p>
              </div>
            </label>

            {/* Choose Another Payment Method */}
            <label
              className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all hover:opacity-80"
              style={{
                background:
                  paymentChoice === "new"
                    ? "var(--glass-bg-subtle)"
                    : "var(--glass-bg)",
                border:
                  paymentChoice === "new"
                    ? "2px solid var(--blue)"
                    : "1px solid var(--glass-border)",
              }}
            >
              <input
                type="radio"
                name="paymentChoice"
                value="new"
                checked={paymentChoice === "new"}
                onChange={() => setPaymentChoice("new")}
                className="w-4 h-4"
              />
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: "var(--glass-bg)" }}
              >
                <CreditCard
                  className="w-5 h-5"
                  style={{ color: "var(--text-muted)" }}
                />
              </div>
              <div className="flex-1">
                <p
                  className="font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Use Different Mobile Money Number
                </p>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Enter phone number for payment
                </p>
              </div>
            </label>
          </div>

          {/* Phone Input for New Payment */}
          {paymentChoice === "new" && (
            <div
              className="mt-4 pt-4 border-t"
              style={{ borderColor: "var(--glass-border)" }}
            >
              <label className="block mb-2">
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Mobile Money Phone Number
                </span>
              </label>
              <input
                type="tel"
                placeholder="e.g., +237 679 123 456"
                value={newPaymentPhone}
                onChange={(e) => setNewPaymentPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-sm transition-all"
                style={{
                  background: "var(--glass-bg)",
                  border: "1px solid var(--glass-border)",
                  color: "var(--text-primary)",
                }}
              />
              <p
                className="text-xs mt-2"
                style={{ color: "var(--text-secondary)" }}
              >
                Enter the mobile money number where payment will be collected
              </p>
            </div>
          )}
        </div>
      )}

      {/* Available Plans - Organized by Role */}
      {plans.length > 0 && (
        <div>
          <h2
            className="text-xl font-semibold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            {primarySub ? "Change Plan" : "Available Plans"}
          </h2>

          {/* Group plans by category */}
          {(() => {
            const relevantPlans = getPlansForRole(plans, userRoles);
            const categories = [
              ...new Set(relevantPlans.map((p) => p.category)),
            ];

            return categories.map((category) => {
              const categoryPlans = relevantPlans.filter(
                (p) => p.category === category,
              );
              const Icon = getCategoryIcon(category);
              const title = getCategoryTitle(category);

              return (
                <div key={category} className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: "var(--glass-bg-subtle)" }}
                    >
                      <Icon
                        className="w-4 h-4"
                        style={{ color: "var(--text-secondary)" }}
                      />
                    </div>
                    <h3
                      className="text-lg font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {title}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryPlans.map((plan) => {
                      const PlanIcon = getPlanIcon(plan);
                      const isCurrent = subscriptions.some(
                        (s) => s.plan.id === plan.id && s.status === "ACTIVE",
                      );

                      return (
                        <div
                          key={plan.id}
                          className="p-5 rounded-xl transition-all"
                          style={{
                            background: "var(--glass-bg)",
                            border: `2px solid ${
                              isCurrent ? "var(--green)" : "var(--glass-border)"
                            }`,
                          }}
                        >
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                            style={{ background: "var(--glass-bg-subtle)" }}
                          >
                            <PlanIcon
                              className="w-5 h-5"
                              style={{ color: "var(--text-secondary)" }}
                            />
                          </div>
                          <h4
                            className="font-bold mb-1"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {plan.name}
                          </h4>
                          <p
                            className="text-xs mb-1"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {plan.planCode}
                          </p>
                          <p
                            className="text-2xl font-bold mb-1"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {plan.price > 0
                              ? `${plan.price.toLocaleString()} XAF`
                              : "Free"}
                            {plan.price > 0 && (
                              <span
                                className="text-xs font-normal"
                                style={{ color: "var(--text-muted)" }}
                              >
                                {plan.interval === "MONTHLY"
                                  ? "/mo"
                                  : plan.interval === "YEARLY"
                                    ? "/yr"
                                    : ""}
                              </span>
                            )}
                          </p>

                          {/* Limits preview */}
                          <div className="mb-4 space-y-1">
                            {plan.courseLimit && (
                              <p
                                className="text-xs"
                                style={{ color: "var(--text-muted)" }}
                              >
                                Up to {plan.courseLimit} courses
                              </p>
                            )}
                            {plan.productLimit && (
                              <p
                                className="text-xs"
                                style={{ color: "var(--text-muted)" }}
                              >
                                Up to {plan.productLimit} products
                              </p>
                            )}
                            {plan.leadLimit && (
                              <p
                                className="text-xs"
                                style={{ color: "var(--text-muted)" }}
                              >
                                Up to {plan.leadLimit} leads
                              </p>
                            )}
                            {plan.commissionRate && (
                              <p
                                className="text-xs"
                                style={{ color: "var(--text-muted)" }}
                              >
                                {plan.commissionRate}% commission
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() => handleSubscribe(plan.planCode)}
                            disabled={isCurrent || actionLoading}
                            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{
                              background: isCurrent
                                ? "var(--success-bg)"
                                : "var(--glass-bg-subtle)",
                              color: isCurrent
                                ? "var(--green)"
                                : "var(--text-primary)",
                              border: isCurrent
                                ? "1px solid var(--green)"
                                : "none",
                            }}
                          >
                            {actionLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                            ) : isCurrent ? (
                              "Current Plan"
                            ) : (
                              "Select Plan"
                            )}
                          </button>
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

      {/* Payment Modal */}
      {showPaymentModal && pendingPlanCode && (
        <SubscriptionPaymentModal
          planCode={pendingPlanCode}
          paymentMethodId={selectedPaymentMethod}
          phone={paymentChoice === "new" ? newPaymentPhone : undefined}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          onClose={() => {
            setShowPaymentModal(false);
            setPendingPlanCode("");
          }}
        />
      )}

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
