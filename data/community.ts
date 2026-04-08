// data/community.ts

// ─── 7 Systems ───────────────────────────────────────────────────────────────

// data/community.ts

// ─── 6 Community Sectors ─────────────────────────────────────────────────────

export const SYSTEMS = [
  {
    id: "health-environment",
    slug: "health-environment",
    label: "Health & Environment",
    icon: "🌿",
    description:
      "Community health initiatives, environmental sustainability, clean living & disease prevention.",
    color: "#10b981",
    gradient: "linear-gradient(135deg, #10b981, #059669)",
    glow: "rgba(16,185,129,0.3)",
    image:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1600&q=80&fit=crop",
    imageAlt: "Lush green nature representing health and environment",
  },
  {
    id: "education-knowledge",
    slug: "education-knowledge",
    label: "Education & Knowledge",
    icon: "📚",
    description:
      "Digital skills, AI literacy, lifelong learning & knowledge sharing across Africa.",
    color: "#1a3adb",
    gradient: "linear-gradient(135deg, #1a3adb, #7b2fbe)",
    glow: "rgba(26,58,219,0.3)",
    image:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1600&q=80&fit=crop",
    imageAlt: "Books and knowledge representing education",
  },
  {
    id: "governance-law",
    slug: "governance-law",
    label: "Governance & Law",
    icon: "🏛️",
    description:
      "Ethical leadership, civic rights, legal literacy, policy research & good governance.",
    color: "#7b2fbe",
    gradient: "linear-gradient(135deg, #7b2fbe, #1a3adb)",
    glow: "rgba(123,47,190,0.3)",
    image:
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1600&q=80&fit=crop",
    imageAlt: "Government building representing governance and law",
  },
  {
    id: "economic-empowerment",
    slug: "economic-empowerment",
    label: "Economic Empowerment",
    icon: "💼",
    description:
      "Cooperatives, entrepreneurship, microfinance, agriculture & building community economies.",
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #f59e0b, #10b981)",
    glow: "rgba(245,158,11,0.3)",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&q=80&fit=crop",
    imageAlt: "Market and business representing economic empowerment",
  },
  {
    id: "youth-empowerment",
    slug: "youth-empowerment",
    label: "Youth Empowerment",
    icon: "🚀",
    description:
      "Youth leadership, skills development, mentorship & creating opportunities for the next generation.",
    color: "#dc143c",
    gradient: "linear-gradient(135deg, #dc143c, #f59e0b)",
    glow: "rgba(220,20,60,0.3)",
    image:
      "https://images.unsplash.com/photo-1529390079861-591de354fafa?w=1600&q=80&fit=crop",
    imageAlt: "Young people representing youth empowerment",
  },
  {
    id: "women-empowerment",
    slug: "women-empowerment",
    label: "Women Empowerment",
    icon: "👩‍💼",
    description:
      "Women's rights, gender equality, female entrepreneurship & safe spaces for women to thrive.",
    color: "#ec4899",
    gradient: "linear-gradient(135deg, #ec4899, #7b2fbe)",
    glow: "rgba(236,72,153,0.3)",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1600&q=80&fit=crop",
    imageAlt: "Women in leadership representing women empowerment",
  },
] as const;

export type SystemId = (typeof SYSTEMS)[number]["id"];

// ─── Helper to get a system by id ────────────────────────────────────────────

export function getSystem(id: SystemId | string) {
  return SYSTEMS.find((s) => s.id === id) ?? null;
}
