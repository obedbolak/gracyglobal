"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Phone, CheckCircle, AlertTriangle } from "lucide-react";
import { useCamPay } from "@/hooks/useCamPay";
import { Button } from "@/components/ui/button";

interface SubscriptionPaymentModalProps {
  planCode: string;
  subscriptionId?: string;
  paymentMethodId: string;
  phone?: string;
  onSuccess: (transactionId: string) => void;
  onError: (error: string) => void;
  onClose: () => void;
}

interface Plan {
  id: string;
  planCode: string;
  name: string;
  category: string;
  price: number;
  interval: string;
  features: string[];
}

export default function SubscriptionPaymentModal({
  planCode,
  subscriptionId,
  paymentMethodId,
  phone: initialPhone,
  onSuccess,
  onError,
  onClose,
}: SubscriptionPaymentModalProps) {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [phone, setPhone] = useState(initialPhone || "");
  const [phoneError, setPhoneError] = useState("");
  const [loading, setLoading] = useState(true);
  const { status, error: paymentError, pay, reset } = useCamPay();

  useEffect(() => {
    fetchPlanDetails();
  }, [planCode]);

  const fetchPlanDetails = async () => {
    try {
      const res = await fetch(`/api/plans?planCode=${planCode}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch plan details");
      }

      setPlan(data.data);
    } catch (err: any) {
      console.error("Failed to fetch plan:", err);
      onError("Failed to load plan details");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!plan) return;

    // Validate phone
    if (!phone || phone.trim().length === 0) {
      setPhoneError("Phone number is required");
      return;
    }

    setPhoneError("");

    try {
      let subId = subscriptionId;

      // If no existing subscription, create one
      if (!subId) {
        const subscriptionRes = await fetch("/api/plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planCode: plan.planCode,
            paymentMethodId,
          }),
        });

        const subscriptionData = await subscriptionRes.json();

        if (!subscriptionRes.ok || !subscriptionData.success) {
          throw new Error(
            subscriptionData.error || "Failed to create subscription",
          );
        }

        subId = subscriptionData.data.subscription.id;
      }

      // Process payment
      await pay({
        amount: plan.price,
        phone: phone.trim(),
        description: `Payment for ${plan.name} - ${plan.category}`,
        externalReference: subId,
        onSuccess: async (transactionId: string) => {
          try {
            // Confirm payment
            const confirmRes = await fetch("/api/payments/confirm", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                subscriptionId: subId,
                paymentReference: transactionId,
                status: "SUCCESSFUL",
              }),
            });

            if (!confirmRes.ok) {
              throw new Error("Failed to confirm payment");
            }

            onSuccess(transactionId);
            reset();
            setPhone("");
          } catch (err) {
            console.error("Error confirming payment:", err);
            onError(
              "Payment received but failed to activate subscription. Please contact support.",
            );
          }
        },
        onFailure: () => {
          onError("Payment failed. Please try again.");
          reset();
        },
      });
    } catch (err: any) {
      console.error("Payment error:", err);
      onError(err.message || "Failed to process payment");
      reset();
    }
  };

  const isLoading = status === "pending" || status === "polling";
  const isSuccess = status === "success";

  if (loading) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{
          background: "var(--modal-backdrop)",
          backdropFilter: "var(--modal-blur)",
        }}
      >
        <div
          className="rounded-2xl max-w-md w-full p-6"
          style={{
            background: "var(--modal-bg)",
            border: "1px solid var(--modal-border)",
            boxShadow: "var(--modal-shadow)",
          }}
        >
          <div className="flex items-center justify-center gap-3">
            <Loader2
              className="w-6 h-6 animate-spin"
              style={{ color: "var(--blue)" }}
            />
            <span style={{ color: "var(--text-primary)" }}>
              Loading plan details...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "var(--modal-backdrop)",
        backdropFilter: "var(--modal-blur)",
      }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl max-w-md w-full overflow-hidden"
        style={{
          background: "var(--modal-bg)",
          border: "1px solid var(--modal-border)",
          boxShadow: "var(--modal-shadow)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="p-6 pb-4 flex items-center justify-between border-b"
          style={{ borderColor: "var(--divider)" }}
        >
          <h2
            className="text-xl font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Complete Payment
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 rounded-lg transition-all hover:opacity-80 disabled:opacity-50"
            style={{
              background: "var(--glass-bg-subtle)",
              color: "var(--text-secondary)",
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Plan Summary */}
          <div
            className="rounded-xl p-4"
            style={{
              background: "var(--glass-bg-subtle)",
              border: "1px solid var(--divider)",
            }}
          >
            <div className="flex justify-between mb-2">
              <span style={{ color: "var(--text-secondary)" }}>Plan:</span>
              <span
                className="font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {plan.name}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span style={{ color: "var(--text-secondary)" }}>Category:</span>
              <span
                className="font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {plan.category}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span style={{ color: "var(--text-secondary)" }}>Interval:</span>
              <span
                className="font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {plan.interval}
              </span>
            </div>
            <div
              className="border-t mt-3 pt-3 flex justify-between"
              style={{ borderColor: "var(--divider)" }}
            >
              <span
                className="font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Total Amount:
              </span>
              <span
                className="text-2xl font-bold"
                style={{ color: "var(--success-text)" }}
              >
                {plan.price ? plan.price.toLocaleString() : "0"} XAF
              </span>
            </div>
          </div>

          {/* Phone Input */}
          <div>
            <label
              className="flex items-center gap-2 text-sm font-medium mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              <Phone className="w-4 h-4" />
              Mobile Money Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setPhoneError("");
              }}
              placeholder="e.g., 237679123456"
              className="glass-input w-full px-4 py-3 text-sm"
              disabled={isLoading}
              style={{
                background: "var(--input-bg)",
                border: phoneError
                  ? "1px solid var(--error-border)"
                  : "1px solid var(--input-border)",
                color: "var(--text-primary)",
              }}
            />
            {phoneError && (
              <p
                className="text-xs mt-1.5 flex items-center gap-1"
                style={{ color: "var(--error-text)" }}
              >
                <AlertTriangle className="w-3 h-3" />
                {phoneError}
              </p>
            )}
            <p
              className="text-xs mt-1.5"
              style={{ color: "var(--text-muted)" }}
            >
              Format: 237XXXXXXXXX (country code + number, no spaces)
            </p>
          </div>

          {/* Error Message */}
          {paymentError && (
            <div
              className="rounded-lg p-3 flex items-start gap-2"
              style={{
                background: "var(--error-bg)",
                border: "1px solid var(--error-border)",
              }}
            >
              <AlertTriangle
                className="w-4 h-4 flex-shrink-0 mt-0.5"
                style={{ color: "var(--error-text)" }}
              />
              <p className="text-sm" style={{ color: "var(--error-text)" }}>
                {paymentError}
              </p>
            </div>
          )}

          {/* Success Message */}
          {isSuccess && (
            <div
              className="rounded-lg p-3 flex items-start gap-2"
              style={{
                background: "var(--success-bg)",
                border: "1px solid var(--success-border)",
              }}
            >
              <CheckCircle
                className="w-4 h-4 flex-shrink-0 mt-0.5"
                style={{ color: "var(--success-text)" }}
              />
              <p className="text-sm" style={{ color: "var(--success-text)" }}>
                Payment successful! Your subscription has been activated.
              </p>
            </div>
          )}

          {/* Loading Status */}
          {isLoading && (
            <div
              className="rounded-lg p-3 flex items-center gap-2"
              style={{
                background: "var(--info-bg)",
                border: "1px solid var(--info-border)",
              }}
            >
              <Loader2
                className="w-4 h-4 animate-spin"
                style={{ color: "var(--info-text)" }}
              />
              <p className="text-sm" style={{ color: "var(--info-text)" }}>
                {status === "pending"
                  ? "Initiating payment..."
                  : "Waiting for payment confirmation..."}
              </p>
            </div>
          )}

          {/* Payment Info */}
          <div
            className="rounded-lg p-3"
            style={{
              background: "var(--info-bg)",
              border: "1px solid var(--info-border)",
            }}
          >
            <p className="text-sm" style={{ color: "var(--info-text)" }}>
              💳 <strong>Supported:</strong> MTN Mobile Money, Orange Money
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex gap-3 p-6 border-t"
          style={{
            borderColor: "var(--divider)",
            background: "var(--glass-bg-subtle)",
          }}
        >
          <Button
            variant="outline"
            size="lg"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="default"
            size="lg"
            onClick={handlePayment}
            disabled={isLoading || isSuccess || !phone}
            className="flex-1"
          >
            {isSuccess ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Done
              </>
            ) : isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay ${plan.price.toLocaleString()} XAF`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
