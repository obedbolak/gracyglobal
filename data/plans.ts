// data/plans.ts

export interface Plan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;  // CFA
  priceAnnual: number;   // CFA per month billed annually
  pricePerSession: number | null; // CFA per session (null = unlimited)
  highlighted: boolean;
  badge?: string;
  color: string;
  gradient: string;
  glow: string;
  features: { text: string; included: boolean }[];
  cta: string;
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    description: "Explore the community and see what GracyGlobal is about.",
    priceMonthly: 0,
    priceAnnual: 0,
    pricePerSession: null,
    highlighted: false,
    color: "var(--text-secondary)",
    gradient: "linear-gradient(135deg, var(--blue), var(--purple))",
    glow: "rgba(26,58,219,0.2)",
    cta: "Get Started Free",
    features: [
      { text: "Browse community posts", included: true },
      { text: "View public projects", included: true },
      { text: "Access free resources", included: true },
      { text: "View upcoming events", included: true },
      { text: "Post & reply in discussions", included: false },
      { text: "Join or lead projects", included: false },
      { text: "RSVP to events", included: false },
      { text: "Download premium resources", included: false },
      { text: "1-on-1 counselor sessions", included: false },
    ],
  },
  {
    id: "starter",
    name: "Starter",
    description: "Get involved. Post, connect, and start making impact.",
    priceMonthly: 5000,
    priceAnnual: 3500,
    pricePerSession: 3000,
    highlighted: false,
    color: "var(--blue)",
    gradient: "linear-gradient(135deg, var(--blue), var(--purple))",
    glow: "rgba(26,58,219,0.3)",
    cta: "Start Starter",
    features: [
      { text: "Everything in Free", included: true },
      { text: "Post & reply in discussions", included: true },
      { text: "Join active projects", included: true },
      { text: "RSVP to events", included: true },
      { text: "Download basic resources", included: true },
      { text: "2 counselor sessions/month", included: true },
      { text: "Lead your own project", included: false },
      { text: "Unlimited sessions", included: false },
      { text: "Priority support", included: false },
    ],
  },
  {
    id: "growth",
    name: "Growth",
    description: "Lead projects, access all resources, and grow with your cohort.",
    priceMonthly: 15000,
    priceAnnual: 10000,
    pricePerSession: 2000,
    highlighted: true,
    badge: "Most Popular",
    color: "var(--purple)",
    gradient: "linear-gradient(135deg, var(--scarlet), var(--purple))",
    glow: "rgba(220,20,60,0.35)",
    cta: "Join Growth",
    features: [
      { text: "Everything in Starter", included: true },
      { text: "Lead your own projects", included: true },
      { text: "Unlimited resource downloads", included: true },
      { text: "Early event access", included: true },
      { text: "5 counselor sessions/month", included: true },
      { text: "Access all 7 system groups", included: true },
      { text: "Monthly cohort calls", included: true },
      { text: "Unlimited sessions", included: false },
      { text: "Dedicated account manager", included: false },
    ],
  },
  {
    id: "elite",
    name: "Elite / Pro",
    description: "Unlimited access. For serious changemakers building Africa's future.",
    priceMonthly: 35000,
    priceAnnual: 25000,
    pricePerSession: null,
    highlighted: false,
    badge: "Full Access",
    color: "var(--purple-light)",
    gradient: "linear-gradient(135deg, var(--purple-light), var(--scarlet-light))",
    glow: "rgba(168,85,247,0.4)",
    cta: "Go Elite",
    features: [
      { text: "Everything in Growth", included: true },
      { text: "Unlimited counselor sessions", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "1-on-1 leadership coaching", included: true },
      { text: "Private mastermind group", included: true },
      { text: "Priority event speaking slots", included: true },
      { text: "Custom project support", included: true },
      { text: "Affiliate revenue share", included: true },
      { text: "Early access to new features", included: true },
    ],
  },
];
