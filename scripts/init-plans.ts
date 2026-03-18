// scripts/init-plans.ts
// Run this script to initialize plans in the database

import { prisma } from "../lib/prisma";
import { PLANS } from "../data/plans";

async function initPlans() {
  console.log("🚀 Initializing plans in database...");

  try {
    for (const planData of PLANS) {
      const plan = await prisma.plan.upsert({
        where: { name: planData.id },
        update: {
          displayName: planData.name,
          description: planData.description,
          priceMonthly: planData.priceMonthly,
          priceAnnual: planData.priceAnnual,
          pricePerSession: planData.pricePerSession,
          counselorSessions: planData.id === "free" ? 0 : 
                           planData.id === "starter" ? 2 :
                           planData.id === "growth" ? 5 : 0,
          highlighted: planData.highlighted,
          active: true,
          sortOrder: PLANS.findIndex(p => p.id === planData.id),
        },
        create: {
          name: planData.id,
          displayName: planData.name,
          description: planData.description,
          priceMonthly: planData.priceMonthly,
          priceAnnual: planData.priceAnnual,
          pricePerSession: planData.pricePerSession,
          counselorSessions: planData.id === "free" ? 0 : 
                           planData.id === "starter" ? 2 :
                           planData.id === "growth" ? 5 : 0,
          highlighted: planData.highlighted,
          active: true,
          sortOrder: PLANS.findIndex(p => p.id === planData.id),
        },
      });

      console.log(`✅ Plan "${plan.displayName}" initialized`);
    }

    console.log("🎉 All plans initialized successfully!");
  } catch (error) {
    console.error("❌ Error initializing plans:", error);
  } finally {
    await prisma.$disconnect();
  }
}

initPlans();