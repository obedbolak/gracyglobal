import Link from "next/link";
import { Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SYSTEMS } from "@/data/community";

// System images from Unsplash
const SYSTEM_IMAGES: Record<string, string> = {
  "human-flourishing":
    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop",
  "knowledge-skills":
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=400&fit=crop",
  "economic-empowerment":
    "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=400&fit=crop",
  "civic-leadership":
    "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=400&h=400&fit=crop",
  "media-narrative":
    "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=400&fit=crop",
  "creativity-culture":
    "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=400&fit=crop",
  "technology-intelligence":
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=400&fit=crop",
};

export default function CommunitySection() {
  return (
    <section className="py-16 relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "var(--glass-bg-subtle)" }}
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
                    "linear-gradient(135deg, var(--scarlet), var(--purple))",
                }}
              >
                <Heart size={14} className="text-white" />
              </div>
              <h2
                className="text-2xl font-extrabold"
                style={{ color: "var(--text-primary)" }}
              >
                My Nation & I
              </h2>
            </div>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Building Stronger Communities Together
            </p>
          </div>
          <Button asChild size="sm" variant="scarlet">
            <Link href="/community">Explore All Systems</Link>
          </Button>
        </div>

        {/* Seven Systems Cards - 4 per row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {SYSTEMS.map((system) => {
            const imageUrl =
              SYSTEM_IMAGES[system.id] ||
              "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=400&fit=crop";

            return (
              <Link
                key={system.id}
                href={`/community?tab=${system.id}`}
                className="block group"
              >
                <Card className="overflow-hidden hover:-translate-y-1 transition-all duration-300 group p-0 gap-0 h-full">
                  {/* Image section with gradient overlay */}
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={system.label}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    {/* Gradient overlay */}
                    <div
                      className="absolute inset-0"
                      style={{ background: system.gradient, opacity: 0.75 }}
                    />
                    {/* Icon overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-4xl drop-shadow-lg transition-transform duration-300 group-hover:scale-110">
                        {system.icon}
                      </div>
                    </div>
                  </div>

                  {/* Info section */}
                  <CardContent className="p-3">
                    <div
                      className="text-sm font-bold text-center mb-1 line-clamp-2 min-h-[40px]"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {system.label}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
