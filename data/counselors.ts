// data/counselors.ts
// Single source of truth for counselor data.
// data/counselors.ts

export type SessionType = "Video" | "Text";
export type Specialty =
  | "Marriage Counseling"
  | "Trauma Healing"
  | "Life Coaching"
  | "Business Coaching";

export interface Counselor {
  id: string;
  name: string;
  role: string;
  specialty: Specialty;
  rating: number;
  reviews: number;
  price: number; // Base price in XAF (CFA)
  img: string;
  available: boolean;
  verified: boolean;
  languages: string[];
  sessions: SessionType[];
  bio: string;
  country: string;
}

// ─── Currency helpers ─────────────────────────────────────────────────────────

/** Detect the user's local currency from their browser locale */
export function detectUserCurrency(): string {
  try {
    const locale = navigator.language || "fr-CM";
    const formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
    });
    const parts = formatter.formatToParts(1);
    const currencyPart = parts.find((p) => p.type === "currency");
    // Fall back gracefully
    return currencyPart?.value ?? "XAF";
  } catch {
    return "XAF";
  }
}

/** Map browser locale to ISO 4217 currency code */
export function localeToCurrency(locale: string): string {
  const map: Record<string, string> = {
    "en-US": "USD",
    "en-GB": "GBP",
    "fr-FR": "EUR",
    "de-DE": "EUR",
    "fr-CM": "XAF",
    "en-CM": "XAF",
    "en-NG": "NGN",
    "ha-NG": "NGN",
    "en-GH": "GHS",
    "en-KE": "KES",
    "fr-SN": "XOF",
    "ar-MA": "MAD",
    "en-ZA": "ZAR",
    "en-CA": "CAD",
    "en-AU": "AUD",
  };
  return (
    map[locale] ??
    map[locale.split("-")[0] + "-" + locale.split("-")[1]] ??
    "XAF"
  );
}

export const counselors: Counselor[] = [
  {
    id: "cynthia-ching",
    name: "Cynthia Ching",
    role: "Trauma & Emotional Wellness",
    specialty: "Trauma Healing",
    rating: 4.9,
    reviews: 124,
    price: 2000,
    img: "/images/cynthia.jpeg",
    available: true,
    verified: true,
    languages: ["English", "French", "Pidgin"],
    sessions: ["Video", "Text"],
    bio: "Certified trauma therapist with 8 years helping clients process grief, anxiety, and past wounds.",
    country: "Cameroon",
  },
  {
    id: "wandia-gracious",
    name: "Wandia Gracious",
    role: "Relationship, Marriage & Trauma ",
    specialty: "Marriage Counseling",
    rating: 4.8,
    reviews: 98,
    price: 2500,
    img: "/images/ching.png",
    available: true,
    verified: true,
    languages: ["English", "Pidgin"],
    sessions: ["Video", "Text"],
    bio: "Couples therapist specialising in communication breakdowns, trust rebuilding, and pre-marital prep.",
    country: "Nigeria",
  },
  {
    id: "remedy-mbong",
    name: "Remedy Mbong",
    role: "Life & Career Coach",
    specialty: "Life Coaching",
    rating: 4.8,
    reviews: 76,
    price: 1000,
    img: "/images/remedy.jpeg",
    available: true,
    verified: true,
    languages: ["English", "Pidgin"],
    sessions: ["Video"],
    bio: "Certified life coach helping professionals navigate career pivots, burnout, and personal growth.",
    country: "Ghana",
  },
  {
    id: "marlyne-yenzy",
    name: "Marlyne Yenzy",
    role: "Life & Carreer Coach",
    specialty: "Life Coaching",
    rating: 4.7,
    reviews: 61,
    price: 2000,
    img: "/images/marlyne.jpeg",
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
    role: "Business coach",
    specialty: "Business Coaching",
    rating: 4.9,
    reviews: 143,
    price: 2500,
    img: "https://randomuser.me/api/portraits/women/32.jpg",
    available: true,
    verified: true,
    languages: ["English"],
    sessions: ["Text"],
    bio: "Helps Entrepreneurs stop guessing and start growing. With a sharp eye for strategy and a direct coaching style, she transforms overwhelmed business owners into focused, profitable leaders — one session at a time.",
    country: "Cameroon",
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

export function getCounselorById(id: string): Counselor | undefined {
  return counselors.find((c) => c.id === id);
}
export function getCounselorsBySpecialty(specialty: Specialty): Counselor[] {
  return counselors.filter((c) => c.specialty === specialty);
}
export function getAvailableCounselors(): Counselor[] {
  return counselors.filter((c) => c.available);
}
