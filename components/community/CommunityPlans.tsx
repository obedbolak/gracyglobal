"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, X, Zap } from "lucide-react";
import { PLANS } from "@/data/plans";
import { useCurrency } from "@/hooks/useCurrency";

type Billing = "monthly" | "annual" | "session";

export default function CommunityPlans() {
  const [billing, setBilling] = useState<Billing>("monthly");
  const { convert, loading } = useCurrency();

  function getPrice(plan: typeof PLANS[0]) {
    if (plan.priceMonthly === 0) return "Free";
    const fmt = (n: number) => loading ? "..." : convert(n);
    if (billing === "monthly")  return fmt(plan.priceMonthly);
    if (billing === "annual")   return fmt(plan.priceAnnual);
    if (billing === "session")  return plan.pricePerSession ? fmt(plan.pricePerSession) : "Unlimited";
    return "Free";
  }

  function getPriceSub(plan: typeof PLANS[0]) {
    if (plan.priceMonthly === 0) return "forever";
    if (billing === "monthly")  return "/ month";
    if (billing === "annual")   return "/ month, billed annually";
    if (billing === "session")  return plan.pricePerSession ? "/ session" : "— no limits";
    return "";
  }

  function getSaving(plan: typeof PLANS[0]) {
    if (plan.priceMonthly === 0 || !plan.priceAnnual) return null;
    const saved = Math.round(((plan.priceMonthly - plan.priceAnnual) / plan.priceMonthly) * 100);
    return saved > 0 ? `Save ${saved}%` : null;
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="text-center mb-12">

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-5"
            style={{ background: "var(--glass-bg-subtle)", border: "1px solid var(--glass-border)", color: "var(--text-muted)", backdropFilter: "blur(12px)" }}>
            <Zap size={12} style={{ color: "var(--purple-light)" }} />
            Choose Your Plan
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight" style={{ color: "var(--text-primary)" }}>
            Invest in Your{" "}
            <span style={{ background: "linear-gradient(90deg, var(--purple-light), var(--scarlet-light))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Transformation
            </span>
          </h2>
          <p className="text-base font-light max-w-xl mx-auto mb-8" style={{ color: "var(--text-muted)" }}>
            Every plan gives you access to Africa's most ambitious community of builders, healers, and leaders.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 p-1 rounded-2xl"
            style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
            {([
              { id: "session", label: "Per Session" },
              { id: "monthly", label: "Monthly" },
              { id: "annual",  label: "Annual" },
            ] as { id: Billing; label: string }[]).map(({ id, label }) => (
              <button key={id} onClick={() => setBilling(id)}
                className="relative px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200"
                style={billing === id ? {
                  background: "linear-gradient(135deg, var(--purple), var(--blue))",
                  color: "#fff",
                  boxShadow: "0 4px 12px rgba(123,47,190,0.35)",
                } : { color: "var(--text-muted)" }}>
                {label}
                {id === "annual" && (
                  <span className="absolute -top-2.5 -right-2 text-[9px] font-black px-1.5 py-0.5 rounded-full text-white"
                    style={{ background: "var(--scarlet)" }}>
                    -30%
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Plan cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
          {PLANS.map((plan, i) => (
            <motion.div key={plan.id}
              initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.08 }}
              className={`glass flex flex-col gap-5 p-6 relative overflow-hidden ${plan.highlighted ? "ring-2 ring-purple-400" : ""}`}
              style={plan.highlighted ? { boxShadow: `0 20px 60px ${plan.glow}, var(--glass-shadow)`, transform: "scale(1.03)" } : {}}>

              {/* Top gradient strip */}
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: plan.gradient }} />

              {/* Badge */}
              {plan.badge && (
                <span className="absolute top-4 right-4 text-[10px] font-bold px-2.5 py-1 rounded-full text-white"
                  style={{ background: plan.gradient }}>
                  {plan.badge}
                </span>
              )}

              {/* Plan name */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>
                  {plan.name}
                </p>
                <p className="text-xs font-light leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div>
                <div className="flex items-end gap-1.5 mb-1">
                  <span className="text-4xl font-extrabold leading-none"
                    style={plan.priceMonthly > 0 ? {
                      background: plan.gradient,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    } : { color: "var(--text-primary)" }}>
                    {getPrice(plan)}
                  </span>
                </div>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {getPriceSub(plan)}
                </p>
                {billing === "annual" && plan.priceMonthly > 0 && (
                  <p className="text-[11px] font-bold mt-1" style={{ color: "#10b981" }}>
                    {getSaving(plan)}
                  </p>
                )}
              </div>

              {/* Divider */}
              <div className="h-px" style={{ background: "var(--divider)" }} />

              {/* Features */}
              <ul className="flex flex-col gap-2.5 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-xs" style={{ color: f.included ? "var(--text-secondary)" : "var(--text-disabled)" }}>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${f.included ? "" : "opacity-40"}`}
                      style={{ background: f.included ? plan.gradient : "var(--badge-neutral-bg)" }}>
                      {f.included
                        ? <Check size={9} className="text-white" strokeWidth={3} />
                        : <X size={9} className="text-white" strokeWidth={3} />}
                    </div>
                    {f.text}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link href={plan.priceMonthly === 0 ? "/register" : "/register?plan=" + plan.id}
                className="w-full text-center py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5"
                style={plan.highlighted ? {
                  background: plan.gradient,
                  color: "#fff",
                  boxShadow: `0 4px 16px ${plan.glow}`,
                } : {
                  background: "var(--glass-bg)",
                  border: "1px solid var(--glass-border)",
                  color: "var(--text-secondary)",
                }}>
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Footer note */}
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.4 }}
          className="text-center text-xs mt-8 font-light" style={{ color: "var(--text-disabled)" }}>
          All prices in your local currency. Cancel anytime. Prices shown in CFA for reference.
        </motion.p>
      </div>
    </section>
  );
}
