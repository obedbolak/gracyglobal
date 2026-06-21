import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SYSTEMS } from "@/data/community";

export default function CommunitySection() {
  return (
    <section className="py-16 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "var(--glass-bg-subtle)" }}
      />
      <div
        className="absolute top-0 left-0 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(220,20,60,0.08) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(123,47,190,0.08) 0%, transparent 70%)",
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
                  background: "linear-gradient(135deg, var(--scarlet), var(--purple))",
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

        {/* System cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {SYSTEMS.map((system) => (
            <Link
              key={system.id}
              href={`/community?tab=${system.id}`}
              className="block group"
            >
                <Card className="overflow-hidden hover:-translate-y-1 transition-all duration-300 group p-0 gap-0 h-full">
                  {/* Image section */}
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={system.image}
                      alt={system.label}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />

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
                      {system.label}
                    </div>

                    <div className="flex items-center justify-center gap-1 text-xs font-medium group-hover:gap-1.5 transition-all duration-200">
                      <span style={{ color: "var(--text-muted)" }}>Explore</span>
                      <ArrowRight
                        size={12}
                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                        style={{ color: "var(--text-muted)" }}
                      />
                    </div>
                  </CardContent>
                </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
