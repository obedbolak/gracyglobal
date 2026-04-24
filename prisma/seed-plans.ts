import { Service } from "./../data/services";
// prisma/seed-categories.ts
// Run with: npx ts-node prisma/seed-categories.ts

import { PrismaClient } from "@prisma/client";
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

async function main() {
  console.log("🌱 Seeding product and service categories...\n");

  // ─── 1. PRODUCT CATEGORIES ──────────────────────────────────────────────────
  console.log("📦 Creating Product Categories...");

  const productCategories = [
    {
      name: "Electronics",
      slug: "electronics",
      icon: "📱",
      color: "#007AFF",
      sortOrder: 1,
    },
    {
      name: "Fashion",
      slug: "fashion",
      icon: "👔",
      color: "#FF1493",
      sortOrder: 2,
    },
    {
      name: "Home & Garden",
      slug: "home-garden",
      icon: "🏠",
      color: "#228B22",
      sortOrder: 3,
    },
    {
      name: "Beauty & Personal Care",
      slug: "beauty-personal-care",
      icon: "💄",
      color: "#FFB6C1",
      sortOrder: 4,
    },
    {
      name: "Health & Wellness",
      slug: "health-wellness",
      icon: "💊",
      color: "#FF6B6B",
      sortOrder: 5,
    },
    {
      name: "Sports & Outdoors",
      slug: "sports-outdoors",
      icon: "⚽",
      color: "#4CAF50",
      sortOrder: 6,
    },
    {
      name: "Books & Media",
      slug: "books-media",
      icon: "📚",
      color: "#8B4513",
      sortOrder: 7,
    },
    {
      name: "Toys & Games",
      slug: "toys-games",
      icon: "🎮",
      color: "#FF69B4",
      sortOrder: 8,
    },
    {
      name: "Food & Beverages",
      slug: "food-beverages",
      icon: "🍔",
      color: "#FFA500",
      sortOrder: 9,
    },
    {
      name: "Handmade & Crafts",
      slug: "handmade-crafts",
      icon: "🎨",
      color: "#9C27B0",
      sortOrder: 10,
    },
  ];

  for (const category of productCategories) {
    await prisma.productCategory.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        icon: category.icon,
        color: category.color,
        sortOrder: category.sortOrder,
        active: true,
      },
      create: {
        name: category.name,
        slug: category.slug,
        icon: category.icon,
        color: category.color,
        sortOrder: category.sortOrder,
        active: true,
      },
    });
    console.log(`  ✅ ${category.icon} ${category.name}`);
  }

  // ─── 2. SERVICE CATEGORIES ───────────────────────────────────────────────────
  console.log("\n🔧 Creating Service Categories...");

  const serviceCategories = [
    {
      name: "Cleaning",
      slug: "cleaning",
      icon: "🧹",
      color: "#00BCD4",
      sortOrder: 1,
    },
    {
      name: "Plumbing",
      slug: "plumbing",
      icon: "🔧",
      color: "#FF9800",
      sortOrder: 2,
    },
    {
      name: "Electrical",
      slug: "electrical",
      icon: "⚡",
      color: "#FFEB3B",
      sortOrder: 3,
    },
    {
      name: "Carpentry",
      slug: "carpentry",
      icon: "🪵",
      color: "#8D6E63",
      sortOrder: 4,
    },
    {
      name: "Painting",
      slug: "painting",
      icon: "🎨",
      color: "#E91E63",
      sortOrder: 5,
    },
    {
      name: "Landscaping",
      slug: "landscaping",
      icon: "🌳",
      color: "#4CAF50",
      sortOrder: 6,
    },
    {
      name: "Tutoring",
      slug: "tutoring",
      icon: "📖",
      color: "#3F51B5",
      sortOrder: 7,
    },
    {
      name: "Photography",
      slug: "photography",
      icon: "📷",
      color: "#F44336",
      sortOrder: 8,
    },
    {
      name: "Fitness Training",
      slug: "fitness-training",
      icon: "💪",
      color: "#FF5722",
      sortOrder: 9,
    },
    {
      name: "Event Planning",
      slug: "event-planning",
      icon: "🎉",
      color: "#9C27B0",
      sortOrder: 10,
    },
    {
      name: "Pet Care",
      slug: "pet-care",
      icon: "🐕",
      color: "#D4A574",
      sortOrder: 11,
    },
    {
      name: "Automotive",
      slug: "automotive",
      icon: "🚗",
      color: "#607D8B",
      sortOrder: 12,
    },
    {
      name: "Haircare & Styling",
      slug: "haircare-styling",
      icon: "💇",
      color: "#E1BEE7",
      sortOrder: 13,
    },
    {
      name: "Massage & Spa",
      slug: "massage-spa",
      icon: "💆",
      color: "#F8BBD0",
      sortOrder: 14,
    },
    {
      name: "Consulting",
      slug: "consulting",
      icon: "💼",
      color: "#455A64",
      sortOrder: 15,
    },
  ];

  for (const category of serviceCategories) {
    await prisma.serviceCategory.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        icon: category.icon,
        color: category.color,
        sortOrder: category.sortOrder,
        active: true,
      },
      create: {
        name: category.name,
        slug: category.slug,
        icon: category.icon,
        color: category.color,
        sortOrder: category.sortOrder,
        active: true,
      },
    });
    console.log(`  ✅ ${category.icon} ${category.name}`);
  }

  // ─── 3. COURSE CATEGORIES ───────────────────────────────────────────────────
  console.log("\n🎓 Creating Course Categories...");

  const courseCategories = [
    {
      name: "Programming",
      slug: "programming",
      icon: "💻",
      color: "#2196F3",
      sortOrder: 1,
    },
    {
      name: "Business",
      slug: "business",
      icon: "💼",
      color: "#FFC107",
      sortOrder: 2,
    },
    {
      name: "Design",
      slug: "design",
      icon: "🎨",
      color: "#FF5722",
      sortOrder: 3,
    },
    {
      name: "Marketing",
      slug: "marketing",
      icon: "📢",
      color: "#E91E63",
      sortOrder: 4,
    },
    {
      name: "Personal Development",
      slug: "personal-development",
      icon: "🌟",
      color: "#9C27B0",
      sortOrder: 5,
    },
    {
      name: "Finance",
      slug: "finance",
      icon: "💰",
      color: "#4CAF50",
      sortOrder: 6,
    },
    {
      name: "Health & Fitness",
      slug: "health-fitness",
      icon: "🏃",
      color: "#FF6B6B",
      sortOrder: 7,
    },
    {
      name: "Language Learning",
      slug: "language-learning",
      icon: "🗣️",
      color: "#00BCD4",
      sortOrder: 8,
    },
    {
      name: "Music & Arts",
      slug: "music-arts",
      icon: "🎵",
      color: "#FF1493",
      sortOrder: 9,
    },
    {
      name: "Technology",
      slug: "technology",
      icon: "⚙️",
      color: "#607D8B",
      sortOrder: 10,
    },
  ];

  for (const category of courseCategories) {
    await prisma.courseCategory.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        icon: category.icon,
        color: category.color,
        sortOrder: category.sortOrder,
        active: true,
      },
      create: {
        name: category.name,
        slug: category.slug,
        icon: category.icon,
        color: category.color,
        sortOrder: category.sortOrder,
        active: true,
      },
    });
    console.log(`  ✅ ${category.icon} ${category.name}`);
  }

  console.log("\n🎉 Done! All categories seeded successfully.");
  console.log(`   ✅ ${productCategories.length} Product Categories`);
  console.log(`   ✅ ${serviceCategories.length} Service Categories`);
  console.log(`   ✅ ${courseCategories.length} Course Categories`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
    await prisma.$disconnect();
  });
