// data/services.ts
// Single source of truth for service data, categories, and subscription plans.
// NOTE: All pricing amounts are in XAF (Central African Franc) - the base currency.
// The currency converter will automatically convert to user's preferred currency.

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

export interface ServiceOption {
  id: string;
  name: string;
  description: string;
  pricing: PricingOption;
  duration?: string; // e.g. "2 hours", "Full day"
  popular?: boolean;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  images: string[];
  category: ServiceCategory;
  group: ServiceCategoryGroup;
  featured: boolean;
  rating: number;
  reviews: number;
  badge?: string;
  includes?: string[];  // what's covered
  availability?: string; // e.g. "Mon–Sat, 7am–8pm"
  options: ServiceOption[]; // Different service packages/tiers
}

// ─── Services ──────────────────────────────────────────────────────────────────

export const services: Service[] = [
  // ── Home & Errand ──
  {
    id: "svc-home-delivery",
    name: "Home Delivery Service",
    description:
      "Fast, reliable delivery of packages, documents, and purchases straight to your door. Same-day and scheduled delivery available.",
    images: [
      "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=600&q=80",
    ],
    category: "Home Delivery",
    group: "Home & Errand",
    featured: true,
    rating: 4.6,
    reviews: 112,
    badge: "Popular",
    includes: ["Live tracking", "SMS alerts", "Proof of delivery", "Insurance coverage"],
    availability: "Mon–Sat, 7am–8pm",
    options: [
      {
        id: "delivery-single",
        name: "Single Delivery",
        description: "One-time delivery within city limits",
        pricing: { type: "one-time", amount: 1500, label: "Per delivery" },
      },
      {
        id: "delivery-monthly",
        name: "Monthly Plan",
        description: "Up to 10 deliveries per month with priority service",
        pricing: { type: "monthly", amount: 12000, yearlyAmount: 120000 },
        popular: true,
      },
      {
        id: "delivery-unlimited",
        name: "Unlimited Plan",
        description: "Unlimited local deliveries with same-day guarantee",
        pricing: { type: "monthly", amount: 25000, yearlyAmount: 250000 },
      },
    ],
  },
  {
    id: "svc-grocery-shopping",
    name: "Grocery & Personal Shopping",
    description:
      "A dedicated shopper handles your grocery list, market runs, and personal purchases. Fresh produce, household items, and more delivered to you.",
    images: [
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80",
    ],
    category: "Grocery & Personal Shopping",
    group: "Home & Errand",
    featured: true,
    rating: 4.7,
    reviews: 88,
    includes: ["Professional shopper", "Market & supermarket runs", "Receipt provided", "Quality guarantee"],
    availability: "Mon–Sat, 7am–6pm",
    options: [
      {
        id: "grocery-basic",
        name: "Basic Shopping",
        description: "Essential grocery shopping for individuals or small households",
        pricing: { type: "per-session", amount: 2500, label: "Per trip" },
      },
      {
        id: "grocery-standard",
        name: "Standard Shopping",
        description: "Weekly grocery shopping with up to 4 trips per month",
        pricing: { type: "monthly", amount: 8000, yearlyAmount: 80000 },
        popular: true,
      },
      {
        id: "grocery-premium",
        name: "Premium Shopping",
        description: "Unlimited shopping trips with priority scheduling and specialty items",
        pricing: { type: "monthly", amount: 20000, yearlyAmount: 200000 },
      },
    ],
  },
  {
    id: "svc-errand-assistance",
    name: "Errand & Personal Assistance",
    description:
      "Let us handle your daily errands — bill payments, document drops, queue waiting, pharmacy pickups, and more.",
    images: [
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80",
    ],
    category: "Errand & Personal Assistance",
    group: "Home & Errand",
    featured: false,
    rating: 4.5,
    reviews: 54,
    includes: ["Bill & payment runs", "Pharmacy & office pickups", "Queue waiting service", "Document handling"],
    availability: "Mon–Fri, 8am–6pm",
    options: [
      {
        id: "errand-payg",
        name: "Pay As You Go",
        description: "Single errand service with no commitment",
        pricing: { type: "per-session", amount: 2000, label: "Per errand" },
      },
      {
        id: "errand-monthly",
        name: "Monthly Package",
        description: "Up to 10 errands per month with priority service",
        pricing: { type: "monthly", amount: 15000, yearlyAmount: 150000 },
        popular: true,
      },
    ],
  },

  // ── Transport ──
  {
    id: "svc-ride-transport",
    name: "Ride & Transport Service",
    description:
      "Safe, comfortable rides for daily commutes, airport transfers, school runs, or special occasions. Book in advance or on-demand.",
    images: [
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&q=80",
    ],
    category: "Ride & Transport",
    group: "Transport",
    featured: true,
    rating: 4.8,
    reviews: 203,
    badge: "On-Demand",
    includes: ["Professional driver", "Clean vehicle", "Door-to-door", "GPS tracking"],
    availability: "Daily, 5am–11pm",
    options: [
      {
        id: "ride-single",
        name: "Single Ride",
        description: "One-time ride within city limits",
        pricing: { type: "one-time", amount: 3500, label: "Per ride" },
        popular: true,
      },
      {
        id: "ride-airport",
        name: "Airport Transfer",
        description: "Airport pickup or drop-off service",
        pricing: { type: "one-time", amount: 8000, label: "Per trip" },
      },
      {
        id: "ride-monthly",
        name: "Monthly Commute",
        description: "Daily commute package (up to 40 rides/month)",
        pricing: { type: "monthly", amount: 120000, yearlyAmount: 1200000 },
      },
    ],
  },

  // ── Home Comfort ──
  {
    id: "svc-meal-preparation",
    name: "Meal Preparation Service",
    description:
      "A personal cook comes to your home to prepare fresh, healthy meals. Choose your menu, dietary needs, and schedule — we handle the rest.",
    images: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
    ],
    category: "Meal Preparation",
    group: "Home Comfort",
    featured: true,
    rating: 4.8,
    reviews: 97,
    badge: "Top Rated",
    includes: ["Custom menu planning", "Ingredients sourced", "Kitchen cleanup", "Dietary accommodations"],
    availability: "Daily, 7am–7pm",
    options: [
      {
        id: "meal-basic",
        name: "Basic Plan",
        description: "4 cooking sessions per month",
        pricing: { type: "monthly", amount: 25000, yearlyAmount: 250000 },
      },
      {
        id: "meal-standard",
        name: "Standard Plan",
        description: "8 cooking sessions per month with meal planning",
        pricing: { type: "monthly", amount: 45000, yearlyAmount: 450000 },
        popular: true,
      },
      {
        id: "meal-premium",
        name: "Premium Plan",
        description: "12 cooking sessions per month with specialty cuisine",
        pricing: { type: "monthly", amount: 65000, yearlyAmount: 650000 },
      },
    ],
  },
  {
    id: "svc-laundry-care",
    name: "Laundry & Garment Care",
    description:
      "Full laundry service including washing, drying, ironing, and folding. Pickup and delivery included. Delicate and bulk loads handled with care.",
    images: [
      "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600&q=80",
    ],
    category: "Laundry & Garment Care",
    group: "Home Comfort",
    featured: false,
    rating: 4.5,
    reviews: 63,
    includes: ["Pickup & delivery", "Wash, dry & iron", "Delicate care", "Stain treatment"],
    availability: "Mon–Sat, 8am–5pm",
    options: [
      {
        id: "laundry-perkg",
        name: "Pay Per Load",
        description: "Charged per kilogram of laundry",
        pricing: { type: "per-session", amount: 1500, label: "Per kg" },
      },
      {
        id: "laundry-weekly",
        name: "Weekly Service",
        description: "Weekly pickup & delivery (up to 15kg/week)",
        pricing: { type: "monthly", amount: 20000, yearlyAmount: 200000 },
        popular: true,
      },
      {
        id: "laundry-unlimited",
        name: "Unlimited Service",
        description: "Unlimited laundry with twice-weekly pickup",
        pricing: { type: "monthly", amount: 35000, yearlyAmount: 350000 },
      },
    ],
  },

  // ── Home Management ──
  {
    id: "svc-home-cleaning",
    name: "Home Cleaning & Maintenance",
    description:
      "Professional home cleaning covering all rooms, floors, kitchens, and bathrooms. Deep cleaning and routine maintenance packages available.",
    images: [
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80",
    ],
    category: "Home Cleaning & Maintenance",
    group: "Home Management",
    featured: true,
    rating: 4.6,
    reviews: 145,
    includes: ["All rooms covered", "Eco-friendly products", "Minor repairs", "Quality guarantee"],
    availability: "Mon–Sat, 7am–6pm",
    options: [
      {
        id: "cleaning-basic",
        name: "Basic Cleaning",
        description: "2 cleaning visits per month",
        pricing: { type: "monthly", amount: 20000, yearlyAmount: 200000 },
      },
      {
        id: "cleaning-standard",
        name: "Standard Cleaning",
        description: "4 cleaning visits per month (weekly)",
        pricing: { type: "monthly", amount: 35000, yearlyAmount: 350000 },
        popular: true,
      },
      {
        id: "cleaning-deep",
        name: "Deep Cleaning",
        description: "One-time deep cleaning service",
        pricing: { type: "one-time", amount: 25000, label: "Per session" },
      },
    ],
  },
  {
    id: "svc-home-support",
    name: "Home Support Service",
    description:
      "A dedicated home assistant helps manage household routines, coordinate vendors, run the home smoothly, and support the whole family.",
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
    options: [
      {
        id: "support-parttime",
        name: "Part-Time Support",
        description: "20 hours per week of home assistance",
        pricing: { type: "monthly", amount: 40000, yearlyAmount: 400000 },
      },
      {
        id: "support-fulltime",
        name: "Full-Time Support",
        description: "40 hours per week with dedicated assistant",
        pricing: { type: "monthly", amount: 75000, yearlyAmount: 750000 },
        popular: true,
      },
    ],
  },

  // ── Care Services ──
  {
    id: "svc-child-care",
    name: "Child Care Service",
    description:
      "Trusted, background-checked caregivers provide attentive, nurturing care for your children at home. Includes activities, meals, and school-run assistance.",
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
    options: [
      {
        id: "childcare-occasional",
        name: "Occasional Care",
        description: "Hourly childcare for occasional needs",
        pricing: { type: "per-session", amount: 3000, label: "Per hour" },
      },
      {
        id: "childcare-parttime",
        name: "Part-Time Care",
        description: "20 hours per week of childcare",
        pricing: { type: "monthly", amount: 45000, yearlyAmount: 450000 },
        popular: true,
      },
      {
        id: "childcare-fulltime",
        name: "Full-Time Care",
        description: "40 hours per week with dedicated caregiver",
        pricing: { type: "monthly", amount: 80000, yearlyAmount: 800000 },
      },
    ],
  },
  {
    id: "svc-elder-care",
    name: "Elder Care & Companionship",
    description:
      "Compassionate, professional care for elderly family members. Services include daily assistance, companionship, medication reminders, and mobility support.",
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
    options: [
      {
        id: "eldercare-visits",
        name: "Daily Visits",
        description: "2-hour daily visits for companionship and assistance",
        pricing: { type: "monthly", amount: 35000, yearlyAmount: 350000 },
      },
      {
        id: "eldercare-parttime",
        name: "Part-Time Care",
        description: "4 hours daily care with medication management",
        pricing: { type: "monthly", amount: 65000, yearlyAmount: 650000 },
        popular: true,
      },
      {
        id: "eldercare-fulltime",
        name: "Full-Time Care",
        description: "24/7 live-in care with medical support",
        pricing: { type: "monthly", amount: 150000, yearlyAmount: 1500000 },
      },
    ],
  },

  // ── Beauty & Wellness ──
  {
    id: "svc-hairdressing",
    name: "Hairdressing & Barber Service",
    description:
      "Professional hairdressers and barbers come to your home. From cuts and styling to braiding and treatments — all hair types welcomed.",
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
    options: [
      {
        id: "hair-basic",
        name: "Basic Cut & Style",
        description: "Haircut and basic styling",
        pricing: { type: "per-session", amount: 3500, label: "Per session" },
        popular: true,
      },
      {
        id: "hair-premium",
        name: "Premium Styling",
        description: "Cut, color, and advanced styling",
        pricing: { type: "per-session", amount: 8000, label: "Per session" },
      },
      {
        id: "hair-braiding",
        name: "Braiding & Extensions",
        description: "Professional braiding and hair extensions",
        pricing: { type: "per-session", amount: 12000, label: "Per session" },
      },
    ],
  },
  {
    id: "svc-makeup-grooming",
    name: "Makeup & Grooming",
    description:
      "Professional makeup artists and grooming specialists for events, photoshoots, or everyday glam. Natural, bridal, and editorial looks available.",
    images: [
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80",
    ],
    category: "Makeup & Grooming",
    group: "Beauty & Wellness",
    featured: false,
    rating: 4.8,
    reviews: 91,
    includes: ["Home visit", "Professional kit", "Touch-up guidance", "Product recommendations"],
    availability: "Daily, 7am–8pm",
    options: [
      {
        id: "makeup-natural",
        name: "Natural Look",
        description: "Everyday natural makeup application",
        pricing: { type: "per-session", amount: 5000, label: "Per session" },
      },
      {
        id: "makeup-event",
        name: "Event Makeup",
        description: "Full glam for special occasions",
        pricing: { type: "per-session", amount: 10000, label: "Per session" },
        popular: true,
      },
      {
        id: "makeup-bridal",
        name: "Bridal Package",
        description: "Complete bridal makeup with trial session",
        pricing: { type: "per-session", amount: 25000, label: "Per package" },
      },
    ],
  },
  {
    id: "svc-skincare-facials",
    name: "Skincare & Facials",
    description:
      "Licensed estheticians bring the spa to you. Deep cleansing facials, chemical peels, brightening treatments, and custom skincare routines.",
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
    options: [
      {
        id: "facial-basic",
        name: "Basic Facial",
        description: "Deep cleansing and hydration treatment",
        pricing: { type: "per-session", amount: 8000, label: "Per session" },
      },
      {
        id: "facial-advanced",
        name: "Advanced Treatment",
        description: "Chemical peel or microdermabrasion",
        pricing: { type: "per-session", amount: 15000, label: "Per session" },
        popular: true,
      },
      {
        id: "facial-package",
        name: "Monthly Package",
        description: "4 facial sessions per month",
        pricing: { type: "monthly", amount: 50000, yearlyAmount: 500000 },
      },
    ],
  },
  {
    id: "svc-nail-care",
    name: "Nail Care (Manicure & Pedicure)",
    description:
      "At-home nail technicians for manicures, pedicures, gel nails, and nail art. Hygienic, professional tools used every visit.",
    images: [
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80",
    ],
    category: "Nail Care",
    group: "Beauty & Wellness",
    featured: false,
    rating: 4.6,
    reviews: 82,
    includes: ["Sterilised tools", "Quality products", "Nail art options", "Home visit"],
    availability: "Tue–Sun, 9am–7pm",
    options: [
      {
        id: "nails-basic",
        name: "Basic Mani/Pedi",
        description: "Standard manicure and pedicure",
        pricing: { type: "per-session", amount: 4000, label: "Per session" },
        popular: true,
      },
      {
        id: "nails-gel",
        name: "Gel Nails",
        description: "Gel manicure with extended wear",
        pricing: { type: "per-session", amount: 7000, label: "Per session" },
      },
      {
        id: "nails-art",
        name: "Nail Art Package",
        description: "Custom nail art and design",
        pricing: { type: "per-session", amount: 10000, label: "Per session" },
      },
    ],
  },
  {
    id: "svc-massage-therapy",
    name: "Massage & Wellness Therapy",
    description:
      "Certified massage therapists offer relaxation, deep tissue, sports, and prenatal massages in the comfort of your home.",
    images: [
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80",
    ],
    category: "Massage & Wellness Therapy",
    group: "Beauty & Wellness",
    featured: true,
    rating: 4.9,
    reviews: 109,
    badge: "Wellness",
    includes: ["Certified therapist", "Table & oils provided", "Multiple techniques", "Aromatherapy options"],
    availability: "Daily, 8am–9pm",
    options: [
      {
        id: "massage-60min",
        name: "60-Minute Session",
        description: "Full body relaxation or deep tissue massage",
        pricing: { type: "per-session", amount: 12000, label: "Per session" },
        popular: true,
      },
      {
        id: "massage-90min",
        name: "90-Minute Session",
        description: "Extended massage with hot stones",
        pricing: { type: "per-session", amount: 18000, label: "Per session" },
      },
      {
        id: "massage-package",
        name: "Monthly Wellness",
        description: "4 massage sessions per month",
        pricing: { type: "monthly", amount: 40000, yearlyAmount: 400000 },
      },
    ],
  },

  // ── Priority Access ──
  {
    id: "svc-priority-ondemand",
    name: "Priority & On-Demand Assistance",
    description:
      "VIP access to all services with guaranteed fast response, dedicated account manager, and 24/7 availability. The ultimate lifestyle support package.",
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
    options: [
      {
        id: "priority-silver",
        name: "Silver Priority",
        description: "Priority access with 2-hour response time",
        pricing: { type: "monthly", amount: 20000, yearlyAmount: 200000 },
      },
      {
        id: "priority-gold",
        name: "Gold Priority",
        description: "VIP access with 1-hour response and account manager",
        pricing: { type: "monthly", amount: 35000, yearlyAmount: 350000 },
        popular: true,
      },
      {
        id: "priority-platinum",
        name: "Platinum Priority",
        description: "Ultimate VIP with instant response and concierge service",
        pricing: { type: "monthly", amount: 60000, yearlyAmount: 600000 },
      },
    ],
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
