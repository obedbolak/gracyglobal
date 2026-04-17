"use client";

import { useState, useEffect } from "react";
import { X, Loader } from "lucide-react";
import { useCamPay } from "@/hooks/useCamPay";

interface SubscriptionPaymentModalProps {
  planCode: string;
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
      // First create the subscription
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

      const { subscription, payment } = subscriptionData.data;

      // Now process the payment
      await pay({
        amount: plan.price,
        phone: phone.trim(),
        description: `Payment for ${plan.name} - ${plan.category}`,
        externalReference: subscription.id,
        onSuccess: async (transactionId: string) => {
          try {
            // Confirm payment and activate subscription
            const confirmRes = await fetch("/api/payments/confirm", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                subscriptionId: subscription.id,
                transactionId,
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
      console.error("Subscription creation error:", err);
      onError(err.message || "Failed to create subscription");
      reset();
    }
  };

  const isLoading = status === "pending" || status === "polling";
  const isSuccess = status === "success";

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
          <div className="flex items-center justify-center">
            <Loader className="w-6 h-6 animate-spin mr-2" />
            <span>Loading plan details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Complete Payment
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content lets make it work*/}
        <div className="p-6 space-y-6">
          {/* Plan Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Plan:</span>
              <span className="font-semibold text-gray-900">{plan.name}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Category:</span>
              <span className="font-semibold text-gray-900">
                {plan.category}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Interval:</span>
              <span className="font-semibold text-gray-900">
                {plan.interval}
              </span>
            </div>
            <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between">
              <span className="text-gray-900 font-semibold">Total Amount:</span>
              <span className="text-2xl font-bold text-green-600">
                {plan.price ? plan.price.toLocaleString() : "0"} XAF
              </span>
            </div>
          </div>

          {/* Error Message */}
          {paymentError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{paymentError}</p>
            </div>
          )}

          {/* Success Message */}
          {isSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-700 text-sm">
                Payment successful! Your subscription has been activated.
              </p>
            </div>
          )}

          {/* Status Messages */}
          {isLoading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
              <Loader size={16} className="animate-spin" />
              <p className="text-blue-700 text-sm">
                {status === "pending"
                  ? "Initiating payment..."
                  : "Waiting for payment confirmation..."}
              </p>
            </div>
          )}

          {/* Payment Method Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              <span className="text-blue-600">💡</span>{" "}
              <strong>Payment Methods:</strong> MTN Mobile Money, Orange Money,
              Card (via CamPay)
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={isLoading || isSuccess}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
          >
            {isSuccess ? (
              "Done"
            ) : isLoading ? (
              <>
                <Loader size={16} className="animate-spin" />
                Processing...
              </>
            ) : (
              "Pay Now"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
