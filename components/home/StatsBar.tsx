"use client";
import { Users, Briefcase, Globe, ShoppingCart } from "lucide-react";

const stats = [
  {
    value: "1,000+",
    label: "People Supported",
    Icon: Users,
    color: "var(--purple)",
    glow: "rgba(123,47,190,0.3)",
  },
  {
    value: "500+",
    label: "Remote Jobs Shared",
    Icon: Briefcase,
    color: "var(--scarlet)",
    glow: "rgba(220,20,60,0.3)",
  },
  {
    value: "50+",
    label: "Community Projects",
    Icon: Globe,
    color: "var(--blue)",
    glow: "rgba(26,58,219,0.3)",
  },
  {
    value: "10+",
    label: "Marketplace Products",
    Icon: ShoppingCart,
    color: "var(--purple-light)",
    glow: "rgba(168,85,247,0.3)",
  },
];

export default function StatsBar() {
  return (
    <div
      style={{
        background: "var(--glass-bg-subtle)",
        borderTop: "1px solid var(--glass-border-subtle)",
        borderBottom: "1px solid var(--glass-border-subtle)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => {
            const Icon = s.Icon;
            return (
              <div
                key={i}
                className="flex items-center gap-4 py-5 px-5 transition-all duration-200 group"
                style={{
                  borderRight:
                    i < stats.length - 1 ? "1px solid var(--divider)" : "none",
                }}
              >
                {/* Icon bubble */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                  style={{
                    background: `${s.glow}`,
                    border: `1px solid ${s.glow}`,
                    boxShadow: `0 4px 14px ${s.glow}`,
                  }}
                >
                  <Icon size={18} style={{ color: s.color }} />
                </div>

                {/* Text */}
                <div>
                  <div
                    className="text-xl font-extrabold leading-none mb-0.5"
                    style={{
                      background: `linear-gradient(90deg, ${s.color}, var(--text-primary))`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {s.value}
                  </div>
                  <div
                    className="text-xs font-medium mt-0.5"
                    style={{ color: "var(--text-muted)" }}
                  >
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
