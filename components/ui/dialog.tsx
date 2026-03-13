import * as React from "react";
import { cn } from "@/lib/utils";

function Input({
  className,
  type,
  style,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-[var(--input-radius)] px-3 py-1 text-sm",
        "transition-all duration-200 outline-none",
        // Placeholder
        "placeholder:text-[var(--text-disabled)]",
        // File input
        "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[var(--text-primary)]",
        // Disabled
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        // Invalid
        "aria-invalid:border-[var(--error-text)] aria-invalid:ring-2 aria-invalid:ring-[var(--error-bg)]",
        className,
      )}
      style={{
        background: "var(--input-bg)",
        border: "1px solid var(--input-border)",
        color: "var(--text-primary)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        ...style,
      }}
      onFocus={(e) => {
        e.currentTarget.style.background = "var(--input-bg-focus)";
        e.currentTarget.style.borderColor = "var(--input-border-focus)";
        e.currentTarget.style.boxShadow = "var(--input-shadow-focus)";
      }}
      onBlur={(e) => {
        e.currentTarget.style.background = "var(--input-bg)";
        e.currentTarget.style.borderColor = "var(--input-border)";
        e.currentTarget.style.boxShadow = "none";
      }}
      {...props}
    />
  );
}

export { Input };
