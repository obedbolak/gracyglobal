"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  ShoppingBag,
  Star,
  X,
  ChevronDown,
} from "lucide-react";
import { products, CATEGORIES, type ProductCategory } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/hooks/useCurrency";

type SortOption = "featured" | "price-asc" | "price-desc" | "newest" | "rating";

const SORT_LABELS: Record<SortOption, string> = {
  featured: "Featured",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  newest: "Newest",
  rating: "Top Rated",
};

export default function MarketplacePage() {
  const { addToCart, count } = useCart();
  const { convert, loading: currencyLoading } = useCurrency();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ProductCategory | "All">("All");
  const [sort, setSort] = useState<SortOption>("featured");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [showFilters, setShowFilters] = useState(false);
  const [addedId, setAddedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = [...products];

    if (search) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase()),
      );
    }
    if (category !== "All")
      result = result.filter((p) => p.category === category);
    result = result.filter((p) => p.price >= minPrice && p.price <= maxPrice);

    switch (sort) {
      case "featured":
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
    }

    return result;
  }, [search, category, sort, minPrice, maxPrice]);

  function handleAddToCart(product: (typeof products)[0]) {
    addToCart(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  }

  return (
    <main className="min-h-screen">
      {/* Hero banner */}
      <section className="relative overflow-hidden py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div
          className="absolute -top-40 -left-32 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(220,20,60,0.25) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(123,47,190,0.2) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-6"
            style={{
              background: "var(--glass-bg-subtle)",
              border: "1px solid var(--glass-border)",
              color: "var(--text-muted)",
              backdropFilter: "blur(12px)",
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background:
                  "linear-gradient(135deg, var(--scarlet), var(--purple))",
              }}
            />
            Gracy Marketplace
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Shop African.{" "}
            <span
              style={{
                background:
                  "linear-gradient(90deg, var(--scarlet-light), var(--purple-light))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Earn Together.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base font-light max-w-xl mx-auto mb-8"
            style={{ color: "var(--text-muted)" }}
          >
            Curated wellness, beauty and skincare from African entrepreneurs.
            Every purchase supports local communities.
          </motion.p>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative max-w-lg mx-auto"
          >
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--text-disabled)" }}
            />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 text-sm rounded-2xl transition-all duration-200"
              style={{
                background: "var(--glass-bg-strong)",
                border: "1px solid var(--glass-border)",
                color: "var(--text-primary)",
                outline: "none",
                backdropFilter: "blur(12px)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--input-border-focus)";
                e.currentTarget.style.boxShadow = "var(--input-shadow-focus)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--glass-border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            {(["All", ...CATEGORIES] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat as any)}
                className="px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200"
                style={
                  category === cat
                    ? {
                        background:
                          "linear-gradient(135deg, var(--scarlet), var(--purple))",
                        color: "#fff",
                        boxShadow: "0 4px 14px rgba(220,20,60,0.3)",
                      }
                    : {
                        background: "var(--glass-bg)",
                        border: "1px solid var(--glass-border)",
                        color: "var(--text-muted)",
                      }
                }
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Sort */}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="appearance-none pl-4 pr-8 py-2.5 text-xs font-semibold rounded-xl cursor-pointer transition-all duration-200"
                style={{
                  background: "var(--glass-bg)",
                  border: "1px solid var(--glass-border)",
                  color: "var(--text-secondary)",
                  outline: "none",
                }}
              >
                {Object.entries(SORT_LABELS).map(([v, l]) => (
                  <option
                    key={v}
                    value={v}
                    style={{ background: "var(--bg-base)" }}
                  >
                    {l}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={12}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "var(--text-muted)" }}
              />
            </div>

            {/* Price filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200"
              style={{
                background: showFilters
                  ? "linear-gradient(135deg, var(--purple), var(--blue))"
                  : "var(--glass-bg)",
                border: showFilters ? "none" : "1px solid var(--glass-border)",
                color: showFilters ? "#fff" : "var(--text-secondary)",
              }}
            >
              <SlidersHorizontal size={13} /> Price
            </button>

            {/* Cart */}
            <Link
              href="/marketplace/cart"
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all duration-200 hover:scale-105"
              style={{
                background:
                  "linear-gradient(135deg, var(--scarlet), var(--purple))",
                boxShadow: "0 4px 14px rgba(220,20,60,0.3)",
              }}
            >
              <ShoppingBag size={14} />
              Cart
              {count > 0 && (
                <span
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center text-white"
                  style={{ background: "var(--purple)" }}
                >
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Price range filter */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="glass p-5 mb-8 flex flex-wrap items-center gap-6"
            >
              <span
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Price Range
              </span>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="relative flex-1">
                  <span
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    CFA
                  </span>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value))}
                    min={0}
                    max={maxPrice}
                    className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl"
                    style={{
                      background: "var(--input-bg)",
                      border: "1px solid var(--input-border)",
                      color: "var(--text-primary)",
                      outline: "none",
                    }}
                  />
                </div>
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  to
                </span>
                <div className="relative flex-1">
                  <span
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    CFA
                  </span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    min={minPrice}
                    max={200000}
                    className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl"
                    style={{
                      background: "var(--input-bg)",
                      border: "1px solid var(--input-border)",
                      color: "var(--text-primary)",
                      outline: "none",
                    }}
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  setMinPrice(0);
                  setMaxPrice(100000);
                }}
                className="text-xs font-semibold flex items-center gap-1 transition-colors duration-200"
                style={{ color: "var(--text-muted)" }}
              >
                <X size={12} /> Reset
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results count */}
        <p
          className="text-xs font-medium mb-6"
          style={{ color: "var(--text-muted)" }}
        >
          {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
        </p>

        {/* Product grid */}
        {filtered.length === 0 ? (
          <div className="glass flex flex-col items-center justify-center py-24 text-center gap-4">
            <ShoppingBag size={32} style={{ color: "var(--text-disabled)" }} />
            <p className="font-bold" style={{ color: "var(--text-primary)" }}>
              No products found
            </p>
            <p
              className="text-sm font-light"
              style={{ color: "var(--text-muted)" }}
            >
              Try adjusting your filters or search term.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setCategory("All");
                setMinPrice(0);
                setMaxPrice(100000);
              }}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{
                background:
                  "linear-gradient(135deg, var(--purple), var(--blue))",
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="glass flex flex-col overflow-hidden group"
              >
                {/* Image */}
                <Link
                  href={`/marketplace/${product.id}`}
                  className="relative overflow-hidden"
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.15) 100%)",
                    }}
                  />
                  {product.badge && (
                    <span
                      className="absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full text-white"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--scarlet), var(--purple))",
                      }}
                    >
                      {product.badge}
                    </span>
                  )}
                  <span
                    className="absolute top-3 right-3 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                    style={{
                      background: "var(--glass-bg-strong)",
                      color: "var(--text-secondary)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    {product.category}
                  </span>
                </Link>

                {/* Content */}
                <div className="flex flex-col gap-3 p-5 flex-1">
                  <div>
                    <Link href={`/marketplace/${product.id}`}>
                      <h3
                        className="font-extrabold text-base mb-1 hover:opacity-80 transition-opacity"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {product.name}
                      </h3>
                    </Link>
                    <p
                      className="text-xs leading-relaxed font-light line-clamp-2"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {product.description}
                    </p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={11}
                        className={
                          s <= Math.round(product.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    ))}
                    <span
                      className="text-xs font-semibold ml-1"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {product.rating}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      ({product.reviews})
                    </span>
                  </div>

                  {/* Price + CTA */}
                  <div
                    className="flex items-center justify-between mt-auto pt-3"
                    style={{ borderTop: "1px solid var(--divider)" }}
                  >
                    <div className="flex flex-col">
                      <span
                        className="text-lg font-extrabold"
                        style={{
                          background:
                            "linear-gradient(135deg, var(--scarlet), var(--purple))",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        {currencyLoading ? "..." : convert(product.price)}
                      </span>
                      <span
                        className="text-[10px] font-light"
                        style={{ color: "var(--text-disabled)" }}
                      >
                        CFA {product.price.toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all duration-200 hover:scale-105"
                      style={{
                        background:
                          addedId === product.id
                            ? "linear-gradient(135deg, #10b981, #059669)"
                            : "linear-gradient(135deg, var(--scarlet), var(--purple))",
                        boxShadow: "0 4px 12px rgba(220,20,60,0.25)",
                      }}
                    >
                      <ShoppingBag size={12} />
                      {addedId === product.id ? "Added!" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
