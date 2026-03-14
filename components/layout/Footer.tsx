"use client";

import Link from "next/link";
import CurrencySelector from "@/components/shared/CurrencySelector";

const links = {
  Platform: [
    { label: "Counselors", href: "/counselors" },
    { label: "Remote Jobs", href: "/jobs" },
    { label: "Marketplace", href: "/marketplace" },
    { label: "Community", href: "/community" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

export default function Footer() {
  return (
    <footer
      style={{
        background: "var(--glass-bg)",
        borderTop: "1px solid var(--divider-strong)",
        backdropFilter: "var(--glass-blur)",
        WebkitBackdropFilter: "var(--glass-blur)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm"
                style={{
                  background:
                    "linear-gradient(135deg, var(--purple), var(--blue))",
                  boxShadow: "0 4px 14px rgba(123,47,190,0.40)",
                }}
              >
                G
              </div>
              <span
                className="font-extrabold text-lg tracking-tight"
                style={{
                  background:
                    "linear-gradient(135deg, var(--purple-light), var(--blue-light))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                GRACY GLOBAL
              </span>
            </div>
            <p
              className="text-sm leading-relaxed max-w-xs mb-5"
              style={{ color: "var(--text-muted)" }}
            >
              Empowering Lives. Creating Opportunities. Transforming Communities
              across the World.
            </p>

            {/* Currency selector */}
            <div className="mb-5">
              <p
                className="text-[10px] font-bold uppercase tracking-widest mb-2"
                style={{ color: "var(--text-disabled)" }}
              >
                Display Currency
              </p>
              <CurrencySelector />
            </div>

            {/* Social dots */}
            <div className="flex gap-2 mt-5">
              {[
                "linear-gradient(135deg, var(--purple), var(--blue))",
                "linear-gradient(135deg, var(--scarlet), var(--purple))",
                "linear-gradient(135deg, var(--blue), var(--scarlet))",
                "linear-gradient(135deg, var(--purple-light), var(--blue-light))",
              ].map((g, i) => (
                <span
                  key={i}
                  className="w-7 h-7 rounded-lg flex-shrink-0 cursor-pointer transition-all hover:scale-110"
                  style={{
                    background: g,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.20)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <div
                className="text-xs font-bold uppercase tracking-widest mb-4"
                style={{ color: "var(--text-disabled)" }}
              >
                {section}
              </div>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm transition-colors duration-200"
                      style={{ color: "var(--text-muted)" }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.color =
                          "var(--accent-primary)")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.color =
                          "var(--text-muted)")
                      }
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8"
          style={{ borderTop: "1px solid var(--divider)" }}
        >
          <p className="text-xs" style={{ color: "var(--text-disabled)" }}>
            © 2025 Gracy World. All rights reserved.
          </p>

          {/* Pill */}
          <div
            className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs"
            style={{
              background: "var(--badge-purple-bg)",
              border: "1px solid var(--divider-strong)",
              color: "var(--text-muted)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: "var(--purple-light)",
                boxShadow: "0 0 6px rgba(168,85,247,0.8)",
                animation: "pulse 2s ease-in-out infinite",
              }}
            />
            Built with ♥ for Africa
          </div>
        </div>
      </div>
    </footer>
  );
}
