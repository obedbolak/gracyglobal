// data/services.ts
// Single source of truth for service data, categories, and subscription plans.

// ─── Pricing Types ─────────────────────────────────────────────────────────────

export type PricingType = "monthly" | "one-time" | "per-session";

export interface PricingOption {
  type: PricingType;
  amount: number;
  yearlyAmount?: number; // only for monthly — yearly discounted price
  label?: string;        // e.g. "Per ride", "Per session"
}

// ─── Service Category Groups ───────────────────────────────────────────────────

export const SERVICE_CATEGORY_GROUPS = [
  {
    group: "Home & Errand",
    icon: "🏠",
    categories: [
      "Home Delivery",
      "Grocery & Personal Shopping",
      "Errand & Personal Assistance",
    ],
  },
  {
    group: "Transport",
    icon: "🚗",
    categories: ["Ride & Transport"],
  },
  {
    group: "Home Comfort",
    icon: "🍽️",
    categories: ["Meal Preparation", "Laundry & Garment Care"],
  },
  {
    group: "Home Management",
    icon: "🧹",
    categories: ["Home Cleaning & Maintenance", "Home Support"],
  },
  {
    group: "Care Services",
    icon: "❤️",
    categories: ["Child Care", "Elder Care & Companionship"],
  },
  {
    group: "Beauty & Wellness",
    icon: "✨",
    categories: [
      "Hairdressing & Barber",
      "Makeup & Grooming",
      "Skincare & Facials",
      "Nail Care",
      "Massage & Wellness Therapy",
    ],
  },
  {
    group: "Priority Access",
    icon: "⚡",
    categories: ["Priority & On-Demand Assistance"],
  },
] as const;

export type ServiceCategoryGroup = (typeof SERVICE_CATEGORY_GROUPS)[number]["group"];
export type ServiceCategory =
  (typeof SERVICE_CATEGORY_GROUPS)[number]["categories"][number];

export const ALL_SERVICE_CATEGORIES = SERVICE_CATEGORY_GROUPS.flatMap(
  (g) => g.categories,
) as ServiceCategory[];

// ─── Service Interface ─────────────────────────────────────────────────────────

export interface Service {
  id: string;
  name: string;
  description: string;
  pricing: PricingOption;
  images: string[];
  category: ServiceCategory;
  group: ServiceCategoryGroup;
  featured: boolean;
  rating: number;
  reviews: number;
  badge?: string;
  includes?: string[];  // what's covered
  availability?: string; // e.g. "Mon–Sat, 7am–8pm"
}

// ─── Services ──────────────────────────────────────────────────────────────────

