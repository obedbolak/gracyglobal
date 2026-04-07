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

const SYSTEMS = [
  {
    id: "human-flourishing",
    name: "Human Flourishing",
    description:
      "Family, mental health, emotional wellbeing & conflict resolution.",
    icon: "💛",
  },
  {
    id: "knowledge-skills",
    name: "Knowledge & Skills",
    description:
      "Digital skills, AI literacy, entrepreneurship & lifelong learning.",
    icon: "📚",
  },
  {
    id: "economic-empowerment",
    name: "Economic Empowerment",
    description:
      "Women cooperatives, youth startups, agriculture & community economies.",
    icon: "🌱",
  },
  {
    id: "civic-leadership",
    name: "Civic Leadership",
    description: "Ethical leadership, governance training & policy research.",
    icon: "🏛️",
  },
  {
    id: "media-narrative",
    name: "Media & Narrative",
    description:
      "Podcasts, youth media, storytelling & shaping positive culture.",
    icon: "🎙️",
  },
  {
    id: "creativity-culture",
    name: "Creativity & Culture",
    description:
      "Music, digital art, storytelling & African cultural innovation.",
    icon: "🎨",
  },
  {
    id: "technology-intelligence",
    name: "Technology & Intelligence",
    description: "AI training, digital entrepreneurship & community tech labs.",
    icon: "🤖",
  },
];

const SAMPLE_USERS = [
  {
    email: "amina@gracyglobal.com",
    name: "Amina Bello",
    image: "https://randomuser.me/api/portraits/women/32.jpg",
  },
  {
    email: "kwame@gracyglobal.com",
    name: "Kwame Osei",
    image: "https://randomuser.me/api/portraits/men/45.jpg",
  },
  {
    email: "fatima@gracyglobal.com",
    name: "Fatima Hassan",
    image: "https://randomuser.me/api/portraits/women/28.jpg",
  },
  {
    email: "david@gracyglobal.com",
    name: "David Owusu",
    image: "https://randomuser.me/api/portraits/men/52.jpg",
  },
  {
    email: "zainab@gracyglobal.com",
    name: "Zainab Ahmed",
    image: "https://randomuser.me/api/portraits/women/15.jpg",
  },
];

const SAMPLE_POSTS = [
  {
    title: "How I used AI tools to grow my business by 300%",
    content:
      "I want to share how I integrated simple AI tools into my tailoring business — and the results shocked even me. From automating customer inquiries to using design tools for proposals, everything changed.",
    type: PostType.TEXT,
    tags: ["AI", "Business", "Growth", "Entrepreneurship"],
    communitySystem: "technology-intelligence",
  },
  {
    title: "Resources for digital skills training",
    content:
      "Compiled a list of free and affordable platforms for learning digital marketing, coding, and data analysis. Check them out and share your recommendations!",
    type: PostType.TEXT,
    tags: ["Learning", "Resources", "Digital Skills"],
    communitySystem: "knowledge-skills",
  },
  {
    title: "Starting my women cooperative journey",
    content:
      "After months of planning, we're finally launching our agricultural cooperative. We're pooling resources, sharing knowledge, and supporting each other. It's scary but exciting!",
    type: PostType.TEXT,
    tags: ["Cooperative", "Agriculture", "Women"],
    communitySystem: "economic-empowerment",
  },
  {
    title: "Mental health check-in: Let's talk about burnout",
    content:
      "Work is overwhelming lately, and I know I'm not alone. Let's create a safe space to discuss burnout, stress management, and how we can support each other.",
    type: PostType.TEXT,
    tags: ["Mental Health", "Wellbeing", "Support"],
    communitySystem: "human-flourishing",
  },
  {
    title: "Ethical leadership in tech — panel discussion recording",
    content:
      "Just shared the recording from last week's panel on ethical leadership in technology. Great insights from our speakers on governance and accountability.",
    type: PostType.TEXT,
    tags: ["Leadership", "Ethics", "Technology"],
    communitySystem: "civic-leadership",
  },
  {
    title: "New podcast series: African Innovators",
    content:
      "Excited to announce our new podcast series featuring changemakers across Africa. First episode drops next week! Subscribe and share.",
    type: PostType.TEXT,
    tags: ["Podcast", "Innovation", "Media"],
    communitySystem: "media-narrative",
  },
  {
    title: "Open call for musicians and artists",
    content:
      "We're looking for creative collaborators for our upcoming cultural festival. Musicians, dancers, visual artists — everyone welcome!",
    type: PostType.TEXT,
    tags: ["Art", "Music", "Culture"],
    communitySystem: "creativity-culture",
  },
];

