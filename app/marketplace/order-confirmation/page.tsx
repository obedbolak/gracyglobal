"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { CheckCircle, ShoppingBag, ArrowRight, Home } from "lucide-react";

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const orderNumber = orderId
    ? `GG-${orderId.slice(0, 6).toUpperCase()}`
    : `GG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  return (
    <main className="min-h-screen">
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-20 sm:py-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="glass p-10 sm:p-14 flex flex-col items-center text-center gap-6"
        >
          {/* Success icon */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, var(--scarlet), var(--purple))",
              boxShadow: "0 8px 30px rgba(220,20,60,0.4)",
            }}
          >
            <CheckCircle size={36} className="text-white" />
          </div>

          {/* Heading */}
          <div>
            <h1
              className="text-2xl font-extrabold mb-2 tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Order Confirmed! 🎉
            </h1>
            <p
              className="text-sm font-light leading-relaxed"
              style={{ color: "var(--text-muted)" }}
            >
              Thank you for shopping with GracyGlobal. Your order has been
              received and will be processed shortly.
            </p>
          </div>

          {/* Order number */}
          <div
            className="w-full p-4 rounded-xl text-center"
            style={{
              background: "var(--glass-bg-subtle)",
              border: "1px solid var(--glass-border)",
            }}
          >
            <p
              className="text-xs font-medium mb-1"
              style={{ color: "var(--text-muted)" }}
            >
              Order Number
            </p>
            <p
              className="text-lg font-extrabold tracking-widest"
              style={{ color: "var(--text-primary)" }}
            >
              {orderNumber}
            </p>
          </div>

          {/* What's next */}
          <div className="w-full flex flex-col gap-3">
            {[
              {
                step: "1",
                text: "You'll receive an email confirmation shortly.",
              },
              { step: "2", text: "We'll process your order within 24 hours." },
              { step: "3", text: "Delivery within 3–7 business days." },
            ].map(({ step, text }) => (
              <div
                key={step}
                className="flex items-center gap-3 text-sm text-left"
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black text-white flex-shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--purple), var(--blue))",
                  }}
                >
                  {step}
                </div>
                <span style={{ color: "var(--text-secondary)" }}>{text}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Link
              href="/marketplace"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-[1.01]"
              style={{
                background:
                  "linear-gradient(135deg, var(--scarlet), var(--purple))",
                boxShadow: "0 4px 14px rgba(220,20,60,0.35)",
              }}
            >
              <ShoppingBag size={14} /> Shop More
            </Link>
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.01]"
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
                color: "var(--text-secondary)",
              }}
            >
              <Home size={14} /> Go Home
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
