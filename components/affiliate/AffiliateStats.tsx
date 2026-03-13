"use client";

import { motion } from "framer-motion";
import { DollarSign, Users, Globe, Zap } from "lucide-react";

const stats = [
  { icon: DollarSign, value: "CFA 2.4M+", label: "Paid to affiliates" },
  { icon: Users, value: "500+", label: "Active affiliates" },
  { icon: Globe, value: "28", label: "Countries reached" },
  { icon: Zap, value: "24h", label: "Avg. payout time" },
];

export default function AffiliateStats() {
  return (
    <section className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {stats.map(({ icon: Icon, value, label }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="glass flex flex-col items-center justify-center gap-2 py-6 px-4 text-center"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-1"
                style={{
                  background: "linear-gradient(135deg, var(--purple), var(--blue))",
                  boxShadow: "0 4px 14px rgba(123,47,190,0.35)",
                }}
              >
                <Icon size={18} className="text-white" />
              </div>
              <span
                className="text-2xl font-extrabold"
                style={{ color: "var(--text-primary)" }}
              >
                {value}
              </span>
              <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                {label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
