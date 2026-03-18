"use client";

import { motion } from "framer-motion";
import { Zap, Check } from "lucide-react";
import CommunityPlans from "@/components/community/CommunityPlans";

export default function PlansPage() {
  return (
    <main className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Plans Component */}
        <CommunityPlans />

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-20"
        >
          <h2
            className="text-2xl font-bold text-center mb-10"
            style={{ color: "var(--text-primary)" }}
          >
            Frequently Asked Questions
          </h2>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                q: "Can I change my plan later?",
                a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept Mobile Money, Bank Transfer, and PayPal for your convenience.",
              },
              {
                q: "Is there a free trial?",
                a: "The Free plan is available forever. Upgrade anytime to unlock more features.",
              },
              {
                q: "Can I cancel my subscription?",
                a: "Yes, you can cancel anytime. You'll retain access until the end of your billing period.",
              },
            ].map((faq, i) => (
              <div key={i} className="glass p-6">
                <h3
                  className="font-bold text-sm mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  {faq.q}
                </h3>
                <p
                  className="text-sm font-light leading-relaxed"
                  style={{ color: "var(--text-muted)" }}
                >
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-20 text-center"
        >
          <div
            className="glass p-10 max-w-3xl mx-auto"
            style={{
              background:
                "linear-gradient(135deg, rgba(123,47,190,0.1), rgba(26,58,219,0.1))",
            }}
          >
            <h2
              className="text-2xl font-bold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Still have questions?
            </h2>
            <p
              className="text-sm mb-6"
              style={{ color: "var(--text-muted)" }}
            >
              Our team is here to help you choose the right plan for your needs.
            </p>
            <a
              href="mailto:support@gracyglobal.com"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-105"
              style={{
                background:
                  "linear-gradient(135deg, var(--purple), var(--blue))",
                boxShadow: "0 4px 16px rgba(123,47,190,0.4)",
              }}
            >
              Contact Support
            </a>
          </div>
        </motion.div>
      </div>
    </main>
  );
}