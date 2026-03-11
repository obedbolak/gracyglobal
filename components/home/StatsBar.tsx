// components/home/StatsBar.tsx
import { Users, Briefcase, Globe, ShoppingCart } from "lucide-react";

const stats = [
  { value: "1,000+", label: "People Supported", Icon: Users, color: "#7B2FBE" },
  {
    value: "500+",
    label: "Remote Jobs Shared",
    Icon: Briefcase,
    color: "#DC143C",
  },
  { value: "50+", label: "Community Projects", Icon: Globe, color: "#1A3ADB" },
  {
    value: "10+",
    label: "Marketplace Products",
    Icon: ShoppingCart,
    color: "#7B2FBE",
  },
];

export default function StatsBar() {
  return (
    <div
      className="border-b border-gray-100"
      style={{
        background:
          "linear-gradient(135deg, #0D0820 0%, #1A0F3C 50%, #0D1A6E 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => {
            const Icon = s.Icon;
            return (
              <div
                key={i}
                className="flex items-center gap-4 py-5 px-4 border-r border-white/5 last:border-r-0"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `${s.color}22`,
                    border: `1px solid ${s.color}44`,
                  }}
                >
                  <Icon size={18} style={{ color: s.color }} />
                </div>
                <div>
                  <div
                    className="text-xl font-extrabold"
                    style={{
                      background: `linear-gradient(90deg, ${s.color}, #F5EFFF)`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {s.value}
                  </div>
                  <div className="text-xs text-white/40 font-medium mt-0.5">
                    {s.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
