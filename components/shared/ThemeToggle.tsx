"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: {
    track: "w-12 h-6",
    knob: "w-5 h-5",
    translate: "translate-x-6",
    icon: 12,
  },
  md: {
    track: "w-14 h-7",
    knob: "w-6 h-6",
    translate: "translate-x-7",
    icon: 14,
  },
  lg: {
    track: "w-16 h-8",
    knob: "w-7 h-7",
    translate: "translate-x-8",
    icon: 16,
  },
};

export function ThemeToggle({ className, size = "md" }: ThemeToggleProps) {
  const { toggleTheme, isDark } = useTheme();
  const s = sizeMap[size];

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "relative inline-flex items-center cursor-pointer select-none",
        "rounded-full p-0.5 transition-all duration-300 focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-offset-2",
        s.track,
        className,
      )}
      style={{
        background: isDark
          ? "linear-gradient(135deg, #5b1f9a, #7b2fbe)"
          : "linear-gradient(135deg, #a855f7, #7b2fbe)",
        boxShadow: isDark
          ? "0 2px 12px rgba(168,85,247,0.45), inset 0 1px 0 rgba(255,255,255,0.15)"
          : "0 2px 12px rgba(123,47,190,0.35), inset 0 1px 0 rgba(255,255,255,0.30)",
      }}
    >
      {/* Track icons */}
      <span className="absolute left-1.5 flex items-center justify-center opacity-80">
        <Sun size={s.icon} color="#fff" strokeWidth={2.5} />
      </span>
      <span className="absolute right-1.5 flex items-center justify-center opacity-80">
        <Moon size={s.icon} color="#fff" strokeWidth={2.5} />
      </span>

      {/* Knob */}
      <span
        className={cn(
          "relative z-10 flex items-center justify-center rounded-full",
          "transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          s.knob,
          isDark ? s.translate : "translate-x-0",
        )}
        style={{
          background: "rgba(255,255,255,0.92)",
          boxShadow:
            "0 2px 8px rgba(0,0,0,0.20), 0 1px 3px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.9)",
        }}
      >
        {isDark ? (
          <Moon size={s.icon - 2} color="#7b2fbe" strokeWidth={2.5} />
        ) : (
          <Sun size={s.icon - 2} color="#a855f7" strokeWidth={2.5} />
        )}
      </span>
    </button>
  );
}
