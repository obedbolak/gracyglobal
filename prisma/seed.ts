// prisma/seed.ts
import {
  PrismaClient,
  UserRole,
  CounselorType,
  JobCategory,
  JobType,
  MemberBadge,
  SubscriptionBilling,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { hash } from "bcryptjs";
import * as dotenv from "dotenv";

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
      counselorSessions: 0, // unlimited
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

    // Subscription
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

    // Community member profile
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
      reviewCount: 142,
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
      reviewCount: 76,
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
      reviewCount: 55,
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
      reviewCount: 38,
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
      reviewCount: 62,
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
      reviewCount: 203,
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
      reviewCount: 87,
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
      reviewCount: 44,
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
      reviewCount: 29,
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
      reviewCount: 310,
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
      reviewCount: 88,
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
      reviewCount: 34,
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
      reviewCount: 61,
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
      reviewCount: 22,
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
      reviewCount: 47,
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
      reviewCount: 53,
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
      reviewCount: 119,
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
      reviewCount: 64,
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
      reviewCount: 38,
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
      reviewCount: 92,
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
      reviewCount: 76,
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
      reviewCount: 144,
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

  console.log("\n🎉 Seeding complete!");
  console.log("\n📋 Test accounts (password: Test@2025):");
  console.log("   free@gracyworld.com     → Free plan");
  console.log("   starter@gracyworld.com  → Starter plan");
  console.log("   growth@gracyworld.com   → Growth plan");
  console.log("   elite@gracyworld.com    → Elite/Pro plan");
  console.log("\n👑 Admin (password: Admin@2025):");
  console.log("   admin@gracyworld.com");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
