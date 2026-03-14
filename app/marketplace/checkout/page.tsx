"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Shield,
  Smartphone,
  Building2,
  Check,
} from "lucide-react";

import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/hooks/useCurrency";

type PaymentMethod = "mobile_money" | "bank_transfer";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const { convert, loading: currencyLoading } = useCurrency();
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("mobile_money");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Cameroon",
  });

  const fmt = (xaf: number) => (currencyLoading ? "..." : convert(xaf));

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const inputStyle = {
    background: "var(--input-bg)",
    border: "1px solid var(--input-border)",
    color: "var(--text-primary)",
    outline: "none",
  };
  function onFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    e.currentTarget.style.borderColor = "var(--input-border-focus)";
    e.currentTarget.style.boxShadow = "var(--input-shadow-focus)";
  }
  function onBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    e.currentTarget.style.borderColor = "var(--input-border)";
    e.currentTarget.style.boxShadow = "none";
  }

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    clearCart();
    router.push("/marketplace/order-confirmation");
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen">
        <div className="max-w-lg mx-auto px-4 py-32 text-center">
          <p
            className="text-lg font-bold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Your cart is empty.
          </p>
          <Link
            href="/marketplace"
            className="text-sm font-semibold"
            style={{ color: "var(--accent-primary)" }}
          >
            ← Browse products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <Link
          href="/marketplace/cart"
          className="flex items-center gap-1.5 text-sm font-medium mb-8 transition-colors duration-200 hover:opacity-70"
          style={{ color: "var(--text-muted)" }}
        >
          <ChevronLeft size={15} /> Back to Cart
        </Link>

        <h1
          className="text-3xl font-extrabold tracking-tight mb-10"
          style={{ color: "var(--text-primary)" }}
        >
          Checkout
        </h1>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid lg:grid-cols-3 gap-6 items-start">
            {/* Left — form */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Delivery info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="glass p-6"
              >
                <h2
                  className="font-extrabold text-base mb-5"
                  style={{ color: "var(--text-primary)" }}
                >
                  Delivery Information
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      field: "name",
                      label: "Full Name",
                      placeholder: "Grace Nfor",
                      type: "text",
                    },
                    {
                      field: "email",
                      label: "Email",
                      placeholder: "grace@email.com",
                      type: "email",
                    },
                    {
                      field: "phone",
                      label: "Phone",
                      placeholder: "+237 6XX XXX XXX",
                      type: "tel",
                    },
                    {
                      field: "address",
                      label: "Address",
                      placeholder: "Street address",
                      type: "text",
                    },
                    {
                      field: "city",
                      label: "City",
                      placeholder: "Yaoundé",
                      type: "text",
                    },
                  ].map(({ field, label, placeholder, type }) => (
                    <div
                      key={field}
                      className={field === "address" ? "sm:col-span-2" : ""}
                    >
                      <label
                        className="block text-xs font-semibold mb-1.5"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {label}
                      </label>
                      <input
                        type={type}
                        required
                        placeholder={placeholder}
                        value={(form as any)[field]}
                        onChange={(e) => update(field, e.target.value)}
                        className="w-full px-4 py-3 text-sm rounded-xl transition-all duration-200"
                        style={inputStyle}
                        onFocus={onFocus}
                        onBlur={onBlur}
                      />
                    </div>
                  ))}
                  <div>
                    <label
                      className="block text-xs font-semibold mb-1.5"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Country
                    </label>
                    <select
                      value={form.country}
                      onChange={(e) => update("country", e.target.value)}
                      className="w-full px-4 py-3 text-sm rounded-xl transition-all duration-200 appearance-none"
                      style={inputStyle}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    >
                      {[
                        "Cameroon",
                        "Nigeria",
                        "Ghana",
                        "Kenya",
                        "Ivory Coast",
                        "Senegal",
                        "Other",
                      ].map((c) => (
                        <option
                          key={c}
                          value={c}
                          style={{ background: "var(--bg-base)" }}
                        >
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>

              {/* Payment method */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="glass p-6"
              >
                <h2
                  className="font-extrabold text-base mb-5"
                  style={{ color: "var(--text-primary)" }}
                >
                  Payment Method
                </h2>
                <div className="flex flex-col gap-3">
                  {[
                    {
                      id: "mobile_money" as const,
                      icon: Smartphone,
                      label: "Mobile Money",
                      sub: "MTN, Orange, Airtel",
                    },
                    {
                      id: "bank_transfer" as const,
                      icon: Building2,
                      label: "Bank Transfer",
                      sub: "Local & international banks",
                    },
                  ].map(({ id, icon: Icon, label, sub }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPaymentMethod(id)}
                      className="flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-200"
                      style={{
                        background:
                          paymentMethod === id
                            ? "var(--glass-bg-strong)"
                            : "var(--glass-bg)",
                        border:
                          paymentMethod === id
                            ? "2px solid var(--purple-light)"
                            : "1px solid var(--glass-border)",
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background:
                            paymentMethod === id
                              ? "linear-gradient(135deg, var(--purple), var(--blue))"
                              : "var(--glass-bg-subtle)",
                        }}
                      >
                        <Icon
                          size={18}
                          style={{
                            color:
                              paymentMethod === id
                                ? "#fff"
                                : "var(--text-muted)",
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <p
                          className="font-bold text-sm"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {label}
                        </p>
                        <p
                          className="text-xs font-light"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {sub}
                        </p>
                      </div>
                      {paymentMethod === id && (
                        <Check
                          size={16}
                          style={{ color: "var(--purple-light)" }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right — order summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="glass p-6 flex flex-col gap-4"
            >
              <h2
                className="font-extrabold text-base"
                style={{ color: "var(--text-primary)" }}
              >
                Order Summary
              </h2>

              <div className="flex flex-col gap-3">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex items-center gap-3">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-semibold truncate"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {product.name}
                      </p>
                      <p
                        className="text-[11px]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        × {quantity}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span
                        className="text-xs font-bold block"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {fmt(product.price * quantity)}
                      </span>
                      <span
                        className="text-[10px]"
                        style={{ color: "var(--text-disabled)" }}
                      >
                        CFA {(product.price * quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-px" style={{ background: "var(--divider)" }} />

              <div className="flex items-center justify-between">
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-muted)" }}
                >
                  Total
                </span>
                <div className="text-right">
                  <span
                    className="text-xl font-extrabold block"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--scarlet), var(--purple))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {fmt(total)}
                  </span>
                  <span
                    className="text-[10px]"
                    style={{ color: "var(--text-disabled)" }}
                  >
                    CFA {total.toLocaleString()}
                  </span>
                </div>
              </div>

              <div
                className="flex items-center gap-2 text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                <Shield size={12} style={{ color: "var(--accent-primary)" }} />
                Secure & encrypted checkout
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-[1.01] disabled:opacity-60 flex items-center justify-center gap-2"
                style={{
                  background:
                    "linear-gradient(135deg, var(--scarlet), var(--purple))",
                  boxShadow: "0 4px 16px rgba(220,20,60,0.35)",
                }}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                    Processing...
                  </>
                ) : (
                  "Place Order"
                )}
              </button>
            </motion.div>
          </div>
        </form>
      </div>
    </main>
  );
}
