// hooks/useSubscription.ts
"use client";
import useSWR from "swr";
import { useSession } from "next-auth/react";

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface Plan {
  id: string;
  planCode: string;
  category: PlanCategory;
  name: string;
  price: number;
  interval: PlanInterval;
  commissionRate: number | null;
  productLimit: number | null;
  leadLimit: number | null;
  courseLimit: number | null;
  features: string[];
  active: boolean;
  sortOrder: number;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  sessionsUsed: number;
  leadsUsed: number;
  productsUsed: number;
  coursesUsed: number;
  plan: Plan;
}

export type PlanCategory =
  | "COUNSELLOR"
  | "MARKETPLACE"
  | "SERVICE"
  | "TEACHER"
  | "STUDENT";

export type PlanInterval =
  | "MONTHLY"
  | "YEARLY"
  | "ONGOING"
  | "PER_LEAD"
  | "PER_USE";

export type SubscriptionStatus =
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELLED"
  | "EXPIRED"
  | "TRIALING";

// ─── API RESPONSE TYPES ──────────────────────────────────────────────────────

// Matches what GET /api/plans returns when authenticated (no category param)
interface PlansApiResponse {
  success: boolean;
  data: {
    plans: Plan[];
    subscription: Subscription | null;
    subscriptions?: Subscription[]; // All subscriptions for user
  };
}

// Matches what POST /api/plans returns
interface SubscribeApiResponse {
  success: boolean;
  data: {
    subscription: Subscription;
    payment: {
      id: string;
      amount: number;
      status: string;
    } | null;
  };
  message?: string;
  error?: string;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/**
 * Parse a feature limit from features[] array
 * e.g. "sessions:10" → 10, "sessions:unlimited" → Infinity
 */
function parseFeatureLimit(features: string[], key: string): number {
  const match = features.find((f) => f.startsWith(`${key}:`));
  if (!match) return 0;
  const value = match.split(":")[1];
  if (value === "unlimited") return Infinity;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? 0 : parsed;
}

// ─── FETCHER ─────────────────────────────────────────────────────────────────

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

// ─── HOOK ────────────────────────────────────────────────────────────────────

export function useSubscription() {
  const { data: session } = useSession();

  // ✅ Correct endpoint — GET /api/plans (no category param = auth-gated)
  const { data, error, isLoading, mutate } = useSWR<PlansApiResponse>(
    session?.user?.id ? "/api/plans" : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30_000,
    },
  );

  // Extract subscription from response shape: { success, data: { plans, subscription, subscriptions } }
  const subscription = data?.data?.subscription ?? null;
  const allSubscriptions: Subscription[] =
    data?.data?.subscriptions ??
    (data?.data?.subscription ? [data?.data?.subscription] : []);
  const allPlans = data?.data?.plans ?? [];

  // ─── HELPERS ─────────────────────────────────────────────────────────

  /**
   * Find a subscription for a specific category (e.g., "TEACHER", "COUNSELLOR")
   * Used by sidebars to get the relevant subscription for their dashboard
   */
  const getSubscriptionByCategory = (
    category: PlanCategory,
  ): Subscription | null => {
    return (
      allSubscriptions.find((sub) => sub?.plan?.category === category) ?? null
    );
  };

  // ─── ACTIONS ─────────────────────────────────────────────────────────────

