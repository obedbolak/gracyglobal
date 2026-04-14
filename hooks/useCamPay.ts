// hooks/useCamPay.ts
import { useState } from "react";

type PaymentStatus =
  | "idle"
  | "pending"
  | "polling"
  | "success"
  | "failed"
  | "error";

export function useCamPay() {
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [reference, setReference] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pay = async ({
    amount,
    phone,
    description,
    externalReference,
    onSuccess,
    onFailure,
  }: {
    amount: number;
    phone: string;
    description: string;
    externalReference?: string;
    onSuccess?: () => void;
    onFailure?: () => void;
  }) => {
    setStatus("pending");
    setError(null);

    try {
      const res = await fetch("/api/payments/campay/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, phone, description, externalReference }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to initiate payment");

      setReference(data.reference);
      setStatus("polling");

      // Poll every 5s, max 60s
      let attempts = 0;
      const interval = setInterval(async () => {
        attempts++;
        try {
          const statusRes = await fetch(
            `/api/payments/campay/status/${data.reference}`,
          );
          const statusData = await statusRes.json();

          if (statusData.status === "SUCCESSFUL") {
            clearInterval(interval);
            setStatus("success");
            onSuccess?.();
          } else if (statusData.status === "FAILED" || attempts >= 12) {
            clearInterval(interval);
            setStatus("failed");
            setError(
              statusData.status === "FAILED"
                ? "Payment was declined."
                : "Payment timed out.",
            );
            onFailure?.();
          }
        } catch {
          clearInterval(interval);
          setStatus("error");
          setError("Could not verify payment.");
        }
      }, 5000);
    } catch (err: any) {
      setError(err.message);
      setStatus("error");
    }
  };

  const reset = () => {
    setStatus("idle");
    setReference(null);
    setError(null);
  };

  return { status, reference, error, pay, reset };
}
