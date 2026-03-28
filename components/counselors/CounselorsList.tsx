// components/counselors/CounselorsList.tsx
"use client";

import { motion } from "framer-motion";
import { Star, Video, MessageCircle, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCounselors } from "@/hooks/useCounselors";
import { useCurrency } from "@/hooks/useCurrency";

const specialtyColors: Record<string, string> = {
  "Relationship Counseling": "var(--badge-scarlet-bg)",
  "Emotional Wellness": "var(--badge-purple-bg)",
  "Life Coaching": "var(--badge-blue-bg)",
  "Family Counseling": "var(--badge-blue-bg)",
  "Career Counseling": "var(--badge-purple-bg)",
  "Mental Health": "var(--badge-scarlet-bg)",
  "Grief & Loss": "var(--badge-scarlet-bg)",
  "Addiction Recovery": "var(--badge-purple-bg)",
  "Stress Management": "var(--badge-blue-bg)",
  "Self-Esteem & Confidence": "var(--badge-purple-bg)",
  "Trauma & PTSD": "var(--badge-scarlet-bg)",
  "Anxiety & Depression": "var(--badge-scarlet-bg)",
};

const specialtyText: Record<string, string> = {
  "Relationship Counseling": "var(--scarlet-dark)",
  "Emotional Wellness": "var(--purple-dark)",
  "Life Coaching": "var(--blue-dark)",
  "Family Counseling": "var(--blue-dark)",
  "Career Counseling": "var(--purple-dark)",
  "Mental Health": "var(--scarlet-dark)",
  "Grief & Loss": "var(--scarlet-dark)",
  "Addiction Recovery": "var(--purple-dark)",
  "Stress Management": "var(--blue-dark)",
  "Self-Esteem & Confidence": "var(--purple-dark)",
  "Trauma & PTSD": "var(--scarlet-dark)",
  "Anxiety & Depression": "var(--scarlet-dark)",
};

export default function CounselorsList() {
  const { counselors, loading: counselorsLoading } = useCounselors({
    available: true, // Only show available counselors
  });
  const { convert, loading: currencyLoading } = useCurrency();

  return (
    <section id="counselors" className="py-20 px-4 sm:px-6 lg:px-8">
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
            Meet the Team
          </div>
          <h2
            className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Real People.{" "}
            <span
              style={{
                background:
                  "linear-gradient(90deg, var(--purple-light), var(--scarlet-light))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Real Credentials.
            </span>
          </h2>
          <p
            className="text-base max-w-xl mx-auto font-light"
            style={{ color: "var(--text-muted)" }}
          >
            Every counselor is vetted, certified, and genuinely invested in your
            growth.
          </p>
        </motion.div>

        {/* Loading State */}
        {counselorsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--purple)]" />
          </div>
        ) : counselors.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="glass p-12 rounded-xl max-w-md mx-auto">
              <div className="w-16 h-16 bg-[var(--purple-faint)] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👤</span>
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                No Counselors Available
              </h3>
              <p className="text-sm text-[var(--text-muted)]">
                Check back soon for new counselors.
              </p>
            </div>
          </div>
        ) : (
          /* Grid */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {counselors.map((counselor, i) => (
              <motion.div
                key={counselor.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: (i % 3) * 0.1 }}
                className="glass flex flex-col gap-4 p-6 group"
              >
                {/* Top row */}
                <div className="flex items-start gap-4">
                  <div className="relative flex-shrink-0">
                    {counselor.user.image ? (
                      <img
                        src={counselor.user.image}
                        alt={counselor.user.name || "Counselor"}
                        className="w-14 h-14 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--purple-faint)] to-[var(--glass-bg)] flex items-center justify-center">
                        <span className="text-xl font-bold text-[var(--purple)]">
                          {counselor.user.name?.[0] || "C"}
                        </span>
                      </div>
                    )}
                    {counselor.available && (
                      <span
                        className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 flex items-center justify-center"
                        style={{
                          background: "#4ade80",
                          borderColor: "var(--card-bg)",
                        }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span
                        className="font-bold text-sm truncate"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {counselor.user.name || "Unnamed Counselor"}
                      </span>
                      {counselor.verified && (
                        <CheckCircle
                          size={13}
                          style={{ color: "var(--blue-light)", flexShrink: 0 }}
                        />
                      )}
                    </div>
                    <p
                      className="text-xs truncate mb-2"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {counselor.user.country
                        ? `Based in ${counselor.user.country}`
                        : "Professional Counselor"}
                    </p>
                    <span
                      className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                      style={{
                        background:
                          specialtyColors[counselor.specialty] ||
                          "var(--badge-neutral-bg)",
                        color:
                          specialtyText[counselor.specialty] ||
                          "var(--text-muted)",
                      }}
                    >
                      {counselor.specialty}
                    </span>
                  </div>
                </div>

                {/* Bio */}
                <p
                  className="text-xs leading-relaxed font-light line-clamp-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {counselor.bio || "Professional counselor ready to help you."}
                </p>

                {/* Rating + price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Star
                      size={13}
                      className="fill-yellow-400 text-yellow-400"
                    />
                    <span
                      className="text-sm font-bold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {counselor.rating.toFixed(1)}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      ({counselor.reviews})
                    </span>
                  </div>
                  <span
                    className="text-sm font-bold"
                    style={{ color: "var(--accent-primary)" }}
                  >
                    {currencyLoading ? "..." : convert(counselor.pricePerHour)}
                    <span
                      className="text-xs font-normal"
                      style={{ color: "var(--text-muted)" }}
                    >
                      /hr
                    </span>
                  </span>
                </div>

                {/* Session types */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full"
                    style={{
                      background: "var(--badge-blue-bg)",
                      color: "var(--blue-dark)",
                    }}
                  >
                    <Video size={10} /> Video
                  </span>
                  <span
                    className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full"
                    style={{
                      background: "var(--badge-purple-bg)",
                      color: "var(--purple-dark)",
                    }}
                  >
                    <MessageCircle size={10} /> Text
                  </span>
                  {counselor.user.country && (
                    <span
                      className="text-[11px] px-2 py-0.5 rounded-full"
                      style={{
                        background: "var(--badge-neutral-bg)",
                        color: "var(--text-muted)",
                      }}
                    >
                      {counselor.user.country}
                    </span>
                  )}
                </div>

                {/* CTA */}
                <Link
                  href={`/counselors/${counselor.id}/book`}
                  className="w-full text-center py-2.5 rounded-xl text-xs font-bold text-white transition-all duration-200 hover:scale-105 mt-auto"
                  style={{
                    background: counselor.available
                      ? "linear-gradient(135deg, var(--purple), var(--blue))"
                      : "var(--badge-neutral-bg)",
                    color: counselor.available
                      ? "white"
                      : "var(--text-disabled)",
                    cursor: counselor.available ? "pointer" : "not-allowed",
                    boxShadow: counselor.available
                      ? "0 4px 14px rgba(123,47,190,0.3)"
                      : "none",
                  }}
                >
                  {counselor.available ? "Book Now" : "Currently Unavailable"}
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* View all - only show if there are more than 6 counselors */}
        {!counselorsLoading && counselors.length > 6 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-center mt-10"
          >
            <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
              Showing all {counselors.length} counselors
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
