// hooks/useCurrency.ts
// Re-exports useCurrency from the context so all imports work the same way.
// The actual state lives in CurrencyContext — this is just a convenience re-export.

import { Currency } from "@/data/currencies";

export { useCurrency } from "@/context/CurrencyContext";

interface CurrencyState {
  currency: Currency;
  rate: number; // multiplier from XAF
  loading: boolean;
  error: string | null;
  source: "geo" | "locale" | "manual" | "saved";
}

const RATES_CACHE_KEY = "gracy_xaf_rates";
const PREF_CACHE_KEY = "gracy_currency_pref";
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

async function fetchRates(): Promise<Record<string, number>> {
  // Check cache first
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
    localStorage.setItem(
      RATES_CACHE_KEY,
      JSON.stringify({ rates, timestamp: Date.now() }),
    );
  } catch {}

  return rates;
}

async function detectCountryCode(): Promise<string | null> {
  try {
    // Use a free IP geolocation API — no key needed
    const res = await fetch("https://ipapi.co/json/", {
      signal: AbortSignal.timeout(3000),
    });
    const data = await res.json();
    return data.country_code ?? null;
  } catch {
    return null;
  }
}
