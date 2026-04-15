// lib/campay.ts

const BASE_URL =
  process.env.CAMPAY_ENV === "PROD"
    ? "https://campay.net/api"
    : "https://demo.campay.net/api";

// Token cache to avoid hitting rate limits
let tokenCache: { token: string; expiresAt: number } | null = null;

export async function getCamPayToken(): Promise<string> {
  const token = process.env.CAMPAY_PAYMENT_TOKEN;
  if (!token) throw new Error("CAMPAY_PAYMENT_TOKEN is not set");
  return token;
}
/**
 * Format phone number to CamPay standard (237XXXXXXXXX)
 * Accepts: 6XXXXXXXX, 237XXXXXXXX, +237XXXXXXXX, 06XXXXXXXX
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digits and leading +
  let cleaned = phone.replace(/\D/g, "");

  // If already starts with 237 and has correct length (12 digits total)
  if (cleaned.startsWith("237") && cleaned.length === 12) {
    return cleaned;
  }

  // If starts with 0, remove it and add 237
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1);
  }

  // If 9 digits, assume it's a Cameroon number without country code
  if (cleaned.length === 9) {
    return "237" + cleaned;
  }

  // If it's 12 digits starting with 237, return as-is
  if (cleaned.length === 12 && cleaned.startsWith("237")) {
    return cleaned;
  }

  throw new Error(
    `Invalid phone number: ${phone}. Use format: 237XXXXXXXXX or 6XXXXXXXX`,
  );
}

export async function initiateCollection({
  amount,
  from,
  description,
  externalReference = "",
  currency = "XAF",
}: {
  amount: number;
  from: string;
  description: string;
  externalReference?: string;
  currency?: string;
}) {
  const token = await getCamPayToken();
  const formattedPhone = formatPhoneNumber(from);

  console.log("💰 Initiating CamPay collection:", {
    amount,
    from: formattedPhone,
    description,
    externalReference,
  });

  const res = await fetch(`${BASE_URL}/collect/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: String(amount),
      currency,
      from: formattedPhone,
      description,
      external_reference: externalReference,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("❌ CamPay collection failed:", data);
    throw new Error(
      data?.detail || data?.message || "Payment initiation failed",
    );
  }

  return data; // { reference, ussd_code, operator }
}

export async function getTransactionStatus(reference: string) {
  const token = await getCamPayToken();

  console.log(`🔍 Checking transaction: ${reference}`);

  const res = await fetch(`${BASE_URL}/transaction/${reference}/`, {
    headers: { Authorization: `Token ${token}` },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    console.error("❌ Status check failed:", error);
    throw new Error("Failed to fetch transaction status");
  }

  const data = await res.json();
  console.log("📊 Transaction data:", data);

  return data; // { status: "SUCCESSFUL" | "FAILED" | "PENDING", amount, ... }
}
