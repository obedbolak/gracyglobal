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

// Category colors for visual variety
const CATEGORY_COLORS = [
  {
    gradient: "linear-gradient(135deg, #10b981, #059669)",
    glow: "rgba(16, 185, 129, 0.3)",
    bg: "rgba(16, 185, 129, 0.1)",
  },
  {
    gradient: "linear-gradient(135deg, #8b5cf6, #7c3aed)", 
    glow: "rgba(139, 92, 246, 0.3)",
    bg: "rgba(139, 92, 246, 0.1)",
  },
  {
    gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
    glow: "rgba(245, 158, 11, 0.3)",
    bg: "rgba(245, 158, 11, 0.1)",
  },
  {
    gradient: "linear-gradient(135deg, #ef4444, #dc2626)",
    glow: "rgba(239, 68, 68, 0.3)",
    bg: "rgba(239, 68, 68, 0.1)",
  },
  {
    gradient: "linear-gradient(135deg, #3b82f6, #2563eb)",
    glow: "rgba(59, 130, 246, 0.3)",
    bg: "rgba(59, 130, 246, 0.1)",
  },
  {
    gradient: "linear-gradient(135deg, #06b6d4, #0891b2)",
    glow: "rgba(6, 182, 212, 0.3)",
    bg: "rgba(6, 182, 212, 0.1)",
  },
  {
    gradient: "linear-gradient(135deg, #ec4899, #db2777)",
    glow: "rgba(236, 72, 153, 0.3)",
    bg: "rgba(236, 72, 153, 0.1)",
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {FEATURED_CATEGORIES.map((category, index) => {
            const colors = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
            const categoryCount = category.categories.length;
            
            return (
              <Link
                key={category.group}
                href={`/marketplace?group=${encodeURIComponent(category.group)}`}
                className="block group"
              >
                <Card className="overflow-hidden hover:-translate-y-2 transition-all duration-300 group p-0 gap-0 h-full">
                  {/* Icon section */}
                  <div 
                    className="relative p-4 sm:p-6 flex flex-col items-center justify-center min-h-[100px] sm:min-h-[120px]"
                    style={{ background: colors.bg }}
                  >
                    <div
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 transition-transform duration-300 group-hover:scale-110"
                      style={{
                        background: colors.gradient,
                        boxShadow: `0 4px 14px ${colors.glow}`,
                      }}
                    >
                      <span className="text-xl sm:text-2xl">{category.icon}</span>
                    </div>
                    
                    {/* Category count badge */}
                    <Badge 
                      variant="outline" 
                      className="text-[10px] sm:text-xs font-medium px-2 py-0.5"
                      style={{
                        background: "rgba(255,255,255,0.9)",
                        border: "1px solid rgba(255,255,255,0.2)",
                      }}
                    >
                      {categoryCount} categories
                    </Badge>
                  </div>

                  {/* Info section */}
                  <CardContent className="p-3 sm:p-4">
                    <div
                      className="font-bold text-xs sm:text-sm mb-2 text-center leading-tight"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {category.group}
                    </div>
                    
                    {/* Sample categories */}
                    <div className="text-center">
                      <div
                        className="text-[10px] sm:text-xs leading-relaxed mb-2 sm:mb-3 min-h-[24px] sm:min-h-[28px]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {category.categories.slice(0, 2).join(", ")}
                        {categoryCount > 2 && ` +${categoryCount - 2} more`}
                      </div>
                      
                      <div className="flex items-center justify-center gap-1 text-[10px] sm:text-xs font-medium group-hover:gap-2 transition-all duration-200">
                        <span style={{ color: "var(--text-secondary)" }}>Explore</span>
                        <ArrowRight 
                          size={10} 
                          className="sm:w-3 sm:h-3 transition-transform duration-200 group-hover:translate-x-0.5"
                          style={{ color: "var(--text-secondary)" }}
                        />
                      </div>
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
                  background: "rgba(123,47,190,0.15)",
                  border: "1px solid rgba(168,85,247,0.25)",
                }}
              >
                <Icon size={14} style={{ color: "var(--purple-light)" }} />
              </div>
              <Badge variant="outline">{label}</Badge>
            </div>
          ))}
          
          {/* Additional trust indicator */}
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                background: "rgba(16,185,129,0.15)",
                border: "1px solid rgba(16,185,129,0.25)",
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
