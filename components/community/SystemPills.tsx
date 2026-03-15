"use client";

import { SYSTEMS, type SystemId } from "@/data/community";
import { Check } from "lucide-react";

export default function SystemPills({
  active,
  onChangeAction,
}: {
  active: SystemId | "all";
  onChangeAction: (s: SystemId | "all") => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={() => onChangeAction("all")}
        className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
        style={
          active === "all"
            ? { background: "linear-gradient(135deg, var(--purple), var(--blue))", color: "#fff" }
            : { background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--text-muted)" }
        }
      >
        All Systems
      </button>
      {SYSTEMS.map((s) => (
        <button
          key={s.id}
          onClick={() => onChangeAction(s.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
          style={
            active === s.id
              ? { background: s.gradient, color: "#fff", boxShadow: `0 3px 12px ${s.glow}` }
              : { background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--text-muted)" }
          }
        >
          {active === s.id && <Check size={9} strokeWidth={3} />}
          {s.icon} {s.label}
        </button>
      ))}
    </div>
  );
}
