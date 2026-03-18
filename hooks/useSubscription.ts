import { useState, useEffect } from "react";
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
}

export function useSubscription() {
  const { data: session } = useSession();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchSubscription();
    } else {
      setLoading(false);
    }
  }, [session?.user?.id]);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/subscriptions");
      const data = await response.json();
      
      if (response.ok) {
        setSubscription(data.subscription);
      } else {
        setError(data.error || "Failed to fetch subscription");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const subscribeToPlan = async (planId: string, billing: "MONTHLY" | "ANNUAL" | "PER_SESSION" = "MONTHLY") => {
    try {
      setLoading(true);
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId, billing }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setSubscription(data.subscription);
        return { success: true, subscription: data.subscription };
      } else {
        setError(data.error || "Failed to subscribe");
        return { success: false, error: data.error };
      }
    } catch (err) {
      const error = "Network error";
      setError(error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPlan = () => {
    if (!subscription) return "free";
    return subscription.plan.name;
  };

  const canAccessFeature = (feature: string) => {
    const plan = getCurrentPlan();
    
    // Define feature access by plan
    const features = {
      free: ["browse", "view_posts", "view_events"],
      starter: ["browse", "view_posts", "view_events", "post", "join_projects", "rsvp", "basic_resources", "counselor_sessions"],
      growth: ["browse", "view_posts", "view_events", "post", "join_projects", "rsvp", "basic_resources", "counselor_sessions", "lead_projects", "all_resources", "early_access", "system_groups", "cohort_calls"],
      elite: ["browse", "view_posts", "view_events", "post", "join_projects", "rsvp", "basic_resources", "counselor_sessions", "lead_projects", "all_resources", "early_access", "system_groups", "cohort_calls", "unlimited_sessions", "account_manager", "leadership_coaching", "mastermind", "speaking_slots", "custom_support", "affiliate_revenue"]
    };

    return features[plan as keyof typeof features]?.includes(feature) || false;
  };

  const getSessionsRemaining = () => {
    if (!subscription) return 0;
    if (subscription.plan.counselorSessions === 0) return Infinity; // Unlimited
    return Math.max(0, subscription.plan.counselorSessions - subscription.sessionsUsed);
  };

  return {
    subscription,
    loading,
    error,
    subscribeToPlan,
    getCurrentPlan,
    canAccessFeature,
    getSessionsRemaining,
    refetch: fetchSubscription,
  };
}