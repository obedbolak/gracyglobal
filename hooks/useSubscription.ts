"use client";
import useSWR from "swr";
import { useSession } from "next-auth/react";

interface Plan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  priceMonthly: number;
  priceAnnual: number;
  pricePerSession: number | null;
  counselorSessions: number;
  highlighted: boolean;
}

interface Subscription {
  id: string;
  planId: string;
  billing: "MONTHLY" | "ANNUAL" | "PER_SESSION";
  status: "ACTIVE" | "PAST_DUE" | "CANCELLED" | "EXPIRED" | "TRIALING";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  sessionsUsed: number;
  plan: Plan;
  refetch: () => Promise<void>; // ← keep this as-is
}

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

export function useSubscription() {
  const { data: session } = useSession();

  // Only fetch when user is logged in — null key skips the request
  const { data, error, isLoading, mutate } = useSWR<{
    subscription: Subscription | null;
  }>(session?.user?.id ? "/api/subscriptions" : null, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30_000, // 30 seconds — subscription state changes more often
  });

  const subscribeToPlan = async (
    planId: string,
    billing: "MONTHLY" | "ANNUAL" | "PER_SESSION" = "MONTHLY",
  ) => {
    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, billing }),
      });
      const data = await response.json();

      if (response.ok) {
        // Update SWR cache immediately with new subscription
        mutate({ subscription: data.subscription }, false);
        return { success: true, subscription: data.subscription };
      } else {
        return { success: false, error: data.error || "Failed to subscribe" };
      }
    } catch {
      return { success: false, error: "Network error" };
    }
  };

  const subscription = data?.subscription ?? null;

  const getCurrentPlan = () => {
    if (!subscription) return "free";
    return subscription.plan.name;
  };

  const canAccessFeature = (feature: string) => {
    const plan = getCurrentPlan();
    const features = {
      free: ["browse", "view_posts", "view_events"],
      starter: [
        "browse",
        "view_posts",
        "view_events",
        "post",
        "join_projects",
        "rsvp",
        "basic_resources",
        "counselor_sessions",
      ],
      growth: [
        "browse",
        "view_posts",
        "view_events",
        "post",
        "join_projects",
        "rsvp",
        "basic_resources",
        "counselor_sessions",
        "lead_projects",
        "all_resources",
        "early_access",
        "system_groups",
        "cohort_calls",
      ],
      elite: [
        "browse",
        "view_posts",
        "view_events",
        "post",
        "join_projects",
        "rsvp",
        "basic_resources",
        "counselor_sessions",
        "lead_projects",
        "all_resources",
        "early_access",
        "system_groups",
        "cohort_calls",
        "unlimited_sessions",
        "account_manager",
        "leadership_coaching",
        "mastermind",
        "speaking_slots",
        "custom_support",
        "affiliate_revenue",
      ],
    };
    return features[plan as keyof typeof features]?.includes(feature) || false;
  };

  const getSessionsRemaining = () => {
    if (!subscription) return 0;
    if (subscription.plan.counselorSessions === 0) return Infinity;
    return Math.max(
      0,
      subscription.plan.counselorSessions - subscription.sessionsUsed,
    );
  };

  return {
    subscription,
    loading: isLoading,
    error: error?.message ?? null,
    subscribeToPlan,
    getCurrentPlan,
    canAccessFeature,
    getSessionsRemaining,
    refetch: async () => {
      await mutate();
    }, // ← wrap mutate so it returns Promise<void> // mutate() triggers a fresh fetch — same as old refetch()
  };
}
