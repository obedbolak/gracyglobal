"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

interface ShareButtonProps {
  href: string;
  title?: string;
  text?: string;
  className?: string;
}

export default function ShareButton({
  href,
  title,
  text,
  className,
}: ShareButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "shared" | "error">(
    "idle",
  );

  const buildUrl = () => {
    if (href.startsWith("http")) return href;
    if (typeof window !== "undefined") {
      return `${window.location.origin}${href}`;
    }
    return href;
  };

  const shareUrl = buildUrl();

  const resetStatus = () => {
    window.setTimeout(() => setStatus("idle"), 1800);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setStatus("copied");
    } catch {
      setStatus("error");
    } finally {
      resetStatus();
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title ?? document.title,
          text: text ?? title,
          url: shareUrl,
        });
        setStatus("shared");
        resetStatus();
        return;
      } catch {
        // User canceled or native share failed, fall back to copy
      }
    }

    await handleCopy();
  };

  const label =
    status === "copied" ? "Copied" : status === "shared" ? "Shared" : "Share";

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={label}
      className={[
        // Layout
        "inline-flex items-center justify-center gap-1.5",
        // Sizing — grows with content, never overflows
        "min-w-0 w-auto max-w-full",
        // Padding scales slightly on larger screens
        "px-3 py-2 sm:px-4",
        // Typography
        "text-xs sm:text-sm font-semibold text-white whitespace-nowrap",
        // Shape & transitions
        "rounded-xl transition-all duration-200",
        // Touch target — ensures at least 44px tall on mobile
        "min-h-[44px] sm:min-h-0",
        // Active state feedback for touch
        "active:scale-95",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        background: "linear-gradient(135deg, var(--scarlet), var(--purple))",
        boxShadow: "0 10px 20px rgba(123, 47, 190, 0.15)",
      }}
    >
      {status === "copied" || status === "shared" ? (
        <Check size={14} aria-hidden="true" />
      ) : (
        <Share2 size={14} aria-hidden="true" />
      )}
      <span>{label}</span>
    </button>
  );
}
