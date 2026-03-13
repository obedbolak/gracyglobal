"use client";

import { motion } from "framer-motion";
import { Search, CalendarCheck, MessageCircle, ThumbsUp } from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Browse Counselors",
    description:
      "Filter by specialty, language, price, and availability. Read real reviews from real clients.",
    gradient: "linear-gradient(135deg, var(--purple), var(--blue))",
    glow: "rgba(123,47,190,0.35)",
  },
  {
    icon: CalendarCheck,
    step: "02",
    title: "Book a Session",
    description:
      "Pick a time that works for you. Same-day slots are often available.",
    gradient: "linear-gradient(135deg, var(--blue), var(--purple-light))",
    glow: "rgba(26,58,219,0.35)",
  },
  {
    icon: MessageCircle,
    step: "03",
    title: "Connect & Talk",
    description:
      "Meet via secure text or video chat. Your session, your pace, your safe space.",
    gradient: "linear-gradient(135deg, var(--scarlet), var(--purple))",
    glow: "rgba(220,20,60,0.35)",
  },
  {
    icon: ThumbsUp,
    step: "04",
    title: "Grow & Return",
    description:
      "Track your progress, rebook your favourite counselor, and keep moving forward.",
    gradient:
      "linear-gradient(135deg, var(--purple-light), var(--scarlet-light))",
    glow: "rgba(168,85,247,0.35)",
  },
];

export default function CounselorsHowItWorks() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
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
            How It Works
          </div>
          <h2
            className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            From Hesitation to{" "}
            <span
              style={{
                background:
                  "linear-gradient(90deg, var(--purple-light), var(--blue-light))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Healing
            </span>{" "}
            in 4 Steps
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map(
            ({ icon: Icon, step, title, description, gradient, glow }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="glass flex flex-col gap-4 p-6 relative overflow-hidden group"
              >
                <span
                  className="absolute -top-3 -right-1 text-7xl font-black select-none pointer-events-none"
                  style={{ color: "var(--divider)", lineHeight: 1 }}
                >
                  {step}
                </span>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: gradient,
                    boxShadow: `0 4px 16px ${glow}`,
                  }}
                >
                  <Icon size={20} className="text-white" />
                </div>
                <div>
                  <h3
                    className="font-bold text-base mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed font-light"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {description}
                  </p>
                </div>
              </motion.div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
