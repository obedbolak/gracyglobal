"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Star,
  ShoppingBag,
  ChevronLeft,
  Check,
  Minus,
  Plus,
  Shield,
  Truck,
  RotateCcw,
} from "lucide-react";

import { useProduct, useProducts } from "@/hooks/UseProducts";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/hooks/useCurrency";
import { useCategories } from "@/hooks/useCategories";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProductDetailSkeleton() {
  const categories = useCategories("product");
  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 animate-pulse">
        <div
          className="h-5 w-32 rounded-lg mb-8"
          style={{ background: "var(--glass-bg)" }}
        />
        <div className="grid lg:grid-cols-2 gap-10 mb-20">
          {/* Image skeleton */}
          <div className="flex flex-col gap-3">
            <div
              className="h-96 rounded-2xl"
              style={{ background: "var(--glass-bg)" }}
            />
            <div className="flex gap-3">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-20 rounded-xl"
                  style={{ background: "var(--glass-bg)" }}
                />
              ))}
            </div>
          </div>
          {/* Details skeleton */}
          <div className="flex flex-col gap-5">
            <div className="flex gap-2">
              <div
                className="h-6 w-24 rounded-full"
                style={{ background: "var(--glass-bg)" }}
              />
              <div
                className="h-6 w-16 rounded-full"
                style={{ background: "var(--glass-bg)" }}
              />
            </div>
            <div>
              <div
                className="h-10 w-3/4 rounded-lg mb-3"
                style={{ background: "var(--glass-bg)" }}
              />
              <div
                className="h-8 w-32 rounded-lg"
                style={{ background: "var(--glass-bg)" }}
              />
            </div>
            <div
              className="h-4 w-48 rounded-lg"
              style={{ background: "var(--glass-bg)" }}
            />
            <div className="flex flex-col gap-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-3 rounded-lg"
                  style={{
                    background: "var(--glass-bg)",
                    width: `${85 - i * 10}%`,
                  }}
                />
              ))}
            </div>
            <div
              className="h-12 rounded-xl"
              style={{ background: "var(--glass-bg)" }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { convert, loading: currencyLoading } = useCurrency();

  const id = Array.isArray(params.id) ? params.id[0] : (params.id as string);

  // ── Fetch product from DB ──────────────────────────────────────────────────
  const { product, isLoading, error } = useProduct(id);

  // ── Fetch related products (same category, excluding current) ──────────────
  const { products: related } = useProducts({
    category: product?.category as any,
    limit: 4,
  });
  const relatedFiltered = related.filter((p) => p.id !== id).slice(0, 3);

  // ── Local UI state ─────────────────────────────────────────────────────────
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);

  // ── Loading / error states ─────────────────────────────────────────────────
  if (isLoading) return <ProductDetailSkeleton />;

  if (error || !product) {
    return (
      <main className="min-h-screen">
        <div className="max-w-lg mx-auto px-4 py-32 text-center">
          <p
            className="text-lg font-bold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            {error ? "Failed to load product." : "Product not found."}
          </p>
          {error && (
            <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
              {error.message}
            </p>
          )}
          <Link
            href="/marketplace"
            className="text-sm font-semibold"
            style={{ color: "var(--accent-primary)" }}
          >
            ← Back to Marketplace
          </Link>
        </div>
      </main>
    );
  }

  function handleAddToCart() {
    addToCart(product!, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const { categories } = useCategories("product");

  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm font-medium mb-8 transition-colors duration-200 hover:opacity-70"
          style={{ color: "var(--text-muted)" }}
        >
          <ChevronLeft size={16} /> Back to Marketplace
        </button>

        <div className="grid lg:grid-cols-2 gap-10 mb-20">
          {/* ── Images ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-3"
          >
            <div className="glass overflow-hidden rounded-2xl">
              <img
                src={product.images[activeImg]}
                alt={product.name}
                className="w-full h-80 sm:h-96 object-cover transition-all duration-500"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className="flex-1 overflow-hidden rounded-xl transition-all duration-200"
                    style={{
                      border:
                        activeImg === i
                          ? "2px solid var(--purple-light)"
                          : "2px solid transparent",
                    }}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* ── Details ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col gap-5"
          >
            {/* Badge + category */}
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{
                  background: "var(--badge-purple-bg)",
                  color: "var(--badge-purple-text)",
                }}
              >
                {categories.find((c) => c.id === product.categoryId)?.name ||
                  "Uncategorized"}
              </span>
              {product.badge && (
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--scarlet), var(--purple))",
                  }}
                >
                  {product.badge}
                </span>
              )}
            </div>

            {/* Name + price */}
            <div>
              <h1
                className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                {product.name}
              </h1>
              <div className="flex items-baseline gap-3">
                <span
                  className="text-3xl font-extrabold"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--scarlet), var(--purple))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {currencyLoading ? "…" : convert(product.price)}
                </span>
                <span
                  className="text-sm font-light"
                  style={{ color: "var(--text-disabled)" }}
                >
                  CFA {product.price.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={14}
                    className={
                      s <= Math.round(product.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>
              <span
                className="text-sm font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {product.rating}
              </span>
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                ({product.reviews} reviews)
              </span>
            </div>

            {/* Description */}
            <p
              className="text-sm leading-relaxed font-light"
              style={{ color: "var(--text-secondary)" }}
            >
              {product.description}
            </p>

            {/* Benefits */}
            {product.benefits && product.benefits.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.benefits.map((b) => (
                  <span
                    key={b}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
                    style={{
                      background: "var(--glass-bg)",
                      border: "1px solid var(--glass-border)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <Check
                      size={10}
                      style={{ color: "var(--accent-primary)" }}
                      strokeWidth={3}
                    />
                    {b}
                  </span>
                ))}
              </div>
            )}

            {/* Quantity + Add to cart */}
            <div className="flex items-center gap-4 pt-2">
              <div
                className="flex items-center rounded-xl overflow-hidden"
                style={{
                  border: "1px solid var(--glass-border)",
                  background: "var(--glass-bg)",
                }}
              >
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:opacity-70 transition-opacity"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <Minus size={14} />
                </button>
                <span
                  className="w-10 text-center text-sm font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  className="w-10 h-10 flex items-center justify-center hover:opacity-70 transition-opacity"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-[1.01]"
                style={{
                  background: added
                    ? "linear-gradient(135deg, #10b981, #059669)"
                    : "linear-gradient(135deg, var(--scarlet), var(--purple))",
                  boxShadow: "0 4px 16px rgba(220,20,60,0.35)",
                }}
              >
                {added ? (
                  <>
                    <Check size={15} /> Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingBag size={15} /> Add to Cart
                  </>
                )}
              </button>
            </div>

            {/* Stock */}
            <p
              className="text-xs font-medium"
              style={{
                color:
                  product.stock > 10
                    ? "var(--success-text)"
                    : "var(--warning-text)",
              }}
            >
              {product.stock > 10
                ? `✓ In stock (${product.stock} available)`
                : `⚠ Only ${product.stock} left`}
            </p>

            {/* Trust row */}
            <div
              className="grid grid-cols-3 gap-3 pt-2"
              style={{ borderTop: "1px solid var(--divider)" }}
            >
              {[
                { icon: Shield, label: "Authentic", sub: "100% genuine" },
                { icon: Truck, label: "Delivery", sub: "Nationwide" },
                { icon: RotateCcw, label: "Returns", sub: "7-day policy" },
              ].map(({ icon: Icon, label, sub }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl text-center"
                  style={{
                    background: "var(--glass-bg-subtle)",
                    border: "1px solid var(--glass-border-subtle)",
                  }}
                >
                  <Icon size={16} style={{ color: "var(--accent-primary)" }} />
                  <span
                    className="text-xs font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {label}
                  </span>
                  <span
                    className="text-[10px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {sub}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Ingredients */}
        {product.ingredients && product.ingredients.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="glass p-6 mb-8"
          >
            <h2
              className="text-lg font-extrabold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Key Ingredients
            </h2>
            <div className="flex flex-wrap gap-2">
              {product.ingredients.map((ing) => (
                <span
                  key={ing}
                  className="text-xs font-medium px-3 py-1.5 rounded-full"
                  style={{
                    background: "var(--badge-purple-bg)",
                    color: "var(--badge-purple-text)",
                  }}
                >
                  {ing}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Related products */}
        {relatedFiltered.length > 0 && (
          <div>
            <h2
              className="text-xl font-extrabold mb-6"
              style={{ color: "var(--text-primary)" }}
            >
              You May Also Like
            </h2>
            <div className="grid sm:grid-cols-3 gap-5">
              {relatedFiltered.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="glass overflow-hidden group"
                >
                  <Link href={`/marketplace/${p.id}`}>
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>
                  <div className="p-4">
                    <Link href={`/marketplace/${p.id}`}>
                      <h3
                        className="font-bold text-sm mb-1 hover:opacity-80 transition-opacity"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {p.name}
                      </h3>
                    </Link>
                    <p
                      className="text-sm font-extrabold"
                      style={{ color: "var(--accent-primary)" }}
                    >
                      {currencyLoading ? "…" : convert(p.price)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
