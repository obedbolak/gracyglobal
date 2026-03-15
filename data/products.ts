// data/products.ts
// Single source of truth for product data and categories.

// ─── Category groups ──────────────────────────────────────────────────────────

export const CATEGORY_GROUPS = [
  {
    group: "Food & Agriculture",
    icon: "🌾",
    categories: [
      "Fresh Produce",
      "Grains & Staples",
      "Cooking Oils & Spices",
      "Packaged Foods",
      "Farm Tools & Seeds",
    ],
  },
  {
    group: "Health & Wellness",
    icon: "💊",
    categories: [
      "Herbal & Natural",
      "Vitamins & Supplements",
      "Fitness & Equipment",
      "Mental Wellness",
      "Telehealth Products",
    ],
  },
  {
    group: "Beauty & Personal Care",
    icon: "✨",
    categories: [
      "Skincare",
      "Hair Care",
      "Beauty Tools",
      "Perfumes & Fragrance",
      "Natural Cosmetics",
    ],
  },
  {
    group: "Home & Living",
    icon: "🏠",
    categories: [
      "Furniture",
      "Kitchen & Utensils",
      "Bedding & Textiles",
      "Cleaning Products",
      "Home Decor",
    ],
  },
  {
    group: "Fashion & Lifestyle",
    icon: "👗",
    categories: [
      "Clothing",
      "Shoes & Footwear",
      "Bags & Accessories",
      "Jewelry & Watches",
      "African Traditional Wear",
    ],
  },
  {
    group: "Digital Products",
    icon: "💻",
    categories: [
      "Online Courses",
      "E-books & Guides",
      "Templates & Design",
      "Software & Tools",
      "AI Products",
    ],
  },
  {
    group: "Education & Skills",
    icon: "🎓",
    categories: [
      "Training & Certification",
      "Business Courses",
      "Leadership Programs",
      "Skill-based Coaching",
    ],
  },
  {
    group: "Technology",
    icon: "📱",
    categories: [
      "Phones & Gadgets",
      "Laptops & Computers",
      "Accessories",
      "Solar & Energy",
      "Smart Devices",
    ],
  },
  {
    group: "Services",
    icon: "🤝",
    categories: [
      "Counseling & Therapy",
      "Business Consulting",
      "Graphic Design",
      "Writing & Content",
      "Legal & Finance",
    ],
  },
] as const;

export type CategoryGroup = (typeof CATEGORY_GROUPS)[number]["group"];
export type ProductCategory =
  (typeof CATEGORY_GROUPS)[number]["categories"][number];
export const ALL_CATEGORIES = CATEGORY_GROUPS.flatMap(
  (g) => g.categories,
) as ProductCategory[];
export const CATEGORIES = ALL_CATEGORIES; // backward compat

// ─── Product interface ────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: ProductCategory;
  group: CategoryGroup;
  stock: number;
  featured: boolean;
  rating: number;
  reviews: number;
  badge?: string;
  ingredients?: string[];
  benefits?: string[];
}

// ─── Products ─────────────────────────────────────────────────────────────────

