// components/home/HeroSection.tsx
import Link from "next/link";
import { MessageCircle, Briefcase, Globe, ShoppingBag } from "lucide-react";

const heroCards = [
  {
    id: "counselors",
    icon: MessageCircle,
    title: "Talk to a Counselor",
    description:
      "Professional mental health, relationship & life coaching support — available now.",
    href: "/counselors",
    gradient: "linear-gradient(135deg, #7B2FBE, #1A3ADB)",
    glowColor: "rgba(123, 47, 190, 0.4)",
    badge: "1,000+ Sessions",
    badgeBg: "rgba(255,255,255,0.2)",
  },
  {
    id: "jobs",
    icon: Briefcase,
    title: "Find Remote Jobs",
    description:
      "Browse 500+ vetted remote opportunities from global and Worldn companies.",
    href: "/jobs",
    gradient: "linear-gradient(135deg, #DC143C, #7B2FBE)",
    glowColor: "rgba(220, 20, 60, 0.4)",
    badge: "500+ Jobs",
    badgeBg: "rgba(255,255,255,0.2)",
  },
  {
    id: "community",
    icon: Globe,
    title: "Explore Community Projects",
    description:
      "Join youth empowerment, women's initiatives & community development programs.",
    href: "/community",
    gradient: "linear-gradient(135deg, #1A3ADB, #DC143C)",
    glowColor: "rgba(26, 58, 219, 0.4)",
    badge: "50+ Projects",
    badgeBg: "rgba(255,255,255,0.2)",
  },
  {
    id: "marketplace",
    icon: ShoppingBag,
    title: "Shop Gracy Products",
    description:
      "Discover and support Worldn entrepreneurs through our curated marketplace.",
    href: "/marketplace",
    gradient: "linear-gradient(135deg, #1A3ADB, #7B2FBE, #DC143C)",
    glowColor: "rgba(123, 47, 190, 0.35)",
    badge: "10+ Products",
    badgeBg: "rgba(255,255,255,0.2)",
  },
];

export default function HeroSection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "var(--grad-hero)" }}
    >
      {/* Ambient glow blobs */}
      <div
        className="absolute -top-40 -left-32 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(123,47,190,0.45) 0%, transparent 70%)",
          filter: "blur(80px)",
          animation: "pulse-glow 8s ease-in-out infinite",
        }}
      />
      <div
        className="absolute top-1/3 -right-24 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(220,20,60,0.35) 0%, transparent 70%)",
          filter: "blur(80px)",
          animation: "pulse-glow 10s ease-in-out infinite 3s",
        }}
      />
      <div
        className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(26,58,219,0.4) 0%, transparent 70%)",
          filter: "blur(80px)",
          animation: "pulse-glow 12s ease-in-out infinite 6s",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        {/* Headline */}
        <div className="text-center mb-14 animate-fadeUp">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-6"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(8px)",
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: "linear-gradient(135deg, #DC143C, #7B2FBE)",
              }}
            />
            Digital Ecosystem for World
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
            Empowering Lives.{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #A855F7, #FF4D6D, #4F72FF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Creating Opportunities.
            </span>
            <br />
            Transforming Communities.
          </h1>

          <p className="text-base sm:text-lg text-white/50 max-w-2xl mx-auto font-light leading-relaxed">
            A digital ecosystem connecting counseling, remote work, community
            development, and commerce across World.
          </p>
        </div>

        {/* ── 4 Hero Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {heroCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.id}
                href={card.href}
                className="group relative rounded-2xl overflow-hidden block transition-all duration-300 hover:-translate-y-2"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animation: `fadeUp 0.7s ease ${i * 0.12}s both`,
                }}
              >
                {/* Card background gradient */}
                <div
                  className="absolute inset-0"
                  style={{ background: card.gradient }}
                />

                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at 50% 0%, ${card.glowColor} 0%, transparent 60%)`,
                  }}
                />

                {/* Glass shimmer border */}
                <div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    border: "1px solid rgba(255,255,255,0.18)",
                    background: "rgba(255,255,255,0.04)",
                  }}
                />

                {/* Content */}
                <div className="relative z-10 p-6 flex flex-col h-full min-h-[220px]">
                  {/* Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{
                        background: "rgba(255,255,255,0.18)",
                        border: "1px solid rgba(255,255,255,0.25)",
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      <Icon size={20} className="text-white" />
                    </div>
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full text-white/90"
                      style={{
                        background: card.badgeBg,
                        border: "1px solid rgba(255,255,255,0.2)",
                      }}
                    >
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2 leading-snug group-hover:text-white/95">
                    {card.title}
                  </h3>
                  <p className="text-sm text-white/60 leading-relaxed flex-1 font-light">
                    {card.description}
                  </p>

                  {/* Arrow CTA */}
                  <div className="mt-4 flex items-center gap-1.5 text-white/80 text-xs font-semibold group-hover:gap-2.5 transition-all duration-200">
                    <span>Explore</span>
                    <svg
                      className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
