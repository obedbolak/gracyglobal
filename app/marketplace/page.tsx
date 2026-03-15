"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  ShoppingBag,
  Star,
  X,
  Check,
} from "lucide-react";

import {
  products,
  CATEGORY_GROUPS,
  ALL_CATEGORIES,
  type ProductCategory,
  type CategoryGroup,
} from "@/data/products";
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

// All prices in XAF
const XAF_MIN = 0;
const XAF_MAX = Math.max(...products.map((p) => p.price));

// ─── Dual range slider ────────────────────────────────────────────────────────
function PriceRangeSlider({
  minXAF,
  maxXAF,
  onMinChange,
  onMaxChange,
  rate,
  symbol,
  loading,
}: {
  minXAF: number;
  maxXAF: number;
  onMinChange: (v: number) => void;
  onMaxChange: (v: number) => void;
  rate: number;
  symbol: string;
  loading: boolean;
}) {
  const STEP = 500; // XAF step
  const toDisplay = (xaf: number) => (loading ? xaf : Math.round(xaf * rate));

  const dispMin = toDisplay(minXAF);
  const dispMax = toDisplay(maxXAF);

  const minPct = (minXAF / XAF_MAX) * 100;
  const maxPct = (maxXAF / XAF_MAX) * 100;

  return (
    <div className="flex flex-col gap-4">
      {/* Live price badges */}
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-lg"
          style={{
            background: "var(--badge-purple-bg)",
            color: "var(--badge-purple-text)",
          }}
        >
          {symbol} {dispMin.toLocaleString()}
        </span>
        <span className="text-xs" style={{ color: "var(--text-disabled)" }}>
          –
        </span>
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-lg"
          style={{
            background: "var(--badge-scarlet-bg)",
            color: "var(--badge-scarlet-text)",
          }}
        >
          {symbol} {dispMax.toLocaleString()}
        </span>
      </div>

      {/* Slider track */}
      <div className="relative h-6 flex items-center">
        {/* Grey base */}
        <div
          className="absolute inset-x-0 h-1.5 rounded-full"
          style={{ background: "var(--glass-bg-subtle)" }}
        />
        {/* Coloured active range */}
        <div
          className="absolute h-1.5 rounded-full pointer-events-none"
          style={{
            left: `${minPct}%`,
            right: `${100 - maxPct}%`,
            background: "linear-gradient(90deg, var(--purple), var(--scarlet))",
          }}
        />

        {/* Min thumb — sits below max when near right edge */}
        <input
          type="range"
          min={XAF_MIN}
          max={XAF_MAX}
          step={STEP}
          value={minXAF}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v < maxXAF - STEP) onMinChange(v);
          }}
          className="absolute inset-0 w-full appearance-none bg-transparent cursor-pointer"
          style={{ zIndex: minXAF >= XAF_MAX - STEP * 2 ? 5 : 3 }}
        />
        {/* Max thumb */}
        <input
          type="range"
          min={XAF_MIN}
          max={XAF_MAX}
          step={STEP}
          value={maxXAF}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v > minXAF + STEP) onMaxChange(v);
          }}
          className="absolute inset-0 w-full appearance-none bg-transparent cursor-pointer"
          style={{ zIndex: 4 }}
        />
      </div>

      {/* Min / Max labels */}
      <div
        className="flex items-center justify-between text-[10px]"
        style={{ color: "var(--text-disabled)" }}
      >
        <span>{symbol} 0</span>
        <span>
          {symbol} {toDisplay(XAF_MAX).toLocaleString()}
        </span>
      </div>

      <style>{`
        input[type="range"] { pointer-events: none; }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          pointer-events: all;
          width: 20px; height: 20px;
          border-radius: 50%;
          background: white;
          border: 2.5px solid var(--purple);
          box-shadow: 0 2px 10px rgba(123,47,190,0.4);
          cursor: grab;
          transition: transform 0.1s, box-shadow 0.1s;
        }
        input[type="range"]::-webkit-slider-thumb:active {
          cursor: grabbing;
          transform: scale(1.2);
          box-shadow: 0 4px 16px rgba(123,47,190,0.55);
        }
        input[type="range"]::-moz-range-thumb {
          pointer-events: all;
          width: 20px; height: 20px;
          border-radius: 50%;
          background: white;
          border: 2.5px solid var(--purple);
          box-shadow: 0 2px 10px rgba(123,47,190,0.4);
          cursor: grab;
        }
      `}</style>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function MarketplacePage() {
  const { addToCart, count } = useCart();
  const { convert, rate, currency, loading: currencyLoading } = useCurrency();

  const [search, setSearch] = useState("");
  const [group, setGroup] = useState<CategoryGroup | "All">("All");
  const [category, setCategory] = useState<ProductCategory | "All">("All");
  const [sort, setSort] = useState<SortOption>("featured");
  const [minPriceXAF, setMinPriceXAF] = useState(XAF_MIN);
  const [maxPriceXAF, setMaxPriceXAF] = useState(XAF_MAX);
  const [showFilters, setShowFilters] = useState(false);
  const [addedId, setAddedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = [...products];
    if (search)
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase()),
      );
    if (group !== "All") result = result.filter((p) => p.group === group);
    if (category !== "All")
      result = result.filter((p) => p.category === category);
    result = result.filter(
      (p) => p.price >= minPriceXAF && p.price <= maxPriceXAF,
    );
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
  }, [search, group, category, sort, minPriceXAF, maxPriceXAF]);

  function handleAddToCart(product: (typeof products)[0]) {
    addToCart(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  }

  const hasActiveFilters =
    group !== "All" ||
    category !== "All" ||
    sort !== "featured" ||
    minPriceXAF > XAF_MIN ||
    maxPriceXAF < XAF_MAX;

  function clearAll() {
    setSearch("");
    setGroup("All");
    setCategory("All");
    setSort("featured");
    setMinPriceXAF(XAF_MIN);
    setMaxPriceXAF(XAF_MAX);
  }

  const dispMin = currencyLoading
    ? minPriceXAF
    : Math.round(minPriceXAF * rate);
  const dispMax = currencyLoading
    ? maxPriceXAF
    : Math.round(maxPriceXAF * rate);

  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        {/* ── Top bar ── */}
        <div className="flex items-center gap-3 mb-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--text-disabled)" }}
            />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl transition-all duration-200"
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
                color: "var(--text-primary)",
                outline: "none",
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
          </div>

          {/* Filters button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex-shrink-0"
            style={{
              background: showFilters
                ? "linear-gradient(135deg, var(--purple), var(--blue))"
                : "var(--glass-bg)",
              border: showFilters ? "none" : "1px solid var(--glass-border)",
              color: showFilters ? "#fff" : "var(--text-secondary)",
              boxShadow: showFilters
                ? "0 4px 14px rgba(123,47,190,0.3)"
                : "none",
            }}
          >
            <SlidersHorizontal size={14} />
            Filters
            {hasActiveFilters && (
              <span
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center text-white"
                style={{ background: "var(--scarlet)" }}
              >
                !
              </span>
            )}
          </button>

          {/* Cart */}
          {/* <Link
            href="/marketplace/cart"
            className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all duration-200 hover:scale-105 flex-shrink-0"
            style={{
              background:
                "linear-gradient(135deg, var(--scarlet), var(--purple))",
              boxShadow: "0 4px 14px rgba(220,20,60,0.3)",
            }}
          >
            <ShoppingBag size={14} />
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center text-white"
                style={{ background: "var(--purple)" }}
              >
                {count > 9 ? "9+" : count}
              </span>
            )}
          </Link> */}
        </div>

        {/* ── Filters panel ── */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
              className="overflow-hidden mb-4"
            >
              <div className="glass p-5 flex flex-col gap-5">
                {/* Category + Sort */}
                <div className="grid sm:grid-cols-2 gap-5">
                  {/* Two-level category select */}
                  <div className="flex flex-col gap-3">
                    {/* Group select */}
                    <div>
                      <p
                        className="text-[10px] font-bold uppercase tracking-widest mb-2"
                        style={{ color: "var(--text-disabled)" }}
                      >
                        Department
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={() => {
                            setGroup("All");
                            setCategory("All");
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                          style={
                            group === "All"
                              ? {
                                  background:
                                    "linear-gradient(135deg, var(--scarlet), var(--purple))",
                                  color: "#fff",
                                }
                              : {
                                  background: "var(--glass-bg-subtle)",
                                  border: "1px solid var(--glass-border)",
                                  color: "var(--text-muted)",
                                }
                          }
                        >
                          {group === "All" && (
                            <Check size={9} strokeWidth={3} />
                          )}{" "}
                          All
                        </button>
                        {CATEGORY_GROUPS.map((g) => (
                          <button
                            key={g.group}
                            onClick={() => {
                              setGroup(g.group as any);
                              setCategory("All");
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                            style={
                              group === g.group
                                ? {
                                    background:
                                      "linear-gradient(135deg, var(--scarlet), var(--purple))",
                                    color: "#fff",
                                  }
                                : {
                                    background: "var(--glass-bg-subtle)",
                                    border: "1px solid var(--glass-border)",
                                    color: "var(--text-muted)",
                                  }
                            }
                          >
                            {group === g.group && (
                              <Check size={9} strokeWidth={3} />
                            )}
                            <span>{g.icon}</span> {g.group}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sub-category select — only shows when a group is selected */}
                    {group !== "All" && (
                      <div>
                        <p
                          className="text-[10px] font-bold uppercase tracking-widest mb-2"
                          style={{ color: "var(--text-disabled)" }}
                        >
                          Sub-category
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            onClick={() => setCategory("All")}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                            style={
                              category === "All"
                                ? {
                                    background:
                                      "linear-gradient(135deg, var(--purple), var(--blue))",
                                    color: "#fff",
                                  }
                                : {
                                    background: "var(--glass-bg-subtle)",
                                    border: "1px solid var(--glass-border)",
                                    color: "var(--text-muted)",
                                  }
                            }
                          >
                            {category === "All" && (
                              <Check size={9} strokeWidth={3} />
                            )}{" "}
                            All in {group}
                          </button>
                          {CATEGORY_GROUPS.find(
                            (g) => g.group === group,
                          )?.categories.map((cat) => (
                            <button
                              key={cat}
                              onClick={() => setCategory(cat as any)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                              style={
                                category === cat
                                  ? {
                                      background:
                                        "linear-gradient(135deg, var(--purple), var(--blue))",
                                      color: "#fff",
                                    }
                                  : {
                                      background: "var(--glass-bg-subtle)",
                                      border: "1px solid var(--glass-border)",
                                      color: "var(--text-muted)",
                                    }
                              }
                            >
                              {category === cat && (
                                <Check size={9} strokeWidth={3} />
                              )}{" "}
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sort */}
                  <div>
                    <p
                      className="text-[10px] font-bold uppercase tracking-widest mb-2.5"
                      style={{ color: "var(--text-disabled)" }}
                    >
                      Sort By
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(
                        Object.entries(SORT_LABELS) as [SortOption, string][]
                      ).map(([v, l]) => (
                        <button
                          key={v}
                          onClick={() => setSort(v)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                          style={
                            sort === v
                              ? {
                                  background:
                                    "linear-gradient(135deg, var(--purple), var(--blue))",
                                  color: "#fff",
                                  boxShadow: "0 3px 10px rgba(123,47,190,0.25)",
                                }
                              : {
                                  background: "var(--glass-bg-subtle)",
                                  border: "1px solid var(--glass-border)",
                                  color: "var(--text-muted)",
                                }
                          }
                        >
                          {sort === v && <Check size={10} strokeWidth={3} />}
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Price range */}
                <div>
                  <p
                    className="text-[10px] font-bold uppercase tracking-widest mb-3"
                    style={{ color: "var(--text-disabled)" }}
                  >
                    Price Range · {currency.code}
                  </p>
                  <PriceRangeSlider
                    minXAF={minPriceXAF}
                    maxXAF={maxPriceXAF}
                    onMinChange={setMinPriceXAF}
                    onMaxChange={setMaxPriceXAF}
                    rate={rate || 1}
                    symbol={currency.symbol}
                    loading={currencyLoading}
                  />
                </div>

                {/* Footer row */}
                <div
                  className="flex items-center justify-between pt-1"
                  style={{ borderTop: "1px solid var(--divider)" }}
                >
                  <button
                    onClick={clearAll}
                    className="flex items-center gap-1.5 text-xs font-semibold hover:opacity-70 transition-opacity"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <X size={12} /> Clear all
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-105"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--purple), var(--blue))",
                      color: "#fff",
                    }}
                  >
                    Show {filtered.length} result
                    {filtered.length !== 1 ? "s" : ""}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {group !== "All" && (
              <span
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  background: "var(--badge-scarlet-bg)",
                  color: "var(--scarlet-dark)",
                }}
              >
                {CATEGORY_GROUPS.find((g) => g.group === group)?.icon} {group}
                <button
                  onClick={() => {
                    setGroup("All");
                    setCategory("All");
                  }}
                >
                  <X size={10} />
                </button>
              </span>
            )}
            {category !== "All" && (
              <span
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  background: "var(--badge-blue-bg)",
                  color: "var(--blue-dark)",
                }}
              >
                {category}
                <button onClick={() => setCategory("All")}>
                  <X size={10} />
                </button>
              </span>
            )}
            {sort !== "featured" && (
              <span
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  background: "var(--badge-purple-bg)",
                  color: "var(--purple-dark)",
                }}
              >
                {SORT_LABELS[sort]}
                <button onClick={() => setSort("featured")}>
                  <X size={10} />
                </button>
              </span>
            )}
            {(minPriceXAF > XAF_MIN || maxPriceXAF < XAF_MAX) && (
              <span
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  background: "var(--badge-blue-bg)",
                  color: "var(--blue-dark)",
                }}
              >
                {currency.symbol} {dispMin.toLocaleString()} –{" "}
                {dispMax.toLocaleString()}
                <button
                  onClick={() => {
                    setMinPriceXAF(XAF_MIN);
                    setMaxPriceXAF(XAF_MAX);
                  }}
                >
                  <X size={10} />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Count */}
        <p
          className="text-xs font-medium mb-5"
          style={{ color: "var(--text-muted)" }}
        >
          {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
        </p>

        {/* Grid */}
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
              Try adjusting your filters.
            </p>
            <button
              onClick={clearAll}
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