export const products: Product[] = [
  {
    id: "gracy-72-aura",
    name: "Gracy 72 Aura",
    description:
      "A premium wellness blend formulated to restore inner balance and radiance. Rich in natural African botanicals, this daily supplement supports energy, mood, and overall vitality.",
    price: 10000,
    images: [
      "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&q=80",
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&q=80",
    ],
    category: "Natural Cosmetics",
    group: "Beauty & Personal Care",
    stock: 50,
    featured: true,
    rating: 4.5,
    reviews: 89,
    badge: "Best Seller",
    benefits: [
      "Boosts energy",
      "Improves mood",
      "Natural ingredients",
      "Daily use",
    ],
    ingredients: ["Moringa extract", "Baobab powder", "Vitamin C", "Zinc"],
  },
  {
    id: "gracy-shine",
    name: "Gracy Shine",
    description:
      "An artisan beauty serum that enhances your natural glow. Crafted with rare African oils and antioxidant-rich extracts for visibly luminous, hydrated skin.",
    price: 30000,
    images: [
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80",
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80",
    ],
    category: "Skincare",
    group: "Beauty & Personal Care",
    stock: 30,
    featured: true,
    rating: 4.8,
    reviews: 142,
    badge: "Top Rated",
    benefits: ["Deep hydration", "Brightening", "Anti-aging", "All skin types"],
    ingredients: ["Argan oil", "Shea butter", "Vitamin E", "Rosehip extract"],
  },
  {
    id: "gracy-glow",
    name: "Gracy Glow",
    description:
      "A transformative skincare system targeting uneven tone, dullness, and fine lines. Powered by African plant stem cells and hyaluronic acid.",
    price: 50000,
    images: [
      "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&q=80",
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80",
    ],
    category: "Skincare",
    group: "Beauty & Personal Care",
    stock: 20,
    featured: true,
    rating: 4.7,
    reviews: 76,
    badge: "Premium",
    benefits: [
      "Even skin tone",
      "Reduces fine lines",
      "24hr moisture",
      "Clinically tested",
    ],
    ingredients: [
      "Hyaluronic acid",
      "Neem oil",
      "African plant stem cells",
      "Collagen peptides",
    ],
  },
  {
    id: "gracy-curl-butter",
    name: "Gracy Curl Butter",
    description:
      "A rich, whipped hair butter that defines curls, eliminates frizz, and restores moisture to natural African hair textures.",
    price: 15000,
    images: [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80",
    ],
    category: "Hair Care",
    group: "Beauty & Personal Care",
    stock: 45,
    featured: false,
    rating: 4.6,
    reviews: 55,
    benefits: [
      "Defines curls",
      "Frizz control",
      "Deep moisture",
      "Natural hold",
    ],
    ingredients: ["Shea butter", "Coconut oil", "Castor oil", "Aloe vera"],
  },
  {
    id: "gracy-vitality-plus",
    name: "Gracy Vitality Plus",
    description:
      "A powerful daily supplement packed with African superfoods. Supports immune function, cognitive clarity, and sustained energy.",
    price: 22000,
    images: [
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80",
    ],
    category: "Vitamins & Supplements",
    group: "Health & Wellness",
    stock: 60,
    featured: true,
    rating: 4.4,
    reviews: 38,
    benefits: [
      "Immune support",
      "Mental clarity",
      "Sustained energy",
      "No stimulants",
    ],
    ingredients: ["Spirulina", "Moringa", "Turmeric", "Black seed oil"],
  },
  {
    id: "gracy-repair-mask",
    name: "Gracy Repair Mask",
    description:
      "An intensive overnight face mask that repairs the skin barrier, fades dark spots, and delivers a morning glow.",
    price: 18000,
    images: [
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80",
    ],
    category: "Skincare",
    group: "Beauty & Personal Care",
    stock: 35,
    featured: false,
    rating: 4.5,
    reviews: 62,
    benefits: [
      "Repairs barrier",
      "Fades dark spots",
      "Overnight treatment",
      "Morning glow",
    ],
    ingredients: [
      "African black soap",
      "Shea extract",
      "Kojic acid",
      "Vitamin A",
    ],
  },
  {
    id: "africa-business-ebook",
    name: "Africa Business Blueprint",
    description:
      "A comprehensive e-book covering how to start, grow, and scale a business in Africa. Includes case studies from 20+ successful African entrepreneurs.",
    price: 5000,
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
    ],
    category: "E-books & Guides",
    group: "Digital Products",
    stock: 999,
    featured: true,
    rating: 4.7,
    reviews: 203,
    badge: "Digital",
    benefits: [
      "Instant download",
      "20+ case studies",
      "Action plans",
      "Lifetime access",
    ],
  },
  {
    id: "financial-freedom-course",
    name: "Financial Freedom Masterclass",
    description:
      "A 6-module online course teaching budgeting, saving, investing, and building multiple income streams — designed for the African context.",
    price: 35000,
    images: [
      "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&q=80",
    ],
    category: "Online Courses",
    group: "Digital Products",
    stock: 999,
    featured: true,
    rating: 4.9,
    reviews: 87,
    badge: "Bestseller",
    benefits: [
      "6 modules",
      "Certificate included",
      "Lifetime access",
      "Community access",
    ],
  },
  {
    id: "organic-moringa-powder",
    name: "Organic Moringa Powder",
    description:
      "100% pure, sun-dried moringa leaf powder sourced directly from small-scale Cameroonian farmers. Packed with iron, calcium, and vitamins.",
    price: 8000,
    images: [
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80",
    ],
    category: "Herbal & Natural",
    group: "Health & Wellness",
    stock: 80,
    featured: false,
    rating: 4.6,
    reviews: 44,
    benefits: [
      "Rich in iron",
      "Boosts immunity",
      "Farm-to-home",
      "Certified organic",
    ],
    ingredients: ["100% Moringa oleifera leaf"],
  },
  {
    id: "african-shea-candle",
    name: "African Shea Candle Set",
    description:
      "Hand-poured scented candles made with raw shea butter and essential oils. Create a warm, relaxing atmosphere inspired by African botanical fragrances.",
    price: 12000,
    images: [
      "https://images.unsplash.com/photo-1602928321679-560bb453f190?w=600&q=80",
    ],
    category: "Home Decor",
    group: "Home & Living",
    stock: 40,
    featured: false,
    rating: 4.5,
    reviews: 29,
    benefits: [
      "Natural shea wax",
      "Long burn time",
      "Relaxing scent",
      "Eco-friendly",
    ],
  },

  // ── Food & Agriculture ──
  {
    id: "organic-palm-oil",
    name: "Pure Red Palm Oil 1L",
    description:
      "Cold-pressed, unrefined red palm oil sourced from family farms in the Southwest Region of Cameroon. Rich in beta-carotene and vitamin E. No additives.",
    price: 4500,
    images: [
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80",
    ],
    category: "Cooking Oils & Spices",
    group: "Food & Agriculture",
    stock: 120,
    featured: true,
    rating: 4.8,
    reviews: 310,
    badge: "Farm Direct",
    benefits: [
      "Cold-pressed",
      "Rich in beta-carotene",
      "No additives",
      "Farm to table",
    ],
    ingredients: ["100% Elaeis guineensis (red palm) oil"],
  },
  {
    id: "cassava-flour-2kg",
    name: "Premium Cassava Flour 2kg",
    description:
      "Finely milled, sun-dried cassava flour from local Cameroonian farmers. Gluten-free, versatile for fufu, baking, and thickening soups.",
    price: 3000,
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    ],
    category: "Grains & Staples",
    group: "Food & Agriculture",
    stock: 200,
    featured: false,
    rating: 4.6,
    reviews: 88,
    benefits: ["Gluten-free", "High fibre", "Locally sourced", "Versatile use"],
  },
  {
    id: "heirloom-pepper-seeds",
    name: "African Pepper Seed Kit",
    description:
      "A curated set of 5 heirloom pepper varieties — scotch bonnet, njansa, country pepper, white pepper, and African basil seeds — perfect for home gardens.",
    price: 2500,
    images: [
      "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&q=80",
    ],
    category: "Farm Tools & Seeds",
    group: "Food & Agriculture",
    stock: 75,
    featured: false,
    rating: 4.5,
    reviews: 34,
    benefits: [
      "5 varieties",
      "Heirloom seeds",
      "Home garden ready",
      "Planting guide included",
    ],
  },

  // ── Home & Living ──
  {
    id: "bamboo-kitchen-set",
    name: "Bamboo Kitchen Utensil Set",
    description:
      "A 6-piece eco-friendly bamboo kitchen set including spoons, spatulas, and ladles. Sustainably sourced, naturally antimicrobial, and heat resistant.",
    price: 9500,
    images: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
    ],
    category: "Kitchen & Utensils",
    group: "Home & Living",
    stock: 55,
    featured: true,
    rating: 4.7,
    reviews: 61,
    benefits: [
      "Eco-friendly",
      "Antimicrobial",
      "Heat resistant",
      "6-piece set",
    ],
  },
  {
    id: "ankara-throw-pillow",
    name: "Ankara Print Throw Pillows (2-pack)",
    description:
      "Vibrant Ankara-fabric throw pillows hand-sewn by artisans in Douala. Each pair is unique. Cotton inner filling, zip-off covers for easy washing.",
    price: 14000,
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
    ],
    category: "Home Decor",
    group: "Home & Living",
    stock: 30,
    featured: false,
    rating: 4.4,
    reviews: 22,
    benefits: [
      "Handmade",
      "Unique patterns",
      "Washable covers",
      "Supports artisans",
    ],
  },

  // ── Fashion & Lifestyle ──
  {
    id: "kente-tote-bag",
    name: "Kente Woven Tote Bag",
    description:
      "A bold, hand-woven tote bag using authentic Ghanaian kente strips. Spacious interior, sturdy handles, and a zippered inner pocket. Every bag is one-of-a-kind.",
    price: 20000,
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80",
    ],
    category: "Bags & Accessories",
    group: "Fashion & Lifestyle",
    stock: 18,
    featured: true,
    rating: 4.9,
    reviews: 47,
    badge: "Handmade",
    benefits: [
      "Hand-woven kente",
      "One-of-a-kind",
      "Inner pocket",
      "Ethically made",
    ],
  },
  {
    id: "african-print-dress",
    name: "Dashiki Wrap Dress",
    description:
      "A flowing, midi-length wrap dress in premium Ankara fabric. Adjustable tie waist fits sizes S–XL. Available in three signature prints.",
    price: 25000,
    images: [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80",
    ],
    category: "African Traditional Wear",
    group: "Fashion & Lifestyle",
    stock: 40,
    featured: false,
    rating: 4.6,
    reviews: 53,
    benefits: [
      "Adjustable fit",
      "3 prints available",
      "Premium Ankara",
      "S–XL sizing",
    ],
  },

  // ── Education & Skills ──
  {
    id: "public-speaking-course",
    name: "Public Speaking Mastery",
    description:
      "A 4-week intensive online program that builds confidence, clarity, and charisma for presentations, pitches, and leadership communication in African business contexts.",
    price: 28000,
    images: [
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&q=80",
    ],
    category: "Training & Certification",
    group: "Education & Skills",
    stock: 999,
    featured: true,
    rating: 4.8,
    reviews: 119,
    badge: "New",
    benefits: [
      "4-week program",
      "Live practice sessions",
      "Certificate",
      "Recorded replay",
    ],
  },
  {
    id: "leadership-bootcamp",
    name: "African Leadership Bootcamp",
    description:
      "A transformative leadership program built for young African professionals. Covers vision-setting, team management, decision-making, and community impact.",
    price: 45000,
    images: [
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&q=80",
    ],
    category: "Leadership Programs",
    group: "Education & Skills",
    stock: 999,
    featured: false,
    rating: 4.9,
    reviews: 64,
    benefits: [
      "8 modules",
      "Mentorship included",
      "Cohort model",
      "Lifetime community",
    ],
  },

  // ── Technology ──
  {
    id: "solar-phone-charger",
    name: "Portable Solar Phone Charger",
    description:
      "A foldable 20W solar panel charger compatible with all USB-C and USB-A devices. Lightweight, waterproof, and perfect for areas with unreliable power supply.",
    price: 32000,
    images: [
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80",
    ],
    category: "Solar & Energy",
    group: "Technology",
    stock: 25,
    featured: true,
    rating: 4.7,
    reviews: 38,
    badge: "Eco",
    benefits: ["20W output", "Waterproof", "USB-C & USB-A", "Foldable design"],
  },
  {
    id: "wireless-earbuds",
    name: "Wireless Earbuds Pro",
    description:
      "True wireless earbuds with active noise cancellation, 24-hour battery life (with case), and IPX5 water resistance. Crystal-clear call quality for remote workers.",
    price: 18000,
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80",
    ],
    category: "Accessories",
    group: "Technology",
    stock: 50,
    featured: false,
    rating: 4.5,
    reviews: 92,
    benefits: ["ANC", "24hr battery", "IPX5 waterproof", "Clear call quality"],
  },

  // ── Services ──
  {
    id: "brand-identity-package",
    name: "Brand Identity Starter Pack",
    description:
      "A professional brand identity package including logo design, colour palette, typography guide, and business card mockup. Delivered within 5 business days.",
    price: 55000,
    images: [
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80",
    ],
    category: "Graphic Design",
    group: "Services",
    stock: 999,
    featured: true,
    rating: 4.9,
    reviews: 76,
    badge: "Pro Service",
    benefits: [
      "Logo + brand guide",
      "3 revisions",
      "5-day delivery",
      "Source files included",
    ],
  },
  {
    id: "cv-writing-service",
    name: "Professional CV & Cover Letter",
    description:
      "A certified career coach rewrites your CV and cover letter tailored to your target role and industry. ATS-optimised and reviewed by an HR professional.",
    price: 15000,
    images: [
      "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&q=80",
    ],
    category: "Writing & Content",
    group: "Services",
    stock: 999,
    featured: false,
    rating: 4.8,
    reviews: 144,
    benefits: [
      "ATS-optimised",
      "HR reviewed",
      "Cover letter included",
      "48hr turnaround",
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function getProductsByCategory(category: ProductCategory): Product[] {
  return products.filter((p) => p.category === category);
}

export function getProductsByGroup(group: CategoryGroup): Product[] {
  return products.filter((p) => p.group === group);
}

export function getCategoryGroup(
  category: ProductCategory,
): CategoryGroup | undefined {
  return CATEGORY_GROUPS.find((g) =>
    (g.categories as readonly string[]).includes(category),
  )?.group as CategoryGroup | undefined;
}
