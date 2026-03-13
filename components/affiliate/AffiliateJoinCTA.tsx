"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function AffiliateJoinCTA() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="relative rounded-3xl overflow-hidden p-10 sm:p-16 text-center"
          style={{
            background: "linear-gradient(135deg, var(--purple) 0%, var(--blue) 50%, var(--scarlet) 100%)",
            boxShadow: "0 24px 80px rgba(123,47,190,0.45), 0 4px 24px rgba(0,0,0,0.2)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          {/* Glass shimmer overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(145deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.02) 60%, transparent 100%)",
            }}
          />

          {/* Glow blobs */}
          <div
            className="absolute -top-20 -left-20 w-64 h-64 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
          <div
            className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(220,20,60,0.25) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
              Ready to Start Earning?
            </h2>
            <p className="text-white/65 text-base font-light max-w-xl mx-auto mb-10 leading-relaxed">
              Join 500+ affiliates already earning with GracyGlobal. Sign up in 2 minutes, get your link, and start sharing today.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/register?role=affiliate"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 group"
                style={{
                  background: "rgba(255,255,255,0.95)",
                  color: "var(--purple-dark)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.20)",
                }}
              >
                Join the Program Free
                <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="px-8 py-3.5 rounded-2xl text-sm font-bold text-white transition-all duration-200 hover:scale-105"
                style={{
                  background: "rgba(255,255,255,0.14)",
                  border: "1px solid rgba(255,255,255,0.28)",
                  backdropFilter: "blur(10px)",
                }}
              >
                Already a member? Log in
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
