"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Amina Bello",
    location: "Lagos, Nigeria",
    img: "https://randomuser.me/api/portraits/women/32.jpg",
    tier: "Elite",
    earned: "CFA 320,000",
    quote:
      "I started sharing GracyGlobal links in my WhatsApp groups and within 3 months I was earning more than my day job. The Growth tier commission bump was a game changer.",
    rating: 5,
  },
  {
    name: "Jean-Baptiste Mvondo",
    location: "Yaoundé, Cameroon",
    img: "https://randomuser.me/api/portraits/men/54.jpg",
    tier: "Growth",
    earned: "CFA 150,000",
    quote:
      "The marketing materials are top quality. I just posted the banners in my Facebook group and the referrals started coming in. Payouts hit my account within 24 hours.",
    rating: 5,
  },
  {
    name: "Grace Nakato",
    location: "Kampala, Uganda",
    img: "https://randomuser.me/api/portraits/women/68.jpg",
    tier: "Growth",
    earned: "CFA 95,000",
    quote:
      "As a content creator talking about financial freedom, this program aligns perfectly with my audience. The dashboard shows exactly where my earnings come from.",
    rating: 5,
  },
];

const tierColors: Record<string, string> = {
  Elite: "linear-gradient(135deg, var(--purple-light), var(--scarlet-light))",
  Growth: "linear-gradient(135deg, var(--scarlet), var(--purple))",
  Starter: "linear-gradient(135deg, var(--blue), var(--purple))",
};

export default function AffiliateTestimonials() {
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
            Real Earnings
          </div>
          <h2
            className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Affiliates Are Already Winning
          </h2>
          <p
            className="text-base max-w-xl mx-auto font-light"
            style={{ color: "var(--text-muted)" }}
          >
            See what our community members are earning across Africa.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid sm:grid-cols-3 gap-5">
          {testimonials.map(
            ({ name, location, img, tier, earned, quote, rating }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="glass flex flex-col gap-5 p-6"
              >
                {/* Stars */}
                <div className="flex gap-0.5">
                  {Array.from({ length: rating }).map((_, j) => (
                    <Star
                      key={j}
                      size={13}
                      className="fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>

                {/* Quote */}
                <p
                  className="text-sm leading-relaxed font-light flex-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  "{quote}"
                </p>

                {/* User */}
                <div
                  className="flex items-center gap-3 pt-2"
                  style={{ borderTop: "1px solid var(--divider)" }}
                >
                  <img
                    src={img}
                    alt={name}
                    className="w-10 h-10 rounded-full object-cover"
                    style={{ boxShadow: "0 0 0 2px var(--glass-border)" }}
                  />
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-sm font-bold truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {name}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {location}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white"
                      style={{ background: tierColors[tier] }}
                    >
                      {tier}
                    </span>
                    <span
                      className="text-xs font-bold"
                      style={{ color: "var(--accent-primary)" }}
                    >
                      {earned}
                    </span>
                  </div>
                </div>
              </motion.div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
