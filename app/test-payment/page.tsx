"use client";

import { useCamPay } from "@/hooks/useCamPay";
import { useState } from "react";

export default function TestPaymentPage() {
  const { status, reference, error, pay, reset } = useCamPay();
  const [phone, setPhone] = useState("651234567");
  const [amount, setAmount] = useState(1000);
  const [description, setDescription] = useState("Test Payment");

  const handlePayment = async () => {
    await pay({
      amount,
      phone,
      description,
      externalReference: `test_${Date.now()}`,
      onSuccess: () => {
        console.log("✅ Payment successful!");
        alert("Payment successful!");
      },
      onFailure: () => {
        console.log("❌ Payment failed!");
        alert("Payment failed!");
      },
    });
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Test CamPay Payment</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Phone Number</label>
          <input
            type="tel"
            placeholder="651234567 or 237651234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            Format: 6XXXXXXXX or 237XXXXXXXXX
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Amount (XAF)</label>
          <input
            type="number"
            placeholder="1000"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full border rounded px-3 py-2"
            min="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <input
            type="text"
            placeholder="Test Payment"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <button
          onClick={handlePayment}
          disabled={status === "pending" || status === "polling"}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {status === "idle" && "Pay Now"}
          {status === "pending" && "Initiating..."}
          {status === "polling" && "⏳ Waiting for payment confirmation..."}
          {status === "success" && "✅ Payment Successful!"}
          {status === "failed" && "❌ Payment Failed"}
          {status === "error" && "⚠️ Error Occurred"}
        </button>

        {reference && (
          <div className="p-3 bg-blue-50 rounded">
            <p className="text-sm">
              <strong>Reference:</strong> {reference}
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {status === "polling" && (
          <div className="p-3 bg-yellow-50 text-yellow-800 rounded">
            <p className="text-sm">
              📱 Please check your phone and enter your PIN to complete the
              payment.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="p-3 bg-green-50 text-green-700 rounded">
            <p className="text-sm">✅ Payment completed successfully!</p>
          </div>
        )}

        {(status === "error" || status === "failed") && (
          <button
            onClick={reset}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
          >
            Try Again
          </button>
        )}
      </div>

      {/* Status Display */}
      <div className="mt-6 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">Status:</h3>
        <div className="space-y-1 text-sm">
          <p>
            Current State: <span className="font-mono">{status}</span>
          </p>
          {reference && (
            <p>
              Reference: <span className="font-mono text-xs">{reference}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
