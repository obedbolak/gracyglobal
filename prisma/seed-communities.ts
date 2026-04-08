// prisma/seed-communities.ts

import {
  PrismaClient,
  PostType,
  MemberRole,
  ReactionType,
} from "@prisma/client";
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

// ─── 6 Sectors matching data/community.ts ────────────────────────────────────
// IMPORTANT:
//   slug     → used as Community.slug (unique identifier, used in API routes)
//   category → used as Community.category (must match SystemId for filtering)
//   image    → Unsplash URLs matching each sector

const SECTORS = [
  {
    slug: "health-environment",
    category: "health-environment",
    name: "Health & Environment",
    description:
      "Community health initiatives, environmental sustainability, clean living & disease prevention.",
    image:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1600&q=80&fit=crop",
  },
  {
    slug: "education-knowledge",
    category: "education-knowledge",
    name: "Education & Knowledge",
    description:
      "Digital skills, AI literacy, lifelong learning & knowledge sharing across Africa.",
    image:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1600&q=80&fit=crop",
  },
  {
    slug: "governance-law",
    category: "governance-law",
    name: "Governance & Law",
    description:
      "Ethical leadership, civic rights, legal literacy, policy research & good governance.",
    image:
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1600&q=80&fit=crop",
  },
  {
    slug: "economic-empowerment",
    category: "economic-empowerment",
    name: "Economic Empowerment",
    description:
      "Cooperatives, entrepreneurship, microfinance, agriculture & building community economies.",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&q=80&fit=crop",
  },
  {
    slug: "youth-empowerment",
    category: "youth-empowerment",
    name: "Youth Empowerment",
    description:
      "Youth leadership, skills development, mentorship & creating opportunities for the next generation.",
    image:
      "https://images.unsplash.com/photo-1529390079861-591de354fafa?w=1600&q=80&fit=crop",
  },
  {
    slug: "women-empowerment",
    category: "women-empowerment",
    name: "Women Empowerment",
    description:
      "Women's rights, gender equality, female entrepreneurship & safe spaces for women to thrive.",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1600&q=80&fit=crop",
  },
];

// ─── Sample users ─────────────────────────────────────────────────────────────

const SAMPLE_USERS = [
  {
    email: "amina@gracyglobal.com",
    name: "Amina Bello",
    country: "Cameroon",
    image: "https://randomuser.me/api/portraits/women/32.jpg",
  },
  {
    email: "kwame@gracyglobal.com",
    name: "Kwame Osei",
    country: "Ghana",
    image: "https://randomuser.me/api/portraits/men/45.jpg",
  },
  {
    email: "fatima@gracyglobal.com",
    name: "Fatima Hassan",
    country: "Nigeria",
    image: "https://randomuser.me/api/portraits/women/28.jpg",
  },
  {
    email: "david@gracyglobal.com",
    name: "David Owusu",
    country: "Ghana",
    image: "https://randomuser.me/api/portraits/men/52.jpg",
  },
  {
    email: "zainab@gracyglobal.com",
    name: "Zainab Ahmed",
    country: "Senegal",
    image: "https://randomuser.me/api/portraits/women/15.jpg",
  },
  {
    email: "jean@gracyglobal.com",
    name: "Jean-Paul Mvondo",
    country: "Cameroon",
    image: "https://randomuser.me/api/portraits/men/54.jpg",
  },
];

// ─── Sample posts per sector ──────────────────────────────────────────────────
// category field must match one of the 6 sector slugs