  /**
   * Subscribe to a plan
   * POST /api/plans → { planCode, paymentMethod?, paymentReference? }
   */
  const subscribeToPlan = async (
    planCode: string,
    options?: {
      paymentMethod?:
        | "MOBILE_MONEY_MTN"
        | "MOBILE_MONEY_ORANGE"
        | "BANK_TRANSFER"
        | "CARD"
        | "CASH";
      paymentReference?: string;
    },
  ): Promise<{
    success: boolean;
    subscription?: Subscription;
    requiresPayment?: boolean;
    error?: string;
  }> => {
    try {
      const response = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planCode,
          paymentMethod: options?.paymentMethod ?? "MOBILE_MONEY_MTN",
          paymentReference: options?.paymentReference ?? null,
        }),
      });

      const result: SubscribeApiResponse = await response.json();

      if (response.ok && result.success) {
        // Optimistically update SWR cache with new subscription
        await mutate(
          (prev) =>
            prev
              ? {
                  ...prev,
                  data: {
                    ...prev.data,
                    subscription: result.data.subscription,
                  },
                }
              : prev,
          false,
        );

        return {
          success: true,
          subscription: result.data.subscription,
          // Payment record created = paid plan, needs payment completion
          requiresPayment: result.data.payment !== null,
        };
      }

      return {
        success: false,
        error: result.error ?? "Failed to subscribe",
      };
    } catch {
      return { success: false, error: "Network error" };
    }
  };

  // ─── PLAN INFO ───────────────────────────────────────────────────────────

  /** e.g. "C1", "C2", "M1" */
  const getCurrentPlanCode = (): string | null =>
    subscription?.plan.planCode ?? null;

  /** e.g. "COUNSELLOR", "MARKETPLACE" */
  const getCurrentPlanCategory = (): PlanCategory | null =>
    subscription?.plan.category ?? null;

  // ─── FEATURE ACCESS ──────────────────────────────────────────────────────

  /**
   * Check feature flag in plan.features[]
   * e.g. canAccessFeature("video_sessions")
   */
  const canAccessFeature = (feature: string): boolean => {
    if (!subscription || subscription.status !== "ACTIVE") return false;
    return subscription.plan.features.includes(feature);
  };

  // ─── USAGE LIMITS ────────────────────────────────────────────────────────

  /**
   * Reads session limit from features[] e.g. "sessions:10" or "sessions:unlimited"
   * commissionRate is a billing % — NOT a session count
   */
  const getSessionsRemaining = (): number => {
    if (!subscription) return 0;
    const limit = parseFeatureLimit(subscription.plan.features, "sessions");
    if (limit === Infinity) return Infinity;
    return Math.max(0, limit - subscription.sessionsUsed);
  };

  /** plan.leadLimit null = unlimited */
  const getLeadsRemaining = (): number => {
    if (!subscription) return 0;
    if (subscription.plan.leadLimit === null) return Infinity;
    return Math.max(0, subscription.plan.leadLimit - subscription.leadsUsed);
  };

  /** plan.productLimit null = unlimited */
  const getProductsRemaining = (): number => {
    if (!subscription) return 0;
    if (subscription.plan.productLimit === null) return Infinity;
    return Math.max(
      0,
      subscription.plan.productLimit - subscription.productsUsed,
    );
  };

  /** plan.courseLimit null = unlimited */
  const getCoursesRemaining = (): number => {
    if (!subscription) return 0;
    if (subscription.plan.courseLimit === null) return Infinity;
    return Math.max(
      0,
      subscription.plan.courseLimit - subscription.coursesUsed,
    );
  };

  // ─── STATUS HELPERS ──────────────────────────────────────────────────────

  const isActive = (): boolean => subscription?.status === "ACTIVE";

  const isTrialing = (): boolean => subscription?.status === "TRIALING";

  const isExpired = (): boolean => {
    if (!subscription) return false;
    if (
      subscription.status === "EXPIRED" ||
      subscription.status === "CANCELLED"
    )
      return true;
    return new Date(subscription.currentPeriodEnd) < new Date();
  };

  const isPastDue = (): boolean => subscription?.status === "PAST_DUE";

  const willCancelAtPeriodEnd = (): boolean =>
    subscription?.cancelAtPeriodEnd ?? false;

  const getDaysUntilRenewal = (): number | null => {
    if (!subscription) return null;
    const end = new Date(subscription.currentPeriodEnd);
    const now = new Date();
    const diff = Math.ceil(
      (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    return Math.max(0, diff);
  };

  // ─── RETURN ──────────────────────────────────────────────────────────────

  return {
    subscription,
    allSubscriptions, // ✅ All subscriptions for filtering by category
    allPlans, // ✅ bonus — all active plans available from same request
    loading: isLoading,
    error: error?.message ?? null,

    // Actions
    subscribeToPlan,

    // Plan info
    getCurrentPlanCode,
    getCurrentPlanCategory,
    getSubscriptionByCategory, // ✅ NEW: Get subscription for specific category

    // Feature access
    canAccessFeature,

    // Usage limits
    getSessionsRemaining,
    getLeadsRemaining,
    getProductsRemaining,
    getCoursesRemaining,

    // Status helpers
    isActive,
    isTrialing,
    isExpired,
    isPastDue,
    willCancelAtPeriodEnd,
    getDaysUntilRenewal,

    refetch: async () => {
      await mutate();
    },
  };
}
