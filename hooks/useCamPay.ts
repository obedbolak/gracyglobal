import { useState, useRef, useEffect } from "react";

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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => () => clearPolling(), []);

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
    onSuccess?: (transactionId: string) => void; // ✅ Fixed
    onFailure?: () => void;
  }) => {
    if (status === "pending" || status === "polling") return;
    clearPolling();
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

      let attempts = 0;
      intervalRef.current = setInterval(async () => {
        attempts++;
        try {
          const statusRes = await fetch(
            `/api/payments/campay/status/${data.reference}`,
          );
          const statusData = await statusRes.json();

          if (statusData.status === "SUCCESSFUL") {
            clearPolling();
            setStatus("success");
            onSuccess?.(data.reference); // ✅ Fixed
          } else if (statusData.status === "FAILED") {
            clearPolling();
            setStatus("failed");
            setError("Payment was declined.");
            onFailure?.();
          } else if (attempts >= 12) {
            clearPolling();
            setStatus("error");
            setError(
              "Timed out waiting for confirmation. Check your transaction history.",
            );
          }
        } catch {
          clearPolling();
          setStatus("error");
          setError("Could not verify payment status.");
        }
      }, 5000);
    } catch (err: any) {
      setError(err.message);
      setStatus("error");
    }
  };

  const reset = () => {
    clearPolling();
    setStatus("idle");
    setReference(null);
    setError(null);
  };

  return { status, reference, error, pay, reset };
}
