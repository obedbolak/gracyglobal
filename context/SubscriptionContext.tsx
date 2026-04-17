// context/SubscriptionContext.tsx
"use client";

import { createContext, useContext, ReactNode } from "react";
import { useSubscription as useSubscriptionData } from "@/hooks/useSubscription";

// ✅ Matches PricingPlan model in schema
interface Plan {
  id: string;
  planCode: string; // "C1", "C2", "M1", etc.
  category: "COUNSELLOR" | "MARKETPLACE" | "SERVICE" | "TEACHER" | "STUDENT";
  name: string; // "Monthly", "Yearly", "Free"
  price: number; // in FCFA
  interval: "MONTHLY" | "YEARLY" | "ONGOING" | "PER_LEAD" | "PER_USE";
  commissionRate: number | null;
  productLimit: number | null;
  leadLimit: number | null;
  courseLimit: number | null;
  features: string[];
  active: boolean;
  sortOrder: number;
}

// ✅ Matches UserSubscription model in schema
interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: "ACTIVE" | "PAST_DUE" | "CANCELLED" | "EXPIRED" | "TRIALING";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  // ✅ Usage tracking fields from UserSubscription
  sessionsUsed: number;
  leadsUsed: number;
  productsUsed: number;
  coursesUsed: number;
  plan: Plan;
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  allPlans: Plan[];
  loading: boolean;
  error: any;

  // ✅ subscribeToPlan with payment options
  subscribeToPlan: (
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
  ) => Promise<{
    success: boolean;
    subscription?: Subscription;
    requiresPayment?: boolean;
    error?: string;
  }>;

  // ✅ Plan info helpers
  getCurrentPlanCode: () => string | null;
  getCurrentPlanCategory: () => string | null;

  // ✅ Feature access
  canAccessFeature: (feature: string) => boolean;

  // ✅ Usage limit helpers — all backed by schema fields
  getSessionsRemaining: () => number;
  getLeadsRemaining: () => number | typeof Infinity;
  getProductsRemaining: () => number | typeof Infinity;
  getCoursesRemaining: () => number | typeof Infinity;

  // ✅ Status helpers
  isActive: () => boolean;
  isTrialing: () => boolean;
  isExpired: () => boolean;
  isPastDue: () => boolean;
  willCancelAtPeriodEnd: () => boolean;
  getDaysUntilRenewal: () => number | null;

  refetch: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined,
);

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
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider",
    );
  }
  return context;
}
