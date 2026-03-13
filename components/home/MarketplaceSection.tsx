import Link from "next/link";
import { Star, ShoppingCart, ShieldCheck, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const products = [
  {
    id: "1",
    name: "Gracy 72 Aura",
    price: 10000,
    rating: 4.5,
    img: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&q=80",
    tag: "Wellness",
    tagVariant: "success" as const,
  },
  {
    id: "2",
    name: "Gracy Shine",
    price: 30000,
    rating: 4.8,
    img: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&q=80",
    tag: "Beauty",
    tagVariant: "scarlet" as const,
  },
  {
    id: "3",
    name: "Gracy Glow",
    price: 50000,
    rating: 4.7,
    img: "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&q=80",
    tag: "Skincare",
    tagVariant: "purple" as const,
  },
];

const trustBadges = [
  { icon: ShieldCheck, label: "Secure Checkout" },
  { icon: RotateCcw, label: "Money Back" },
];

function formatCFA(n: number) {
  return `CFA ${n.toLocaleString()}`;
}

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
              Shop and Earn with Gracy
            </p>
          </div>
          <Button asChild size="sm" variant="scarlet">
            <Link href="/marketplace">View All Products</Link>
          </Button>
        </div>

        {/* Product cards — using Card + Badge + Button */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {products.map((p) => (
            <Card
              key={p.id}
              className="overflow-hidden hover:-translate-y-2 transition-all duration-300 group p-0 gap-0"
            >
              {/* Image */}
              <div className="relative overflow-hidden h-44">
                <img
                  src={p.img}
                  alt={p.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.30) 100%)",
                  }}
                />
                <div className="absolute top-3 left-3">
                  <Badge variant={p.tagVariant}>{p.tag}</Badge>
                </div>
              </div>

              {/* Info */}
              <CardContent className="p-4">
                <div
                  className="font-bold text-sm mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  {p.name}
                </div>
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={11}
                      className={
                        i < Math.floor(p.rating)
                          ? "text-yellow-400 fill-yellow-400"
                          : ""
                      }
                      style={
                        i < Math.floor(p.rating)
                          ? {}
                          : { color: "var(--text-disabled)" }
                      }
                    />
                  ))}
                  <span
                    className="text-xs ml-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {p.rating}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className="font-extrabold text-base"
                    style={{
                      background:
                        "linear-gradient(90deg, var(--purple-light), var(--scarlet-light))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {formatCFA(p.price)}
                  </span>
                  <Button asChild size="sm">
                    <Link href={`/marketplace/${p.id}`}>
                      <ShoppingCart size={12} />
                      Add to Cart
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust badges — using Badge component */}
        <div
          className="flex flex-wrap gap-4 mt-8 pt-6"
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
          {["Lidluck", "Yroloto"].map((b) => (
            <div key={b} className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg"
                style={{
                  background:
                    "linear-gradient(135deg, var(--purple), var(--blue))",
                  opacity: 0.7,
                }}
              />
              <Badge variant="ghost">{b}</Badge>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
