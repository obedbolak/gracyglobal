"use client";

import { createContext, useContext, ReactNode } from "react";
import { useSubscription as useSubscriptionData } from "@/hooks/useSubscription";

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

interface SubscriptionContextType {
  subscription: Subscription | null;
  loading: boolean;
  error: string | null;
  subscribeToPlan: (planId: string, billing?: "MONTHLY" | "ANNUAL" | "PER_SESSION") => Promise<{ success: boolean; subscription?: Subscription; error?: string }>;
  getCurrentPlan: () => string;
  canAccessFeature: (feature: string) => boolean;
  getSessionsRemaining: () => number;
  refetch: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const subscriptionData = useSubscriptionData();

  return (
    <SubscriptionContext.Provider value={subscriptionData}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
}