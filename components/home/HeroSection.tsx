"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Briefcase,
  Globe,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Star,
  ArrowRight,
  ShoppingCart,
  Users,
  BookOpen,
  MapPin,
  Clock,
  Zap,
} from "lucide-react";
import { useCounselors } from "@/hooks/useCounselors";
import { useCourses } from "@/hooks/useCourses";
import { useFeaturedProducts } from "@/hooks/UseProducts";
import { useCommunities } from "@/hooks/useCommunity";
import { useJobs } from "@/hooks/useJobs";

const slides = [
  {
    id: "counselors",
    icon: MessageCircle,
    label: "Counseling",
    title: "Talk to a Counselor",
    subtitle: "Professional support, whenever you need it.",
    description:
      "Connect with certified mental health professionals, relationship coaches, and life counselors. 1-on-1 sessions via text or video — private, affordable, and available now.",
    href: "/counselors",
    cta: "Book a Session",
    gradient: "linear-gradient(135deg, var(--purple), var(--blue))",
    glowA: "rgba(123,47,190,0.35)",
    glowB: "rgba(26,58,219,0.25)",
    badge: "1,000+ Sessions",
    stats: [
      { label: "Active Counselors", value: "120+" },
      { label: "Sessions Done", value: "1,000+" },
      { label: "Avg. Rating", value: "4.8 ★" },
    ],
    preview: "counselors",
  },
  {
    id: "jobs",
    icon: Briefcase,
    label: "Remote Jobs",
    title: "Find Remote Jobs",
    subtitle: "Work from anywhere, earn globally.",
    description:
      "Browse 500+ vetted remote opportunities from top global companies. Full-time, freelance, and contract roles across tech, design, marketing and more.",
    href: "/jobs",
    cta: "Browse Jobs",
    gradient: "linear-gradient(135deg, var(--scarlet), var(--purple))",
    glowA: "rgba(220,20,60,0.35)",
    glowB: "rgba(123,47,190,0.25)",
    badge: "500+ Jobs",
    stats: [
      { label: "Open Positions", value: "500+" },
      { label: "Companies", value: "80+" },
      { label: "Avg. Salary", value: "CFA 350k" },
    ],
    preview: "jobs",
  },
  {
    id: "community",
    icon: Globe,
    label: "Community",
    title: "My Nation & I",
    subtitle: "Building stronger communities together.",
    description:
      "Join youth empowerment programs, women's initiatives and community development projects. Volunteer, lead, and create impact where it matters most.",
    href: "/community",
    cta: "Join a Project",
    gradient: "linear-gradient(135deg, var(--blue), var(--purple))",
    glowA: "rgba(26,58,219,0.35)",
    glowB: "rgba(123,47,190,0.25)",
    badge: "50+ Projects",
    stats: [
      { label: "Active Projects", value: "50+" },
      { label: "Volunteers", value: "800+" },
      { label: "Communities", value: "20+" },
    ],
    preview: "community",
  },
  {
    id: "marketplace",
    icon: ShoppingBag,
    label: "Marketplace",
    title: "Gracy Marketplace",
    subtitle: "Shop African. Earn together.",
    description:
      "Discover curated wellness, beauty and skincare products from African entrepreneurs. Every purchase supports local businesses and communities.",
    href: "/marketplace",
    cta: "Shop Now",
    gradient: "linear-gradient(135deg, var(--purple), var(--blue))",
    glowA: "rgba(123,47,190,0.35)",
    glowB: "rgba(26,58,219,0.2)",
    badge: "10+ Products",
    stats: [
      { label: "Products", value: "10+" },
      { label: "Sellers", value: "15+" },
      { label: "Orders Done", value: "200+" },
    ],
    preview: "marketplace",
  },
];

