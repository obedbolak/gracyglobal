// data/products.ts
// Single source of truth for product data.

export type ProductCategory = "Wellness" | "Beauty" | "Skincare" | "Hair Care" | "Supplements";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // CFA
  images: string[];
  category: ProductCategory;
  stock: number;
  featured: boolean;
  rating: number;
  reviews: number;
  badge?: string;
  ingredients?: string[];
  benefits?: string[];
}

export const products: Product[] = [
  {
    id: "gracy-72-aura",
    name: "Gracy 72 Aura",
    description: "A premium wellness blend formulated to restore inner balance and radiance. Rich in natural African botanicals, this daily supplement supports energy, mood, and overall vitality.",
    price: 10000,
    images: [
      "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&q=80",
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&q=80",
    ],
    category: "Wellness",
    stock: 50,
    featured: true,
    rating: 4.5,
    reviews: 89,
    badge: "Best Seller",
    benefits: ["Boosts energy", "Improves mood", "Natural ingredients", "Daily use"],
    ingredients: ["Moringa extract", "Baobab powder", "Vitamin C", "Zinc"],
  },
  {
    id: "gracy-shine",
    name: "Gracy Shine",
    description: "An artisan beauty serum that enhances your natural glow. Crafted with rare African oils and antioxidant-rich extracts for visibly luminous, hydrated skin within weeks.",
    price: 30000,
    images: [
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80",
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80",
    ],
    category: "Beauty",
    stock: 30,
    featured: true,
    rating: 4.8,
    reviews: 142,
    badge: "Top Rated",
    benefits: ["Deep hydration", "Brightening", "Anti-aging", "Suitable for all skin types"],
    ingredients: ["Argan oil", "Shea butter", "Vitamin E", "Rosehip extract"],
  },
  {
    id: "gracy-glow",
    name: "Gracy Glow",
    description: "A transformative skincare system that targets uneven tone, dullness, and fine lines. Powered by African plant stem cells and hyaluronic acid for deep, lasting moisture.",
    price: 50000,
    images: [
      "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&q=80",
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80",
    ],
    category: "Skincare",
    stock: 20,
    featured: true,
    rating: 4.7,
    reviews: 76,
    badge: "Premium",
    benefits: ["Even skin tone", "Reduces fine lines", "24hr moisture", "Clinically tested"],
    ingredients: ["Hyaluronic acid", "Neem oil", "African plant stem cells", "Collagen peptides"],
  },
  {
    id: "gracy-curl-butter",
    name: "Gracy Curl Butter",
    description: "A rich, whipped hair butter that defines curls, eliminates frizz, and restores moisture to natural African hair textures. Leave-in formula for all-day hold.",
    price: 15000,
    images: [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80",
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&q=80",
    ],
    category: "Hair Care",
    stock: 45,
    featured: false,
    rating: 4.6,
    reviews: 55,
    benefits: ["Defines curls", "Frizz control", "Deep moisture", "Natural hold"],
    ingredients: ["Shea butter", "Coconut oil", "Castor oil", "Aloe vera"],
  },
  {
    id: "gracy-vitality-plus",
    name: "Gracy Vitality Plus",
    description: "A powerful daily supplement packed with African superfoods. Designed to support immune function, cognitive clarity, and sustained energy without stimulants.",
    price: 22000,
    images: [
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80",
      "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&q=80",
    ],
    category: "Supplements",
    stock: 60,
    featured: false,
    rating: 4.4,
    reviews: 38,
    benefits: ["Immune support", "Mental clarity", "Sustained energy", "No stimulants"],
    ingredients: ["Spirulina", "Moringa", "Turmeric", "Black seed oil"],
  },
  {
    id: "gracy-repair-mask",
    name: "Gracy Repair Mask",
    description: "An intensive overnight face mask that repairs the skin barrier, fades dark spots, and delivers a morning glow. Infused with African black soap and shea extracts.",
    price: 18000,
    images: [
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80",
      "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&q=80",
    ],
    category: "Skincare",
    stock: 35,
    featured: false,
    rating: 4.5,
    reviews: 62,
    benefits: ["Repairs barrier", "Fades dark spots", "Overnight treatment", "Morning glow"],
    ingredients: ["African black soap", "Shea extract", "Kojic acid", "Vitamin A"],
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

export const CATEGORIES: ProductCategory[] = [
  "Wellness", "Beauty", "Skincare", "Hair Care", "Supplements",
];
