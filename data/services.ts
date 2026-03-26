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
      "Housing & Property Services",
    ],
  },
  {
    group: "Transport",
    icon: "🚗",
    categories: ["Ride & Transport", "Car Rental", "Auto Repair & Roadside Assistance"],
  },
  {
    group: "Home Comfort",
    icon: "🍽️",
    categories: ["Meal Preparation", "Laundry & Garment Care"],
  },
  {
    group: "Home Management",
    icon: "🧹",
    categories: ["Home Cleaning & Maintenance", "Home Support", "Home Maintenance & Repairs"],
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
      "Personal Care & Lifestyle",
    ],
  },
  {
    group: "Business & Professional",
    icon: "💼",
    categories: ["Business & Professional Services"],
  },
  {
    group: "Technical Services",
    icon: "💻",
    categories: ["Technical & Digital Services"],
  },
  {
    group: "Education",
    icon: "🏫",
    categories: ["Education & Training"],
  },
  {
    group: "Legal & Administrative",
    icon: "📄",
    categories: ["Administrative & Legal Services"],
  },
  {
    group: "Marketplace",
    icon: "🛍️",
    categories: ["Marketplace & Sourcing"],
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

  // ── Car Rental ──
  {
    id: "svc-car-rental",
    name: "Car Rental Service",
    description:
      "Flexible car rental options for daily, weekly, or monthly needs. Economy, sedan, SUV, and luxury vehicles available with or without driver.",
    images: [
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&q=80",
    ],
    category: "Car Rental",
    group: "Transport",
    featured: true,
    rating: 4.7,
    reviews: 187,
    badge: "Flexible",
    includes: ["Insurance coverage", "24/7 roadside assistance", "Unlimited mileage", "Fuel options"],
    availability: "Daily, 24/7",
    options: [
      {
        id: "rental-daily",
        name: "Daily Rental",
        description: "Economy or sedan car for one day",
        pricing: { type: "per-session", amount: 15000, label: "Per day" },
        popular: true,
      },
      {
        id: "rental-weekly",
        name: "Weekly Rental",
        description: "7-day car rental with discounted rate",
        pricing: { type: "one-time", amount: 90000, label: "Per week" },
      },
      {
        id: "rental-monthly",
        name: "Monthly Rental",
        description: "30-day car rental with best rates",
        pricing: { type: "monthly", amount: 300000, yearlyAmount: 3000000 },
      },
      {
        id: "rental-driver",
        name: "With Driver",
        description: "Car rental with professional driver (daily)",
        pricing: { type: "per-session", amount: 25000, label: "Per day" },
      },
    ],
  },

  // ── Housing & Property ──
  {
    id: "svc-housing-property",
    name: "Housing & Property Services",
    description:
      "Complete housing support including house hunting, rental search, property inspection, rent negotiation, land acquisition, and property sales.",
    images: [
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80",
    ],
    category: "Housing & Property Services",
    group: "Home & Errand",
    featured: true,
    rating: 4.7,
    reviews: 89,
    badge: "Relocation",
    includes: ["House hunting", "Property inspection", "Rent negotiation", "Land acquisition", "Property sales", "Legal documentation"],
    availability: "Mon–Sat, 9am–6pm",
    options: [
      {
        id: "housing-studio",
        name: "Studio Apartment Rental",
        description: "Furnished or unfurnished studio apartments",
        pricing: { type: "monthly", amount: 80000, yearlyAmount: 960000 },
      },
      {
        id: "housing-1bed",
        name: "1-Bedroom Apartment Rental",
        description: "Modern 1-bedroom apartments in prime locations",
        pricing: { type: "monthly", amount: 120000, yearlyAmount: 1440000 },
        popular: true,
      },
      {
        id: "housing-2bed",
        name: "2-Bedroom Apartment Rental",
        description: "Spacious 2-bedroom apartments for families",
        pricing: { type: "monthly", amount: 180000, yearlyAmount: 2160000 },
      },
      {
        id: "housing-3bed",
        name: "3-Bedroom House Rental",
        description: "Family homes with 3 bedrooms and compound",
        pricing: { type: "monthly", amount: 250000, yearlyAmount: 3000000 },
      },
      {
        id: "housing-villa",
        name: "Villa/Luxury Home Rental",
        description: "Premium villas and luxury homes with amenities",
        pricing: { type: "monthly", amount: 500000, yearlyAmount: 6000000 },
      },
      {
        id: "housing-commercial",
        name: "Commercial Space Rental",
        description: "Office spaces, shops, and commercial properties",
        pricing: { type: "monthly", amount: 300000, yearlyAmount: 3600000 },
      },
      {
        id: "housing-shortterm",
        name: "Short-Stay Apartments",
        description: "Fully furnished apartments for short-term stays",
        pricing: { type: "per-session", amount: 25000, label: "Per night" },
      },
      {
        id: "housing-land-residential",
        name: "Residential Land Sale",
        description: "Titled residential plots in developed areas",
        pricing: { type: "one-time", amount: 5000000, label: "From 5M XAF" },
      },
      {
        id: "housing-land-commercial",
        name: "Commercial Land Sale",
        description: "Prime commercial plots on major roads",
        pricing: { type: "one-time", amount: 10000000, label: "From 10M XAF" },
      },
      {
        id: "housing-apartment-sale",
        name: "Apartment for Sale",
        description: "Modern apartments for purchase (1-3 bedrooms)",
        pricing: { type: "one-time", amount: 15000000, label: "From 15M XAF" },
      },
      {
        id: "housing-house-sale",
        name: "House for Sale",
        description: "Standalone houses with land title",
        pricing: { type: "one-time", amount: 25000000, label: "From 25M XAF" },
      },
      {
        id: "housing-villa-sale",
        name: "Villa/Luxury Property Sale",
        description: "Premium villas and luxury properties",
        pricing: { type: "one-time", amount: 50000000, label: "From 50M XAF" },
      },
      {
        id: "housing-consultation",
        name: "Property Consultation",
        description: "Professional property search and negotiation service",
        pricing: { type: "one-time", amount: 20000, label: "Per consultation" },
      },
    ],
  },

  // ── Auto Repair & Roadside ──
  {
    id: "svc-auto-repair",
    name: "Auto Repair & Roadside Assistance",
    description:
      "Complete auto repair services including mobile mechanics, diagnostics, oil changes, tire services, towing, and emergency roadside assistance.",
    images: [
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80",
    ],
    category: "Auto Repair & Roadside Assistance",
    group: "Transport",
    featured: true,
    rating: 4.6,
    reviews: 156,
    badge: "24/7 Emergency",
    includes: ["Mobile mechanic", "Car diagnostics", "Oil change", "Tire services", "Towing", "Battery service"],
    availability: "24/7",
    options: [
      {
        id: "auto-basic",
        name: "Basic Service",
        description: "Oil change and basic maintenance",
        pricing: { type: "per-session", amount: 8000, label: "Per service" },
      },
      {
        id: "auto-diagnostic",
        name: "Diagnostic & Repair",
        description: "Full diagnostic and repair service",
        pricing: { type: "per-session", amount: 15000, label: "Per service" },
        popular: true,
      },
      {
        id: "auto-emergency",
        name: "Emergency Roadside",
        description: "24/7 emergency towing and roadside assistance",
        pricing: { type: "per-session", amount: 12000, label: "Per call" },
      },
    ],
  },

  // ── Home Maintenance & Repairs ──
  {
    id: "svc-home-repairs",
    name: "Home Maintenance & Repairs",
    description:
      "Professional home repair services including plumbing, electrical work, carpentry, AC repair, and generator maintenance.",
    images: [
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80",
    ],
    category: "Home Maintenance & Repairs",
    group: "Home Management",
    featured: true,
    rating: 4.7,
    reviews: 124,
    includes: ["Plumbing", "Electrical work", "Carpentry", "AC & fridge repair", "Generator maintenance"],
    availability: "Mon–Sat, 7am–7pm",
    options: [
      {
        id: "repair-basic",
        name: "Basic Repair",
        description: "Single repair service (plumbing, electrical, etc.)",
        pricing: { type: "per-session", amount: 5000, label: "Per repair" },
      },
      {
        id: "repair-monthly",
        name: "Monthly Maintenance",
        description: "Monthly home maintenance package (up to 4 repairs)",
        pricing: { type: "monthly", amount: 18000, yearlyAmount: 180000 },
        popular: true,
      },
      {
        id: "repair-emergency",
        name: "Emergency Repair",
        description: "Same-day emergency repair service",
        pricing: { type: "per-session", amount: 10000, label: "Per repair" },
      },
    ],
  },

  // ── Business & Professional ──
  {
    id: "svc-business-professional",
    name: "Business & Professional Services",
    description:
      "Professional business services including CV writing, document preparation, business registration, accounting, and digital marketing.",
    images: [
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80",
    ],
    category: "Business & Professional Services",
    group: "Business & Professional",
    featured: true,
    rating: 4.8,
    reviews: 98,
    includes: ["CV writing", "Document typing", "Business registration", "Accounting", "Digital marketing"],
    availability: "Mon–Fri, 8am–6pm",
    options: [
      {
        id: "business-cv",
        name: "CV Writing",
        description: "Professional CV and cover letter writing",
        pricing: { type: "one-time", amount: 10000, label: "Per CV" },
      },
      {
        id: "business-registration",
        name: "Business Registration",
        description: "Complete business registration and setup",
        pricing: { type: "one-time", amount: 50000, label: "Per registration" },
        popular: true,
      },
      {
        id: "business-monthly",
        name: "Monthly Accounting",
        description: "Monthly bookkeeping and accounting services",
        pricing: { type: "monthly", amount: 30000, yearlyAmount: 300000 },
      },
    ],
  },

  // ── Technical & Digital ──
  {
    id: "svc-technical-digital",
    name: "Technical & Digital Services",
    description:
      "Tech support including phone repair, laptop repair, Wi-Fi installation, software installation, and cyber café services.",
    images: [
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&q=80",
    ],
    category: "Technical & Digital Services",
    group: "Technical Services",
    featured: true,
    rating: 4.6,
    reviews: 142,
    includes: ["Phone repair", "Laptop repair", "Wi-Fi installation", "Software installation", "Tech support"],
    availability: "Mon–Sat, 9am–7pm",
    options: [
      {
        id: "tech-repair",
        name: "Device Repair",
        description: "Phone or laptop repair service",
        pricing: { type: "per-session", amount: 8000, label: "Per repair" },
        popular: true,
      },
      {
        id: "tech-installation",
        name: "Installation Service",
        description: "Wi-Fi or software installation",
        pricing: { type: "per-session", amount: 5000, label: "Per installation" },
      },
      {
        id: "tech-support",
        name: "Monthly Tech Support",
        description: "Unlimited tech support and maintenance",
        pricing: { type: "monthly", amount: 15000, yearlyAmount: 150000 },
      },
    ],
  },

  // ── Education & Training ──
  {
    id: "svc-education-training",
    name: "Education & Training",
    description:
      "Professional tutoring and training services including private tutoring, language training, computer training, and exam preparation.",
    images: [
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80",
    ],
    category: "Education & Training",
    group: "Education",
    featured: true,
    rating: 4.9,
    reviews: 167,
    badge: "Top Rated",
    includes: ["Private tutoring", "Language training", "Computer training", "Exam prep", "Online courses"],
    availability: "Mon–Sat, 8am–8pm",
    options: [
      {
        id: "edu-tutoring",
        name: "Private Tutoring",
        description: "One-on-one tutoring session",
        pricing: { type: "per-session", amount: 5000, label: "Per hour" },
      },
      {
        id: "edu-monthly",
        name: "Monthly Package",
        description: "8 tutoring sessions per month",
        pricing: { type: "monthly", amount: 35000, yearlyAmount: 350000 },
        popular: true,
      },
      {
        id: "edu-exam",
        name: "Exam Preparation",
        description: "Intensive exam preparation course",
        pricing: { type: "one-time", amount: 50000, label: "Per course" },
      },
    ],
  },

  // ── Administrative & Legal ──
  {
    id: "svc-admin-legal",
    name: "Administrative & Legal Services",
    description:
      "Professional administrative and legal support including ID/passport processing, visa assistance, legal consultation, and document legalization.",
    images: [
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80",
    ],
    category: "Administrative & Legal Services",
    group: "Legal & Administrative",
    featured: true,
    rating: 4.7,
    reviews: 76,
    includes: ["ID/passport processing", "Visa assistance", "Legal consultation", "Document legalization", "Tax support"],
    availability: "Mon–Fri, 9am–5pm",
    options: [
      {
        id: "admin-document",
        name: "Document Processing",
        description: "ID, passport, or visa application assistance",
        pricing: { type: "one-time", amount: 20000, label: "Per application" },
      },
      {
        id: "admin-legal",
        name: "Legal Consultation",
        description: "One-hour legal consultation session",
        pricing: { type: "per-session", amount: 15000, label: "Per hour" },
        popular: true,
      },
      {
        id: "admin-package",
        name: "Full Service Package",
        description: "Complete document processing and legal support",
        pricing: { type: "one-time", amount: 75000, label: "Per package" },
      },
    ],
  },

  // ── Marketplace & Sourcing ──
  {
    id: "svc-marketplace-sourcing",
    name: "Marketplace & Sourcing",
    description:
      "Product sourcing and marketplace services including price negotiation, import/export help, wholesale sourcing, and second-hand items.",
    images: [
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80",
    ],
    category: "Marketplace & Sourcing",
    group: "Marketplace",
    featured: true,
    rating: 4.6,
    reviews: 93,
    includes: ["Product sourcing", "Price negotiation", "Import/export help", "Wholesale sourcing", "Second-hand items"],
    availability: "Mon–Sat, 9am–6pm",
    options: [
      {
        id: "market-sourcing",
        name: "Product Sourcing",
        description: "Find and source specific products",
        pricing: { type: "per-session", amount: 10000, label: "Per item" },
      },
      {
        id: "market-wholesale",
        name: "Wholesale Sourcing",
        description: "Bulk product sourcing and negotiation",
        pricing: { type: "one-time", amount: 50000, label: "Per order" },
        popular: true,
      },
      {
        id: "market-import",
        name: "Import/Export Service",
        description: "Complete import/export assistance",
        pricing: { type: "one-time", amount: 100000, label: "Per shipment" },
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
