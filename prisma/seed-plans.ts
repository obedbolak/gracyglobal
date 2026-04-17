// prisma/seed-plans.ts

import { PrismaClient, PlanCategory, PlanInterval } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

// ─── 15 PRICING PLANS ────────────────────────────────────────────────────────

const PRICING_PLANS = [
  // ═══ 1️⃣ COUNSELLOR PLANS ═══
  {
    planCode: "C1",
    category: PlanCategory.COUNSELLOR,
    name: "Monthly",
    price: 3000,
    interval: PlanInterval.MONTHLY,
    commissionRate: 10,
    productLimit: null,
    leadLimit: null,
    courseLimit: null,
    features: ["basic_profile", "bookings", "10% commission per session"],
    active: true,
    sortOrder: 1,
  },
  {
    planCode: "C2",
    category: PlanCategory.COUNSELLOR,
    name: "Yearly",
    price: 30000,
    interval: PlanInterval.YEARLY,
    commissionRate: 7,
    productLimit: null,
    leadLimit: null,
    courseLimit: null,
    features: [
      "better_visibility",
      "bookings",
      "7% commission per session",
      "priority_support",
    ],
    active: true,
    sortOrder: 2,
  },
  {
    planCode: "C3",
    category: PlanCategory.COUNSELLOR,
    name: "Free",
    price: 0,
    interval: PlanInterval.ONGOING,
    commissionRate: 15,
    productLimit: null,
    leadLimit: null,
    courseLimit: null,
    features: ["basic_access", "15% commission per session"],
    active: true,
    sortOrder: 3,
  },

  // ═══ 2️⃣ MARKETPLACE PLANS ═══
  {
    planCode: "M1",
    category: PlanCategory.MARKETPLACE,
    name: "Monthly Store",
    price: 3000,
    interval: PlanInterval.MONTHLY,
    commissionRate: 10,
    productLimit: 20,
    leadLimit: null,
    courseLimit: null,
    features: [
      "up_to_20_products",
      "10% commission per sale",
      "basic_analytics",
    ],
    active: true,
    sortOrder: 1,
  },
  {
    planCode: "M2",
    category: PlanCategory.MARKETPLACE,
    name: "Yearly Store",
    price: 30000,
    interval: PlanInterval.YEARLY,
    commissionRate: 7,
    productLimit: null,
    leadLimit: null,
    courseLimit: null,
    features: [
      "unlimited_products",
      "7% commission per sale",
      "advanced_analytics",
      "priority_support",
    ],
    active: true,
    sortOrder: 2,
  },
  {
    planCode: "M3",
    category: PlanCategory.MARKETPLACE,
    name: "Free Store",
    price: 0,
    interval: PlanInterval.ONGOING,
    commissionRate: 15,
    productLimit: null,
    leadLimit: null,
    courseLimit: null,
    features: [
      "unlimited_products",
      "15% commission per sale",
      "mass_adoption",
    ],
    active: true,
    sortOrder: 3,
  },

  // ═══ 3️⃣ SERVICE PLANS ═══
  {
    planCode: "S1",
    category: PlanCategory.SERVICE,
    name: "Monthly",
    price: 2000,
    interval: PlanInterval.MONTHLY,
    commissionRate: null,
    productLimit: null,
    leadLimit: 10,
    courseLimit: null,
    features: ["10_leads_per_month", "basic_profile"],
    active: true,
    sortOrder: 1,
  },
  {
    planCode: "S2",
    category: PlanCategory.SERVICE,
    name: "Yearly",
    price: 20000,
    interval: PlanInterval.YEARLY,
    commissionRate: null,
    productLimit: null,
    leadLimit: 50,
    courseLimit: null,
    features: [
      "50_leads_per_month",
      "better_ranking",
      "priority_support",
      "featured_listing",
    ],
    active: true,
    sortOrder: 2,
  },
  {
    planCode: "S3",
    category: PlanCategory.SERVICE,
    name: "Pay-Per-Lead",
    price: 200,
    interval: PlanInterval.PER_LEAD,
    commissionRate: null,
    productLimit: null,
    leadLimit: null,
    courseLimit: null,
    features: ["no_subscription", "no_risk", "pay_only_for_results"],
    active: true,
    sortOrder: 3,
  },

  // ═══ 4️⃣ TEACHER PLANS ═══
  {
    planCode: "T1",
    category: PlanCategory.TEACHER,
    name: "Monthly",
    price: 3000,
    interval: PlanInterval.MONTHLY,
    commissionRate: 20,
    productLimit: null,
    leadLimit: null,
    courseLimit: 2,
    features: [
      "upload_2_courses",
      "20% commission per sale",
      "basic_analytics",
    ],
    active: true,
    sortOrder: 1,
  },
  {
    planCode: "T2",
    category: PlanCategory.TEACHER,
    name: "Yearly",
    price: 30000,
    interval: PlanInterval.YEARLY,
    commissionRate: 15,
    productLimit: null,
    leadLimit: null,
    courseLimit: null,
    features: [
      "unlimited_courses",
      "15% commission per sale",
      "advanced_analytics",
      "priority_support",
    ],
    active: true,
    sortOrder: 2,
  },
  {
    planCode: "T3",
    category: PlanCategory.TEACHER,
    name: "Free",
    price: 0,
    interval: PlanInterval.ONGOING,
    commissionRate: 30,
    productLimit: null,
    leadLimit: null,
    courseLimit: null,
    features: ["unlimited_courses", "30% commission per sale", "mass_adoption"],
    active: true,
    sortOrder: 3,
  },

  // ═══ 5️⃣ STUDENT PLANS ═══
  {
    planCode: "U1",
    category: PlanCategory.STUDENT,
    name: "Free Account",
    price: 0,
    interval: PlanInterval.ONGOING,
    commissionRate: null,
    productLimit: null,
    leadLimit: null,
    courseLimit: null,
    features: ["pay_per_use", "access_free_courses", "basic_features"],
    active: true,
    sortOrder: 1,
  },
  {
    planCode: "U2",
    category: PlanCategory.STUDENT,
    name: "Monthly Premium",
    price: 1500,
    interval: PlanInterval.MONTHLY,
    commissionRate: null,
    productLimit: null,
    leadLimit: null,
    courseLimit: null,
    features: ["discounts", "priority_support", "early_access"],
    active: true,
    sortOrder: 2,
  },
  {
    planCode: "U3",
    category: PlanCategory.STUDENT,
    name: "Yearly Premium",
    price: 15000,
    interval: PlanInterval.YEARLY,
    commissionRate: null,
    productLimit: null,
    leadLimit: null,
    courseLimit: null,
    features: [
      "bigger_discounts",
      "free_courses",
      "priority_support",
      "exclusive_content",
    ],
    active: true,
    sortOrder: 3,
  },
];

