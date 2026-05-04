// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCFA(amount: number): string {
  return new Intl.NumberFormat("fr-CM", {
    style: "currency",
    currency: "XAF",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k+`;
  return `${n}+`;
}

// Email validation functions
const ALLOWED_EMAIL_DOMAINS = [
  "gmail.com",
  "google.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "yahoo.com",
  "ymail.com",
  "icloud.com",
  "me.com",
  "protonmail.com",
  "proton.me",
  "zoho.com",
  "zohomail.com",
  "fastmail.com",
  "fastmail.fm",
  "tutanota.com",
  "tutamail.com",
  "mail.com",
  "usa.com",
  "europe.com",
  "yandex.com",
  "yandex.ru",
];

export function validateEmail(email: string): {
  isValid: boolean;
  error?: string;
} {
  if (!email) {
    return { isValid: false, error: "Email is required" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }

  const domain = email.split("@")[1]?.toLowerCase();
  if (!ALLOWED_EMAIL_DOMAINS.includes(domain)) {
    return {
      isValid: false,
      error:
        "Only emails from verified services (Gmail, Outlook, Yahoo, etc.) are allowed. Please use a permanent email address from a trusted provider.",
    };
  }

  return { isValid: true };
}

export function validateName(name: string): {
  isValid: boolean;
  error?: string;
} {
  if (!name.trim()) {
    return { isValid: false, error: "Name is required" };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: "Name must be at least 2 characters long" };
  }

  // Check for only letters, spaces, hyphens, apostrophes
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  if (!nameRegex.test(name.trim())) {
    return {
      isValid: false,
      error: "Name can only contain letters, spaces, hyphens, and apostrophes",
    };
  }

  // Check for at least two names (first and last)
  const nameParts = name.trim().split(/\s+/);
  if (nameParts.length < 2) {
    return {
      isValid: false,
      error: "Please enter your full name (at least first and last name)",
    };
  }

  return { isValid: true };
}
