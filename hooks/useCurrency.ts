// hooks/useCurrency.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { localeToCurrency } from "@/data/counselors";

interface CurrencyState {
  code: string; // e.g. "USD"
  symbol: string; // e.g. "$"
  rate: number; // multiplier from XAF
  loading: boolean;
  error: string | null;
}

const CACHE_KEY = "xaf_rates_cache";
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export function useCurrency() {
  const [state, setState] = useState<CurrencyState>({
    code: "XAF",
    symbol: "CFA",
    rate: 1,
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function init() {
      const locale = navigator.language || "fr-CM";
      const currency = localeToCurrency(locale);

      // No conversion needed for XAF
      if (currency === "XAF") {
        setState({
          code: "XAF",
          symbol: "CFA",
          rate: 1,
          loading: false,
          error: null,
        });
        return;
      }

      // Check cache
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { rates, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL && rates[currency]) {
            setState({
              code: currency,
              symbol: getSymbol(currency),
              rate: rates[currency],
              loading: false,
              error: null,
            });
            return;
          }
        }
      } catch {}

      // Fetch live rates (base: XAF)
      try {
        const res = await fetch(
          `https://api.exchangerate-api.com/v4/latest/XAF`,
        );
        const data = await res.json();
        const rates = data.rates as Record<string, number>;

        // Cache it
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ rates, timestamp: Date.now() }),
        );

        setState({
          code: currency,
          symbol: getSymbol(currency),
          rate: rates[currency] ?? 1,
          loading: false,
          error: null,
        });
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Rate fetch failed",
        }));
      }
    }

    init();
  }, []);

  /** Convert a XAF amount to the user's local currency */
  const convert = useCallback(
    (xafAmount: number): string => {
      if (state.loading) return "...";
      const converted = xafAmount * state.rate;
      return new Intl.NumberFormat(navigator.language, {
        style: "currency",
        currency: state.code,
        maximumFractionDigits: 0,
      }).format(converted);
    },
    [state],
  );

  return { ...state, convert };
}

function getSymbol(code: string): string {
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    NGN: "₦",
    GHS: "₵",
    KES: "KSh",
    ZAR: "R",
    XOF: "CFA",
    MAD: "MAD",
    CAD: "CA$",
    AUD: "A$",
    XAF: "CFA",
  };
  return symbols[code] ?? code;
}