export const services: Service[] = [
  // ── Home & Errand ──
  {
    id: "svc-home-delivery",
    name: "Home Delivery Service",
    description:
      "Fast, reliable delivery of packages, documents, and purchases straight to your door. Same-day and scheduled delivery available.",
    pricing: { type: "monthly", amount: 15000, yearlyAmount: 150000 },
    images: [
      "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=600&q=80",
    ],
    category: "Home Delivery",
    group: "Home & Errand",
    featured: true,
    rating: 4.6,
    reviews: 112,
    badge: "Popular",
    includes: ["Unlimited local deliveries", "Live tracking", "SMS alerts"],
    availability: "Mon–Sat, 7am–8pm",
  },
  {
    id: "svc-grocery-shopping",
    name: "Grocery & Personal Shopping",
    description:
      "A dedicated shopper handles your grocery list, market runs, and personal purchases. Fresh produce, household items, and more delivered to you.",
    pricing: { type: "monthly", amount: 20000, yearlyAmount: 200000 },
    images: [
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80",
    ],
    category: "Grocery & Personal Shopping",
    group: "Home & Errand",
    featured: true,
    rating: 4.7,
    reviews: 88,
    includes: ["Up to 8 shopping trips/month", "Market & supermarket runs", "Receipt provided"],
    availability: "Mon–Sat, 7am–6pm",
  },
  {
    id: "svc-errand-assistance",
    name: "Errand & Personal Assistance",
    description:
      "Let us handle your daily errands — bill payments, document drops, queue waiting, pharmacy pickups, and more.",
    pricing: { type: "monthly", amount: 18000, yearlyAmount: 180000 },
    images: [
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80",
    ],
    category: "Errand & Personal Assistance",
    group: "Home & Errand",
    featured: false,
    rating: 4.5,
    reviews: 54,
    includes: ["Up to 10 errands/month", "Bill & payment runs", "Pharmacy & office pickups"],
    availability: "Mon–Fri, 8am–6pm",
  },

  // ── Transport ──
  {
    id: "svc-ride-transport",
    name: "Ride & Transport Service",
    description:
      "Safe, comfortable rides for daily commutes, airport transfers, school runs, or special occasions. Book in advance or on-demand.",
    pricing: { type: "one-time", amount: 3500, label: "Per ride (within city)" },
    images: [
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&q=80",
    ],
    category: "Ride & Transport",
    group: "Transport",
    featured: true,
    rating: 4.8,
    reviews: 203,
    badge: "On-Demand",
    includes: ["Professional driver", "Clean vehicle", "Door-to-door"],
    availability: "Daily, 5am–11pm",
  },

  // ── Home Comfort ──
  {
    id: "svc-meal-preparation",
    name: "Meal Preparation Service",
    description:
      "A personal cook comes to your home to prepare fresh, healthy meals. Choose your menu, dietary needs, and schedule — we handle the rest.",
    pricing: { type: "monthly", amount: 45000, yearlyAmount: 450000 },
    images: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
    ],
    category: "Meal Preparation",
    group: "Home Comfort",
    featured: true,
    rating: 4.8,
    reviews: 97,
    badge: "Top Rated",
    includes: ["Up to 12 cooking sessions/month", "Custom menu planning", "Ingredients sourced", "Kitchen cleanup"],
    availability: "Daily, 7am–7pm",
  },
  {
    id: "svc-laundry-care",
    name: "Laundry & Garment Care",
    description:
      "Full laundry service including washing, drying, ironing, and folding. Pickup and delivery included. Delicate and bulk loads handled with care.",
    pricing: { type: "monthly", amount: 25000, yearlyAmount: 250000 },
    images: [
      "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600&q=80",
    ],
    category: "Laundry & Garment Care",
    group: "Home Comfort",
    featured: false,
    rating: 4.5,
    reviews: 63,
    includes: ["Weekly pickup & delivery", "Wash, dry & iron", "Delicate care", "Up to 15kg/week"],
    availability: "Mon–Sat, 8am–5pm",
  },

  // ── Home Management ──
  {
    id: "svc-home-cleaning",
    name: "Home Cleaning & Maintenance",
    description:
      "Professional home cleaning covering all rooms, floors, kitchens, and bathrooms. Deep cleaning and routine maintenance packages available.",
    pricing: { type: "monthly", amount: 35000, yearlyAmount: 350000 },
    images: [
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80",
    ],
    category: "Home Cleaning & Maintenance",
    group: "Home Management",
    featured: true,
    rating: 4.6,
    reviews: 145,
    includes: ["4 cleaning visits/month", "All rooms covered", "Eco-friendly products", "Minor repairs"],
    availability: "Mon–Sat, 7am–6pm",
  },
  {
    id: "svc-home-support",
    name: "Home Support Service",
    description:
      "A dedicated home assistant helps manage household routines, coordinate vendors, run the home smoothly, and support the whole family.",
    pricing: { type: "monthly", amount: 60000, yearlyAmount: 600000 },
    images: [
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80",
    ],
    category: "Home Support",
    group: "Home Management",
    featured: false,
    rating: 4.7,
    reviews: 42,
    includes: ["Dedicated home assistant", "Vendor coordination", "Household scheduling", "Daily reporting"],
    availability: "Mon–Sat, 7am–7pm",
  },

  // ── Care Services ──
  {
    id: "svc-child-care",
    name: "Child Care Service",
    description:
      "Trusted, background-checked caregivers provide attentive, nurturing care for your children at home. Includes activities, meals, and school-run assistance.",
    pricing: { type: "monthly", amount: 55000, yearlyAmount: 550000 },
    images: [
      "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&q=80",
    ],
    category: "Child Care",
    group: "Care Services",
    featured: true,
    rating: 4.9,
    reviews: 78,
    badge: "Trusted",
    includes: ["Background-checked carer", "Activity planning", "School run support", "Meal prep for kids"],
    availability: "Mon–Sat, 6am–8pm",
  },
  {
    id: "svc-elder-care",
    name: "Elder Care & Companionship",
    description:
      "Compassionate, professional care for elderly family members. Services include daily assistance, companionship, medication reminders, and mobility support.",
    pricing: { type: "monthly", amount: 65000, yearlyAmount: 650000 },
    images: [
      "https://images.unsplash.com/photo-1576765607924-3f7b8410a787?w=600&q=80",
    ],
    category: "Elder Care & Companionship",
    group: "Care Services",
    featured: true,
    rating: 4.9,
    reviews: 56,
    badge: "Premium Care",
    includes: ["Daily check-ins", "Medication reminders", "Mobility assistance", "Companionship & activities"],
    availability: "Daily, 7am–9pm",
  },

  // ── Beauty & Wellness ──
  {
    id: "svc-hairdressing",
    name: "Hairdressing & Barber Service",
    description:
      "Professional hairdressers and barbers come to your home. From cuts and styling to braiding and treatments — all hair types welcomed.",
    pricing: { type: "per-session", amount: 5000, label: "Per session" },
    images: [
      "https://images.unsplash.com/photo-1521490683712-35a1cb235d1c?w=600&q=80",
    ],
    category: "Hairdressing & Barber",
    group: "Beauty & Wellness",
    featured: true,
    rating: 4.7,
    reviews: 134,
    includes: ["Home visit", "All hair types", "Styling & treatments", "Equipment provided"],
    availability: "Tue–Sun, 9am–7pm",
  },
  {
    id: "svc-makeup-grooming",
    name: "Makeup & Grooming",
    description:
      "Professional makeup artists and grooming specialists for events, photoshoots, or everyday glam. Natural, bridal, and editorial looks available.",
    pricing: { type: "per-session", amount: 10000, label: "Per session" },
    images: [
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80",
    ],
    category: "Makeup & Grooming",
    group: "Beauty & Wellness",
    featured: false,
    rating: 4.8,
    reviews: 91,
    includes: ["Home visit", "Professional kit", "Bridal & event looks", "Touch-up guidance"],
    availability: "Daily, 7am–8pm",
  },
  {
    id: "svc-skincare-facials",
    name: "Skincare & Facials",
    description:
      "Licensed estheticians bring the spa to you. Deep cleansing facials, chemical peels, brightening treatments, and custom skincare routines.",
    pricing: { type: "per-session", amount: 12000, label: "Per session" },
    images: [
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80",
    ],
    category: "Skincare & Facials",
    group: "Beauty & Wellness",
    featured: true,
    rating: 4.8,
    reviews: 67,
    badge: "Spa at Home",
    includes: ["Licensed esthetician", "Products provided", "Custom skin analysis", "Post-care advice"],
    availability: "Mon–Sat, 9am–7pm",
  },
  {
    id: "svc-nail-care",
    name: "Nail Care (Manicure & Pedicure)",
    description:
      "At-home nail technicians for manicures, pedicures, gel nails, and nail art. Hygienic, professional tools used every visit.",
    pricing: { type: "per-session", amount: 6000, label: "Per session" },
    images: [
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80",
    ],
    category: "Nail Care",
    group: "Beauty & Wellness",
    featured: false,
    rating: 4.6,
    reviews: 82,
    includes: ["Mani & pedi", "Gel option available", "Nail art", "Sterilised tools"],
    availability: "Tue–Sun, 9am–7pm",
  },
  {
    id: "svc-massage-therapy",
    name: "Massage & Wellness Therapy",
    description:
      "Certified massage therapists offer relaxation, deep tissue, sports, and prenatal massages in the comfort of your home.",
    pricing: { type: "per-session", amount: 15000, label: "Per session (60 min)" },
    images: [
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80",
    ],
    category: "Massage & Wellness Therapy",
    group: "Beauty & Wellness",
    featured: true,
    rating: 4.9,
    reviews: 109,
    badge: "Wellness",
    includes: ["Certified therapist", "Table & oils provided", "60 or 90 min sessions", "Multiple techniques"],
    availability: "Daily, 8am–9pm",
  },

  // ── Priority Access ──
  {
    id: "svc-priority-ondemand",
    name: "Priority & On-Demand Assistance",
    description:
      "VIP access to all services with guaranteed fast response, dedicated account manager, and 24/7 availability. The ultimate lifestyle support package.",
    pricing: { type: "monthly", amount: 30000, yearlyAmount: 300000 },
    images: [
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&q=80",
    ],
    category: "Priority & On-Demand Assistance",
    group: "Priority Access",
    featured: true,
    rating: 5.0,
    reviews: 34,
    badge: "VIP",
    includes: ["Fast response guarantee", "Dedicated account manager", "24/7 availability", "All services unlocked"],
    availability: "24/7",
  },
];

