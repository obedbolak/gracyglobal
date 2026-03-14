// data/currencies.ts

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  flag: string;
}

export const CURRENCIES: Currency[] = [
  { code: "XAF", symbol: "CFA", name: "Central African Franc", flag: "🇨🇲" },
  { code: "XOF", symbol: "CFA", name: "West African Franc", flag: "🇸🇳" },
  { code: "NGN", symbol: "₦",   name: "Nigerian Naira",       flag: "🇳🇬" },
  { code: "GHS", symbol: "₵",   name: "Ghanaian Cedi",        flag: "🇬🇭" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling",      flag: "🇰🇪" },
  { code: "ZAR", symbol: "R",   name: "South African Rand",   flag: "🇿🇦" },
  { code: "USD", symbol: "$",   name: "US Dollar",            flag: "🇺🇸" },
  { code: "EUR", symbol: "€",   name: "Euro",                 flag: "🇪🇺" },
  { code: "GBP", symbol: "£",   name: "British Pound",        flag: "🇬🇧" },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar",      flag: "🇨🇦" },
  { code: "MAD", symbol: "MAD", name: "Moroccan Dirham",      flag: "🇲🇦" },
];

export const CURRENCY_MAP: Record<string, string> = {
  code: "XAF",
  // by code
};

// Map country code → currency code
export const COUNTRY_TO_CURRENCY: Record<string, string> = {
  CM: "XAF", CF: "XAF", TD: "XAF", CG: "XAF", GA: "XAF", GQ: "XAF",
  SN: "XOF", CI: "XOF", ML: "XOF", BF: "XOF", NE: "XOF", TG: "XOF", BJ: "XOF", GW: "XOF",
  NG: "NGN",
  GH: "GHS",
  KE: "KES", TZ: "KES", UG: "KES",
  ZA: "ZAR",
  US: "USD",
  GB: "GBP",
  MA: "MAD",
  CA: "CAD",
  // European countries → EUR
  DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR", PT: "EUR", NL: "EUR",
  BE: "EUR", AT: "EUR", FI: "EUR", IE: "EUR", LU: "EUR", GR: "EUR",
};

// Map navigator.language locale → currency code (fallback)
export const LOCALE_TO_CURRENCY: Record<string, string> = {
  "fr-CM": "XAF", "fr-CF": "XAF", "fr-TD": "XAF", "fr-CG": "XAF", "fr-GA": "XAF",
  "fr-SN": "XOF", "fr-CI": "XOF", "fr-ML": "XOF", "fr-BF": "XOF", "fr-NE": "XOF",
  "en-NG": "NGN", "en-GH": "GHS", "en-KE": "KES", "en-ZA": "ZAR",
  "en-US": "USD", "en-GB": "GBP", "en-CA": "CAD",
  "fr-FR": "EUR", "de-DE": "EUR", "es-ES": "EUR",
  "fr-MA": "MAD", "ar-MA": "MAD",
};

export function getCurrencyByCode(code: string): Currency {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

export function getSymbol(code: string): string {
  return getCurrencyByCode(code).symbol;
}

// Detect currency from locale string
export function localeToCurrency(locale: string): string {
  // Try exact match first
  if (LOCALE_TO_CURRENCY[locale]) return LOCALE_TO_CURRENCY[locale];
  // Try country code from locale (e.g. "en-CM" → "CM")
  const countryCode = locale.split("-")[1]?.toUpperCase();
  if (countryCode && COUNTRY_TO_CURRENCY[countryCode]) {
    return COUNTRY_TO_CURRENCY[countryCode];
  }
  // Default to XAF (most users are African)
  return "XAF";
}
