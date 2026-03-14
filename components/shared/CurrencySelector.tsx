"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Check, Loader2, Search, X } from "lucide-react";
import { CURRENCIES } from "@/data/currencies";
import { useCurrency } from "@/hooks/useCurrency";

export default function CurrencySelector() {
  const { currency, loading, setCurrency, source } = useCurrency();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search when opened
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
    else setSearch("");
  }, [open]);

  const filtered = useMemo(
    () =>
      CURRENCIES.filter(
        (c) =>
          c.code.toLowerCase().includes(search.toLowerCase()) ||
          c.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  );

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 hover:scale-105"
        style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
          color: "var(--text-secondary)",
          backdropFilter: "blur(10px)",
        }}
      >
        {loading ? (
          <Loader2
            size={12}
            className="animate-spin"
            style={{ color: "var(--accent-primary)" }}
          />
        ) : (
          <>
            <span>{currency.flag ?? "🌍"}</span>
            <span>{currency.code}</span>
            <ChevronDown
              size={11}
              className="transition-transform duration-200"
              style={{
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
                color: "var(--text-muted)",
              }}
            />
          </>
        )}
      </button>

      {/* Dropdown — opens ABOVE */}
      {open && (
        <div
          className="absolute left-0 bottom-full mb-2 w-64 rounded-2xl overflow-hidden z-50"
          style={{
            background: "var(--modal-bg)",
            border: "1px solid var(--modal-border)",
            boxShadow: "var(--modal-shadow)",
            backdropFilter: "var(--modal-blur)",
            WebkitBackdropFilter: "var(--modal-blur)",
          }}
        >
          {/* Header */}
          <div
            className="px-3 pt-3 pb-2"
            style={{ borderBottom: "1px solid var(--divider)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <p
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: "var(--text-disabled)" }}
              >
                {source === "geo"
                  ? "🌍 Auto-detected"
                  : source === "manual"
                    ? "✓ Your preference"
                    : "Select Currency"}
              </p>
              <button
                onClick={() => {
                  setOpen(false);
                  setSearch("");
                }}
                className="p-0.5 rounded-lg transition-colors duration-150 hover:opacity-70"
                style={{ color: "var(--text-muted)" }}
              >
                <X size={12} />
              </button>
            </div>

            {/* Search input */}
            <div className="relative">
              <Search
                size={12}
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "var(--text-disabled)" }}
              />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search currency..."
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl transition-all duration-200"
                style={{
                  background: "var(--input-bg)",
                  border: "1px solid var(--input-border)",
                  color: "var(--text-primary)",
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor =
                    "var(--input-border-focus)";
                  e.currentTarget.style.boxShadow = "var(--input-shadow-focus)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--input-border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          {/* Currency list */}
          <div className="overflow-y-auto p-1.5" style={{ maxHeight: "220px" }}>
            {filtered.length === 0 ? (
              <p
                className="text-xs text-center py-4"
                style={{ color: "var(--text-muted)" }}
              >
                No currencies found
              </p>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.code}
                  onClick={() => {
                    setCurrency(c.code);
                    setOpen(false);
                    setSearch("");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150"
                  style={{
                    background:
                      currency.code === c.code
                        ? "var(--glass-bg-strong)"
                        : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (currency.code !== c.code)
                      (e.currentTarget as HTMLElement).style.background =
                        "var(--glass-bg)";
                  }}
                  onMouseLeave={(e) => {
                    if (currency.code !== c.code)
                      (e.currentTarget as HTMLElement).style.background =
                        "transparent";
                  }}
                >
                  <span className="text-base flex-shrink-0">{c.flag}</span>
                  <div className="flex-1 min-w-0">
                    <span
                      className="text-xs font-bold block"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {c.code} · {c.symbol}
                    </span>
                    <span
                      className="text-[10px] truncate block"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {c.name}
                    </span>
                  </div>
                  {currency.code === c.code && (
                    <Check
                      size={13}
                      style={{ color: "var(--accent-primary)", flexShrink: 0 }}
                    />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