// ─── Subscription Plans ────────────────────────────────────────────────────────

export interface ServicePlan {
  id: string;
  name: string;
  tier: "basic" | "silver" | "gold" | "platinum";
  tagline: string;
  monthlyPrice: number;
  yearlyPrice: number;
  color: string;         // for UI theming
  icon: string;
  serviceIds: string[];  // references Service.id
  featured?: boolean;
  badge?: string;
}

export const SERVICE_PLANS: ServicePlan[] = [
  {
    id: "plan-basic",
    name: "Basic",
    tier: "basic",
    tagline: "Essential Support — everyday quick help",
    monthlyPrice: 35000,
    yearlyPrice: 350000,
    color: "#6B7280",
    icon: "🔹",
    serviceIds: [
      "svc-home-delivery",
      "svc-grocery-shopping",
      "svc-errand-assistance",
    ],
  },
  {
    id: "plan-silver",
    name: "Silver",
    tier: "silver",
    tagline: "Convenience Living — for individuals & small households",
    monthlyPrice: 75000,
    yearlyPrice: 750000,
    color: "#9CA3AF",
    icon: "🔹",
    serviceIds: [
      "svc-home-delivery",
      "svc-grocery-shopping",
      "svc-errand-assistance",
      "svc-ride-transport",
      "svc-meal-preparation",
      "svc-laundry-care",
    ],
  },
  {
    id: "plan-gold",
    name: "Gold",
    tier: "gold",
    tagline: "Comfort Lifestyle — for busy professionals & families",
    monthlyPrice: 120000,
    yearlyPrice: 1200000,
    color: "#F59E0B",
    icon: "🥇",
    featured: true,
    badge: "Most Popular",
    serviceIds: [
      "svc-home-delivery",
      "svc-grocery-shopping",
      "svc-errand-assistance",
      "svc-ride-transport",
      "svc-meal-preparation",
      "svc-laundry-care",
      "svc-home-cleaning",
      "svc-child-care",
    ],
  },
  {
    id: "plan-platinum",
    name: "Platinum",
    tier: "platinum",
    tagline: "Premium Care — full lifestyle support & VIP clients",
    monthlyPrice: 200000,
    yearlyPrice: 2000000,
    color: "#6366F1",
    icon: "💎",
    badge: "All-Inclusive",
    serviceIds: [
      "svc-home-delivery",
      "svc-grocery-shopping",
      "svc-errand-assistance",
      "svc-ride-transport",
      "svc-meal-preparation",
      "svc-laundry-care",
      "svc-home-cleaning",
      "svc-child-care",
      "svc-home-support",
      "svc-elder-care",
      "svc-priority-ondemand",
    ],
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

export function getServiceById(id: string): Service | undefined {
  return services.find((s) => s.id === id);
}

export function getFeaturedServices(): Service[] {
  return services.filter((s) => s.featured);
}

export function getServicesByCategory(category: ServiceCategory): Service[] {
  return services.filter((s) => s.category === category);
}

export function getServicesByGroup(group: ServiceCategoryGroup): Service[] {
  return services.filter((s) => s.group === group);
}

export function getPlanById(id: string): ServicePlan | undefined {
  return SERVICE_PLANS.find((p) => p.id === id);
}

export function getServicesForPlan(planId: string): Service[] {
  const plan = getPlanById(planId);
  if (!plan) return [];
  return plan.serviceIds.map((id) => getServiceById(id)).filter(Boolean) as Service[];
}

export function getServiceCategoryGroup(
  category: ServiceCategory,
): ServiceCategoryGroup | undefined {
  return SERVICE_CATEGORY_GROUPS.find((g) =>
    (g.categories as readonly string[]).includes(category),
  )?.group as ServiceCategoryGroup | undefined;
}
