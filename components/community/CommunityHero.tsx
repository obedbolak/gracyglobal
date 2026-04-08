"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Users,
  MapPin,
} from "lucide-react";
import { SYSTEMS } from "@/data/community";

// ─── Slide headlines per sector ───────────────────────────────────────────────

const HEADLINES: Record<string, { title: string; sub: string }> = {
  "health-environment": {
    title: "Heal. Sustain. Thrive.",
    sub: "A community driving health initiatives and environmental sustainability across Africa.",
  },
  "education-knowledge": {
    title: "Learn. Build. Lead.",
    sub: "Access world-class digital skills, AI literacy, and entrepreneurship training for Africa's future.",
  },
  "governance-law": {
    title: "Rise. Lead. Serve.",
    sub: "Train ethical leaders, shape governance, and build communities aligned with global standards.",
  },
  "economic-empowerment": {
    title: "Earn. Build. Own.",
    sub: "Join cooperatives, launch startups, and create community economies that last generations.",
  },
  "youth-empowerment": {
    title: "Dream. Act. Inspire.",
    sub: "Empowering the next generation with mentorship, skills, and the tools to lead change.",
  },
  "women-empowerment": {
    title: "Rise. Lead. Transform.",
    sub: "Safe spaces, equal opportunities, and a global sisterhood driving women's advancement.",
  },
};

const SLIDES = SYSTEMS.map((s) => ({
  ...s,
  headline: HEADLINES[s.id] ?? { title: s.label, sub: s.description },
}));

// ─── Component ────────────────────────────────────────────────────────────────

export default function CommunityHero({
  onJoin,
  stats,
  joining,
}: {
  onJoin?: (slug: string, name: string) => void;
  joining?: boolean;
  stats?: {
    members: number;
    posts: number;
    countries: number;
    communities: number;
  };
}) {
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  // Track which images have loaded so we can fade them in
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  const go = useCallback((next: number, direction: number) => {
    setDir(direction);
    setActive((next + SLIDES.length) % SLIDES.length);
  }, []);

  // Auto-advance
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => go(active + 1, 1), 5000);
    return () => clearInterval(t);
  }, [active, paused, go]);

  // Preload all images on mount
  useEffect(() => {
    SLIDES.forEach((slide) => {
      const img = new Image();
      img.src = slide.image;
      img.onload = () =>
        setLoadedImages((prev) => ({ ...prev, [slide.id]: true }));
    });
  }, []);

  const slide = SLIDES[active];

  const displayStats = stats
    ? {
        members: stats.members.toLocaleString() + "+",
        posts: stats.posts.toLocaleString() + "+",
        countries: stats.countries.toLocaleString() + "+",
      }
    : { members: "1,000+", posts: "500+", countries: "20+" };

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ minHeight: "100vh" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Background images (one per slide, crossfade) ── */}
      {SLIDES.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === active ? 1 : 0 }}
          aria-hidden="true"
        >
          {/* Actual image */}
          <img
            src={s.image}
            alt={s.imageAlt}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              opacity: loadedImages[s.id] ? 1 : 0,
              transition: "opacity 0.5s ease",
            }}
          />

          {/* Dark base so text is always readable */}
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.45)" }}
          />

          {/* Sector-coloured gradient overlay (replaces the old pure gradient) */}
          <div
            className="absolute inset-0"
            style={{
              background: s.gradient,
              opacity: 0.55,
              mixBlendMode: "multiply",
            }}
          />

          {/* Glow blob — top-left */}
          <div
            className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${s.glow} 0%, transparent 65%)`,
              filter: "blur(80px)",
            }}
          />

          {/* Subtle glass shimmer */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.06) 0%, transparent 60%)",
            }}
          />
        </div>
      ))}

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col justify-between min-h-screen px-4 sm:px-6 lg:px-8 py-24">
        {/* Sector pills — top */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => go(i, i > active ? 1 : -1)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
              style={
                i === active
                  ? {
                      background: "rgba(255,255,255,0.22)",
                      border: "1px solid rgba(255,255,255,0.35)",
                      color: "#fff",
                      boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
                    }
                  : {
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "rgba(255,255,255,0.6)",
                    }
              }
            >
              {s.icon}
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Main headline */}
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={slide.id}
                custom={dir}
                initial={{ y: dir > 0 ? 40 : -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: dir > 0 ? -40 : 40, opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
              >
                {/* Sector badge */}
                <div
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-8"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    color: "rgba(255,255,255,0.9)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {slide.icon} {slide.label}
                </div>

                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.05] mb-6 drop-shadow-lg">
                  {slide.headline.title}
                </h1>

                <p className="text-lg sm:text-xl text-white/70 font-light max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow">
                  {slide.headline.sub}
                </p>

                {/* Stats row */}
                <div className="flex flex-wrap items-center justify-center gap-6 mb-10">
                  {[
                    {
                      icon: Users,
                      value: displayStats.members,
                      label: "Members",
                    },
                    {
                      icon: ArrowRight,
                      value: displayStats.posts,
                      label: "Posts",
                    },
                    {
                      icon: MapPin,
                      value: displayStats.countries,
                      label: "Countries",
                    },
                  ].map(({ icon: Icon, value, label }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                          background: "rgba(255,255,255,0.15)",
                          backdropFilter: "blur(6px)",
                        }}
                      >
                        <Icon size={14} className="text-white" />
                      </div>
                      <div>
                        <div className="text-lg font-extrabold text-white leading-none drop-shadow">
                          {value}
                        </div>
                        <div className="text-[11px] text-white/50">{label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <button
                    onClick={() => onJoin?.(slide.slug, slide.headline.title)}
                    disabled={joining}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold text-white transition-all duration-200 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{
                      background: slide.gradient,
                      boxShadow: `0 8px 24px ${slide.glow}`,
                    }}
                  >
                    {joining ? "Joining…" : "Join This Community"}
                    <ArrowRight size={15} />
                  </button>

                  <button
                    onClick={() =>
                      document
                        .getElementById("community-hub")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="px-8 py-3.5 rounded-2xl text-sm font-bold text-white transition-all duration-200 hover:scale-105"
                    style={{
                      background: "rgba(255,255,255,0.12)",
                      border: "1px solid rgba(255,255,255,0.25)",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    Explore All Communities
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom nav */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => go(active - 1, -1)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.22)",
              backdropFilter: "blur(6px)",
            }}
          >
            <ChevronLeft size={18} className="text-white" />
          </button>

          {/* Dot indicators */}
          <div className="flex items-center gap-2">
            {SLIDES.map((s, i) => (
              <button
                key={s.id}
                onClick={() => go(i, i > active ? 1 : -1)}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: i === active ? "28px" : "8px",
                  height: "8px",
                  background:
                    i === active
                      ? "rgba(255,255,255,0.95)"
                      : "rgba(255,255,255,0.3)",
                }}
              />
            ))}
          </div>

          <button
            onClick={() => go(active + 1, 1)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.22)",
              backdropFilter: "blur(6px)",
            }}
          >
            <ChevronRight size={18} className="text-white" />
          </button>

          <span className="text-xs text-white/35 font-mono ml-2">
            {String(active + 1).padStart(2, "0")} /{" "}
            {String(SLIDES.length).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      {!paused && (
        <motion.div
          key={slide.id + "-progress"}
          className="absolute bottom-0 left-0 h-1"
          style={{ background: "rgba(255,255,255,0.6)" }}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 5, ease: "linear" }}
        />
      )}
    </section>
  );
}
