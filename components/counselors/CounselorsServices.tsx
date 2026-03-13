"use client";

import { motion } from "framer-motion";
import { Heart, Zap, Compass } from "lucide-react";

const services = [
  {
    icon: Heart,
    title: "Marriage Counseling",
    tagline: "Love is easy. Staying in love takes a pro.",
    description:
      "Strengthen your relationship with expert guidance on communication, conflict resolution, intimacy, and rebuilding trust. For couples at any stage.",
    gradient: "linear-gradient(135deg, var(--scarlet), var(--purple))",
    glow: "rgba(220,20,60,0.35)",
    badge: "Most Booked",
    features: [
      "Couples sessions",
      "Pre-marital counseling",
      "Conflict resolution",
      "Intimacy coaching",
    ],
  },
  {
    icon: Zap,
    title: "Trauma Healing",
    tagline: "Your past happened. Your future doesn't have to match.",
    description:
      "Process and recover from past wounds with trauma-informed therapists. A safe, judgment-free space to heal at your own pace.",
    gradient: "linear-gradient(135deg, var(--purple), var(--blue))",
    glow: "rgba(123,47,190,0.35)",
    badge: "Safe Space",
    features: [
      "Trauma-informed care",
      "PTSD support",
      "Grief counseling",
      "Anxiety management",
    ],
  },
  {
    icon: Compass,
    title: "Life Coaching",
    tagline: "You already have the answers. We just ask better questions.",
    description:
      "Unlock clarity, direction, and momentum with a certified life coach. Build habits, set goals, and finally build the next chapter you've been putting off.",
    gradient: "linear-gradient(135deg, var(--blue), var(--purple-light))",
    glow: "rgba(26,58,219,0.35)",
    badge: "Top Rated",
    features: [
      "Goal setting",
      "Career transitions",
      "Confidence building",
      "Accountability coaching",
    ],
  },
];

export default function CounselorsServices() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-5"
            style={{
              background: "var(--glass-bg-subtle)",
              border: "1px solid var(--glass-border)",
              color: "var(--text-muted)",
              backdropFilter: "blur(12px)",
            }}
          >
            Our Specialties
          </div>
          <h2
            className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Three Areas.{" "}
            <span
              style={{
                background:
                  "linear-gradient(90deg, var(--purple-light), var(--scarlet-light))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              One Platform.
            </span>
          </h2>
          <p
            className="text-base max-w-xl mx-auto font-light"
            style={{ color: "var(--text-muted)" }}
          >
            Whatever brought you here, there's a counselor ready for it.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid sm:grid-cols-3 gap-6">
          {services.map(
            (
              {
                icon: Icon,
                title,
                tagline,
                description,
                gradient,
                glow,
                badge,
                features,
              },
              i,
            ) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="glass flex flex-col gap-5 p-7 group relative overflow-hidden"
              >
                {/* Top gradient strip */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                  style={{ background: gradient }}
                />

                {/* Badge */}
                <span
                  className="absolute top-5 right-5 text-[10px] font-bold px-2.5 py-1 rounded-full text-white"
                  style={{ background: gradient }}
                >
                  {badge}
                </span>

                {/* Icon */}
                <div
                  className="w-13 h-13 w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: gradient,
                    boxShadow: `0 4px 16px ${glow}`,
                  }}
                >
                  <Icon size={22} className="text-white" />
                </div>

                {/* Text */}
                <div>
                  <h3
                    className="font-extrabold text-lg mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {title}
                  </h3>
                  <p
                    className="text-xs font-semibold italic mb-3"
                    style={{ color: "var(--text-muted)" }}
                  >
                    "{tagline}"
                  </p>
                  <p
                    className="text-sm leading-relaxed font-light"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {description}
                  </p>
                </div>

                {/* Feature pills */}
                <div className="flex flex-wrap gap-2 mt-auto">
                  {features.map((f, j) => (
                    <span
                      key={j}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                      style={{
                        background: "var(--badge-neutral-bg)",
                        color: "var(--text-muted)",
                      }}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </motion.div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