// ─── Main seed function ───────────────────────────────────────────────────────

async function seedPricingPlans() {
  console.log("🌱 Starting pricing plans seed...\n");

  try {
    console.log("💰 Upserting pricing plans...");

    for (const planData of PRICING_PLANS) {
      const plan = await prisma.pricingPlan.upsert({
        where: { planCode: planData.planCode },
        update: {
          category: planData.category,
          name: planData.name,
          price: planData.price,
          interval: planData.interval,
          commissionRate: planData.commissionRate,
          productLimit: planData.productLimit,
          leadLimit: planData.leadLimit,
          courseLimit: planData.courseLimit,
          features: planData.features,
          active: planData.active,
          sortOrder: planData.sortOrder,
        },
        create: {
          planCode: planData.planCode,
          category: planData.category,
          name: planData.name,
          price: planData.price,
          interval: planData.interval,
          commissionRate: planData.commissionRate,
          productLimit: planData.productLimit,
          leadLimit: planData.leadLimit,
          courseLimit: planData.courseLimit,
          features: planData.features,
          active: planData.active,
          sortOrder: planData.sortOrder,
        },
      });

      console.log(
        `  ✓ [${plan.planCode}] ${plan.category} - ${plan.name} (${plan.price} FCFA)`,
      );
    }

    // ── Summary ───────────────────────────────────────────────────────────────
    console.log("\n✅ Pricing plans seed complete!");
    console.log(`   Total plans: ${PRICING_PLANS.length}`);
    console.log("\n📊 Breakdown:");
    console.log(`   Counsellor plans : 3`);
    console.log(`   Marketplace plans: 3`);
    console.log(`   Service plans    : 3`);
    console.log(`   Teacher plans    : 3`);
    console.log(`   Student plans    : 3`);
  } catch (error) {
    console.error("\n❌ Seeding error:", error);
    throw error;
  } finally {
    await pool.end();
    await prisma.$disconnect();
  }
}

seedPricingPlans();
