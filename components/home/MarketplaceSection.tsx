"use client";

import Link from "next/link";
import { ShoppingCart, ShieldCheck, RotateCcw, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/useCategories";

const trustBadges = [
  { icon: ShieldCheck, label: "Secure Checkout" },
  { icon: RotateCcw, label: "Money Back" },
];

// Simple fallback color if category has no color set
const DEFAULT_COLOR = "#6B7280"; // neutral gray

export default function MarketplaceSection() {
  // ✅ Fetch real categories from database
  const { categories, loading, error } = useCategories("product");

  // Take first 7 active categories, sorted by sortOrder
  const featuredCategories = categories
    .filter((cat) => cat.active)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 7);

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
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden p-0 gap-0 h-full animate-pulse border-[var(--glass-border)] bg-[var(--glass-bg)]">
                <div className="aspect-square bg-gray-300/20" />
                <CardContent className="p-3">
                  <div className="h-4 bg-gray-300/20 rounded w-3/4 mx-auto mb-2" />
                  <div className="h-3 bg-gray-300/20 rounded w-1/2 mx-auto" />
                </CardContent>
              </Card>
            ))
          ) : error ? (
            <div className="col-span-full text-center py-8">
              <p style={{ color: "var(--error-text)" }}>Failed to load categories</p>
            </div>
          ) : (
            featuredCategories.map((category) => {
              // ✅ Only use color from database
              const categoryColor = category.color || DEFAULT_COLOR;

              const background = `linear-gradient(135deg, ${categoryColor}10, ${categoryColor}20)`;

              // Check if category has an image
              const hasImage = category.image && category.image.trim() !== "";

              return (
                <Link
                  key={category.id}
                  href={`/marketplace?categoryId=${category.id}`}
                  className="block group"
                >
                  <Card className="overflow-hidden hover:-translate-y-1 transition-all duration-300 group p-0 gap-0 h-full">
                    {/* Image/Icon section */}
                    <div className="relative aspect-square overflow-hidden">
                      {hasImage ? (
                        // Show image if available
                        <>
                          <img
                            src={category.image!} // ✅ Safe because hasImage is true
                            alt={category.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            onError={(e) => {
                              // Fallback to icon if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              const iconContainer =
                                target.nextElementSibling as HTMLElement;
                              if (iconContainer)
                                iconContainer.style.display = "flex";
                            }}
                          />
                          {/* Fallback icon container (hidden by default) */}
                          <div
                            className="w-full h-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                            style={{
                              background: background,
                              display: "none",
                            }}
                          >
                            <span
                              className="text-6xl transition-transform duration-300 group-hover:scale-110"
                              style={{ color: categoryColor }}
                            >
                              {category.icon || "📦"}
                            </span>
                          </div>
                        </>
                      ) : (
                        // Show icon if no image
                        <div
                          className="w-full h-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                          style={{ background: background }}
                        >
                          <span
                            className="text-6xl transition-transform duration-300 group-hover:scale-110"
                            style={{ color: categoryColor }}
                          >
                            {category.icon || "📦"}
                          </span>
                        </div>
                      )}

                      {/* Hover overlay */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-300"
                        style={{ background: "#ffffff" }}
                      />
                    </div>

                    {/* Info section */}
                    <CardContent className="p-3">
                      <div
                        className="font-bold text-sm mb-1 text-center line-clamp-2 min-h-[40px]"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {category.name}
                      </div>

                      <div className="flex items-center justify-center gap-1 text-xs font-medium group-hover:gap-1.5 transition-all duration-200">
                        <span style={{ color: "var(--text-muted)" }}>Browse</span>
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
            })
          )}
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
