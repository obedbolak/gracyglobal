"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Is the affiliate program free to join?",
    a: "Yes — 100% free. No registration fees, no monthly costs. Simply sign up, get your link, and start sharing.",
  },
  {
    q: "How do I get paid?",
    a: "We support Mobile Money (MTN, Orange), bank transfers, and PayPal. Payments are processed within 24 hours of reaching the minimum threshold of CFA 5,000.",
  },
  {
    q: "What counts as a successful referral?",
    a: "A referral is counted when someone signs up using your unique link and completes their first paid action — booking a counselor, purchasing a product, or subscribing to a service.",
  },
  {
    q: "How long does my referral cookie last?",
    a: "Your referral cookie lasts 30 days. If someone clicks your link and converts within 30 days, you earn the commission.",
  },
  {
    q: "Can I promote on multiple platforms?",
    a: "Absolutely. You can share your link on WhatsApp, Facebook, Instagram, TikTok, YouTube, your blog — anywhere. We provide platform-specific creative assets.",
  },
  {
    q: "How are tiers calculated?",
    a: "Tiers are based on the number of successful referrals you generate per calendar month. They reset and recalculate automatically at the start of each month.",
  },
];

export default function AffiliateFAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
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
            FAQ
          </div>
          <h2
            className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Common Questions
          </h2>
        </motion.div>

        {/* Accordion */}
        <div className="flex flex-col gap-3">
          {faqs.map(({ q, a }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="glass overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left transition-colors duration-200"
                style={{ color: "var(--text-primary)" }}
              >
                <span className="font-semibold text-sm">{q}</span>
                <ChevronDown
                  size={16}
                  className="flex-shrink-0 transition-transform duration-300"
                  style={{
                    transform: open === i ? "rotate(180deg)" : "rotate(0deg)",
                    color: "var(--accent-primary)",
                  }}
                />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
                    className="overflow-hidden"
                  >
                    <p
                      className="px-5 pb-5 text-sm leading-relaxed font-light"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