const SAMPLE_POSTS: Array<{
  title: string;
  content: string;
  type: PostType;
  category: string;
  tags: string[];
  sectorSlug: string; // which community to post in
}> = [
  // Health & Environment
  {
    title: "5 simple habits that improved my community's health",
    content:
      "We started a community wellness program in our neighbourhood last year. Here are the 5 habits that made the biggest difference — from clean water access to weekly check-ins.",
    type: PostType.TEXT,
    category: "Discussion",
    tags: ["Health", "Community", "Wellness"],
    sectorSlug: "health-environment",
  },
  {
    title: "Urban gardening project — month 3 update",
    content:
      "Our rooftop garden is now feeding 12 families. We've planted cassava, tomatoes, and leafy greens. Here's what we learned about soil, water, and community coordination.",
    type: PostType.TEXT,
    category: "Project",
    tags: ["Environment", "Agriculture", "status:Active"],
    sectorSlug: "health-environment",
  },

  // Education & Knowledge
  {
    title: "Free AI tools every student in Africa should know",
    content:
      "I've been testing free AI tools for education over the past 3 months. Here are 7 that actually work for African students with limited bandwidth and budget.",
    type: PostType.TEXT,
    category: "Resource",
    tags: ["AI", "Education", "Free Tools"],
    sectorSlug: "education-knowledge",
  },
  {
    title: "Building a community library from scratch",
    content:
      "We turned an abandoned room into a fully stocked community library. It took 6 months and zero government funding. Here's exactly how we did it.",
    type: PostType.TEXT,
    category: "Project",
    tags: ["Literacy", "Community", "status:Completed"],
    sectorSlug: "education-knowledge",
  },

  // Governance & Law
  {
    title: "Know your rights: A practical guide for African youth",
    content:
      "Legal literacy is one of the most underrated forms of empowerment. Here is a plain-language guide to your fundamental rights as a citizen in most African countries.",
    type: PostType.TEXT,
    category: "Resource",
    tags: ["Law", "Rights", "Youth"],
    sectorSlug: "governance-law",
  },
  {
    title: "Civic engagement training — what I learned",
    content:
      "I attended a 3-day civic leadership training last month. Here are my top takeaways on participatory governance, community advocacy, and holding leaders accountable.",
    type: PostType.TEXT,
    category: "Discussion",
    tags: ["Governance", "Leadership", "Civic"],
    sectorSlug: "governance-law",
  },

  // Economic Empowerment
  {
    title: "How our women's cooperative tripled income in 8 months",
    content:
      "45 women, one shared processing facility, and a WhatsApp group. Here's how our cooperative went from idea to generating 3x regional average income.",
    type: PostType.TEXT,
    category: "Discussion",
    tags: ["Cooperative", "Women", "Agriculture"],
    sectorSlug: "economic-empowerment",
  },
  {
    title: "Microfinance network — now accepting applications",
    content:
      "Our peer lending circle is opening up for new members. We offer 0% interest loans up to 500,000 XAF for small businesses. Requirements and application inside.",
    type: PostType.TEXT,
    category: "Announcement",
    tags: ["Finance", "Loans", "Business", "status:Recruiting"],
    sectorSlug: "economic-empowerment",
  },

  // Youth Empowerment
  {
    title: "I got my first tech job at 19 — here's my story",
    content:
      "A year ago I didn't know how to code. Today I work at a startup in Lagos. I want to share every step, every resource, and every mistake so others can follow.",
    type: PostType.TEXT,
    category: "Discussion",
    tags: ["Tech", "Career", "Youth"],
    sectorSlug: "youth-empowerment",
  },
  {
    title: "Youth mentorship program — 2025 cohort open",
    content:
      "We're matching 50 young people aged 18–25 with experienced mentors across business, tech, health, and governance. Apply before the deadline!",
    type: PostType.TEXT,
    category: "Announcement",
    tags: ["Mentorship", "Youth", "status:Recruiting"],
    sectorSlug: "youth-empowerment",
  },

  // Women Empowerment
  {
    title: "Creating safe spaces for women in male-dominated industries",
    content:
      "As one of few women in engineering in my country, I've faced real barriers. Here are the strategies that helped me thrive — and how we can create more inclusive environments.",
    type: PostType.TEXT,
    category: "Discussion",
    tags: ["Women", "Inclusion", "Engineering"],
    sectorSlug: "women-empowerment",
  },
  {
    title: "Women in Leadership Summit — recap and resources",
    content:
      "Over 200 women attended our annual summit last weekend. I'm sharing all the slides, recordings, and contacts from the event right here for those who missed it.",
    type: PostType.TEXT,
    category: "Resource",
    tags: ["Leadership", "Women", "Summit"],
    sectorSlug: "women-empowerment",
  },
];

// ─── Main seed function ───────────────────────────────────────────────────────

