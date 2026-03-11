// prisma/seed.ts
import {
  PrismaClient,
  UserRole,
  CounselorType,
  JobCategory,
  JobType,
} from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Site stats ──
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

  // ── Admin user ──
  const adminPassword = await hash("Admin@2025", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@gracyworld.com" },
    update: {},
    create: {
      name: "Gracy Admin",
      email: "admin@gracyworld.com",
      password: adminPassword,
      role: UserRole.ADMIN,
      country: "CM",
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // ── Counselors ──
  const counselorUsers = [
    {
      name: "Daniel Evans",
      email: "daniel@gracyworld.com",
      specialty: [CounselorType.RELATIONSHIP],
    },
    {
      name: "Grace Nfor",
      email: "grace@gracyworld.com",
      specialty: [CounselorType.EMOTIONAL_WELLNESS],
    },
    {
      name: "Dr. Michael",
      email: "michael@gracyworld.com",
      specialty: [CounselorType.LIFE_COACH],
    },
    {
      name: "Sarah Johnson",
      email: "sarah@gracyworld.com",
      specialty: [CounselorType.FAMILY],
    },
  ];

  for (const cu of counselorUsers) {
    const pw = await hash("Counselor@2025", 12);
    const user = await prisma.user.upsert({
      where: { email: cu.email },
      update: {},
      create: {
        name: cu.name,
        email: cu.email,
        password: pw,
        role: UserRole.COUNSELOR,
        country: "CM",
      },
    });
    await prisma.counselor.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        bio: `Professional counselor specializing in ${cu.specialty[0].toLowerCase().replace("_", " ")}.`,
        specialty: cu.specialty,
        rating: 4.7 + Math.random() * 0.3,
        reviewCount: Math.floor(80 + Math.random() * 150),
        pricePerHour: 5000 + Math.floor(Math.random() * 10000),
        available: true,
        verified: true,
      },
    });
  }
  console.log("✅ Counselors seeded");

  // ── Jobs ──
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
        description: `Join ${j.company} as a ${j.title} — remote position.`,
        skills: ["Communication", "English", "Computer"],
        active: true,
        featured: true,
      },
    });
  }
  console.log("✅ Jobs seeded");

  // ── Products ──
  const products = [
    {
      name: "Gracy 72 Aura",
      price: 10000,
      category: "Wellness",
      stock: 50,
      featured: true,
    },
    {
      name: "Gracy Shine",
      price: 30000,
      category: "Beauty",
      stock: 30,
      featured: true,
    },
    {
      name: "Gracy Glow",
      price: 50000,
      category: "Skincare",
      stock: 20,
      featured: true,
    },
  ];

  for (const p of products) {
    await prisma.product.create({
      data: {
        ...p,
        description: `Premium ${p.category} product by Gracy World.`,
        images: [],
        active: true,
      },
    });
  }
  console.log("✅ Products seeded");

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
