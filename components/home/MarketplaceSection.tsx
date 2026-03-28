"use client";

import Link from "next/link";
import { ShoppingCart, ShieldCheck, RotateCcw, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CATEGORY_GROUPS } from "@/data/products";

const trustBadges = [
  { icon: ShieldCheck, label: "Secure Checkout" },
  { icon: RotateCcw, label: "Money Back" },
];

// Select 7 main categories to display
const FEATURED_CATEGORIES = CATEGORY_GROUPS.slice(0, 7);

// Category images from Pexels
const CATEGORY_IMAGES: Record<string, string> = {
  "Fashion & Apparel":
    "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
  "Food & Beverages":
    "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
  "Arts & Crafts":
    "https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
  "Beauty & Personal Care":
    "https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
  "Home & Living":
    "https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
  "Electronics & Tech":
    "https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
  "Health & Wellness":
    "https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
};

// Category colors for visual variety (fallback overlays)
const CATEGORY_COLORS = [
  {
    overlay:
      "linear-gradient(135deg, rgba(16, 185, 129, 0.85), rgba(5, 150, 105, 0.85))",
  },
  {
    overlay:
      "linear-gradient(135deg, rgba(139, 92, 246, 0.85), rgba(124, 58, 237, 0.85))",
  },
  {
    overlay:
      "linear-gradient(135deg, rgba(245, 158, 11, 0.85), rgba(217, 119, 6, 0.85))",
  },
  {
    overlay:
      "linear-gradient(135deg, rgba(239, 68, 68, 0.85), rgba(220, 38, 38, 0.85))",
  },
  {
    overlay:
      "linear-gradient(135deg, rgba(59, 130, 246, 0.85), rgba(37, 99, 235, 0.85))",
  },
  {
    overlay:
      "linear-gradient(135deg, rgba(6, 182, 212, 0.85), rgba(8, 145, 178, 0.85))",
  },
  {
    overlay:
      "linear-gradient(135deg, rgba(236, 72, 153, 0.85), rgba(219, 39, 119, 0.85))",
  },
];

export default function MarketplaceSection() {
  return (
    <section className="py-16 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "var(--glass-bg-subtle)" }}
      />
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(123,47,190,0.10) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(220,20,60,0.08) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, var(--purple), var(--blue))",
                }}
              >
                <ShoppingCart size={14} className="text-white" />
              </div>
              <h2
                className="text-2xl font-extrabold"
                style={{ color: "var(--text-primary)" }}
              >
                Gracy Marketplace
              </h2>
            </div>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Shop African. Support Local. Earn Together.
            </p>
          </div>
          <Button asChild size="sm" variant="scarlet">
            <Link href="/marketplace">Browse All Categories</Link>
          </Button>
        </div>

        {/* Category cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {FEATURED_CATEGORIES.map((category, index) => {
            const colors = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
            const categoryCount = category.categories.length;
            const imageUrl =
              CATEGORY_IMAGES[category.group] ||
              `https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop`;

            return (
              <Link
                key={category.group}
                href={`/marketplace?group=${encodeURIComponent(category.group)}`}
                className="block group"
              >
                <Card className="overflow-hidden hover:-translate-y-1 transition-all duration-300 group p-0 gap-0 h-full">
                  {/* Image section */}
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={category.group}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    {/* Gradient overlay */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: colors.overlay }}
                    />
                    {/* Category icon overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-5xl drop-shadow-lg">
                        {category.icon}
                      </span>
                    </div>
                  </div>

                  {/* Info section */}
                  <CardContent className="p-3">
                    <div
                      className="font-bold text-sm mb-1 text-center line-clamp-2 min-h-[40px]"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {category.group}
                    </div>

                    <div className="flex items-center justify-center gap-1 text-xs font-medium group-hover:gap-1.5 transition-all duration-200">
                      <span style={{ color: "var(--text-muted)" }}>
                        {categoryCount} items
                      </span>
                      <ArrowRight
                        size={12}
                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                        style={{ color: "var(--text-muted)" }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Trust badges */}
        <div
          className="flex flex-wrap gap-4 mt-8 pt-6 justify-center"
          style={{ borderTop: "1px solid var(--divider)" }}
        >
          {trustBadges.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background: "var(--purple-bg, rgba(123,47,190,0.15))",
                  border: "1px solid var(--divider-strong)",
                }}
              >
                <Icon size={14} style={{ color: "var(--purple)" }} />
              </div>
              <Badge variant="outline">{label}</Badge>
            </div>
          ))}

          {/* Additional trust indicator */}
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                background: "var(--success-bg, rgba(16,185,129,0.15))",
                border: "1px solid var(--divider-strong)",
              }}
            >
              <span className="text-sm">🌍</span>
            </div>
            <Badge variant="outline">Made in Africa</Badge>
          </div>
        </div>
      </div>
    </section>
  );
}
