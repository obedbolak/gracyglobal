"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import { useCounselors } from "@/hooks/useCounselors";
import { useCourses } from "@/hooks/useCourses";
import { useFeaturedProducts } from "@/hooks/UseProducts";
import { useCommunities } from "@/hooks/useCommunity";
import { useJobs } from "@/hooks/useJobs";

// ─── Slide shell (no preview items — those come from hooks) ────────────────────

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

// ─── Preview renderers ─────────────────────────────────────────────────────────

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

function CommunityPreview({ communities }: { communities: any[] }) {
  const items = communities.slice(0, 6);
  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((c, i) => (
        <motion.div
          key={c.id ?? i}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 + i * 0.12, duration: 0.4 }}
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid var(--glass-border)" }}
        >
          <div
            className="h-20 bg-cover bg-center"
            style={{
              backgroundImage: c.image
                ? `url(${c.image})`
                : "linear-gradient(135deg, var(--purple), var(--blue))",
            }}
          />
          <div className="p-2" style={{ background: "var(--glass-bg-subtle)" }}>
            <div
              className="text-[10px] font-bold leading-tight truncate"
              style={{ color: "var(--text-muted)" }}
            >
              {c.name}
            </div>
            <div
              className="text-[9px] mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              {c.category}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function MarketplacePreview({ products }: { products: any[] }) {
  const items = products.slice(0, 6);
  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((p, i) => {
        // ✅ Safely extract category name
        const categoryName = p.category?.name || p.group || "Product";
        const categoryIcon = p.category?.icon || "";

        return (
          <motion.div
            key={p.id ?? i}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.12, duration: 0.4 }}
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid var(--glass-border)" }}
          >
            <div className="h-20 relative overflow-hidden">
              <img
                src={
                  p.images?.[0] ??
                  "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=300&q=80"
                }
                alt={p.name}
                className="w-full h-full object-cover"
              />
              <div
                className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                style={{
                  background: "var(--badge-purple-bg)",
                  color: "var(--badge-purple-text)",
                }}
              >
                {categoryIcon && `${categoryIcon} `}
                {categoryName}
              </div>
            </div>
            <div
              className="p-2"
              style={{ background: "var(--glass-bg-subtle)" }}
            >
              <div
                className="text-[10px] font-bold truncate"
                style={{ color: "var(--text-muted)" }}
              >
                {p.name}
              </div>
              <div
                className="text-[9px]"
                style={{ color: "var(--text-muted)" }}
              >
                CFA {(p.price ?? 0).toLocaleString()}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function JobsPreview({ jobs }: { jobs: any[] }) {
  const items = jobs.slice(0, 4);
  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          No live remote jobs available right now.
        </p>
      ) : (
        items.map((job, index) => (
          <motion.div
            key={job.id ?? index}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.08, duration: 0.35 }}
            className="rounded-2xl p-4"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p
                  className="text-sm font-semibold truncate"
                  style={{ color: "var(--text-muted)" }}
                >
                  {job.title}
                </p>
                <p
                  className="text-xs truncate"
                  style={{ color: "var(--text-muted)" }}
                >
                  {job.company}
                  {job.location ? ` · ${job.location}` : ""}
                </p>
              </div>
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.18em] px-2 py-1 rounded-full"
                style={{
                  background: "var(--glass-bg-subtle)",
                  color: "var(--text-secondary)",
                }}
              >
                {job.category?.replace("_", " ")}
              </span>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}

// Skeleton for when data is loading
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

// ─── Slide variants ────────────────────────────────────────────────────────────

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

// ─── Main component ────────────────────────────────────────────────────────────

export default function HeroSection() {
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);

  // Typing effect states
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

  // ─── Live data ───────────────────────────────────────────────────────────────
  const { counselors, loading: loadingCounselors } = useCounselors({
    available: true,
  });
  const { products, isLoading: loadingProducts } = useFeaturedProducts(6);
  const { communities, loading: loadingCommunities } = useCommunities();
  const { jobs, categories, jobsLoading, categoriesLoading } = useJobs();

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

  // Resolve which preview + loading state to show for current slide
  const renderPreview = () => {
    switch (slide.preview) {
      case "counselors":
        return loadingCounselors ? (
          <PreviewSkeleton type="counselors" />
        ) : (
          <CounselorPreview counselors={counselors} />
        );
      case "jobs":
        return jobsLoading ? (
          <PreviewSkeleton type="jobs" />
        ) : (
          <JobsPreview jobs={jobs} />
        );
      case "community":
        return loadingCommunities ? (
          <PreviewSkeleton type="community" />
        ) : (
          <CommunityPreview communities={communities} />
        );
      case "marketplace":
        return loadingProducts ? (
          <PreviewSkeleton type="marketplace" />
        ) : (
          <MarketplacePreview products={products} />
        );
      default:
        return null;
    }
  };

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "var(--bg-base)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background Image */}
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

      {/* Animated gradient background */}
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

      {/* Glow blobs */}
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

      {/* Hero headline */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-32 lg:pt-36 pb-6">
        <div className="text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-8"
            style={{
              background: "var(--glass-bg-subtle)",
              border: "1px solid var(--glass-border)",
              color: "var(--text-muted)",
              backdropFilter: "blur(12px)",
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
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-[1.08] tracking-tight min-h-[180px] sm:min-h-[200px] lg:min-h-[220px]"
            style={{ color: "var(--text-primary)" }}
          >
            {displayedText.includes(staticText.trim()) ? (
              <>
                Empowering Lives. <br />
                {displayedText.length > staticText.length && (
                  <span
                    style={{
                      background:
                        "linear-gradient(90deg, var(--purple-light), var(--scarlet-light), var(--blue-light))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {displayedText.slice(staticText.length)}
                  </span>
                )}
                <span
                  className="inline-block w-0.5 h-[0.9em] ml-1"
                  style={{
                    background: "var(--purple)",
                    verticalAlign: "middle",
                    animation: "blink 1s infinite",
                  }}
                />
                <br />
                <span style={{ color: "var(--text-secondary)" }}>
                  {lastLine}
                </span>
              </>
            ) : (
              <>
                {displayedText}
                <span
                  className="inline-block w-0.5 h-[0.9em] ml-1"
                  style={{
                    background: "var(--purple)",
                    verticalAlign: "middle",
                    animation: "blink 1s infinite",
                  }}
                />
              </>
            )}
          </h1>

          <style jsx>{`
            @keyframes blink {
              0%,
              50% {
                opacity: 1;
              }
              51%,
              100% {
                opacity: 0;
              }
            }
          `}</style>

          <p
            className="text-base sm:text-lg max-w-2xl mx-auto font-light leading-relaxed mb-10"
            style={{ color: "var(--text-muted)" }}
          >
            A digital ecosystem connecting counseling, remote work, community
            development, and commerce across Africa and the World.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-3.5 rounded-2xl text-[var(--text-inverse)] font-bold text-sm transition-all duration-200 hover:scale-105 hover:-translate-y-0.5"
              style={{
                background: "var(--btn-primary-bg)",
                boxShadow: "var(--btn-primary-shadow)",
              }}
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
        {/* Tab pills */}
        <div className="flex justify-center gap-1 sm:gap-2 mb-8 flex-wrap px-2">
          {slides.map((s, i) => {
            const SIcon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => go(i, i > active ? 1 : -1)}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 min-w-0 flex-shrink-0"
                style={
                  i === active
                    ? {
                        background: slide.gradient,
                        color: "var(--text-inverse)",
                        boxShadow: `0 4px 14px ${slide.glowA}`,
                        border: "1px solid rgba(255,255,255,0.20)",
                      }
                    : {
                        background: "var(--glass-bg)",
                        border: "1px solid var(--glass-border)",
                        color: "var(--text-muted)",
                        backdropFilter: "blur(10px)",
                      }
                }
              >
                <SIcon size={14} className="flex-shrink-0" />
                <span className="hidden sm:inline truncate">{s.label}</span>
              </button>
            );
          })}
        </div>

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

            {/* RIGHT — live preview */}
            <div
              className="hidden lg:flex items-center p-8 lg:p-10"
              style={{ borderLeft: "1px solid var(--glass-border-subtle)" }}
            >
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div
                  key={slide.id + "-preview"}
                  custom={dir}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
                  className="w-full"
                >
                  {renderPreview()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Progress bar */}
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