async function seedCommunities() {
  console.log("🌱 Starting community seed...");

  try {
    // Create or get sample users first
    console.log("👥 Creating sample users...");
    const users = await Promise.all(
      SAMPLE_USERS.map(async (userData) => {
        let user = await prisma.user.findUnique({
          where: { email: userData.email },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: userData.email,
              name: userData.name,
              image: userData.image,
              emailVerified: new Date(),
            },
          });
          console.log(`  ✓ Created user: ${user.name}`);
        } else {
          console.log(`  ✓ User exists: ${user.name}`);
        }

        return user;
      }),
    );

    // Create communities
    console.log("🏘️ Creating communities...");
    const communities = await Promise.all(
      SYSTEMS.map(async (system) => {
        let community = await prisma.community.findUnique({
          where: { slug: system.id },
        });

        if (!community) {
          community = await prisma.community.create({
            data: {
              name: system.name,
              slug: system.id,
              description: system.description,
              category: system.icon,
              image: `https://via.placeholder.com/400x300?text=${encodeURIComponent(system.name)}`,
            },
          });
          console.log(`  ✓ Created community: ${community.name}`);
        } else {
          console.log(`  ✓ Community exists: ${community.name}`);
        }

        return community;
      }),
    );

    // Add members to communities
    console.log("👫 Adding members to communities...");
    for (const community of communities) {
      // Add 3-4 random users to each community
      const membersToAdd = users.slice(0, Math.floor(Math.random() * 2) + 3);

      for (let i = 0; i < membersToAdd.length; i++) {
        const user = membersToAdd[i];
        const existingMember = await prisma.communityMember.findUnique({
          where: {
            userId_communityId: {
              userId: user.id,
              communityId: community.id,
            },
          },
        });

        if (!existingMember) {
          // First member is ADMIN, rest are MEMBER
          const role = i === 0 ? MemberRole.ADMIN : MemberRole.MEMBER;
          await prisma.communityMember.create({
            data: {
              userId: user.id,
              communityId: community.id,
              role,
            },
          });
          console.log(`  ✓ Added ${role} ${user.name} to ${community.name}`);
        }
      }
    }

    // Create sample posts
    console.log("📝 Creating sample posts...");
    const communityMap = new Map(
      communities.map((c) => [SYSTEMS.find((s) => s.id === c.slug)?.id, c.id]),
    );

    for (let i = 0; i < SAMPLE_POSTS.length; i++) {
      const postData = SAMPLE_POSTS[i];
      const community = communities.find(
        (c) => c.slug === postData.communitySystem,
      );
      const user = users[i % users.length]; // Rotate through users

      if (community && user) {
        // Check if member
        const isMember = await prisma.communityMember.findUnique({
          where: {
            userId_communityId: {
              userId: user.id,
              communityId: community.id,
            },
          },
        });

        if (!isMember) {
          // Add as member if not
          await prisma.communityMember.create({
            data: {
              userId: user.id,
              communityId: community.id,
              role: MemberRole.MEMBER,
            },
          });
        }

        const post = await prisma.communityPost.create({
          data: {
            title: postData.title,
            content: postData.content,
            type: postData.type,
            tags: postData.tags,
            userId: user.id,
            communityId: community.id,
            published: true,
          },
        });

        console.log(`  ✓ Created post: "${post.title}" in ${community.name}`);

        // Add comments to some posts
        if (i % 2 === 0) {
          const commenters = users.filter((u) => u.id !== user.id).slice(0, 2);
          for (const commenter of commenters) {
            // Ensure commenter is a member
            const isCommenterMember = await prisma.communityMember.findUnique({
              where: {
                userId_communityId: {
                  userId: commenter.id,
                  communityId: community.id,
                },
              },
            });

            if (!isCommenterMember) {
              await prisma.communityMember.create({
                data: {
                  userId: commenter.id,
                  communityId: community.id,
                  role: MemberRole.MEMBER,
                },
              });
            }

            await prisma.postComment.create({
              data: {
                postId: post.id,
                userId: commenter.id,
                content: `Great post! Thanks for sharing this insight.`,
              },
            });
          }
        }

        // Add reactions to some posts
        if (i % 3 === 0) {
          const reactors = users.filter((u) => u.id !== user.id).slice(0, 1);
          for (const reactor of reactors) {
            // Ensure reactor is a member
            const isReactorMember = await prisma.communityMember.findUnique({
              where: {
                userId_communityId: {
                  userId: reactor.id,
                  communityId: community.id,
                },
              },
            });

            if (!isReactorMember) {
              await prisma.communityMember.create({
                data: {
                  userId: reactor.id,
                  communityId: community.id,
                  role: MemberRole.MEMBER,
                },
              });
            }

            const reactionTypes = [
              ReactionType.LIKE,
              ReactionType.LOVE,
              ReactionType.SUPPORT,
            ];
            const reactionType =
              reactionTypes[Math.floor(Math.random() * reactionTypes.length)];

            await prisma.postReaction.create({
              data: {
                postId: post.id,
                userId: reactor.id,
                type: reactionType,
              },
            });
          }
        }
      }
    }

    console.log("✅ Community seeding complete!");
  } catch (error) {
    console.error("❌ Seeding error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedCommunities();
