// components/layout/Footer.tsx
import Link from "next/link";

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
        background: "linear-gradient(135deg, #060410 0%, #0D0820 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm"
                style={{
                  background: "linear-gradient(135deg, #7B2FBE, #1A3ADB)",
                }}
              >
                G
              </div>
              <span
                className="font-extrabold text-lg tracking-tight"
                style={{
                  background: "linear-gradient(135deg, #A855F7, #4F72FF)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                GRACY WORLD
              </span>
            </div>
            <p className="text-sm text-white/40 leading-relaxed max-w-xs">
              Empowering Lives. Creating Opportunities. Transforming Communities
              across Africa.
            </p>
          </div>

          {/* Links */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <div className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">
                {section}
              </div>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-white/50 hover:text-white transition-colors duration-200"
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
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="text-xs text-white/25">
            © 2025 Gracy World. All rights reserved.
          </p>
          <div className="flex gap-2">
            {["#7B2FBE", "#DC143C", "#1A3ADB", "#F5EFFF"].map((c, i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ background: c, boxShadow: `0 0 6px ${c}88` }}
              />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
