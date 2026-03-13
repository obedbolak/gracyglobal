"use client";

import { motion } from "framer-motion";
import { UserPlus, Link2, Share2, Wallet } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Sign Up Free",
    description:
      "Create your affiliate account in under 2 minutes. No fees, no hidden costs — just your name and email.",
    gradient: "linear-gradient(135deg, var(--purple), var(--blue))",
    glow: "rgba(123,47,190,0.35)",
  },
  {
    icon: Link2,
    step: "02",
    title: "Get Your Link",
    description:
      "Receive a unique referral link and access to ready-made banners, posts, and marketing materials.",
    gradient: "linear-gradient(135deg, var(--blue), var(--purple-light))",
    glow: "rgba(26,58,219,0.35)",
  },
  {
    icon: Share2,
    step: "03",
    title: "Share & Promote",
    description:
      "Share on social media, WhatsApp, email — anywhere your audience lives. We track every click.",
    gradient: "linear-gradient(135deg, var(--scarlet), var(--purple))",
    glow: "rgba(220,20,60,0.35)",
  },
  {
    icon: Wallet,
    step: "04",
    title: "Earn Commissions",
    description:
      "Earn up to 30% on every successful referral. Withdraw via Mobile Money or bank — paid within 24h.",
    gradient: "linear-gradient(135deg, var(--purple-light), var(--scarlet-light))",
    glow: "rgba(168,85,247,0.35)",
  },
];

export default function AffiliateHowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
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
            Simple Process
          </div>
          <h2
            className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            How It Works
          </h2>
          <p
            className="text-base max-w-xl mx-auto font-light"
            style={{ color: "var(--text-muted)" }}
          >
            Four simple steps to start earning with GracyGlobal.
          </p>
        </motion.div>

        {/* Steps grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map(({ icon: Icon, step, title, description, gradient, glow }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="glass flex flex-col gap-4 p-6 relative overflow-hidden group"
            >
              {/* Step number watermark */}
              <span
                className="absolute -top-3 -right-1 text-7xl font-black select-none pointer-events-none"
                style={{ color: "var(--divider)", lineHeight: 1 }}
              >
                {step}
              </span>

              {/* Icon */}
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

              {/* Connector arrow — hidden on last */}
              {i < steps.length - 1 && (
                <div
                  className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-lg select-none"
                  style={{ color: "var(--text-disabled)" }}
                >
                  →
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
