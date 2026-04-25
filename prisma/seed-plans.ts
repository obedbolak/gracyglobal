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
  console.log("🌱 Seeding job categories...\n");

  const categories = [
    {
      name: "Tech",
      slug: "tech",
      icon: "💻",
      color: "#2196F3",
      description: "Software, engineering, data, and IT roles",
      sortOrder: 1,
    },
    {
      name: "Marketing",
      slug: "marketing",
      icon: "📣",
      color: "#E91E63",
      description: "Digital marketing, SEO, social media, and growth",
      sortOrder: 2,
    },
    {
      name: "Design",
      slug: "design",
      icon: "🎨",
      color: "#FF5722",
      description: "UI/UX, graphic design, and creative roles",
      sortOrder: 3,
    },
    {
      name: "Customer Service",
      slug: "customer-service",
      icon: "🎧",
      color: "#00BCD4",
      description: "Support, success, and customer experience roles",
      sortOrder: 4,
    },
    {
      name: "Writing",
      slug: "writing",
      icon: "✍️",
      color: "#9C27B0",
      description: "Content writing, copywriting, and editorial roles",
      sortOrder: 5,
    },
    {
      name: "Finance",
      slug: "finance",
      icon: "💰",
      color: "#4CAF50",
      description: "Accounting, finance, and investment roles",
      sortOrder: 6,
    },
    {
      name: "Education",
      slug: "education",
      icon: "📚",
      color: "#FF9800",
      description: "Teaching, tutoring, and e-learning roles",
      sortOrder: 7,
    },
    {
      name: "Health",
      slug: "health",
      icon: "❤️",
      color: "#F44336",
      description: "Healthcare, wellness, and medical roles",
      sortOrder: 8,
    },
    {
      name: "Other",
      slug: "other",
      icon: "🌐",
      color: "#607D8B",
      description: "Roles that don't fit other categories",
      sortOrder: 9,
    },
  ];

  for (const category of categories) {
    await prisma.jobCategoryModel.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        icon: category.icon,
        color: category.color,
        description: category.description,
        sortOrder: category.sortOrder,
        active: true,
      },
      create: {
        name: category.name,
        slug: category.slug,
        icon: category.icon,
        color: category.color,
        description: category.description,
        sortOrder: category.sortOrder,
        active: true,
      },
    });
    console.log(`  ✅ ${category.icon} ${category.name}`);
  }

  console.log("\n🎉 Done! All job categories seeded.");
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
