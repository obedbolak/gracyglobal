// data/counselors.ts
// Single source of truth for counselor data.
// Swap the fetch in getCounselors() for a real DB call when ready.

export type SessionType = "Video" | "Text";
export type Specialty =
  | "Marriage Counseling"
  | "Trauma Healing"
  | "Life Coaching";

export interface Counselor {
  id: string;
  name: string;
  role: string;
  specialty: Specialty;
  rating: number;
  reviews: number;
  price: number; // CFA per hour
  img: string;
  available: boolean;
  verified: boolean;
  languages: string[];
  sessions: SessionType[];
  bio: string;
  country: string;
}

export const counselors: Counselor[] = [
  {
    id: "grace-nfor",
    name: "Grace Nfor",
    role: "Emotional Wellness & Trauma",
    specialty: "Trauma Healing",
    rating: 4.9,
    reviews: 124,
    price: 5000,
    img: "/images/couselor1.jpeg",
    available: true,
    verified: true,
    languages: ["English", "French"],
    sessions: ["Video", "Text"],
    bio: "Certified trauma therapist with 8 years helping clients process grief, anxiety, and past wounds.",
    country: "Cameroon",
  },
  {
    id: "daniel-evans",
    name: "Daniel Evans",
    role: "Relationship & Marriage",
    specialty: "Marriage Counseling",
    rating: 4.8,
    reviews: 98,
    price: 7000,
    img: "/images/counselor2.jpeg",
    available: true,
    verified: true,
    languages: ["English"],
    sessions: ["Video", "Text"],
    bio: "Couples therapist specialising in communication breakdowns, trust rebuilding, and pre-marital prep.",
    country: "Nigeria",
  },
  {
    id: "sarah-johnson",
    name: "Sarah Johnson",
    role: "Life & Career Coach",
    specialty: "Life Coaching",
    rating: 4.8,
    reviews: 76,
    price: 4500,
    img: "/images/counselor3.jpeg",
    available: false,
    verified: true,
    languages: ["English", "Pidgin"],
    sessions: ["Video"],
    bio: "Certified life coach helping professionals navigate career pivots, burnout, and personal growth.",
    country: "Ghana",
  },
  {
    id: "mbeki-oumarou",
    name: "Mbeki Oumarou",
    role: "Family & Conflict Counselor",
    specialty: "Marriage Counseling",
    rating: 4.7,
    reviews: 61,
    price: 6000,
    img: "/images/counselor4.jpeg",
    available: true,
    verified: true,
    languages: ["French", "English"],
    sessions: ["Video", "Text"],
    bio: "Family counselor specialising in generational conflicts, parenting struggles, and cultural tensions.",
    country: "Cameroon",
  },
  {
    id: "amina-bello",
    name: "Amina Bello",
    role: "Mental Health & Anxiety",
    specialty: "Trauma Healing",
    rating: 4.9,
    reviews: 143,
    price: 5500,
    img: "https://randomuser.me/api/portraits/women/32.jpg",
    available: true,
    verified: true,
    languages: ["English", "Hausa"],
    sessions: ["Text"],
    bio: "Mental health specialist focused on anxiety, depression, and building emotional resilience.",
    country: "Nigeria",
  },
  {
    id: "jean-paul-mvondo",
    name: "Jean-Paul Mvondo",
    role: "Purpose & Vision Coach",
    specialty: "Life Coaching",
    rating: 4.6,
    reviews: 45,
    price: 4000,
    img: "https://randomuser.me/api/portraits/men/54.jpg",
    available: true,
    verified: false,
    languages: ["French", "English"],
    sessions: ["Video", "Text"],
    bio: "Helps young professionals and entrepreneurs find clarity, set meaningful goals, and stay accountable.",
    country: "Cameroon",
  },
];

// ─── Helper functions ─────────────────────────────────────────────────────────

export function getCounselorById(id: string): Counselor | undefined {
  return counselors.find((c) => c.id === id);
}

export function getCounselorsBySpecialty(specialty: Specialty): Counselor[] {
  return counselors.filter((c) => c.specialty === specialty);
}

export function getAvailableCounselors(): Counselor[] {
  return counselors.filter((c) => c.available);
}
