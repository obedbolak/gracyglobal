"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Minus,
  Plus,
  X,
  ArrowRight,
  ChevronLeft,
} from "lucide-react";

import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/hooks/useCurrency";
import { useCategories } from "@/hooks/useCategories";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, total, count } = useCart();
  const { convert, loading: currencyLoading } = useCurrency();
  const { categories } = useCategories("product");

  const fmt = (xaf: number) => (currencyLoading ? "..." : convert(xaf));

  return (
    <main className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-3xl font-extrabold tracking-tight mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              Your Cart
            </h1>
            <p
              className="text-sm font-light"
              style={{ color: "var(--text-muted)" }}
            >
              {count} item{count !== 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href="/marketplace"
            className="flex items-center gap-1.5 text-sm font-medium transition-colors duration-200 hover:opacity-70"
            style={{ color: "var(--text-muted)" }}
          >
            <ChevronLeft size={15} /> Continue Shopping
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="glass flex flex-col items-center justify-center py-24 text-center gap-5">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: "var(--glass-bg-subtle)",
                border: "1px solid var(--glass-border)",
              }}
            >
              <ShoppingBag
                size={28}
                style={{ color: "var(--text-disabled)" }}
              />
            </div>
            <div>
              <p
                className="font-bold mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                Your cart is empty
              </p>
              <p
                className="text-sm font-light"
                style={{ color: "var(--text-muted)" }}
              >
                Add some products to get started.
              </p>
            </div>
            <Link
              href="/marketplace"
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-105"
              style={{
                background:
                  "linear-gradient(135deg, var(--scarlet), var(--purple))",
              }}
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6 items-start">
            {/* Cart items */}
            <div className="lg:col-span-2 flex flex-col gap-3">
              <AnimatePresence>
                {items.map(({ product, quantity }) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="glass flex items-center gap-4 p-4"
                  >
                    <Link href={`/marketplace/${product.id}`}>
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-20 h-20 rounded-xl object-cover flex-shrink-0 transition-transform duration-200 hover:scale-105"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/marketplace/${product.id}`}>
                        <h3
                          className="font-bold text-sm mb-0.5 hover:opacity-80 transition-opacity truncate"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {product.name}
                        </h3>
                      </Link>
                      <p
                        className="text-xs mb-3"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {categories.find((c) => c.id === product.categoryId)
                          ?.name || "Uncategorized"}
                      </p>
                      <div className="flex items-center gap-3">
                        {/* Quantity controls */}
                        <div
                          className="flex items-center rounded-lg overflow-hidden"
                          style={{
                            border: "1px solid var(--glass-border)",
                            background: "var(--glass-bg-subtle)",
                          }}
                        >
                          <button
                            onClick={() =>
                              updateQuantity(product.id, quantity - 1)
                            }
                            className="w-8 h-8 flex items-center justify-center transition-colors duration-200 hover:opacity-70"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            <Minus size={12} />
                          </button>
                          <span
                            className="w-8 text-center text-sm font-bold"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(product.id, quantity + 1)
                            }
                            disabled={quantity >= product.stock}
                            className="w-8 h-8 flex items-center justify-center transition-colors duration-200 hover:opacity-70 disabled:opacity-30"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        {/* Line price */}
                        <div className="flex flex-col">
                          <span
                            className="text-sm font-extrabold"
                            style={{ color: "var(--accent-primary)" }}
                          >
                            {fmt(product.price * quantity)}
                          </span>
                          {/* <span
                            className="text-[10px]"
                            style={{ color: "var(--text-disabled)" }}
                          >
                            CFA {(product.price * quantity).toLocaleString()}
                          </span> */}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="p-2 rounded-lg transition-all duration-200 hover:scale-110 flex-shrink-0"
                      style={{
                        background: "var(--error-bg)",
                        color: "var(--error-text)",
                      }}
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order summary */}
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

              <div className="flex flex-col gap-2">
                {items.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between text-xs"
                  >
                    <span
                      className="truncate max-w-[140px]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {product.name} × {quantity}
                    </span>
                    <span
                      className="font-semibold"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {fmt(product.price * quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="h-px" style={{ background: "var(--divider)" }} />

              <div className="flex items-center justify-between">
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-muted)" }}
                >
                  Subtotal
                </span>
                <div className="text-right">
                  <span
                    className="text-lg font-extrabold block"
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
                  {/* <span
                    className="text-[10px]"
                    style={{ color: "var(--text-disabled)" }}
                  >
                    CFA {total.toLocaleString()}
                  </span> */}
                </div>
              </div>

              <div
                className="flex items-center justify-between text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                <span>Delivery</span>
                <span
                  className="font-semibold"
                  style={{ color: "var(--success-text)" }}
                >
                  Calculated at checkout
                </span>
              </div>

              <Link
                href="/marketplace/checkout"
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-[1.01] mt-2"
                style={{
                  background:
                    "linear-gradient(135deg, var(--scarlet), var(--purple))",
                  boxShadow: "0 4px 16px rgba(220,20,60,0.35)",
                }}
              >
                Proceed to Checkout <ArrowRight size={15} />
              </Link>
            </motion.div>
          </div>
        )}
      </div>
    </main>
  );
}
