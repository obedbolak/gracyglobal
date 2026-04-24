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
    gradient: "linear-gradient(135deg, #7b2fbe 0%, #1a3adb 100%)",
    glowA: "rgba(123,47,190,0.45)",
    glowB: "rgba(26,58,219,0.30)",
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
    gradient: "linear-gradient(135deg, #dc143c 0%, #7b2fbe 100%)",
    glowA: "rgba(220,20,60,0.45)",
    glowB: "rgba(123,47,190,0.30)",
    badge: "500+ Jobs",
    stats: [
      { label: "Open Positions", value: "500+" },
      { label: "Companies", value: "80+" },
      { label: "Avg. Salary", value: "CFA 350k" },
    ],
    preview: "community",
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
    gradient: "linear-gradient(135deg, #1a3adb 0%, #dc143c 100%)",
    glowA: "rgba(26,58,219,0.45)",
    glowB: "rgba(220,20,60,0.30)",
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
    gradient: "linear-gradient(135deg, #1a3adb 0%, #7b2fbe 50%, #dc143c 100%)",
    glowA: "rgba(123,47,190,0.45)",
    glowB: "rgba(220,20,60,0.25)",
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
  const items = counselors.slice(0, 3);
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
            background: "rgba(255,255,255,0.10)",
            border: "1px solid rgba(255,255,255,0.15)",
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
            <div className="text-white font-semibold text-sm truncate">
              {c.user?.name ?? "Counselor"}
            </div>
            <div className="text-white/55 text-xs truncate">{c.specialty}</div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1 text-yellow-400 text-xs font-bold">
              <Star size={10} className="fill-yellow-400" /> {c.rating}
            </div>
            {c.available ? (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(74,222,128,0.2)", color: "#4ade80" }}
              >
                Available
              </span>
            ) : (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(255,255,255,0.10)",
                  color: "rgba(255,255,255,0.40)",
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
  const items = communities.slice(0, 3);
  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((c, i) => (
        <motion.div
          key={c.id ?? i}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 + i * 0.12, duration: 0.4 }}
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.15)" }}
        >
          <div
            className="h-20 bg-cover bg-center"
            style={{
              backgroundImage: c.image
                ? `url(${c.image})`
                : "linear-gradient(135deg, #7b2fbe, #1a3adb)",
            }}
          />
          <div className="p-2" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div className="text-white text-[10px] font-bold leading-tight truncate">
              {c.name}
            </div>
            <div className="text-white/45 text-[9px] mt-0.5">{c.category}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function MarketplacePreview({ products }: { products: any[] }) {
  const items = products.slice(0, 3);
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
            style={{ border: "1px solid rgba(255,255,255,0.15)" }}
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
                className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
                style={{ background: "rgba(123,47,190,0.80)" }}
              >
                {categoryIcon && `${categoryIcon} `}
                {categoryName}
              </div>
            </div>
            <div
              className="p-2"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <div className="text-white text-[10px] font-bold truncate">
                {p.name}
              </div>
              <div className="text-white/60 text-[9px]">
                CFA {(p.price ?? 0).toLocaleString()}
              </div>
            </div>
          </motion.div>
        );
      })}
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
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-2.5 w-3/4 rounded bg-white/20" />
              <div className="h-2 w-1/2 rounded bg-white/15" />
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
          style={{ border: "1px solid rgba(255,255,255,0.10)" }}
        >
          <div className="h-20 bg-white/15" />
          <div
            className="p-2 space-y-1"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <div className="h-2 w-3/4 rounded bg-white/20" />
            <div className="h-1.5 w-1/2 rounded bg-white/15" />
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
  const { products, isLoading: loadingProducts } = useFeaturedProducts(3);
  const { communities, loading: loadingCommunities } = useCommunities();

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
  const Icon = slide.icon;

  // Resolve which preview + loading state to show for current slide
  const renderPreview = () => {
    switch (slide.preview) {
      case "counselors":
        return loadingCounselors ? (
          <PreviewSkeleton type="counselors" />
        ) : (
          <CounselorPreview counselors={counselors} />
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
                        color: "#fff",
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
            background: slide.gradient,
            boxShadow: `0 24px 80px ${slide.glowA}, 0 4px 24px rgba(0,0,0,0.2)`,
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.02) 60%, transparent 100%)",
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
                        background: "rgba(255,255,255,0.18)",
                        border: "1px solid rgba(255,255,255,0.28)",
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      <Icon size={20} className="text-white" />
                    </div>
                    <span className="text-xs font-bold tracking-widest uppercase text-white/70">
                      {slide.label}
                    </span>
                    <span
                      className="ml-auto text-[11px] font-bold px-3 py-1 rounded-full"
                      style={{
                        background: "rgba(255,255,255,0.16)",
                        color: "rgba(255,255,255,0.90)",
                        border: "1px solid rgba(255,255,255,0.22)",
                      }}
                    >
                      {slide.badge}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-2xl lg:text-3xl font-extrabold text-white leading-tight mb-2">
                      {slide.title}
                    </h2>
                    <p className="text-sm text-white/60 font-medium mb-3">
                      {slide.subtitle}
                    </p>
                    <p className="text-sm text-white/45 leading-relaxed font-light max-w-md">
                      {slide.description}
                    </p>
                  </div>

                  <div className="flex gap-5 sm:gap-6">
                    {slide.stats.map((s, i) => (
                      <div key={i} className="flex flex-col gap-0.5">
                        <span className="text-lg font-extrabold text-white">
                          {s.value}
                        </span>
                        <span className="text-[11px] text-white/45">
                          {s.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Link
                    href={slide.href}
                    className="inline-flex items-center gap-2 self-start px-6 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 group"
                    style={{
                      background: "rgba(255,255,255,0.18)",
                      border: "1px solid rgba(255,255,255,0.28)",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    {slide.cta}
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
                    background: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(255,255,255,0.22)",
                  }}
                >
                  <ChevronLeft size={16} className="text-white" />
                </button>
                <button
                  onClick={next}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(255,255,255,0.22)",
                  }}
                >
                  <ChevronRight size={16} className="text-white" />
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
                            ? "rgba(255,255,255,0.95)"
                            : "rgba(255,255,255,0.30)",
                      }}
                    />
                  ))}
                </div>

                <span className="ml-auto text-xs text-white/35 font-mono">
                  {String(active + 1).padStart(2, "0")} /{" "}
                  {String(slides.length).padStart(2, "0")}
                </span>
              </div>
            </div>

            {/* RIGHT — live preview */}
            <div
              className="hidden lg:flex items-center p-8 lg:p-10"
              style={{ borderLeft: "1px solid rgba(255,255,255,0.10)" }}
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
              style={{ background: "rgba(255,255,255,0.60)" }}
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
