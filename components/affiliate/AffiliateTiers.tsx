"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";

const tiers = [
  {
    name: "Starter",
    badge: null,
    commission: "10%",
    commissionNote: "on every referral",
    minReferrals: "0–10 referrals/mo",
    color: "var(--blue)",
    gradient: "linear-gradient(135deg, var(--blue), var(--purple))",
    glow: "rgba(26,58,219,0.3)",
    features: [
      "Personal referral link",
      "Basic analytics dashboard",
      "Email marketing kit",
      "Monthly payouts",
      "Community access",
    ],
    cta: "Start Free",
    featured: false,
  },
  {
    name: "Growth",
    badge: "Most Popular",
    commission: "20%",
    commissionNote: "on every referral",
    minReferrals: "11–50 referrals/mo",
    color: "var(--purple)",
    gradient: "linear-gradient(135deg, var(--scarlet), var(--purple))",
    glow: "rgba(220,20,60,0.4)",
    features: [
      "Everything in Starter",
      "Priority support",
      "Social media kit",
      "Bi-weekly payouts",
      "Exclusive webinars",
      "Co-branded materials",
    ],
    cta: "Join Growth",
    featured: true,
  },
  {
    name: "Elite",
    badge: "Top Earners",
    commission: "30%",
    commissionNote: "on every referral",
    minReferrals: "51+ referrals/mo",
    color: "var(--scarlet)",
    gradient:
      "linear-gradient(135deg, var(--purple-light), var(--scarlet-light))",
    glow: "rgba(168,85,247,0.35)",
    features: [
      "Everything in Growth",
      "Dedicated account manager",
      "Custom landing pages",
      "Daily payouts available",
      "Revenue share bonuses",
      "Brand ambassador status",
    ],
    cta: "Unlock Elite",
    featured: false,
  },
];

export default function AffiliateTiers() {
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
            Commission Tiers
          </div>
          <h2
            className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            The More You Share,{" "}
            <span
              style={{
                background:
                  "linear-gradient(90deg, var(--purple-light), var(--scarlet-light))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              The More You Earn
            </span>
          </h2>
          <p
            className="text-base max-w-xl mx-auto font-light"
            style={{ color: "var(--text-muted)" }}
          >
            Unlock higher commission rates as your referrals grow. Tiers are
            updated automatically each month.
          </p>
        </motion.div>

        {/* Tiers */}
        <div className="grid sm:grid-cols-3 gap-5 items-start">
          {tiers.map(
            (
              {
                name,
                badge,
                commission,
                commissionNote,
                minReferrals,
                gradient,
                glow,
                features,
                cta,
                featured,
              },
              i,
            ) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="glass flex flex-col gap-6 p-7 relative overflow-hidden"
                style={
                  featured
                    ? {
                        boxShadow: `0 0 0 2px var(--purple-light), 0 24px 60px ${glow}, var(--glass-shadow)`,
                        transform: "scale(1.02)",
                      }
                    : {}
                }
              >
                {/* Featured ribbon */}
                {badge && (
                  <div
                    className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-white"
                    style={{ background: gradient }}
                  >
                    <Star size={9} className="fill-white" />
                    {badge}
                  </div>
                )}

                {/* Tier name */}
                <div>
                  <span
                    className="text-xs font-bold tracking-widest uppercase mb-2 block"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {name}
                  </span>
                  <div className="flex items-end gap-1.5">
                    <span
                      className="text-5xl font-black"
                      style={{
                        background: gradient,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      {commission}
                    </span>
                    <span
                      className="text-sm font-medium pb-2"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {commissionNote}
                    </span>
                  </div>
                  <div
                    className="text-xs mt-1 px-2.5 py-1 rounded-full inline-block"
                    style={{
                      background: "var(--badge-neutral-bg)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {minReferrals}
                  </div>
                </div>

                {/* Divider */}
                <div className="divider border-t" />

                {/* Features */}
                <ul className="flex flex-col gap-3">
                  {features.map((f, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-2.5 text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{
                          background: gradient,
                          boxShadow: `0 2px 8px ${glow}`,
                        }}
                      >
                        <Check
                          size={11}
                          className="text-white"
                          strokeWidth={3}
                        />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href="/register?role=affiliate"
                  className="w-full text-center py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 mt-auto"
                  style={{
                    background: gradient,
                    boxShadow: `0 4px 16px ${glow}`,
                  }}
                >
                  {cta}
                </Link>
              </motion.div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
