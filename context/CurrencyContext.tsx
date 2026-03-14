"use client";

import {
  createContext, useContext, useState, useEffect,
  useCallback, useMemo, type ReactNode,
} from "react";
import {
  localeToCurrency, COUNTRY_TO_CURRENCY,
  getCurrencyByCode, type Currency,
} from "@/data/currencies";

interface CurrencyState {
  currency: Currency;
  rate: number;
  loading: boolean;
  error: string | null;
  source: "geo" | "locale" | "manual" | "saved";
}

interface CurrencyContextType extends CurrencyState {
  convert: (xafAmount: number) => string;
  convertRaw: (xafAmount: number) => number;
  setCurrency: (code: string) => Promise<void>;
  resetCurrency: () => void;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

const RATES_CACHE_KEY = "gracy_xaf_rates";
const PREF_CACHE_KEY  = "gracy_currency_pref";
const CACHE_TTL       = 1000 * 60 * 60; // 1 hour

async function fetchRates(): Promise<Record<string, number>> {
  try {
    const cached = localStorage.getItem(RATES_CACHE_KEY);
    if (cached) {
      const { rates, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) return rates;
    }
  } catch {}

  const res = await fetch("https://api.exchangerate-api.com/v4/latest/XAF");
  if (!res.ok) throw new Error("Rate fetch failed");
  const data = await res.json();
  const rates = data.rates as Record<string, number>;

  try {
    localStorage.setItem(RATES_CACHE_KEY, JSON.stringify({ rates, timestamp: Date.now() }));
  } catch {}

  return rates;
}

async function detectCountryCode(): Promise<string | null> {
  try {
    const res = await fetch("https://ipapi.co/json/", {
      signal: AbortSignal.timeout(3000),
    });
    const data = await res.json();
    return data.country_code ?? null;
  } catch {
    return null;
  }
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CurrencyState>({
    currency: getCurrencyByCode("XAF"),
    rate: 1,
    loading: true,
    error: null,
    source: "locale",
  });

  useEffect(() => {
    async function init() {
      // 1. Saved user preference
      try {
        const saved = localStorage.getItem(PREF_CACHE_KEY);
        if (saved) {
          const { code } = JSON.parse(saved);
          const currency = getCurrencyByCode(code);
          if (code === "XAF") {
            setState({ currency, rate: 1, loading: false, error: null, source: "saved" });
            return;
          }
          const rates = await fetchRates().catch(() => null);
          setState({
            currency,
            rate: rates?.[code] ?? 1,
            loading: false,
            error: rates ? null : "Rate fetch failed",
            source: "saved",
          });
          return;
        }
      } catch {}

      // 2. IP geolocation
      const countryCode = await detectCountryCode();
      let currencyCode = "XAF";
      let source: CurrencyState["source"] = "locale";

      if (countryCode && COUNTRY_TO_CURRENCY[countryCode]) {
        currencyCode = COUNTRY_TO_CURRENCY[countryCode];
        source = "geo";
      } else {
        const locale = navigator.language || "fr-CM";
        currencyCode = localeToCurrency(locale);
        source = "locale";
      }

      const currency = getCurrencyByCode(currencyCode);

      if (currencyCode === "XAF") {
        setState({ currency, rate: 1, loading: false, error: null, source });
        return;
      }

      try {
        const rates = await fetchRates();
        setState({ currency, rate: rates[currencyCode] ?? 1, loading: false, error: null, source });
      } catch {
        setState({
          currency: getCurrencyByCode("XAF"),
          rate: 1, loading: false,
          error: "Could not fetch exchange rates.",
          source: "locale",
        });
      }
    }

    init();
  }, []);

  const setCurrency = useCallback(async (code: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try { localStorage.setItem(PREF_CACHE_KEY, JSON.stringify({ code })); } catch {}

    const currency = getCurrencyByCode(code);

    if (code === "XAF") {
      setState({ currency, rate: 1, loading: false, error: null, source: "manual" });
      return;
    }

    try {
      const rates = await fetchRates();
      setState({ currency, rate: rates[code] ?? 1, loading: false, error: null, source: "manual" });
    } catch {
      setState((prev) => ({ ...prev, loading: false, error: "Rate fetch failed" }));
    }
  }, []);

  const resetCurrency = useCallback(() => {
    try { localStorage.removeItem(PREF_CACHE_KEY); } catch {}
    window.location.reload();
  }, []);

  const convert = useCallback(
    (xafAmount: number): string => {
      if (state.loading) return "...";
      const converted = xafAmount * state.rate;
      try {
        return new Intl.NumberFormat(navigator.language || "en", {
          style: "currency",
          currency: state.currency.code,
          maximumFractionDigits: 0,
        }).format(converted);
      } catch {
        return `${state.currency.symbol} ${Math.round(converted).toLocaleString()}`;
      }
    },
    [state]
  );

  const convertRaw = useCallback(
    (xafAmount: number): number => Math.round(xafAmount * state.rate),
    [state]
  );

  const value = useMemo(
    () => ({ ...state, convert, convertRaw, setCurrency, resetCurrency }),
    [state, convert, convertRaw, setCurrency, resetCurrency]
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
