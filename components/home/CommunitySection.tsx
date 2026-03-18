import Link from "next/link";
import { Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SYSTEMS } from "@/data/community";

// Get badge variant based on system color
const getBadgeVariant = (color: string) => {
  if (color.includes('#dc143c') || color.includes('scarlet')) return 'scarlet' as const;
  if (color.includes('#1a3adb') || color.includes('blue')) return 'blue' as const;
  if (color.includes('#7b2fbe') || color.includes('purple')) return 'purple' as const;
  return 'blue' as const;
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
            <h2
              className="text-2xl font-extrabold mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              My Nation & I
            </h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Building Stronger Communities Together
            </p>
          </div>
        </div>

        {/* Seven Systems Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-7">
          {SYSTEMS.map((system) => (
            <Link
              key={system.id}
              href={`/community?tab=${system.id}`}
              className="block group"
            >
              <button
                className="w-full py-3 px-2 rounded-xl text-white text-xs font-bold leading-tight text-center transition-all hover:scale-[1.03] hover:-translate-y-0.5 flex flex-col items-center gap-1"
                style={{
                  background: system.gradient,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
                  border: "1px solid rgba(255,255,255,0.18)",
                }}
              >
                <span className="text-lg">{system.icon}</span>
                <span className="hidden sm:block text-center leading-tight">{system.label}</span>
                <span className="sm:hidden">{system.label.split(' ')[0]}</span>
              </button>
            </Link>
          ))}
        </div>

        {/* Featured Systems Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
          {SYSTEMS.slice(0, 3).map((system) => (
            <Link
              key={system.id}
              href={`/community?tab=${system.id}`}
              className="block group"
            >
              <Card className="overflow-hidden hover:-translate-y-1.5 transition-all duration-300 group p-0 gap-0">
                <div
                  className="h-32 relative overflow-hidden flex items-center justify-center"
                  style={{ background: system.gradient }}
                >
                  <div className="text-4xl">{system.icon}</div>
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: "rgba(0,0,0,0.15)" }}
                  />
                  {/* Badge overlay */}
                  <div className="absolute top-3 left-3">
                    <Badge variant={getBadgeVariant(system.color)}>
                      {system.label}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div
                    className="text-sm font-bold mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {system.label}
                  </div>
                  <div
                    className="text-xs leading-relaxed"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {system.description}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <Button asChild size="lg">
          <Link href="/community">
            <Heart size={15} />
            Explore My Nation & I
          </Link>
        </Button>
      </div>
    </section>
  );
}
