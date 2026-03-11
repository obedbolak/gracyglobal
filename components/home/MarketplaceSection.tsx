// components/home/MarketplaceSection.tsx
import Link from "next/link";
import { Star, ShoppingCart } from "lucide-react";

const products = [
  {
    id: "1",
    name: "Gracy 72 Aura",
    price: 10000,
    rating: 4.5,
    img: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&q=80",
    tag: "Wellness",
  },
  {
    id: "2",
    name: "Gracy Shine",
    price: 30000,
    rating: 4.8,
    img: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&q=80",
    tag: "Beauty",
  },
  {
    id: "3",
    name: "Gracy Glow",
    price: 50000,
    rating: 4.7,
    img: "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&q=80",
    tag: "Skincare",
  },
];

function formatCFA(n: number) {
  return `CFA ${n.toLocaleString()}`;
}

export default function MarketplaceSection() {
  return (
    <section
      className="py-16"
      style={{
        background:
          "linear-gradient(135deg, #060C3A 0%, #1A0F3C 50%, #3A0A1A 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #7B2FBE, #1A3ADB)",
                }}
              >
                <ShoppingCart size={14} className="text-white" />
              </div>
              <h2 className="text-2xl font-extrabold text-white">
                Gracy Marketplace
              </h2>
            </div>
            <p className="text-sm text-white/50">Shop and Earn with Gracy</p>
          </div>
          <Link
            href="/marketplace"
            className="text-sm font-bold px-5 py-2 rounded-xl text-white transition-all hover:scale-105 whitespace-nowrap"
            style={{
              background: "linear-gradient(135deg, #DC143C, #7B2FBE)",
              boxShadow: "0 4px 14px rgba(220,20,60,0.3)",
            }}
          >
            View All Products
          </Link>
        </div>

        {/* Product cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {products.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-2"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
              }}
            >
              {/* Product image */}
              <div className="relative overflow-hidden h-44">
                <img
                  src={p.img}
                  alt={p.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <div
                  className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold text-white"
                  style={{
                    background: "rgba(123,47,190,0.85)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  {p.tag}
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="font-bold text-white mb-1 text-sm">
                  {p.name}
                </div>
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className={
                        i < Math.floor(p.rating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-600"
                      }
                    />
                  ))}
                  <span className="text-xs text-white/40 ml-1">{p.rating}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className="font-extrabold text-base"
                    style={{
                      background: "linear-gradient(90deg, #A855F7, #FF4D6D)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {formatCFA(p.price)}
                  </span>
                  <Link
                    href={`/marketplace/${p.id}`}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-105"
                    style={{
                      background: "linear-gradient(135deg, #7B2FBE, #1A3ADB)",
                      boxShadow: "0 3px 10px rgba(123,47,190,0.35)",
                    }}
                  >
                    <ShoppingCart size={12} />
                    Add to Cart
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Store badges */}
        <div
          className="flex flex-wrap gap-4 mt-8 pt-6"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          {["Secure Checkout", "Money Back", "Lidluck", "Yroloto"].map((b) => (
            <div key={b} className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-md"
                style={{
                  background: "linear-gradient(135deg, #7B2FBE, #1A3ADB)",
                }}
              />
              <span className="text-xs text-white/40 font-medium">{b}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
