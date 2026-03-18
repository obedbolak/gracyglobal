"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight, Users, MapPin } from "lucide-react";
import { SYSTEMS } from "@/data/community";

// ─── Slide data pulled from systems ──────────────────────────────────────────
const SLIDES = SYSTEMS.map((s) => ({
  ...s,
  headline: {
    "human-flourishing":    { title: "Heal. Grow. Thrive.", sub: "A safe space for emotional wellness, family strength, and mental health transformation." },
    "knowledge-skills":     { title: "Learn. Build. Lead.", sub: "Access world-class digital skills, AI literacy, and entrepreneurship training for Africa's future." },
    "economic-empowerment": { title: "Earn. Build. Own.", sub: "Join cooperatives, launch startups, and create community economies that last generations." },
    "civic-leadership":     { title: "Rise. Lead. Serve.", sub: "Train ethical leaders, shape governance, and build communities aligned with global standards." },
    "media-narrative":      { title: "Speak. Create. Influence.", sub: "Shape Africa's story through podcasts, youth media, and powerful community narratives." },
    "creativity-culture":   { title: "Create. Express. Inspire.", sub: "Celebrate African identity through music, digital art, and cultural innovation." },
    "technology-intelligence": { title: "Code. Build. Transform.", sub: "Harness AI, build digital platforms, and power community transformation with technology." },
  }[s.id] ?? { title: s.label, sub: s.description },
}));

// Stats per system
const STATS: Record<string, { members: string; projects: string; countries: string }> = {
  "human-flourishing":    { members: "240+", projects: "8",  countries: "12" },
  "knowledge-skills":     { members: "180+", projects: "11", countries: "18" },
  "economic-empowerment": { members: "320+", projects: "14", countries: "22" },
  "civic-leadership":     { members: "95+",  projects: "6",  countries: "10" },
  "media-narrative":      { members: "140+", projects: "9",  countries: "15" },
  "creativity-culture":   { members: "210+", projects: "12", countries: "20" },
  "technology-intelligence": { members: "160+", projects: "7", countries: "16" },
};

export default function CommunityHero({ onJoin }: { onJoin?: () => void }) {
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);

  const go = useCallback((next: number, direction: number) => {
    setDir(direction);
    setActive((next + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => go(active + 1, 1), 5000);
    return () => clearInterval(t);
  }, [active, paused, go]);

  const slide = SLIDES[active];
  const stats = STATS[slide.id];

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ minHeight: "100vh" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background gradient per system */}
      <AnimatePresence mode="sync">
        <motion.div key={slide.id + "-bg"} className="absolute inset-0"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          style={{ background: slide.gradient, opacity: 0.92 }} />
      </AnimatePresence>

      {/* Glow blobs */}
      <AnimatePresence mode="sync">
        <motion.div key={slide.id + "-glow"}
          className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full pointer-events-none"
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }} transition={{ duration: 0.9 }}
          style={{ background: `radial-gradient(circle, ${slide.glow} 0%, transparent 65%)`, filter: "blur(80px)" }} />
        <motion.div key={slide.id + "-glow2"}
          className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.9, delay: 0.15 }}
          style={{ background: `radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 65%)`, filter: "blur(60px)" }} />
      </AnimatePresence>

      {/* Glass shimmer */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.08) 0%, transparent 60%)" }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between min-h-screen px-4 sm:px-6 lg:px-8 py-24">

        {/* System pills — top */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {SLIDES.map((s, i) => (
            <button key={s.id} onClick={() => go(i, i > active ? 1 : -1)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
              style={i === active ? {
                background: "rgba(255,255,255,0.22)",
                border: "1px solid rgba(255,255,255,0.35)",
                color: "#fff",
                boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
              } : {
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.6)",
              }}>
              {s.icon}
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Main headline */}
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div key={slide.id}
                custom={dir}
                initial={{ y: dir > 0 ? 40 : -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: dir > 0 ? -40 : 40, opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}>

                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-8"
                  style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.85)" }}>
                  {slide.icon} {slide.label}
                </div>

                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.05] mb-6">
                  {slide.headline.title}
                </h1>
                <p className="text-lg sm:text-xl text-white/65 font-light max-w-2xl mx-auto mb-10 leading-relaxed">
                  {slide.headline.sub}
                </p>

                {/* Stats row */}
                <div className="flex flex-wrap items-center justify-center gap-6 mb-10">
                  {[
                    { icon: Users, value: stats.members, label: "Members" },
                    { icon: ArrowRight, value: stats.projects, label: "Projects" },
                    { icon: MapPin, value: stats.countries, label: "Countries" },
                  ].map(({ icon: Icon, value, label }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: "rgba(255,255,255,0.15)" }}>
                        <Icon size={14} className="text-white" />
                      </div>
                      <div>
                        <div className="text-lg font-extrabold text-white leading-none">{value}</div>
                        <div className="text-[11px] text-white/50">{label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <button onClick={onJoin}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 group"
                    style={{ background: "rgba(255,255,255,0.95)", color: "#1a0533", boxShadow: "0 4px 20px rgba(0,0,0,0.25)" }}>
                    Join This System
                    <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
                  </button>
                  <button
                    onClick={() => document.getElementById('community-hub')?.scrollIntoView({ behavior: 'smooth' })}
                    className="px-8 py-3.5 rounded-2xl text-sm font-bold text-white transition-all duration-200 hover:scale-105"
                    style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", backdropFilter: "blur(10px)" }}>
                    View All Community
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom nav */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button onClick={() => go(active - 1, -1)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.22)" }}>
            <ChevronLeft size={18} className="text-white" />
          </button>

          {/* Dot indicators */}
          <div className="flex items-center gap-2">
            {SLIDES.map((s, i) => (
              <button key={s.id} onClick={() => go(i, i > active ? 1 : -1)}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: i === active ? "28px" : "8px",
                  height: "8px",
                  background: i === active ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.3)",
                }} />
            ))}
          </div>

          <button onClick={() => go(active + 1, 1)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.22)" }}>
            <ChevronRight size={18} className="text-white" />
          </button>

          <span className="text-xs text-white/35 font-mono ml-2">
            {String(active + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      {!paused && (
        <motion.div key={slide.id + "-progress"}
          className="absolute bottom-0 left-0 h-1"
          style={{ background: "rgba(255,255,255,0.6)" }}
          initial={{ width: "0%" }} animate={{ width: "100%" }}
          transition={{ duration: 5, ease: "linear" }} />
      )}
    </section>
  );
}
