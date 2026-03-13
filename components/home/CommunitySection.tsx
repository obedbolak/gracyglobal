import Link from "next/link";
import { Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const categories = [
  {
    label: "Youth\nEmpowerment",
    gradient: "linear-gradient(135deg, var(--purple), var(--blue))",
    img: "https://images.unsplash.com/photo-1529390079861-591de354faf5?w=400&q=80",
    badge: "purple" as const,
  },
  {
    label: "Women\nEmpowerment",
    gradient: "linear-gradient(135deg, var(--scarlet), var(--purple))",
    img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
    badge: "scarlet" as const,
  },
  {
    label: "Community\nDevelopment",
    gradient: "linear-gradient(135deg, var(--blue), var(--scarlet))",
    img: "https://images.unsplash.com/photo-1517486808906-6ca8b3f8e1c1?w=400&q=80",
    badge: "blue" as const,
  },
];

const projects = [
  {
    title: "Youth Entrepreneurship",
    desc: "Grow skills, build your own profitable business model.",
  },
  {
    title: "Women Empowerment",
    desc: "Find balance, overcome barriers, meet peers.",
  },
  {
    title: "Community Development",
    desc: "Foster modern progress throughout the World.",
  },
];

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

        {/* Category buttons */}
        <div className="grid grid-cols-3 gap-3 mb-7">
          {categories.map((cat, i) => (
            <button
              key={i}
              className="py-3 px-4 rounded-xl text-white text-xs font-bold leading-tight text-center transition-all hover:scale-[1.03] hover:-translate-y-0.5"
              style={{
                background: cat.gradient,
                boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
                border: "1px solid rgba(255,255,255,0.18)",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Project cards — using Card + Badge */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
          {projects.map((p, i) => (
            <Card
              key={i}
              className="overflow-hidden hover:-translate-y-1.5 transition-all duration-300 group p-0 gap-0"
            >
              <div
                className="h-32 bg-cover bg-center relative overflow-hidden"
                style={{ backgroundImage: `url(${categories[i].img})` }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: "rgba(0,0,0,0.15)" }}
                />
                {/* Badge overlay */}
                <div className="absolute top-3 left-3">
                  <Badge variant={categories[i].badge}>
                    {categories[i].label.replace("\n", " ")}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <div
                  className="text-sm font-bold mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  {p.title}
                </div>
                <div
                  className="text-xs leading-relaxed"
                  style={{ color: "var(--text-muted)" }}
                >
                  {p.desc}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button asChild size="lg">
          <Link href="/community/volunteer">
            <Heart size={15} />
            Join as Volunteer
          </Link>
        </Button>
      </div>
    </section>
  );
}
