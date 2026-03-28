// prisma/seed.ts
import {
  PrismaClient,
  UserRole,
  JobCategory,
  JobType,
  MemberBadge,
  SubscriptionBilling,
  CourseLevel,
  LessonType,
  LiveSessionStatus,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { hash } from "bcryptjs";
import * as dotenv from "dotenv";
import { PricingType } from "@prisma/client";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // ── Site stats ──────────────────────────────────────────────────────────────
  await prisma.siteStat.upsert({
    where: { id: "main" },
    update: {},
    create: {
      id: "main",
      peopleSupported: 1000,
      jobsShared: 500,
      communityProjects: 50,
      marketplaceItems: 10,
    },
  });

  // ── Plans ───────────────────────────────────────────────────────────────────
  const plansData = [
    {
      name: "free",
      displayName: "Free",
      description: "Explore the community and see what GracyGlobal is about.",
      priceMonthly: 0,
      priceAnnual: 0,
      pricePerSession: null,
      counselorSessions: 0,
      highlighted: false,
      sortOrder: 1,
    },
    {
      name: "starter",
      displayName: "Starter",
      description: "Get involved. Post, connect, and start making impact.",
      priceMonthly: 5000,
      priceAnnual: 3500,
      pricePerSession: 3000,
      counselorSessions: 2,
      highlighted: false,
      sortOrder: 2,
    },
    {
      name: "growth",
      displayName: "Growth",
      description:
        "Lead projects, access all resources, and grow with your cohort.",
      priceMonthly: 15000,
      priceAnnual: 10000,
      pricePerSession: 2000,
      counselorSessions: 5,
      highlighted: true,
      sortOrder: 3,
    },
    {
      name: "elite",
      displayName: "Elite / Pro",
      description:
        "Unlimited access. For serious changemakers building Africa's future.",
      priceMonthly: 35000,
      priceAnnual: 25000,
      pricePerSession: null,
      counselorSessions: 0,
      highlighted: false,
      sortOrder: 4,
    },
  ];

  const plans: Record<string, { id: string }> = {};
  for (const p of plansData) {
    const plan = await prisma.plan.upsert({
      where: { name: p.name },
      update: { ...p },
      create: { ...p },
    });
    plans[p.name] = plan;
    console.log(`✅ Plan created: ${plan.displayName}`);
  }

  // ── Admin user ──────────────────────────────────────────────────────────────
  const adminPw = await hash("Admin@2025", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@gracyworld.com" },
    update: {},
    create: {
      name: "Gracy Admin",
      email: "admin@gracyworld.com",
      password: adminPw,
      role: UserRole.ADMIN,
      country: "CM",
    },
  });
  console.log("✅ Admin:", admin.email);

  // ── Test accounts — one per plan ────────────────────────────────────────────
  const testAccounts = [
    {
      name: "Test Free User",
      email: "free@gracyworld.com",
      planName: "free",
      billing: SubscriptionBilling.MONTHLY,
      badge: MemberBadge.CONTRIBUTOR,
    },
    {
      name: "Test Starter User",
      email: "starter@gracyworld.com",
      planName: "starter",
      billing: SubscriptionBilling.MONTHLY,
      badge: MemberBadge.CONTRIBUTOR,
    },
    {
      name: "Test Growth User",
      email: "growth@gracyworld.com",
      planName: "growth",
      billing: SubscriptionBilling.ANNUAL,
      badge: MemberBadge.LEADER,
    },
    {
      name: "Test Elite User",
      email: "elite@gracyworld.com",
      planName: "elite",
      billing: SubscriptionBilling.ANNUAL,
      badge: MemberBadge.PIONEER,
    },
  ];

  const pw = await hash("Test@2025", 12);
  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  for (const acc of testAccounts) {
    const user = await prisma.user.upsert({
      where: { email: acc.email },
      update: {},
      create: {
        name: acc.name,
        email: acc.email,
        password: pw,
        role: UserRole.USER,
        country: "CM",
      },
    });

    await prisma.subscription.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        planId: plans[acc.planName].id,
        billing: acc.billing,
        status: "ACTIVE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: periodEnd,
      },
    });

    await prisma.communityMember.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        bio: `${acc.name} — testing the ${acc.planName} plan.`,
        systems: ["human-flourishing", "knowledge-skills"],
        badge: acc.badge,
        contributions: 0,
      },
    });

    console.log(`✅ Test account: ${acc.email} (${acc.planName})`);
  }

  // ── SERVICES ────────────────────────────────────────────────────────────────
  console.log("🛎️  Seeding services...");

  await prisma.serviceBooking.deleteMany();
  await prisma.serviceOption.deleteMany();
  await prisma.service.deleteMany();

  const servicesData = [
    // ── Service 1: Home Delivery ──────────────────────────────────────────────
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
      includes: [
        "Live tracking",
        "SMS alerts",
        "Proof of delivery",
        "Insurance coverage",
      ],
      availability: "Mon–Sat, 7am–8pm",
      options: [
        {
          id: "delivery-single",
          name: "Single Delivery",
          description: "One-time delivery within city limits",
          pricingType: PricingType.ONE_TIME,
          amount: 1500,
          label: "Per delivery",
        },
        {
          id: "delivery-monthly",
          name: "Monthly Plan",
          description: "Up to 10 deliveries per month with priority service",
          pricingType: PricingType.MONTHLY,
          amount: 12000,
          yearlyAmount: 120000,
          popular: true,
        },
        {
          id: "delivery-unlimited",
          name: "Unlimited Plan",
          description: "Unlimited local deliveries with same-day guarantee",
          pricingType: PricingType.MONTHLY,
          amount: 25000,
          yearlyAmount: 250000,
        },
      ],
    },

    // ── Service 2: Meal Preparation ───────────────────────────────────────────
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
      includes: [
        "Custom menu planning",
        "Ingredients sourced",
        "Kitchen cleanup",
        "Dietary accommodations",
      ],
      availability: "Daily, 7am–7pm",
      options: [
        {
          id: "meal-basic",
          name: "Basic Plan",
          description: "4 cooking sessions per month",
          pricingType: PricingType.MONTHLY,
          amount: 25000,
          yearlyAmount: 250000,
        },
        {
          id: "meal-standard",
          name: "Standard Plan",
          description: "8 cooking sessions per month with meal planning",
          pricingType: PricingType.MONTHLY,
          amount: 45000,
          yearlyAmount: 450000,
          popular: true,
        },
        {
          id: "meal-premium",
          name: "Premium Plan",
          description: "12 cooking sessions per month with specialty cuisine",
          pricingType: PricingType.MONTHLY,
          amount: 65000,
          yearlyAmount: 650000,
        },
      ],
    },

    // ── Service 3: Child Care ─────────────────────────────────────────────────
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
      includes: [
        "Background-checked carer",
        "Activity planning",
        "School run support",
        "Meal prep for kids",
      ],
      availability: "Mon–Sat, 6am–8pm",
      options: [
        {
          id: "childcare-occasional",
          name: "Occasional Care",
          description: "Hourly childcare for occasional needs",
          pricingType: PricingType.PER_SESSION,
          amount: 3000,
          label: "Per hour",
        },
        {
          id: "childcare-parttime",
          name: "Part-Time Care",
          description: "20 hours per week of childcare",
          pricingType: PricingType.MONTHLY,
          amount: 45000,
          yearlyAmount: 450000,
          popular: true,
        },
        {
          id: "childcare-fulltime",
          name: "Full-Time Care",
          description: "40 hours per week with dedicated caregiver",
          pricingType: PricingType.MONTHLY,
          amount: 80000,
          yearlyAmount: 800000,
        },
      ],
    },

    // ── Service 4: Home Cleaning ──────────────────────────────────────────────
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
      badge: null,
      includes: [
        "All rooms covered",
        "Eco-friendly products",
        "Minor repairs",
        "Quality guarantee",
      ],
      availability: "Mon–Sat, 7am–6pm",
      options: [
        {
          id: "cleaning-basic",
          name: "Basic Cleaning",
          description: "2 cleaning visits per month",
          pricingType: PricingType.MONTHLY,
          amount: 20000,
          yearlyAmount: 200000,
        },
        {
          id: "cleaning-standard",
          name: "Standard Cleaning",
          description: "4 cleaning visits per month (weekly)",
          pricingType: PricingType.MONTHLY,
          amount: 35000,
          yearlyAmount: 350000,
          popular: true,
        },
        {
          id: "cleaning-deep",
          name: "Deep Cleaning",
          description: "One-time deep cleaning service",
          pricingType: PricingType.ONE_TIME,
          amount: 25000,
          label: "Per session",
        },
      ],
    },

    // ── Service 5: Ride & Transport ───────────────────────────────────────────
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
      includes: [
        "Professional driver",
        "Clean vehicle",
        "Door-to-door",
        "GPS tracking",
      ],
      availability: "Daily, 5am–11pm",
      options: [
        {
          id: "ride-single",
          name: "Single Ride",
          description: "One-time ride within city limits",
          pricingType: PricingType.ONE_TIME,
          amount: 3500,
          label: "Per ride",
          popular: true,
        },
        {
          id: "ride-airport",
          name: "Airport Transfer",
          description: "Airport pickup or drop-off service",
          pricingType: PricingType.ONE_TIME,
          amount: 8000,
          label: "Per trip",
        },
        {
          id: "ride-monthly",
          name: "Monthly Commute",
          description: "Daily commute package (up to 40 rides/month)",
          pricingType: PricingType.MONTHLY,
          amount: 120000,
          yearlyAmount: 1200000,
        },
      ],
    },
  ];

  for (const serviceData of servicesData) {
    const { options, ...serviceFields } = serviceData;

    const service = await prisma.service.create({
      data: {
        ...serviceFields,
        active: true,
      },
    });

    for (const option of options) {
      await prisma.serviceOption.create({
        data: {
          ...option,
          serviceId: service.id,
          active: true,
        },
      });
    }

    console.log(
      `✅ Service seeded: ${service.name} (${options.length} options)`,
    );
  }

  const totalServices = await prisma.service.count();
  const totalOptions = await prisma.serviceOption.count();
  console.log(
    `🛎️  ${totalServices} services with ${totalOptions} options seeded\n`,
  );

  // ── Counselor users ─────────────────────────────────────────────────────────
  const counselorUsers = [
    {
      name: "Daniel Evans",
      email: "daniel@gracyworld.com",
      specialty: "Relationship Counseling",
    },
    {
      name: "Grace Nfor",
      email: "grace@gracyworld.com",
      specialty: "Emotional Wellness",
    },
    {
      name: "Dr. Michael",
      email: "michael@gracyworld.com",
      specialty: "Life Coaching",
    },
    {
      name: "Sarah Johnson",
      email: "sarah@gracyworld.com",
      specialty: "Family Counseling",
    },
  ];

  for (const cu of counselorUsers) {
    const cpw = await hash("Counselor@2025", 12);
    const user = await prisma.user.upsert({
      where: { email: cu.email },
      update: {},
      create: {
        name: cu.name,
        email: cu.email,
        password: cpw,
        role: UserRole.COUNSELOR,
        country: "CM",
      },
    });
    await prisma.counselor.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        bio: `Professional counselor specializing in ${cu.specialty.toLowerCase()}.`,
        specialty: cu.specialty,
        rating: 4.7 + Math.random() * 0.3,
        reviews: Math.floor(80 + Math.random() * 150),
        pricePerHour: 5000 + Math.floor(Math.random() * 10000),
        available: true,
        verified: true,
      },
    });
  }
  console.log("✅ Counselors seeded");

  // ── Jobs ────────────────────────────────────────────────────────────────────
  const jobs = [
    {
      title: "Remote Customer Support",
      company: "Amazon",
      category: JobCategory.CUSTOMER_SERVICE,
      salaryMin: 16000,
      salaryMax: 250000,
    },
    {
      title: "Freelance Developer",
      company: "Upwork",
      category: JobCategory.TECH,
      salaryMin: 400000,
      salaryMax: 600000,
    },
    {
      title: "Logo Designer",
      company: "Fiverr",
      category: JobCategory.DESIGN,
      salaryMin: 100000,
      salaryMax: 300000,
    },
  ];
  for (const j of jobs) {
    await prisma.job.create({
      data: {
        ...j,
        type: JobType.REMOTE,
        description: `Join ${j.company} as a ${j.title} — remote position open worldwide.`,
        skills: ["Communication", "English", "Computer"],
        active: true,
        featured: true,
      },
    });
  }
  console.log("✅ Jobs seeded");

  // ── Products ────────────────────────────────────────────────────────────────
  const products = [
    {
      name: "Gracy 72 Aura",
      price: 10000,
      category: "Natural Cosmetics",
      group: "Beauty & Personal Care",
      stock: 50,
      featured: true,
      rating: 4.5,
      reviews: 89,
      badge: "Best Seller",
      description:
        "A premium wellness blend formulated to restore inner balance and radiance. Rich in natural African botanicals.",
      images: [
        "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&q=80",
      ],
      benefits: ["Boosts energy", "Improves mood", "Natural ingredients"],
      ingredients: ["Moringa extract", "Baobab powder", "Vitamin C"],
    },
    {
      name: "Gracy Shine",
      price: 30000,
      category: "Skincare",
      group: "Beauty & Personal Care",
      stock: 30,
      featured: true,
      rating: 4.8,
      reviews: 142,
      badge: "Top Rated",
      description:
        "An artisan beauty serum that enhances your natural glow. Crafted with rare African oils.",
      images: [
        "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80",
      ],
      benefits: ["Deep hydration", "Brightening", "Anti-aging"],
      ingredients: ["Argan oil", "Shea butter", "Vitamin E"],
    },
    {
      name: "Gracy Glow",
      price: 50000,
      category: "Skincare",
      group: "Beauty & Personal Care",
      stock: 20,
      featured: true,
      rating: 4.7,
      reviews: 76,
      badge: "Premium",
      description:
        "A transformative skincare system targeting uneven tone, dullness, and fine lines.",
      images: [
        "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&q=80",
      ],
      benefits: ["Even skin tone", "Reduces fine lines", "24hr moisture"],
      ingredients: ["Hyaluronic acid", "Neem oil", "Collagen peptides"],
    },
    {
      name: "Gracy Curl Butter",
      price: 15000,
      category: "Hair Care",
      group: "Beauty & Personal Care",
      stock: 45,
      featured: false,
      rating: 4.6,
      reviews: 55,
      description:
        "A rich, whipped hair butter that defines curls and eliminates frizz.",
      images: [
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80",
      ],
      benefits: ["Defines curls", "Frizz control", "Deep moisture"],
      ingredients: ["Shea butter", "Coconut oil", "Castor oil"],
    },
    {
      name: "Gracy Vitality Plus",
      price: 22000,
      category: "Vitamins & Supplements",
      group: "Health & Wellness",
      stock: 60,
      featured: true,
      rating: 4.4,
      reviews: 38,
      description:
        "A powerful daily supplement packed with African superfoods.",
      images: [
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80",
      ],
      benefits: ["Immune support", "Mental clarity", "Sustained energy"],
      ingredients: ["Spirulina", "Moringa", "Turmeric"],
    },
    {
      name: "Gracy Repair Mask",
      price: 18000,
      category: "Skincare",
      group: "Beauty & Personal Care",
      stock: 35,
      featured: false,
      rating: 4.5,
      reviews: 62,
      description:
        "An intensive overnight face mask that repairs the skin barrier and fades dark spots.",
      images: [
        "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80",
      ],
      benefits: ["Repairs barrier", "Fades dark spots", "Morning glow"],
      ingredients: ["African black soap", "Kojic acid", "Vitamin A"],
    },
    {
      name: "Africa Business Blueprint",
      price: 5000,
      category: "E-books & Guides",
      group: "Digital Products",
      stock: 999,
      featured: true,
      rating: 4.7,
      reviews: 203,
      badge: "Digital",
      description:
        "A comprehensive e-book covering how to start, grow, and scale a business in Africa.",
      images: [
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
      ],
      benefits: ["Instant download", "20+ case studies", "Action plans"],
      ingredients: [],
    },
    {
      name: "Financial Freedom Masterclass",
      price: 35000,
      category: "Online Courses",
      group: "Digital Products",
      stock: 999,
      featured: true,
      rating: 4.9,
      reviews: 87,
      badge: "Bestseller",
      description:
        "A 6-module online course teaching budgeting, saving, and investing for the African context.",
      images: [
        "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&q=80",
      ],
      benefits: ["6 modules", "Certificate included", "Lifetime access"],
      ingredients: [],
    },
    {
      name: "Organic Moringa Powder",
      price: 8000,
      category: "Herbal & Natural",
      group: "Health & Wellness",
      stock: 80,
      featured: false,
      rating: 4.6,
      reviews: 44,
      description:
        "100% pure, sun-dried moringa leaf powder from Cameroonian farmers.",
      images: [
        "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80",
      ],
      benefits: ["Rich in iron", "Boosts immunity", "Farm-to-home"],
      ingredients: ["100% Moringa oleifera"],
    },
    {
      name: "African Shea Candle Set",
      price: 12000,
      category: "Home Decor",
      group: "Home & Living",
      stock: 40,
      featured: false,
      rating: 4.5,
      reviews: 29,
      description:
        "Hand-poured scented candles made with raw shea butter and essential oils.",
      images: [
        "https://images.unsplash.com/photo-1602928321679-560bb453f190?w=600&q=80",
      ],
      benefits: ["Natural shea wax", "Long burn time", "Eco-friendly"],
      ingredients: [],
    },
    {
      name: "Pure Red Palm Oil 1L",
      price: 4500,
      category: "Cooking Oils & Spices",
      group: "Food & Agriculture",
      stock: 120,
      featured: true,
      rating: 4.8,
      reviews: 310,
      badge: "Farm Direct",
      description:
        "Cold-pressed, unrefined red palm oil from family farms in the Southwest Region.",
      images: [
        "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80",
      ],
      benefits: ["Cold-pressed", "Rich in beta-carotene", "No additives"],
      ingredients: ["100% red palm oil"],
    },
    {
      name: "Premium Cassava Flour 2kg",
      price: 3000,
      category: "Grains & Staples",
      group: "Food & Agriculture",
      stock: 200,
      featured: false,
      rating: 4.6,
      reviews: 88,
      description:
        "Finely milled, sun-dried cassava flour from local Cameroonian farmers.",
      images: [
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
      ],
      benefits: ["Gluten-free", "High fibre", "Locally sourced"],
      ingredients: ["100% cassava"],
    },
    {
      name: "African Pepper Seed Kit",
      price: 2500,
      category: "Farm Tools & Seeds",
      group: "Food & Agriculture",
      stock: 75,
      featured: false,
      rating: 4.5,
      reviews: 34,
      description:
        "A curated set of 5 heirloom pepper varieties for home gardens.",
      images: [
        "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&q=80",
      ],
      benefits: ["5 varieties", "Heirloom seeds", "Planting guide included"],
      ingredients: [],
    },
    {
      name: "Bamboo Kitchen Utensil Set",
      price: 9500,
      category: "Kitchen & Utensils",
      group: "Home & Living",
      stock: 55,
      featured: true,
      rating: 4.7,
      reviews: 61,
      description:
        "A 6-piece eco-friendly bamboo kitchen set. Naturally antimicrobial and heat resistant.",
      images: [
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
      ],
      benefits: ["Eco-friendly", "Antimicrobial", "Heat resistant"],
      ingredients: [],
    },
    {
      name: "Ankara Print Throw Pillows (2-pack)",
      price: 14000,
      category: "Home Decor",
      group: "Home & Living",
      stock: 30,
      featured: false,
      rating: 4.4,
      reviews: 22,
      description:
        "Vibrant Ankara-fabric throw pillows hand-sewn by artisans in Douala.",
      images: [
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
      ],
      benefits: ["Handmade", "Unique patterns", "Washable covers"],
      ingredients: [],
    },
    {
      name: "Kente Woven Tote Bag",
      price: 20000,
      category: "Bags & Accessories",
      group: "Fashion & Lifestyle",
      stock: 18,
      featured: true,
      rating: 4.9,
      reviews: 47,
      badge: "Handmade",
      description:
        "A bold, hand-woven tote bag using authentic Ghanaian kente strips.",
      images: [
        "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80",
      ],
      benefits: ["Hand-woven kente", "One-of-a-kind", "Ethically made"],
      ingredients: [],
    },
    {
      name: "Dashiki Wrap Dress",
      price: 25000,
      category: "African Traditional Wear",
      group: "Fashion & Lifestyle",
      stock: 40,
      featured: false,
      rating: 4.6,
      reviews: 53,
      description:
        "A flowing, midi-length wrap dress in premium Ankara fabric.",
      images: [
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80",
      ],
      benefits: ["Adjustable fit", "3 prints available", "S-XL sizing"],
      ingredients: [],
    },
    {
      name: "Public Speaking Mastery",
      price: 28000,
      category: "Training & Certification",
      group: "Education & Skills",
      stock: 999,
      featured: true,
      rating: 4.8,
      reviews: 119,
      badge: "New",
      description:
        "A 4-week intensive online program that builds confidence and charisma.",
      images: [
        "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&q=80",
      ],
      benefits: ["4-week program", "Live practice", "Certificate"],
      ingredients: [],
    },
    {
      name: "African Leadership Bootcamp",
      price: 45000,
      category: "Leadership Programs",
      group: "Education & Skills",
      stock: 999,
      featured: false,
      rating: 4.9,
      reviews: 64,
      description:
        "A transformative leadership program for young African professionals.",
      images: [
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&q=80",
      ],
      benefits: ["8 modules", "Mentorship included", "Cohort model"],
      ingredients: [],
    },
    {
      name: "Portable Solar Phone Charger",
      price: 32000,
      category: "Solar & Energy",
      group: "Technology",
      stock: 25,
      featured: true,
      rating: 4.7,
      reviews: 38,
      badge: "Eco",
      description:
        "A foldable 20W solar panel charger compatible with all USB devices.",
      images: [
        "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80",
      ],
      benefits: ["20W output", "Waterproof", "Foldable design"],
      ingredients: [],
    },
    {
      name: "Wireless Earbuds Pro",
      price: 18000,
      category: "Accessories",
      group: "Technology",
      stock: 50,
      featured: false,
      rating: 4.5,
      reviews: 92,
      description:
        "True wireless earbuds with active noise cancellation and 24-hour battery life.",
      images: [
        "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80",
      ],
      benefits: ["ANC", "24hr battery", "IPX5 waterproof"],
      ingredients: [],
    },
    {
      name: "Brand Identity Starter Pack",
      price: 55000,
      category: "Graphic Design",
      group: "Services",
      stock: 999,
      featured: true,
      rating: 4.9,
      reviews: 76,
      badge: "Pro Service",
      description:
        "A professional brand identity package including logo, colour palette, and typography guide.",
      images: [
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80",
      ],
      benefits: ["Logo + brand guide", "3 revisions", "Source files included"],
      ingredients: [],
    },
    {
      name: "Professional CV & Cover Letter",
      price: 15000,
      category: "Writing & Content",
      group: "Services",
      stock: 999,
      featured: false,
      rating: 4.8,
      reviews: 144,
      description:
        "A certified career coach rewrites your CV and cover letter tailored to your target role.",
      images: [
        "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&q=80",
      ],
      benefits: ["ATS-optimised", "HR reviewed", "48hr turnaround"],
      ingredients: [],
    },
  ];

  for (const p of products) {
    await prisma.product.create({ data: { ...p, active: true } });
  }
  console.log(`✅ ${products.length} products seeded`);

  // ── E-Learning Courses ──────────────────────────────────────────────────────
  console.log("🎓 Seeding e-learning courses...");

  const coursesData = [
    // ── Course 1: Financial Freedom (FREE) ────────────────────────────────────
    {
      title: "Financial Freedom for Africans",
      description:
        "Learn how to budget, save, invest, and build wealth from the African context. Practical strategies used by real people across the continent.",
      thumbnail:
        "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80",
      category: "Finance",
      level: CourseLevel.BEGINNER,
      price: 0,
      isFree: true,
      published: true,
      featured: true,
      sections: [
        {
          title: "Getting Started with Money",
          order: 1,
          lessons: [
            {
              title: "Why Most Africans Struggle Financially",
              type: LessonType.VIDEO,
              videoUrl: "https://www.youtube.com/watch?v=example1",
              duration: 12,
              order: 1,
              isFree: true,
            },
            {
              title: "The 3 Pillars of Financial Freedom",
              type: LessonType.TEXT,
              content:
                "Financial freedom rests on three pillars: Income, Savings, and Investment. In this lesson we break down each pillar with actionable steps tailored to the African economic reality...",
              duration: 8,
              order: 2,
              isFree: true,
            },
            {
              title: "Module 1 Quiz",
              type: LessonType.QUIZ,
              order: 3,
              isFree: true,
              quiz: {
                passingScore: 70,
                questions: [
                  {
                    question: "What are the 3 pillars of financial freedom?",
                    options: [
                      "Income, Savings, Investment",
                      "Salary, Loans, Credit",
                      "Budget, Debt, Insurance",
                      "Stocks, Bonds, Cash",
                    ],
                    answer: 0,
                    order: 1,
                  },
                  {
                    question:
                      "Which of the following is NOT a good savings habit?",
                    options: [
                      "Paying yourself first",
                      "Spending before saving",
                      "Setting savings goals",
                      "Automating transfers",
                    ],
                    answer: 1,
                    order: 2,
                  },
                ],
              },
            },
          ],
        },
        {
          title: "Budgeting & Saving",
          order: 2,
          lessons: [
            {
              title: "Creating Your First Monthly Budget",
              type: LessonType.VIDEO,
              videoUrl: "https://www.youtube.com/watch?v=example2",
              duration: 15,
              order: 1,
              isFree: false,
            },
            {
              title: "Saving on a Low Income",
              type: LessonType.TEXT,
              content:
                "Even with limited income, there are proven strategies to build savings. This lesson covers micro-saving, group savings (njangi/tontines), and digital wallet strategies...",
              duration: 10,
              order: 2,
              isFree: false,
            },
          ],
        },
        {
          title: "Investing Basics",
          order: 3,
          lessons: [
            {
              title: "Introduction to Investing in Africa",
              type: LessonType.VIDEO,
              videoUrl: "https://www.youtube.com/watch?v=example3",
              duration: 18,
              order: 1,
              isFree: false,
            },
            {
              title: "Live Q&A — Investing for Beginners",
              type: LessonType.LIVE,
              order: 2,
              isFree: false,
            },
          ],
        },
      ],
      liveSession: {
        title: "Live Q&A: Financial Freedom Masterclass",
        description:
          "Join our admin coach for a live session answering your top questions about investing and saving in Africa.",
        scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        duration: 60,
        meetingUrl: "https://meet.google.com/example-financial",
        status: LiveSessionStatus.SCHEDULED,
      },
    },

    // ── Course 2: Public Speaking (PAID) ──────────────────────────────────────
    {
      title: "Public Speaking Mastery",
      description:
        "Build unshakeable confidence on stage and in meetings. From fear to power in 4 weeks with practical exercises and live coaching.",
      thumbnail:
        "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80",
      category: "Personal Development",
      level: CourseLevel.INTERMEDIATE,
      price: 28000,
      isFree: false,
      published: true,
      featured: true,
      sections: [
        {
          title: "Foundations of Confident Speaking",
          order: 1,
          lessons: [
            {
              title: "Understanding Fear & How to Overcome It",
              type: LessonType.VIDEO,
              videoUrl: "https://www.youtube.com/watch?v=example4",
              duration: 14,
              order: 1,
              isFree: true, // preview
            },
            {
              title: "Body Language Basics",
              type: LessonType.TEXT,
              content:
                "Your body speaks before your mouth does. In this lesson, we cover posture, eye contact, hand gestures, and movement that commands respect and attention...",
              duration: 10,
              order: 2,
              isFree: false,
            },
            {
              title: "Week 1 Assessment",
              type: LessonType.QUIZ,
              order: 3,
              isFree: false,
              quiz: {
                passingScore: 75,
                questions: [
                  {
                    question:
                      "What is the most common cause of public speaking fear?",
                    options: [
                      "Lack of preparation",
                      "Fear of judgment",
                      "Loud voice",
                      "Too much confidence",
                    ],
                    answer: 1,
                    order: 1,
                  },
                  {
                    question:
                      "Which body language signal conveys the most authority?",
                    options: [
                      "Crossed arms",
                      "Looking at the floor",
                      "Open posture with eye contact",
                      "Fidgeting hands",
                    ],
                    answer: 2,
                    order: 2,
                  },
                  {
                    question:
                      "How long should you pause for effect after a key point?",
                    options: [
                      "0 seconds",
                      "1-3 seconds",
                      "10 seconds",
                      "30 seconds",
                    ],
                    answer: 1,
                    order: 3,
                  },
                ],
              },
            },
          ],
        },
        {
          title: "Structuring a Powerful Speech",
          order: 2,
          lessons: [
            {
              title: "The Hook, Body, Close Framework",
              type: LessonType.VIDEO,
              videoUrl: "https://www.youtube.com/watch?v=example5",
              duration: 16,
              order: 1,
              isFree: false,
            },
            {
              title: "Storytelling as a Speaking Tool",
              type: LessonType.TEXT,
              content:
                "Stories are the most powerful way to connect with an audience. This lesson teaches you how to structure personal stories that educate, inspire, and persuade...",
              duration: 12,
              order: 2,
              isFree: false,
            },
          ],
        },
      ],
      liveSession: {
        title: "Live Coaching: Public Speaking Practice Session",
        description:
          "Practice your 2-minute speech live with peers and receive real-time feedback from the coach.",
        scheduledAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        duration: 90,
        meetingUrl: "https://meet.google.com/example-speaking",
        status: LiveSessionStatus.SCHEDULED,
      },
    },

    // ── Course 3: African Leadership (PAID) ───────────────────────────────────
    {
      title: "African Leadership Bootcamp",
      description:
        "A transformative 8-module leadership program built for young African professionals ready to lead teams, communities, and organizations.",
      thumbnail:
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80",
      category: "Leadership",
      level: CourseLevel.ADVANCED,
      price: 45000,
      isFree: false,
      published: true,
      featured: false,
      sections: [
        {
          title: "What is African Leadership?",
          order: 1,
          lessons: [
            {
              title: "Ubuntu Philosophy & Modern Leadership",
              type: LessonType.VIDEO,
              videoUrl: "https://www.youtube.com/watch?v=example6",
              duration: 20,
              order: 1,
              isFree: true, // preview
            },
            {
              title: "African Leadership Models vs Western Models",
              type: LessonType.TEXT,
              content:
                "Leadership in Africa has deep roots in community, consensus, and ubuntu. This lesson compares traditional African leadership philosophy with Western corporate models, and shows how to blend both for maximum impact...",
              duration: 15,
              order: 2,
              isFree: false,
            },
          ],
        },
        {
          title: "Building & Leading Teams",
          order: 2,
          lessons: [
            {
              title: "How to Build High-Performance Teams",
              type: LessonType.VIDEO,
              videoUrl: "https://www.youtube.com/watch?v=example7",
              duration: 22,
              order: 1,
              isFree: false,
            },
            {
              title: "Conflict Resolution in African Contexts",
              type: LessonType.TEXT,
              content:
                "Conflict is inevitable in any team. This lesson provides culturally-aware strategies for resolving disputes, navigating hierarchy, and maintaining team cohesion across diverse African cultures...",
              duration: 18,
              order: 2,
              isFree: false,
            },
            {
              title: "Leadership Assessment",
              type: LessonType.QUIZ,
              order: 3,
              isFree: false,
              quiz: {
                passingScore: 80,
                questions: [
                  {
                    question: "What does 'Ubuntu' mean in leadership context?",
                    options: [
                      "I win, you lose",
                      "I am because we are",
                      "Lead from the top",
                      "Individual success above all",
                    ],
                    answer: 1,
                    order: 1,
                  },
                  {
                    question:
                      "Which leadership style focuses on collective decision-making?",
                    options: [
                      "Autocratic",
                      "Laissez-faire",
                      "Consensus-based",
                      "Transactional",
                    ],
                    answer: 2,
                    order: 2,
                  },
                ],
              },
            },
          ],
        },
      ],
      liveSession: {
        title: "Leadership Bootcamp — Live Cohort Session",
        description:
          "Join the full cohort for a live group discussion, case study breakdown, and networking session.",
        scheduledAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
        duration: 120,
        meetingUrl: "https://meet.google.com/example-leadership",
        status: LiveSessionStatus.SCHEDULED,
      },
    },

    // ── Course 4: Digital Skills (FREE) ───────────────────────────────────────
    {
      title: "Digital Skills for Africa",
      description:
        "Master the essential digital tools every African professional needs — from Google Workspace to social media marketing and basic coding.",
      thumbnail:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
      category: "Technology",
      level: CourseLevel.BEGINNER,
      price: 0,
      isFree: true,
      published: true,
      featured: true,
      sections: [
        {
          title: "Getting Online Professionally",
          order: 1,
          lessons: [
            {
              title: "Setting Up Your Professional Online Presence",
              type: LessonType.VIDEO,
              videoUrl: "https://www.youtube.com/watch?v=example8",
              duration: 11,
              order: 1,
              isFree: true,
            },
            {
              title: "Google Workspace Essentials",
              type: LessonType.TEXT,
              content:
                "Google Docs, Sheets, Drive, and Meet are the backbone of remote work. This lesson walks you through setting up and using each tool effectively for professional collaboration...",
              duration: 14,
              order: 2,
              isFree: true,
            },
            {
              title: "Digital Basics Quiz",
              type: LessonType.QUIZ,
              order: 3,
              isFree: true,
              quiz: {
                passingScore: 60,
                questions: [
                  {
                    question:
                      "Which tool is best for collaborative document editing?",
                    options: [
                      "WhatsApp",
                      "Google Docs",
                      "Notepad",
                      "Excel (offline)",
                    ],
                    answer: 1,
                    order: 1,
                  },
                  {
                    question: "What does SEO stand for?",
                    options: [
                      "Social Engagement Online",
                      "Search Engine Optimization",
                      "Secure Email Output",
                      "Software Engineering Operations",
                    ],
                    answer: 1,
                    order: 2,
                  },
                ],
              },
            },
          ],
        },
        {
          title: "Social Media for Business",
          order: 2,
          lessons: [
            {
              title: "Building a Brand on Instagram & TikTok",
              type: LessonType.VIDEO,
              videoUrl: "https://www.youtube.com/watch?v=example9",
              duration: 17,
              order: 1,
              isFree: false,
            },
            {
              title: "Content Strategy for African Audiences",
              type: LessonType.TEXT,
              content:
                "Creating content that resonates with African audiences requires cultural awareness, language sensitivity, and platform-specific strategy. This lesson breaks it all down...",
              duration: 13,
              order: 2,
              isFree: false,
            },
          ],
        },
      ],
      liveSession: null,
    },
  ];

  for (const courseData of coursesData) {
    const { sections, liveSession, ...courseFields } = courseData;

    const course = await prisma.course.create({
      data: courseFields,
    });

    for (const sectionData of sections) {
      const { lessons, ...sectionFields } = sectionData;

      const section = await prisma.courseSection.create({
        data: {
          courseId: course.id,
          ...sectionFields,
        },
      });

      for (const lessonData of lessons) {
        const { quiz, ...lessonFields } = lessonData as any;

        const lesson = await prisma.lesson.create({
          data: {
            sectionId: section.id,
            ...lessonFields,
          },
        });

        if (quiz) {
          const { questions, ...quizFields } = quiz;
          const createdQuiz = await prisma.quiz.create({
            data: {
              lessonId: lesson.id,
              ...quizFields,
            },
          });

          for (const q of questions) {
            await prisma.quizQuestion.create({
              data: {
                quizId: createdQuiz.id,
                ...q,
              },
            });
          }
        }
      }
    }

    if (liveSession) {
      await prisma.liveSession.create({
        data: {
          courseId: course.id,
          ...liveSession,
        },
      });
    }

    console.log(`✅ Course seeded: ${course.title}`);
  }

  console.log("\n🎉 Seeding complete!");
  console.log("\n📋 Test accounts (password: Test@2025):");
  console.log("   free@gracyworld.com     → Free plan");
  console.log("   starter@gracyworld.com  → Starter plan");
  console.log("   growth@gracyworld.com   → Growth plan");
  console.log("   elite@gracyworld.com    → Elite/Pro plan");
  console.log("\n👑 Admin (password: Admin@2025):");
  console.log("   admin@gracyworld.com");
  console.log("\n🎓 E-Learning:");
  console.log("   4 courses seeded (2 free, 2 paid)");
  console.log("   3 live sessions scheduled");
  console.log("   4 quizzes with questions");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
