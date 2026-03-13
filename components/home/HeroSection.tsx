"use client";

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
    gradient: "linear-gradient(135deg, var(--purple), var(--blue))",
    glowColor: "rgba(123,47,190,0.5)",
    badge: "1,000+ Sessions",
  },
  {
    id: "jobs",
    icon: Briefcase,
    title: "Find Remote Jobs",
    description:
      "Browse 500+ vetted remote opportunities from global and African companies.",
    href: "/jobs",
    gradient: "linear-gradient(135deg, var(--scarlet), var(--purple))",
    glowColor: "rgba(220,20,60,0.5)",
    badge: "500+ Jobs",
  },
  {
    id: "community",
    icon: Globe,
    title: "Explore Community",
    description:
      "Join youth empowerment, women's initiatives & community development programs.",
    href: "/community",
    gradient: "linear-gradient(135deg, var(--blue), var(--scarlet))",
    glowColor: "rgba(26,58,219,0.5)",
    badge: "50+ Projects",
  },
  {
    id: "marketplace",
    icon: ShoppingBag,
    title: "Shop Gracy Products",
    description:
      "Discover and support African entrepreneurs through our curated marketplace.",
    href: "/marketplace",
    gradient:
      "linear-gradient(135deg, var(--blue), var(--purple), var(--scarlet))",
    glowColor: "rgba(123,47,190,0.45)",
    badge: "10+ Products",
  },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Ambient glow blobs */}
      <div
        className="absolute -top-40 -left-32 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(123,47,190,0.35) 0%, transparent 70%)",
          filter: "blur(80px)",
          animation: "pulse-glow 8s ease-in-out infinite",
        }}
      />
      <div
        className="absolute top-1/3 -right-24 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(220,20,60,0.28) 0%, transparent 70%)",
          filter: "blur(80px)",
          animation: "pulse-glow 10s ease-in-out infinite 3s",
        }}
      />
      <div
        className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(26,58,219,0.30) 0%, transparent 70%)",
          filter: "blur(80px)",
          animation: "pulse-glow 12s ease-in-out infinite 6s",
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Headline */}
        <div className="text-center mb-16">
          {/* Pill badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-7"
            style={{
              background: "var(--glass-bg-subtle)",
              border: "1px solid var(--glass-border)",
              color: "var(--text-muted)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background:
                  "linear-gradient(135deg, var(--scarlet), var(--purple))",
              }}
            />
            Digital Ecosystem for Everyone
          </div>

          <h1
            className="text-4xl sm:text-5xl lg:text-7xl font-extrabold mb-6 leading-[1.05] tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Empowering Lives.{" "}
            <span
              style={{
                background:
                  "linear-gradient(90deg, var(--purple-light), var(--scarlet-light), var(--blue-light))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Creating Opportunities.
            </span>
            <br />
            <span style={{ color: "var(--text-secondary)" }}>
              Transforming Communities.
            </span>
          </h1>

          <p
            className="text-base sm:text-lg max-w-2xl mx-auto font-light leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            A digital ecosystem connecting counseling, remote work, community
            development, and commerce across Africa and the World.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-9">
            <Link
              href="/register"
              className="px-8 py-3.5 rounded-2xl text-white font-bold text-sm transition-all duration-200 hover:scale-105 hover:-translate-y-0.5"
              style={{
                background:
                  "linear-gradient(135deg, var(--purple), var(--blue))",
                boxShadow: "var(--btn-primary-shadow)",
              }}
            >
              Get Started Free
            </Link>
            <Link
              href="/counselors"
              className="px-8 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 hover:scale-105"
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
                color: "var(--text-secondary)",
                backdropFilter: "blur(12px)",
              }}
            >
              Explore Platform
            </Link>
          </div>
        </div>

        {/* 4 Hero Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {heroCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.id}
                href={card.href}
                className="group relative rounded-2xl overflow-hidden block transition-all duration-300 hover:-translate-y-2"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {/* Gradient BG */}
                <div
                  className="absolute inset-0"
                  style={{ background: card.gradient }}
                />

                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at 50% 0%, ${card.glowColor} 0%, transparent 65%)`,
                  }}
                />

                {/* Glass shimmer overlay */}
                <div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    border: "1px solid rgba(255,255,255,0.20)",
                    background:
                      "linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 100%)",
                  }}
                />

                {/* Content */}
                <div className="relative z-10 p-6 flex flex-col min-h-[230px]">
                  <div className="flex justify-between items-start mb-5">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{
                        background: "rgba(255,255,255,0.18)",
                        border: "1px solid rgba(255,255,255,0.28)",
                        backdropFilter: "blur(8px)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      }}
                    >
                      <Icon size={20} className="text-white" />
                    </div>
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full text-white/90"
                      style={{
                        background: "rgba(255,255,255,0.16)",
                        border: "1px solid rgba(255,255,255,0.22)",
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2 leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-sm text-white/60 leading-relaxed flex-1 font-light">
                    {card.description}
                  </p>

                  <div className="mt-4 flex items-center gap-1.5 text-white/75 text-xs font-semibold group-hover:gap-3 transition-all duration-200">
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

      <style jsx>{`
        @keyframes pulse-glow {
          0%,
          100% {
            opacity: 0.7;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.08);
          }
        }
      `}</style>
    </section>
  );
}
