"use client";

import { motion } from "framer-motion";
import {
  Star,
  Video,
  MessageCircle,
  CheckCircle,
  Currency,
} from "lucide-react";
import Link from "next/link";
// Replace hardcoded arrays with this import
import { counselors, getCounselorById } from "@/data/counselors";
import { useCurrency } from "@/hooks/useCurrency";

const specialtyColors: Record<string, string> = {
  "Marriage Counseling": "var(--badge-scarlet-bg)",
  "Trauma Healing": "var(--badge-purple-bg)",
  "Life Coaching": "var(--badge-blue-bg)",
};
const specialtyText: Record<string, string> = {
  "Marriage Counseling": "var(--scarlet-dark)",
  "Trauma Healing": "var(--purple-dark)",
  "Life Coaching": "var(--blue-dark)",
};

export default function CounselorsList() {
  const { convert, loading } = useCurrency();
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

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {counselors.map(
            (
              {
                name,
                role,
                specialty,
                rating,
                reviews,
                price,
                img,
                available,
                verified,
                languages,
                sessions,
                bio,
              },
              i,
            ) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: (i % 3) * 0.1 }}
                className="glass flex flex-col gap-4 p-6 group"
              >
                {/* Top row */}
                <div className="flex items-start gap-4">
                  <div className="relative flex-shrink-0">
                    <img
                      src={img}
                      alt={name}
                      className="w-14 h-14 rounded-2xl object-cover"
                    />
                    {available && (
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
                        {name}
                      </span>
                      {verified && (
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
                      {role}
                    </p>
                    <span
                      className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                      style={{
                        background: specialtyColors[specialty],
                        color: specialtyText[specialty],
                      }}
                    >
                      {specialty}
                    </span>
                  </div>
                </div>

                {/* Bio */}
                <p
                  className="text-xs leading-relaxed font-light line-clamp-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {bio}
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
                      {rating}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      ({reviews})
                    </span>
                  </div>
                  <span
                    className="text-sm font-bold"
                    style={{ color: "var(--accent-primary)" }}
                  >
                    {loading ? "..." : convert(price)} /hr
                    <span
                      className="text-xs font-normal"
                      style={{ color: "var(--text-muted)" }}
                    >
                      /hr
                    </span>
                  </span>
                </div>

                {/* Session types + languages */}
                <div className="flex items-center gap-2 flex-wrap">
                  {sessions.includes("Video") && (
                    <span
                      className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full"
                      style={{
                        background: "var(--badge-blue-bg)",
                        color: "var(--blue-dark)",
                      }}
                    >
                      <Video size={10} /> Video
                    </span>
                  )}
                  {sessions.includes("Text") && (
                    <span
                      className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full"
                      style={{
                        background: "var(--badge-purple-bg)",
                        color: "var(--purple-dark)",
                      }}
                    >
                      <MessageCircle size={10} /> Text
                    </span>
                  )}
                  {languages.map((l, j) => (
                    <span
                      key={j}
                      className="text-[11px] px-2 py-0.5 rounded-full"
                      style={{
                        background: "var(--badge-neutral-bg)",
                        color: "var(--text-muted)",
                      }}
                    >
                      {l}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <Link
                  href={`/counselors/${name.toLowerCase().replace(/\s+/g, "-")}/book`}
                  className="w-full text-center py-2.5 rounded-xl text-xs font-bold text-white transition-all duration-200 hover:scale-105 mt-auto"
                  style={{
                    background: available
                      ? "linear-gradient(135deg, var(--purple), var(--blue))"
                      : "var(--badge-neutral-bg)",
                    color: available ? "white" : "var(--text-disabled)",
                    cursor: available ? "pointer" : "not-allowed",
                    boxShadow: available
                      ? "0 4px 14px rgba(123,47,190,0.3)"
                      : "none",
                  }}
                >
                  {available ? "Book Now" : "Currently Unavailable"}
                </Link>
              </motion.div>
            ),
          )}
        </div>

        {/* View all */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mt-10"
        >
          <Link
            href="/counselors#councelors"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 hover:scale-105"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              color: "var(--text-secondary)",
              backdropFilter: "blur(12px)",
            }}
          >
            View All Counselors
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