type ShowcaseMode = "products" | "communities" | "jobs" | "courses";
const SHOWCASE_CYCLE: ShowcaseMode[] = [
  "products",
  "communities",
  "jobs",
  "courses",
];
const SHOWCASE_INTERVAL = 10 * 60 * 1000;

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl ${className}`}
      style={{ background: "var(--glass-bg-subtle)" }}
    />
  );
}

// ─── SHOWCASE: Products ────────────────────────────────────────────────────────

function ProductsShowcase({
  products,
  loading,
}: {
  products: any[];
  loading: boolean;
}) {
  const [cardIdx, setCardIdx] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);
  const items = products.slice(0, 8);

  const prevCard = () => {
    setCardIdx((i) => (i - 1 + items.length) % items.length);
    setImgIdx(0);
  };
  const nextCard = () => {
    setCardIdx((i) => (i + 1) % items.length);
    setImgIdx(0);
  };
  const visible = [items[cardIdx], items[(cardIdx + 1) % items.length]].filter(
    Boolean,
  );

  if (loading)
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 mb-3">
          <ShoppingCart size={13} style={{ color: "var(--text-on-glass)" }} />
          <span
            className="text-[11px] font-bold uppercase tracking-widest"
            style={{ color: "var(--text-on-glass)" }}
          >
            Featured Products
          </span>
        </div>
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid var(--glass-border)" }}
        >
          <Skeleton className="h-48 w-full rounded-none" />
          <div
            className="p-4 space-y-2"
            style={{ background: "var(--glass-bg)" }}
          >
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-7 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );

  if (!items.length) return null;

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <ShoppingCart size={13} style={{ color: "var(--text-on-glass)" }} />
        <span
          className="text-[11px] font-bold uppercase tracking-widest"
          style={{ color: "var(--text-on-glass)" }}
        >
          Featured Products
        </span>
        <span
          className="ml-auto text-[10px]"
          style={{ color: "var(--text-on-glass)", opacity: 0.5 }}
        >
          {cardIdx + 1} / {items.length}
        </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-2.5">
        {visible.map((p, vi) => {
          const imgs: string[] = p.images?.length
            ? p.images
            : [
                "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&q=80",
              ];
          const curImg = vi === 0 ? imgIdx : 0;
          return (
            <motion.div
              key={p.id ?? vi}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl overflow-hidden"
              style={{ border: "1px solid var(--glass-border)" }}
            >
              <div className="relative h-44 overflow-hidden group">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={curImg}
                    src={imgs[curImg]}
                    alt={p.name}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  />
                </AnimatePresence>
                {p.category?.name && (
                  <div
                    className="absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(123,47,190,0.85)",
                      color: "#fff",
                    }}
                  >
                    {p.category.icon ? `${p.category.icon} ` : ""}
                    {p.category.name}
                  </div>
                )}
                {vi === 0 && imgs.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setImgIdx((n) => (n - 1 + imgs.length) % imgs.length)
                      }
                      className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: "rgba(0,0,0,0.45)" }}
                    >
                      <ChevronLeft size={13} color="#fff" />
                    </button>
                    <button
                      onClick={() => setImgIdx((n) => (n + 1) % imgs.length)}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: "rgba(0,0,0,0.45)" }}
                    >
                      <ChevronRight size={13} color="#fff" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {imgs.map((_, s) => (
                        <button
                          key={s}
                          onClick={() => setImgIdx(s)}
                          style={{
                            width: s === curImg ? 14 : 5,
                            height: 5,
                            borderRadius: 99,
                            background:
                              s === curImg ? "#fff" : "rgba(255,255,255,0.5)",
                            transition: "all 0.2s",
                          }}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="p-3" style={{ background: "var(--glass-bg)" }}>
                <p
                  className="text-[12px] font-bold truncate mb-1"
                  style={{ color: "var(--text-on-glass)" }}
                >
                  {p.name}
                </p>
                {p.rating > 0 && (
                  <div className="flex items-center gap-0.5 mb-1.5">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star
                        key={s}
                        size={9}
                        className={
                          s < Math.round(p.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    ))}
                    <span
                      className="text-[9px] ml-1"
                      style={{ color: "var(--text-on-glass)", opacity: 0.6 }}
                    >
                      {p.rating}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span
                    className="text-[13px] font-extrabold"
                    style={{ color: "var(--scarlet, #dc143c)" }}
                  >
                    CFA {(p.price ?? 0).toLocaleString()}
                  </span>
                  <button
                    className="px-3 py-1 rounded-lg text-[10px] font-bold"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--purple), var(--scarlet))",
                      color: "#fff",
                    }}
                  >
                    View
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {items.length > 1 && (
        <div className="flex items-center justify-center gap-3 mt-3">
          <button
            onClick={prevCard}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
            }}
          >
            <ChevronLeft size={13} className="text-[var(--text-on-glass)]" />
          </button>
          <div className="flex gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setCardIdx(i);
                  setImgIdx(0);
                }}
                style={{
                  width: i === cardIdx ? 18 : 6,
                  height: 6,
                  borderRadius: 99,
                  background:
                    i === cardIdx
                      ? "var(--accent-primary)"
                      : "var(--glass-border)",
                  transition: "all 0.25s",
                }}
              />
            ))}
          </div>
          <button
            onClick={nextCard}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
            }}
          >
            <ChevronRight size={13} className="text-[var(--text-on-glass)]" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── SHOWCASE: Communities ─────────────────────────────────────────────────────

function CommunitiesShowcase({
  communities,
  loading,
}: {
  communities: any[];
  loading: boolean;
}) {
  const [idx, setIdx] = useState(0);
  const items = communities.slice(0, 8);
  const visible = [items[idx], items[(idx + 1) % items.length]].filter(Boolean);

  if (loading)
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 mb-3">
          <Users size={13} style={{ color: "var(--text-on-glass)" }} />
          <span
            className="text-[11px] font-bold uppercase tracking-widest"
            style={{ color: "var(--text-on-glass)" }}
          >
            Active Communities
          </span>
        </div>
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid var(--glass-border)" }}
        >
          <Skeleton className="h-40 w-full rounded-none" />
          <div
            className="p-4 space-y-2"
            style={{ background: "var(--glass-bg)" }}
          >
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-2.5 w-full" />
            <Skeleton className="h-2.5 w-3/4" />
          </div>
        </div>
      </div>
    );

  if (!items.length) return null;

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <Users size={13} style={{ color: "var(--text-on-glass)" }} />
        <span
          className="text-[11px] font-bold uppercase tracking-widest"
          style={{ color: "var(--text-on-glass)" }}
        >
          Active Communities
        </span>
        <span
          className="ml-auto text-[10px]"
          style={{ color: "var(--text-on-glass)", opacity: 0.5 }}
        >
          {idx + 1} / {items.length}
        </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-2.5">
        {visible.map((c, vi) => (
          <motion.div
            key={c.id ?? vi}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl overflow-hidden cursor-pointer"
            style={{ border: "1px solid var(--glass-border)" }}
          >
            <div className="relative h-36 overflow-hidden">
              {c.image ? (
                <img
                  src={c.image}
                  alt={c.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--purple), var(--blue))",
                  }}
                />
              )}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.65), transparent)",
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-[13px] font-bold text-white truncate">
                  {c.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-white/70">
                    {c.memberCount ?? 0} members
                  </span>
                  <span
                    className="text-[9px] px-2 py-0.5 rounded-full font-semibold"
                    style={{
                      background: "rgba(123,47,190,0.75)",
                      color: "#fff",
                    }}
                  >
                    {c.category}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-3" style={{ background: "var(--glass-bg)" }}>
              <p
                className="text-[10px] line-clamp-2 leading-relaxed mb-2"
                style={{ color: "var(--text-on-glass)", opacity: 0.75 }}
              >
                {c.description}
              </p>
              <div className="flex items-center justify-between">
                <span
                  className="text-[9px]"
                  style={{ color: "var(--text-on-glass)", opacity: 0.55 }}
                >
                  {c.postCount ?? 0} posts
                </span>
                <button
                  className="px-3 py-1 rounded-lg text-[10px] font-bold"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--purple), var(--blue))",
                    color: "#fff",
                  }}
                >
                  Join
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {items.length > 1 && (
        <div className="flex items-center justify-center gap-3 mt-3">
          <button
            onClick={() => setIdx((i) => (i - 1 + items.length) % items.length)}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
            }}
          >
            <ChevronLeft size={13} className="text-[var(--text-on-glass)]" />
          </button>
          <div className="flex gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                style={{
                  width: i === idx ? 18 : 6,
                  height: 6,
                  borderRadius: 99,
                  background:
                    i === idx ? "var(--accent-primary)" : "var(--glass-border)",
                  transition: "all 0.25s",
                }}
              />
            ))}
          </div>
          <button
            onClick={() => setIdx((i) => (i + 1) % items.length)}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
            }}
          >
            <ChevronRight size={13} className="text-[var(--text-on-glass)]" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── SHOWCASE: Jobs ────────────────────────────────────────────────────────────

function JobsShowcase({ jobs, loading }: { jobs: any[]; loading: boolean }) {
  const [idx, setIdx] = useState(0);
  const items = jobs.slice(0, 8);
  const visible = [items[idx], items[(idx + 1) % items.length]].filter(Boolean);

  const categoryColors: Record<string, string> = {
    TECH: "rgba(26,58,219,0.15)",
    DESIGN: "rgba(123,47,190,0.15)",
    MARKETING: "rgba(220,20,60,0.15)",
    FINANCE: "rgba(16,185,129,0.15)",
    EDUCATION: "rgba(245,158,11,0.15)",
    HEALTH: "rgba(239,68,68,0.15)",
    OTHER: "rgba(107,114,128,0.15)",
  };

  if (loading)
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 mb-3">
          <Briefcase size={13} style={{ color: "var(--text-on-glass)" }} />
          <span
            className="text-[11px] font-bold uppercase tracking-widest"
            style={{ color: "var(--text-on-glass)" }}
          >
            Latest Remote Jobs
          </span>
        </div>
        <div
          className="rounded-2xl p-4 space-y-3"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-2.5 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-2 w-3/4" />
        </div>
      </div>
    );

  if (!items.length) return null;

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <Briefcase size={13} style={{ color: "var(--text-on-glass)" }} />
        <span
          className="text-[11px] font-bold uppercase tracking-widest"
          style={{ color: "var(--text-on-glass)" }}
        >
          Latest Remote Jobs
        </span>
        <span
          className="ml-auto text-[10px]"
          style={{ color: "var(--text-on-glass)", opacity: 0.5 }}
        >
          {idx + 1} / {items.length}
        </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-2.5">
        {visible.map((job, vi) => (
          <motion.div
            key={job.id ?? vi}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.01]"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
            }}
          >
            <div className="flex items-start gap-3 mb-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0 overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, var(--purple), var(--scarlet))",
                }}
              >
                {job.companyLogo ? (
                  <img
                    src={job.companyLogo}
                    alt={job.company}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  job.company?.[0]?.toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-[13px] font-bold truncate"
                  style={{ color: "var(--text-on-glass)" }}
                >
                  {job.title}
                </p>
                <p
                  className="text-[11px] truncate"
                  style={{ color: "var(--text-on-glass)", opacity: 0.7 }}
                >
                  {job.company}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  background:
                    categoryColors[job.category] ?? categoryColors.OTHER,
                  color: "var(--text-on-glass)",
                }}
              >
                {job.type?.replace("_", " ")}
              </span>
              {job.location && (
                <span
                  className="flex items-center gap-0.5 text-[9px]"
                  style={{ color: "var(--text-on-glass)", opacity: 0.65 }}
                >
                  <MapPin size={8} /> {job.location}
                </span>
              )}
              {job.salary && (
                <span
                  className="text-[9px] font-bold ml-auto"
                  style={{ color: "var(--scarlet, #dc143c)" }}
                >
                  {job.salary}
                </span>
              )}
            </div>
            {job.description && (
              <p
                className="text-[10px] line-clamp-2 leading-relaxed mb-3"
                style={{ color: "var(--text-on-glass)", opacity: 0.6 }}
              >
                {job.description}
              </p>
            )}
            <button
              className="w-full py-1.5 rounded-xl text-[10px] font-bold"
              style={{
                background:
                  "linear-gradient(135deg, var(--purple), var(--scarlet))",
                color: "#fff",
              }}
            >
              Apply now
            </button>
          </motion.div>
        ))}
      </div>

      {items.length > 1 && (
        <div className="flex items-center justify-center gap-3 mt-3">
          <button
            onClick={() => setIdx((i) => (i - 1 + items.length) % items.length)}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
            }}
          >
            <ChevronLeft size={13} className="text-[var(--text-on-glass)]" />
          </button>
          <div className="flex gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                style={{
                  width: i === idx ? 18 : 6,
                  height: 6,
                  borderRadius: 99,
                  background:
                    i === idx ? "var(--accent-primary)" : "var(--glass-border)",
                  transition: "all 0.25s",
                }}
              />
            ))}
          </div>
          <button
            onClick={() => setIdx((i) => (i + 1) % items.length)}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
            }}
          >
            <ChevronRight size={13} className="text-[var(--text-on-glass)]" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── SHOWCASE: Courses ─────────────────────────────────────────────────────────

function CoursesShowcase({
  courses,
  loading,
}: {
  courses: any[];
  loading: boolean;
}) {
  const [idx, setIdx] = useState(0);
  const items = courses.slice(0, 8);
  const visible = [items[idx], items[(idx + 1) % items.length]].filter(Boolean);

  const levelColor: Record<string, string> = {
    BEGINNER: "rgba(16,185,129,0.2)",
    INTERMEDIATE: "rgba(245,158,11,0.2)",
    ADVANCED: "rgba(220,20,60,0.2)",
  };

  if (loading)
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={13} style={{ color: "var(--text-on-glass)" }} />
          <span
            className="text-[11px] font-bold uppercase tracking-widest"
            style={{ color: "var(--text-on-glass)" }}
          >
            E-Learning Courses
          </span>
        </div>
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid var(--glass-border)" }}
        >
          <Skeleton className="h-44 w-full rounded-none" />
          <div
            className="p-3 space-y-2"
            style={{ background: "var(--glass-bg)" }}
          >
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-2.5 w-1/2" />
          </div>
        </div>
      </div>
    );

  if (!items.length) return null;

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen size={13} style={{ color: "var(--text-on-glass)" }} />
        <span
          className="text-[11px] font-bold uppercase tracking-widest"
          style={{ color: "var(--text-on-glass)" }}
        >
          E-Learning Courses
        </span>
        <span
          className="ml-auto text-[10px]"
          style={{ color: "var(--text-on-glass)", opacity: 0.5 }}
        >
          {idx + 1} / {items.length}
        </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-2.5">
        {visible.map((course, vi) => {
          const totalLessons =
            course.sections?.reduce(
              (acc: number, s: any) => acc + (s.lessons?.length ?? 0),
              0,
            ) ?? 0;
          return (
            <motion.div
              key={course.id ?? vi}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl overflow-hidden cursor-pointer group"
              style={{ border: "1px solid var(--glass-border)" }}
            >
              <div className="h-44 relative overflow-hidden">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--purple), var(--blue))",
                    }}
                  >
                    <BookOpen size={32} color="rgba(255,255,255,0.4)" />
                  </div>
                )}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.55), transparent)",
                  }}
                />
                {course.level && (
                  <span
                    className="absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{
                      background:
                        levelColor[course.level] ?? levelColor.BEGINNER,
                      color: "#fff",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    {course.level}
                  </span>
                )}
                {course.featured && (
                  <span
                    className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
                    style={{
                      background: "rgba(245,158,11,0.9)",
                      color: "#fff",
                    }}
                  >
                    <Zap size={7} /> Featured
                  </span>
                )}
              </div>
              <div className="p-3" style={{ background: "var(--glass-bg)" }}>
                <p
                  className="text-[12px] font-bold line-clamp-2 leading-tight mb-2"
                  style={{ color: "var(--text-on-glass)" }}
                >
                  {course.title}
                </p>
                <div className="flex items-center justify-between">
                  {totalLessons > 0 && (
                    <span
                      className="flex items-center gap-1 text-[10px]"
                      style={{ color: "var(--text-on-glass)", opacity: 0.65 }}
                    >
                      <Clock size={9} /> {totalLessons} lessons
                    </span>
                  )}
                  <span
                    className="text-[12px] font-extrabold ml-auto"
                    style={{ color: "var(--scarlet, #dc143c)" }}
                  >
                    {course.price === 0
                      ? "Free"
                      : `CFA ${(course.price ?? 0).toLocaleString()}`}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {items.length > 1 && (
        <div className="flex items-center justify-center gap-3 mt-3">
          <button
            onClick={() => setIdx((i) => (i - 1 + items.length) % items.length)}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
            }}
          >
            <ChevronLeft size={13} className="text-[var(--text-on-glass)]" />
          </button>
          <div className="flex gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                style={{
                  width: i === idx ? 18 : 6,
                  height: 6,
                  borderRadius: 99,
                  background:
                    i === idx ? "var(--accent-primary)" : "var(--glass-border)",
                  transition: "all 0.25s",
                }}
              />
            ))}
          </div>
          <button
            onClick={() => setIdx((i) => (i + 1) % items.length)}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
            }}
          >
            <ChevronRight size={13} className="text-[var(--text-on-glass)]" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Stories Strip ─────────────────────────────────────────────────────────────

const STORY_DURATION = 5000; // ms per section

type StorySection = "products" | "jobs" | "communities" | "courses";
const STORY_SECTIONS: StorySection[] = [
  "products",
  "jobs",
  "communities",
  "courses",
];

const STORY_META: Record<
  StorySection,
  { label: string; icon: React.ReactNode; color: string }
> = {
  products: {
    label: "Products",
    icon: <ShoppingCart size={11} />,
    color: "var(--purple, #7b2fbe)",
  },
  jobs: {
    label: "Jobs",
    icon: <Briefcase size={11} />,
    color: "var(--scarlet, #dc143c)",
  },
  communities: {
    label: "Community",
    icon: <Users size={11} />,
    color: "var(--blue, #1a3adb)",
  },
  courses: { label: "Courses", icon: <BookOpen size={11} />, color: "#f59e0b" },
};

function StoriesStrip({
  products,
  jobs,
  communities,
  courses,
}: {
  products: any[];
  jobs: any[];
  communities: any[];
  courses: any[];
}) {
  const [active, setActive] = useState<StorySection>("products");
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  const goTo = useCallback((section: StorySection) => {
    setActive(section);
    setProgress(0);
  }, []);

  const goNext = useCallback(() => {
    setActive((prev) => {
      const idx = STORY_SECTIONS.indexOf(prev);
      const next = STORY_SECTIONS[(idx + 1) % STORY_SECTIONS.length];
      return next;
    });
    setProgress(0);
  }, []);

  // Progress ticker
  useEffect(() => {
    if (paused) return;
    const tick = 50;
    progressRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) return 0;
        return p + (tick / STORY_DURATION) * 100;
      });
    }, tick);
    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [paused, active]);

  // Auto-advance
  useEffect(() => {
    if (paused) return;
    intervalRef.current = setInterval(goNext, STORY_DURATION);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused, active, goNext]);

  const renderCards = (section: StorySection) => {
    if (section === "products") {
      return products.slice(0, 6).map((p, i) => (
        <Link
          href={`/marketplace/${p.id}`}
          key={`sp-${i}`}
          className="flex-shrink-0 w-[400px] rounded-2xl overflow-hidden transition-transform hover:scale-[1.02]"
          style={{
            border: "1px solid var(--glass-border)",
            background: "var(--glass-bg)",
          }}
        >
          <div className="h-56 relative overflow-hidden">
            <img
              src={
                p.images?.[0] ??
                "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&q=80"
              }
              alt={p.name}
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.55), transparent)",
              }}
            />
            <span
              className="absolute top-2.5 left-2.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: "rgba(123,47,190,0.85)", color: "#fff" }}
            >
              {p.category?.icon ?? ""} {p.category?.name ?? "Product"}
            </span>
          </div>
          <div className="p-4">
            <p
              className="text-[14px] font-bold truncate mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              {p.name}
            </p>
            {p.description && (
              <p
                className="text-[12px] line-clamp-2 mb-2"
                style={{ color: "var(--text-muted)" }}
              >
                {p.description}
              </p>
            )}
            <div className="flex items-center justify-between mt-2">
              <p
                className="text-[15px] font-extrabold"
                style={{ color: "var(--scarlet, #dc143c)" }}
              >
                CFA {(p.price ?? 0).toLocaleString()}
              </p>
              <span
                className="text-[11px] font-bold px-3 py-1 rounded-lg"
                style={{
                  background:
                    "linear-gradient(135deg, var(--purple), var(--scarlet))",
                  color: "#fff",
                }}
              >
                View
              </span>
            </div>
          </div>
        </Link>
      ));
    }

    if (section === "jobs") {
      return jobs.slice(0, 6).map((job, i) => (
        <Link
          href={`/jobs/${job.id}`}
          key={`sj-${i}`}
          className="flex-shrink-0 w-[400px] rounded-2xl p-5 flex flex-col gap-3 transition-transform hover:scale-[1.02]"
          style={{
            border: "1px solid var(--glass-border)",
            background: "var(--glass-bg)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0 overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, var(--purple), var(--scarlet))",
              }}
            >
              {job.companyLogo ? (
                <img
                  src={job.companyLogo}
                  alt={job.company}
                  className="w-full h-full object-cover"
                />
              ) : (
                job.company?.[0]?.toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <p
                className="text-[14px] font-bold truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {job.title}
              </p>
              <p
                className="text-[12px] truncate"
                style={{ color: "var(--text-muted)" }}
              >
                {job.company}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
              style={{
                background: "rgba(123,47,190,0.15)",
                color: "var(--purple, #7b2fbe)",
              }}
            >
              {job.type?.replace("_", " ")}
            </span>
            {job.location && (
              <span
                className="flex items-center gap-1 text-[11px]"
                style={{ color: "var(--text-muted)" }}
              >
                <MapPin size={10} />
                {job.location}
              </span>
            )}
            {job.salary && (
              <span
                className="text-[12px] font-extrabold ml-auto"
                style={{ color: "var(--scarlet, #dc143c)" }}
              >
                {job.salary}
              </span>
            )}
          </div>
          {job.description && (
            <p
              className="text-[12px] line-clamp-3 leading-relaxed"
              style={{ color: "var(--text-muted)" }}
            >
              {job.description}
            </p>
          )}
          <div className="mt-auto pt-2">
            <span
              className="block w-full text-center text-[12px] font-bold px-4 py-2 rounded-xl"
              style={{
                background:
                  "linear-gradient(135deg, var(--purple), var(--scarlet))",
                color: "#fff",
              }}
            >
              Apply Now
            </span>
          </div>
        </Link>
      ));
    }

    if (section === "communities") {
      return communities.slice(0, 6).map((c, i) => (
        <Link
          href={`/community/${c.slug}`}
          key={`sc-${i}`}
          className="flex-shrink-0 w-[400px] rounded-2xl overflow-hidden transition-transform hover:scale-[1.02]"
          style={{
            border: "1px solid var(--glass-border)",
            background: "var(--glass-bg)",
          }}
        >
          <div className="h-56 relative overflow-hidden">
            {c.image ? (
              <img
                src={c.image}
                alt={c.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full"
                style={{
                  background:
                    "linear-gradient(135deg, var(--purple), var(--blue))",
                }}
              />
            )}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-[15px] font-bold text-white truncate">
                {c.name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] text-white/70">
                  {c.memberCount ?? 0} members
                </span>
                {c.category && (
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                    style={{
                      background: "rgba(123,47,190,0.75)",
                      color: "#fff",
                    }}
                  >
                    {c.category}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="p-4">
            <p
              className="text-[12px] line-clamp-2 leading-relaxed mb-3"
              style={{ color: "var(--text-muted)" }}
            >
              {c.description}
            </p>
            <span
              className="block w-full text-center text-[12px] font-bold px-4 py-2 rounded-xl"
              style={{
                background:
                  "linear-gradient(135deg, var(--purple), var(--blue))",
                color: "#fff",
              }}
            >
              Join Community
            </span>
          </div>
        </Link>
      ));
    }

    if (section === "courses") {
      return courses.slice(0, 6).map((course, i) => {
        const totalLessons =
          course.sections?.reduce(
            (acc: number, s: any) => acc + (s.lessons?.length ?? 0),
            0,
          ) ?? 0;
        return (
          <Link
            href={`/learn/${course.id}`}
            key={`sco-${i}`}
            className="flex-shrink-0 w-[400px] rounded-2xl overflow-hidden transition-transform hover:scale-[1.02]"
            style={{
              border: "1px solid var(--glass-border)",
              background: "var(--glass-bg)",
            }}
          >
            <div className="h-56 relative overflow-hidden">
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--blue), var(--purple))",
                  }}
                >
                  <BookOpen size={40} color="rgba(255,255,255,0.4)" />
                </div>
              )}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
                }}
              />
              {course.level && (
                <span
                  className="absolute top-2.5 left-2.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(26,58,219,0.85)", color: "#fff" }}
                >
                  {course.level}
                </span>
              )}
              {course.featured && (
                <span
                  className="absolute top-2.5 right-2.5 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"
                  style={{ background: "rgba(245,158,11,0.9)", color: "#fff" }}
                >
                  <Zap size={9} /> Featured
                </span>
              )}
            </div>
            <div className="p-4">
              <p
                className="text-[14px] font-bold line-clamp-2 leading-tight mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                {course.title}
              </p>
              <div className="flex items-center justify-between mt-2">
                {totalLessons > 0 && (
                  <span
                    className="flex items-center gap-1 text-[12px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <Clock size={11} /> {totalLessons} lessons
                  </span>
                )}
                <span
                  className="text-[15px] font-extrabold ml-auto"
                  style={{ color: "var(--scarlet, #dc143c)" }}
                >
                  {course.price === 0
                    ? "Free"
                    : `CFA ${(course.price ?? 0).toLocaleString()}`}
                </span>
              </div>
            </div>
          </Link>
        );
      });
    }

    return null;
  };
  return (
    <div
      className="relative mb-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Story progress bars + section tabs */}
      {/* Story progress bars + section tabs */}
      <div className="flex items-center gap-2 mb-3">
        {STORY_SECTIONS.map((section) => {
          const meta = STORY_META[section];
          const isActive = section === active;
          return (
            <button
              key={section}
              onClick={() => goTo(section)}
              className="flex-1 group flex flex-col gap-1.5"
            >
              {/* Progress bar */}
              <div
                className="w-full h-[3px] rounded-full overflow-hidden"
                style={{ background: "var(--glass-border)" }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: meta.color }}
                  animate={{
                    width: isActive
                      ? `${progress}%`
                      : section ===
                            STORY_SECTIONS[
                              STORY_SECTIONS.indexOf(active) - 1
                            ] ||
                          STORY_SECTIONS.indexOf(section) <
                            STORY_SECTIONS.indexOf(active)
                        ? "100%"
                        : "0%",
                  }}
                  transition={{ duration: 0, ease: "linear" }}
                />
              </div>
              {/* Label */}
              <div className="flex items-center gap-1 justify-center">
                <span
                  style={{
                    color: isActive ? meta.color : "var(--text-muted)",
                    transition: "color 0.2s",
                  }}
                >
                  {meta.icon}
                </span>
                <span
                  className="text-[10px] font-bold transition-all"
                  style={{ color: isActive ? meta.color : "var(--text-muted)" }}
                >
                  {meta.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Cards area */}
      <div className="relative overflow-hidden">
        {/* Fade edges */}
        <div
          className="pointer-events-none absolute left-0 top-0 h-full w-12 z-10"
          style={{
            background:
              "linear-gradient(to right, var(--bg-base), transparent)",
          }}
        />
        <div
          className="pointer-events-none absolute right-0 top-0 h-full w-12 z-10"
          style={{
            background: "linear-gradient(to left, var(--bg-base), transparent)",
          }}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="flex gap-3 overflow-x-auto pb-1"
            style={{ scrollbarWidth: "none" }}
          >
            {renderCards(active)}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
// ─── Counselor preview ────────────────────────────────────────────────────────

function CounselorPreview({ counselors }: { counselors: any[] }) {
  const items = counselors.slice(0, 4);
  return (
    <div className="flex flex-col gap-3">
      {items.map((c, i) => (
        <motion.div
          key={c.id ?? i}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
          className="flex items-center gap-3 rounded-2xl p-3"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
            backdropFilter: "blur(10px)",
          }}
        >
          <img
            src={
              c.user?.image ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${c.user?.name}`
            }
            alt={c.user?.name ?? "Counselor"}
            className="w-10 h-10 rounded-full object-cover object-top ring-2 ring-white/20"
          />
          <div className="flex-1 min-w-0">
            <div
              className="font-semibold text-sm truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {c.user?.name ?? "Counselor"}
            </div>
            <div
              className="text-xs truncate"
              style={{ color: "var(--text-muted)" }}
            >
              {c.specialty}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1 text-yellow-400 text-xs font-bold">
              <Star size={10} className="fill-yellow-400" /> {c.rating}
            </div>
            {c.available ? (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: "var(--success-bg)",
                  color: "var(--success-text)",
                }}
              >
                Available
              </span>
            ) : (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{
                  background: "var(--glass-bg-subtle)",
                  color: "var(--text-muted)",
                }}
              >
                Busy
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function PreviewSkeleton({ type }: { type: string }) {
  if (type === "counselors") {
    return (
      <div className="flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-2xl p-3 animate-pulse"
            style={{
              background: "var(--glass-bg-subtle)",
              border: "1px solid var(--glass-border-subtle)",
            }}
          >
            <div
              className="w-10 h-10 rounded-full flex-shrink-0"
              style={{ background: "var(--skeleton-base)" }}
            />
            <div className="flex-1 space-y-1.5">
              <div
                className="h-2.5 w-3/4 rounded"
                style={{ background: "var(--skeleton-base)" }}
              />
              <div
                className="h-2 w-1/2 rounded"
                style={{ background: "var(--skeleton-base)" }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-3 gap-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-xl overflow-hidden animate-pulse"
          style={{ border: "1px solid var(--glass-border-subtle)" }}
        >
          <div
            className="h-20"
            style={{ background: "var(--skeleton-base)" }}
          />
          <div
            className="p-2 space-y-1"
            style={{ background: "var(--glass-bg-subtle)" }}
          >
            <div
              className="h-2 w-3/4 rounded"
              style={{ background: "var(--skeleton-base)" }}
            />
            <div
              className="h-1.5 w-1/2 rounded"
              style={{ background: "var(--skeleton-base)" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

const textVariants = {
  enter: { y: 24, opacity: 0 },
  center: { y: 0, opacity: 1 },
  exit: { y: -24, opacity: 0 },
};

const SHOWCASE_LABELS: Record<ShowcaseMode, string> = {
  products: "Products",
  communities: "Communities",
  jobs: "Jobs",
  courses: "Courses",
};

const SHOWCASE_ICONS: Record<ShowcaseMode, React.ReactNode> = {
  products: <ShoppingCart size={12} />,
  communities: <Users size={12} />,
  jobs: <Briefcase size={12} />,
  courses: <BookOpen size={12} />,
};

// ─── Main component ────────────────────────────────────────────────────────────

export default function HeroSection() {
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);

  const [showcaseIndex, setShowcaseIndex] = useState(0);
  const showcaseMode: ShowcaseMode = SHOWCASE_CYCLE[showcaseIndex];
  const showcaseTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [displayedText, setDisplayedText] = useState("");
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasCompletedInitial, setHasCompletedInitial] = useState(false);
  const [isWaitingForNextCycle, setIsWaitingForNextCycle] = useState(false);

  const phrases = [
    "Creating Opportunities.",
    "Building Futures.",
    "Connecting People.",
    "Driving Innovation.",
  ];
  const staticText = "Empowering Lives. ";
  const lastLine = "Transforming Communities.";

  const { counselors, loading: loadingCounselors } = useCounselors({
    available: true,
  });
  const { products, isLoading: loadingProducts } = useFeaturedProducts(6);
  const { communities, loading: loadingCommunities } = useCommunities();
  const { jobs, categories, jobsLoading, categoriesLoading } = useJobs();
  const { courses, isLoading: loadingCourses } = useCourses({ featured: true });

  const go = useCallback((next: number, direction: number) => {
    setDir(direction);
    setActive((next + slides.length) % slides.length);
  }, []);

  const prev = () => go(active - 1, -1);
  const next = () => go(active + 1, 1);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => go(active + 1, 1), 5000);
    return () => clearInterval(t);
  }, [active, paused, go]);

  useEffect(() => {
    showcaseTimerRef.current = setInterval(() => {
      setShowcaseIndex((prev) => (prev + 1) % SHOWCASE_CYCLE.length);
    }, SHOWCASE_INTERVAL);
    return () => {
      if (showcaseTimerRef.current) clearInterval(showcaseTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (hasCompletedInitial) return;
    let index = 0;
    const fullInitialText = staticText + phrases[0];
    const typingInterval = setInterval(() => {
      if (index <= fullInitialText.length) {
        setDisplayedText(fullInitialText.slice(0, index));
        index++;
      } else {
        clearInterval(typingInterval);
        setHasCompletedInitial(true);
        setTimeout(() => setIsDeleting(true), 2000);
      }
    }, 50);
    return () => clearInterval(typingInterval);
  }, [hasCompletedInitial]);

  useEffect(() => {
    if (!hasCompletedInitial || isWaitingForNextCycle) return;
    const dynamicPart = displayedText.slice(staticText.length);
    const timeout = setTimeout(
      () => {
        if (isDeleting) {
          if (dynamicPart.length > 0) {
            setDisplayedText(staticText + dynamicPart.slice(0, -1));
          } else {
            setIsDeleting(false);
            const nextIndex = (currentPhraseIndex + 1) % phrases.length;
            setCurrentPhraseIndex(nextIndex);
            if (nextIndex === 0) {
              setIsWaitingForNextCycle(true);
              setTimeout(() => setIsWaitingForNextCycle(false), 30000);
            }
          }
        } else {
          const targetPhrase = phrases[currentPhraseIndex];
          if (dynamicPart.length < targetPhrase.length) {
            setDisplayedText(
              staticText + targetPhrase.slice(0, dynamicPart.length + 1),
            );
          } else {
            setTimeout(() => setIsDeleting(true), 2000);
          }
        }
      },
      isDeleting ? 30 : 50,
    );
    return () => clearTimeout(timeout);
  }, [
    displayedText,
    isDeleting,
    currentPhraseIndex,
    hasCompletedInitial,
    phrases,
    isWaitingForNextCycle,
  ]);

  const slide = slides[active];
  const companiesCount = new Set(jobs.map((job) => job.company)).size;
  const slideData =
    slide.id === "jobs"
      ? {
          ...slide,
          badge: jobsLoading ? "Loading…" : `${jobs.length} Jobs`,
          stats: [
            {
              label: "Open Positions",
              value: jobsLoading ? "..." : `${jobs.length}`,
            },
            {
              label: "Companies",
              value: jobsLoading ? "..." : `${companiesCount}`,
            },
            {
              label: "Categories",
              value: categoriesLoading ? "..." : `${categories.length}`,
            },
          ],
        }
      : slide;
  const Icon = slideData.icon;

  const renderCounselorPreview = () =>
    loadingCounselors ? (
      <PreviewSkeleton type="counselors" />
    ) : (
      <CounselorPreview counselors={counselors} />
    );

  const renderShowcase = () => {
    switch (showcaseMode) {
      case "products":
        return (
          <ProductsShowcase products={products} loading={loadingProducts} />
        );
      case "communities":
        return (
          <CommunitiesShowcase
            communities={communities}
            loading={loadingCommunities}
          />
        );
      case "jobs":
        return <JobsShowcase jobs={jobs} loading={jobsLoading} />;
      case "courses":
        return <CoursesShowcase courses={courses} loading={loadingCourses} />;
    }
  };

  const renderRightPanel = () => {
    if (slide.preview === "counselors") return renderCounselorPreview();
    return renderShowcase();
  };

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "var(--bg-base)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-1/2 h-[700px] pointer-events-none z-[5] animate-float"
        style={{
          backgroundImage: "url(/images/community.png)",
          backgroundSize: "contain",
          backgroundPosition: "left center",
          backgroundRepeat: "no-repeat",
          opacity: 0.15,
        }}
      />

      <AnimatePresence mode="sync">
        <motion.div
          key={slide.id + "-bg"}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          style={{ background: "var(--bg-gradient)" }}
        />
      </AnimatePresence>

      <AnimatePresence mode="sync">
        <motion.div
          key={slide.id + "-glow-a"}
          className="absolute -top-40 -left-32 w-[600px] h-[600px] rounded-full pointer-events-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.8 }}
          style={{
            background: `radial-gradient(circle, ${slide.glowA} 0%, transparent 70%)`,
            filter: "blur(80px)",
          }}
        />
        <motion.div
          key={slide.id + "-glow-b"}
          className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          style={{
            background: `radial-gradient(circle, ${slide.glowB} 0%, transparent 70%)`,
            filter: "blur(80px)",
          }}
        />
      </AnimatePresence>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
        {/* Facebook Stories-style section strip */}
        <StoriesStrip
          products={products}
          jobs={jobs}
          communities={communities}
          courses={courses}
        />
        {/* Carousel card */}
        <div
          className="rounded-3xl overflow-hidden relative"
          style={{
            background: "var(--bg-gradient)",
            boxShadow: "var(--card-shadow), 0 4px 24px rgba(0,0,0,0.2)",
            border: "1px solid var(--card-border)",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(145deg, var(--glass-bg-subtle) 0%, transparent 60%, transparent 100%)",
            }}
          />

          <div className="relative z-10 grid lg:grid-cols-2 gap-0 min-h-[400px] lg:min-h-[420px]">
            {/* LEFT — text */}
            <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10">
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div
                  key={slide.id + "-text"}
                  custom={dir}
                  variants={textVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] }}
                  className="flex flex-col gap-5"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center"
                      style={{
                        background: "var(--glass-bg)",
                        border: "1px solid var(--glass-border)",
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      <Icon size={20} className="text-[var(--text-on-glass)]" />
                    </div>
                    <span className="text-xs font-bold tracking-widest uppercase text-[var(--text-on-glass)]">
                      {slideData.label}
                    </span>
                    <span
                      className="ml-auto text-[11px] font-bold px-3 py-1 rounded-full"
                      style={{
                        background: "var(--glass-bg-subtle)",
                        color: "var(--text-on-glass)",
                        border: "1px solid var(--glass-border-subtle)",
                      }}
                    >
                      {slideData.badge}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-2xl lg:text-3xl font-extrabold text-[var(--text-on-glass)] leading-tight mb-2">
                      {slideData.title}
                    </h2>
                    <p className="text-sm font-medium mb-3 text-[var(--text-on-glass)]">
                      {slideData.subtitle}
                    </p>
                    <p className="text-sm leading-relaxed font-light max-w-md text-[var(--text-on-glass)]">
                      {slideData.description}
                    </p>
                  </div>

                  <div className="flex gap-5 sm:gap-6">
                    {slideData.stats.map((s, i) => (
                      <div key={i} className="flex flex-col gap-0.5">
                        <span className="text-lg font-extrabold text-[var(--text-on-glass)]">
                          {s.value}
                        </span>
                        <span className="text-[11px] text-[var(--text-on-glass)]">
                          {s.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Link
                    href={slideData.href}
                    className="inline-flex items-center gap-2 self-start px-6 py-3 rounded-xl text-sm font-bold text-[var(--text-on-glass)] transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 group"
                    style={{
                      background: "var(--glass-bg)",
                      border: "1px solid var(--glass-border)",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    {slideData.cta}
                    <ArrowRight
                      size={15}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </Link>
                </motion.div>
              </AnimatePresence>

              {/* Nav controls */}
              <div className="flex items-center gap-3 mt-8">
                <button
                  onClick={prev}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{
                    background: "var(--glass-bg)",
                    border: "1px solid var(--glass-border)",
                  }}
                >
                  <ChevronLeft
                    size={16}
                    className="text-[var(--text-on-glass)]"
                  />
                </button>
                <button
                  onClick={next}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{
                    background: "var(--glass-bg)",
                    border: "1px solid var(--glass-border)",
                  }}
                >
                  <ChevronRight
                    size={16}
                    className="text-[var(--text-on-glass)]"
                  />
                </button>
                <div className="flex items-center gap-2 ml-2">
                  {slides.map((s, i) => (
                    <button
                      key={s.id}
                      onClick={() => go(i, i > active ? 1 : -1)}
                      className="transition-all duration-300"
                      style={{
                        width: i === active ? "24px" : "8px",
                        height: "8px",
                        borderRadius: "99px",
                        background:
                          i === active
                            ? "var(--accent-primary)"
                            : "var(--glass-border)",
                      }}
                    />
                  ))}
                </div>
                <span className="ml-auto text-xs text-[var(--text-on-glass)] font-mono">
                  {String(active + 1).padStart(2, "0")} /{" "}
                  {String(slides.length).padStart(2, "0")}
                </span>
              </div>
            </div>

            {/* RIGHT — rotating showcase */}
            <div
              className="hidden lg:flex flex-col p-8 lg:p-10"
              style={{ borderLeft: "1px solid var(--glass-border-subtle)" }}
            >
              {slide.preview !== "counselors" && (
                <div className="flex items-center gap-1.5 mb-4">
                  {SHOWCASE_CYCLE.map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        setShowcaseIndex(SHOWCASE_CYCLE.indexOf(mode));
                        if (showcaseTimerRef.current)
                          clearInterval(showcaseTimerRef.current);
                        showcaseTimerRef.current = setInterval(() => {
                          setShowcaseIndex(
                            (prev) => (prev + 1) % SHOWCASE_CYCLE.length,
                          );
                        }, SHOWCASE_INTERVAL);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all"
                      style={{
                        background:
                          showcaseMode === mode
                            ? "linear-gradient(135deg, var(--purple), var(--scarlet))"
                            : "var(--glass-bg-subtle)",
                        color:
                          showcaseMode === mode
                            ? "#fff"
                            : "var(--text-on-glass)",
                        border:
                          showcaseMode === mode
                            ? "none"
                            : "1px solid var(--glass-border)",
                        opacity: showcaseMode === mode ? 1 : 0.7,
                      }}
                    >
                      {SHOWCASE_ICONS[mode]}
                      {SHOWCASE_LABELS[mode]}
                    </button>
                  ))}
                </div>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={
                    slide.preview === "counselors" ? "counselors" : showcaseMode
                  }
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                  className="flex-1 overflow-y-auto"
                  style={{ scrollbarWidth: "none" }}
                >
                  {renderRightPanel()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {!paused && (
            <motion.div
              key={slide.id + "-progress"}
              className="absolute bottom-0 left-0 h-[3px]"
              style={{ background: "var(--accent-primary)" }}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 5, ease: "linear" }}
            />
          )}
        </div>
      </div>
    </section>
  );
}