async function seedCommunities() {
  console.log("🌱 Starting community seed...\n");

  try {
    // ── 1. Upsert sample users ────────────────────────────────────────────────
    console.log("👥 Upserting sample users...");
    const users = await Promise.all(
      SAMPLE_USERS.map(async (u) => {
        const user = await prisma.user.upsert({
          where: { email: u.email },
          update: { name: u.name, image: u.image, country: u.country },
          create: {
            email: u.email,
            name: u.name,
            image: u.image,
            country: u.country,
            emailVerified: new Date(),
          },
        });
        console.log(`  ✓ ${user.name} (${user.email})`);
        return user;
      }),
    );

    // ── 2. Upsert communities ─────────────────────────────────────────────────
    console.log("\n🏘️  Upserting communities...");
    const communities = await Promise.all(
      SECTORS.map(async (sector) => {
        // upsert by slug (unique field)
        const community = await prisma.community.upsert({
          where: { slug: sector.slug },
          update: {
            name: sector.name,
            description: sector.description,
            category: sector.category, // ← slug, NOT emoji
            image: sector.image, // ← real Unsplash image
          },
          create: {
            name: sector.name,
            slug: sector.slug,
            description: sector.description,
            category: sector.category, // ← slug, NOT emoji
            image: sector.image,
          },
        });
        console.log(`  ✓ ${community.name} [${community.slug}]`);
        return community;
      }),
    );

    // ── 3. Add members ────────────────────────────────────────────────────────
    console.log("\n👫 Adding members to communities...");
    for (const community of communities) {
      // Spread users across communities — each community gets 3–5 members
      const count = 3 + (communities.indexOf(community) % 3);
      const membersToAdd = users.slice(0, count);

      for (let i = 0; i < membersToAdd.length; i++) {
        const user = membersToAdd[i];
        await prisma.communityMember.upsert({
          where: {
            userId_communityId: {
              userId: user.id,
              communityId: community.id,
            },
          },
          update: {},
          create: {
            userId: user.id,
            communityId: community.id,
            // First member is ADMIN, second is MODERATOR, rest are MEMBER
            role:
              i === 0
                ? MemberRole.ADMIN
                : i === 1
                  ? MemberRole.MODERATOR
                  : MemberRole.MEMBER,
          },
        });
      }
      console.log(`  ✓ ${community.name} → ${membersToAdd.length} members`);
    }

    // ── 4. Create posts ───────────────────────────────────────────────────────
    console.log("\n📝 Creating posts...");
    const communityBySlug = new Map(communities.map((c) => [c.slug, c]));

    for (let i = 0; i < SAMPLE_POSTS.length; i++) {
      const postData = SAMPLE_POSTS[i];
      const community = communityBySlug.get(postData.sectorSlug);
      const author = users[i % users.length];

      if (!community) {
        console.warn(
          `  ⚠ Community not found for slug: ${postData.sectorSlug}`,
        );
        continue;
      }

      // Ensure author is a member before posting
      await prisma.communityMember.upsert({
        where: {
          userId_communityId: {
            userId: author.id,
            communityId: community.id,
          },
        },
        update: {},
        create: {
          userId: author.id,
          communityId: community.id,
          role: MemberRole.MEMBER,
        },
      });

      const post = await prisma.communityPost.create({
        data: {
          userId: author.id,
          communityId: community.id,
          title: postData.title,
          content: postData.content,
          type: postData.type,
          category: postData.category, // "Discussion" | "Announcement" | "Resource" | "Project"
          tags: postData.tags,
          published: true,
        },
      });

      console.log(`  ✓ "${post.title}" → ${community.name}`);

      // ── Add comments to every other post ──────────────────────────────────
      if (i % 2 === 0) {
        const commenters = users.filter((u) => u.id !== author.id).slice(0, 2);
        for (const commenter of commenters) {
          // Ensure commenter is a member
          await prisma.communityMember.upsert({
            where: {
              userId_communityId: {
                userId: commenter.id,
                communityId: community.id,
              },
            },
            update: {},
            create: {
              userId: commenter.id,
              communityId: community.id,
              role: MemberRole.MEMBER,
            },
          });

          await prisma.postComment.create({
            data: {
              postId: post.id,
              userId: commenter.id,
              content:
                "Great insight! Thanks for sharing this with the community.",
            },
          });
        }
      }

      // ── Add reactions to every third post ────────────────────────────────
      if (i % 3 === 0) {
        const reactors = users.filter((u) => u.id !== author.id).slice(0, 3);
        const reactionTypes: ReactionType[] = [
          ReactionType.LIKE,
          ReactionType.LOVE,
          ReactionType.SUPPORT,
        ];

        for (let r = 0; r < reactors.length; r++) {
          const reactor = reactors[r];

          // Ensure reactor is a member
          await prisma.communityMember.upsert({
            where: {
              userId_communityId: {
                userId: reactor.id,
                communityId: community.id,
              },
            },
            update: {},
            create: {
              userId: reactor.id,
              communityId: community.id,
              role: MemberRole.MEMBER,
            },
          });

          // @@unique([userId, postId, type]) — one per type per user per post
          await prisma.postReaction.upsert({
            where: {
              userId_postId_type: {
                userId: reactor.id,
                postId: post.id,
                type: reactionTypes[r % reactionTypes.length],
              },
            },
            update: {},
            create: {
              postId: post.id,
              userId: reactor.id,
              type: reactionTypes[r % reactionTypes.length],
            },
          });
        }
      }
    }

    // ── 5. Summary ────────────────────────────────────────────────────────────
    console.log("\n✅ Seed complete!");
    console.log(`   Communities : ${communities.length}`);
    console.log(`   Users       : ${users.length}`);
    console.log(`   Posts       : ${SAMPLE_POSTS.length}`);
  } catch (error) {
    console.error("\n❌ Seeding error:", error);
    throw error;
  } finally {
    await pool.end();
    await prisma.$disconnect();
  }
}

seedCommunities();
