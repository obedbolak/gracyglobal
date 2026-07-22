"use client";

// app/marketplace/page.tsx

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  ShoppingBag,
  Star,
  X,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useCategories, type Category } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/UseProducts";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/hooks/useCurrency";
import ShareButton from "@/components/shared/ShareButton";

type SortOption = "featured" | "price-asc" | "price-desc" | "newest" | "rating";

const SORT_LABELS: Record<SortOption, string> = {
  featured: "Featured",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  newest: "Newest",
  rating: "Top Rated",
};

const XAF_MIN = 0;
const XAF_MAX_DEFAULT = 1_000_000;
const PRODUCTS_PER_PAGE = 10;

// ─── Category Tab Bar ─────────────────────────────────────────────────────────

function CategoryTabBar({
  categories,
  activeCategory,
  onSelect,
}: {
  categories: Category[];
  activeCategory: string | null;
  onSelect: (name: string | null) => void;
}) {
  return null;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({
  currentPage,
  total,
  perPage,
  onPageChange,
}: {
  currentPage: number;
  total: number;
  perPage: number;
  onPageChange: (p: number) => void;
}) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;

  const getPages = (): (number | "...")[] => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    )
      pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
        style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
          color:
            currentPage === 1
              ? "var(--text-disabled)"
              : "var(--text-secondary)",
          opacity: currentPage === 1 ? 0.5 : 1,
        }}
      >
        <ChevronLeft size={14} /> Prev
      </button>
      <div className="flex items-center gap-1">
        {getPages().map((page, i) =>
          page === "..." ? (
            <span
              key={`e-${i}`}
              className="w-9 h-9 flex items-center justify-center text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className="w-9 h-9 rounded-xl text-xs font-bold transition-all hover:scale-105"
              style={
                currentPage === page
                  ? {
                      background:
                        "linear-gradient(135deg, var(--purple), var(--blue))",
                      color: "#fff",
                      boxShadow: "0 4px 12px rgba(123,47,190,0.35)",
                    }
                  : {
                      background: "var(--glass-bg)",
                      border: "1px solid var(--glass-border)",
                      color: "var(--text-secondary)",
                    }
              }
            >
              {page}
            </button>
          ),
        )}
      </div>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
        style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
          color:
            currentPage === totalPages
              ? "var(--text-disabled)"
              : "var(--text-secondary)",
          opacity: currentPage === totalPages ? 0.5 : 1,
        }}
      >
        Next <ChevronRight size={14} />
      </button>
    </div>
  );
}

// ─── Accordion ────────────────────────────────────────────────────────────────

function AccordionSection({
  id,
  title,
  openId,
  onToggle,
  children,
  badge,
}: {
  id: string;
  title: string;
  openId: string | null;
  onToggle: (id: string) => void;
  children: React.ReactNode;
  badge?: string | number;
}) {
  const isOpen = openId === id;
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid var(--glass-border)" }}
    >
      <button
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        style={{ background: "var(--glass-bg)" }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLElement).style.background =
            "var(--btn-ghost-bg-hover)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLElement).style.background =
            "var(--glass-bg)")
        }
      >
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            {title}
          </span>
          {badge !== undefined && (
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full truncate max-w-[80px]"
              style={{
                background: "var(--badge-purple-bg)",
                color: "var(--badge-purple-text)",
              }}
            >
              {badge}
            </span>
          )}
        </div>
        <ChevronDown
          size={14}
          style={{
            color: "var(--text-muted)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        />
      </button>
      <div
        style={{
          maxHeight: isOpen ? "600px" : "0px",
          opacity: isOpen ? 1 : 0,
          overflow: "hidden",
          transition: "max-height 0.3s ease, opacity 0.2s ease",
        }}
      >
        <div
          className="p-2 flex flex-col gap-0.5"
          style={{
            background: "var(--glass-bg)",
            borderTop: "1px solid var(--glass-border)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function SidebarItem({
  label,
  icon,
  isActive,
  onClick,
}: {
  label: string;
  icon?: string | null;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left w-full"
      style={{
        background: isActive ? "var(--blue)" : "transparent",
        color: isActive ? "white" : "var(--text-secondary)",
      }}
      onMouseEnter={(e) => {
        if (!isActive)
          (e.currentTarget as HTMLElement).style.background =
            "var(--btn-ghost-bg-hover)";
      }}
      onMouseLeave={(e) => {
        if (!isActive)
          (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      {icon && (
        <span className="text-base leading-none flex-shrink-0">{icon}</span>
      )}
      <span className="flex-1 truncate">{label}</span>
      {isActive && (
        <Check size={11} strokeWidth={3} className="flex-shrink-0" />
      )}
    </button>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function SidebarContent({
  categories,
  activeCategory,
  sort,
  minPriceXAF,
  maxPriceXAF,
  xafMax,
  rate,
  symbol,
  currencyLoading,
  onCategoryChange,
  onSortChange,
  onMinPriceChange,
  onMaxPriceChange,
  onClearAll,
  hasActiveFilters,
  total,
  isLoading,
}: {
  categories: Category[];
  activeCategory: string | null;
  sort: SortOption;
  minPriceXAF: number;
  maxPriceXAF: number;
  xafMax: number;
  rate: number;
  symbol: string;
  currencyLoading: boolean;
  onCategoryChange: (n: string | null) => void;
  onSortChange: (s: SortOption) => void;
  onMinPriceChange: (v: number) => void;
  onMaxPriceChange: (v: number) => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;
  total: number;
  isLoading: boolean;
}) {
  const [openId, setOpenId] = useState<string | null>("category");
  const toggle = (id: string) => setOpenId((p) => (p === id ? null : id));
  const STEP = 500;
  const toDisplay = (xaf: number) =>
    currencyLoading ? xaf : Math.round(xaf * rate);
  const minPct = xafMax > 0 ? (minPriceXAF / xafMax) * 100 : 0;
  const maxPct = xafMax > 0 ? (maxPriceXAF / xafMax) * 100 : 100;

  return (
    <div className="flex flex-col gap-2">
      <div
        className="px-3 py-2 rounded-xl text-xs font-medium text-center"
        style={{
          background: "var(--badge-blue-bg)",
          color: "var(--blue-dark)",
        }}
      >
        {isLoading
          ? "Loading…"
          : `${total} product${total !== 1 ? "s" : ""} found`}
      </div>

      <AccordionSection
        id="category"
        title="Category"
        openId={openId}
        onToggle={toggle}
        badge={activeCategory ?? undefined}
      >
        <SidebarItem
          label="All Products"
          icon="🛍️"
          isActive={activeCategory === null}
          onClick={() => onCategoryChange(null)}
        />
        {categories.map((cat) => (
          <SidebarItem
            key={cat.id}
            label={cat.name}
            icon={cat.icon}
            isActive={activeCategory === cat.name}
            onClick={() => onCategoryChange(cat.name)}
          />
        ))}
      </AccordionSection>

      <AccordionSection
        id="sort"
        title="Sort By"
        openId={openId}
        onToggle={toggle}
        badge={sort !== "featured" ? SORT_LABELS[sort] : undefined}
      >
        {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(
          ([v, l]) => (
            <SidebarItem
              key={v}
              label={l}
              isActive={sort === v}
              onClick={() => onSortChange(v)}
            />
          ),
        )}
      </AccordionSection>

      <AccordionSection
        id="price"
        title="Price Range"
        openId={openId}
        onToggle={toggle}
        badge={
          minPriceXAF > XAF_MIN || maxPriceXAF < xafMax ? symbol : undefined
        }
      >
        <div className="px-2 py-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-lg"
              style={{
                background: "var(--badge-purple-bg)",
                color: "var(--badge-purple-text)",
              }}
            >
              {symbol} {toDisplay(minPriceXAF).toLocaleString()}
            </span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              –
            </span>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-lg"
              style={{
                background: "var(--badge-scarlet-bg)",
                color: "var(--badge-scarlet-text)",
              }}
            >
              {symbol} {toDisplay(maxPriceXAF).toLocaleString()}
            </span>
          </div>
          <div className="relative h-6 flex items-center">
            <div
              className="absolute inset-x-0 h-1.5 rounded-full"
              style={{ background: "var(--glass-bg-subtle)" }}
            />
            <div
              className="absolute h-1.5 rounded-full pointer-events-none"
              style={{
                left: `${minPct}%`,
                right: `${100 - maxPct}%`,
                background:
                  "linear-gradient(90deg, var(--purple), var(--scarlet))",
              }}
            />
            <input
              type="range"
              min={XAF_MIN}
              max={xafMax}
              step={STEP}
              value={minPriceXAF}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (v < maxPriceXAF - STEP) onMinPriceChange(v);
              }}
              className="absolute inset-0 w-full appearance-none bg-transparent cursor-pointer"
              style={{ zIndex: minPriceXAF >= xafMax - STEP * 2 ? 5 : 3 }}
            />
            <input
              type="range"
              min={XAF_MIN}
              max={xafMax}
              step={STEP}
              value={maxPriceXAF}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (v > minPriceXAF + STEP) onMaxPriceChange(v);
              }}
              className="absolute inset-0 w-full appearance-none bg-transparent cursor-pointer"
              style={{ zIndex: 4 }}
            />
          </div>
          <div
            className="flex items-center justify-between text-[10px]"
            style={{ color: "var(--text-muted)" }}
          >
            <span>{symbol} 0</span>
            <span>
              {symbol} {toDisplay(xafMax).toLocaleString()}
            </span>
          </div>
        </div>
        <style>{`
          input[type="range"]{pointer-events:none}
          input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;pointer-events:all;width:18px;height:18px;border-radius:50%;background:white;border:2.5px solid var(--purple);box-shadow:0 2px 8px rgba(123,47,190,0.4);cursor:grab}
          input[type="range"]::-webkit-slider-thumb:active{cursor:grabbing;transform:scale(1.2)}
          input[type="range"]::-moz-range-thumb{pointer-events:all;width:18px;height:18px;border-radius:50%;background:white;border:2.5px solid var(--purple);cursor:grab}
        `}</style>
      </AccordionSection>

      {hasActiveFilters && (
        <button
          onClick={onClearAll}
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold mt-1"
          style={{
            background: "var(--glass-bg-subtle)",
            border: "1px solid var(--glass-border)",
            color: "var(--text-muted)",
          }}
        >
          <X size={12} /> Clear all filters
        </button>
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="glass flex flex-col overflow-hidden">
      <div className="h-52 skeleton" />
      <div className="p-5 flex flex-col gap-3">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-2/3 rounded" />
        <div className="flex justify-between items-center mt-2">
          <div className="skeleton h-6 w-20 rounded" />
          <div className="skeleton h-8 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

function MarketplacePageContent() {
  const { addToCart } = useCart();
  const { convert, rate, currency, loading: currencyLoading } = useCurrency();
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const topRef = useRef<HTMLDivElement>(null);

  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategories("product");

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>("featured");
  const [minPriceXAF, setMinPriceXAF] = useState(XAF_MIN);
  const [maxPriceXAF, setMaxPriceXAF] = useState(XAF_MAX_DEFAULT);
  const [xafMax, setXafMax] = useState(XAF_MAX_DEFAULT);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { products, total, isLoading, error } = useProducts({
    search: search || undefined,
    category: activeCategory ?? undefined,
    sort,
    minPrice: minPriceXAF > XAF_MIN ? minPriceXAF : undefined,
    maxPrice: maxPriceXAF < xafMax ? maxPriceXAF : undefined,
    limit: PRODUCTS_PER_PAGE,
    page: currentPage,
  });

  const { products: allProducts } = useProducts({ limit: 200 });
  useEffect(() => {
    if (allProducts.length > 0) {
      const max = Math.max(...allProducts.map((p) => p.price));
      setXafMax(max);
      setMaxPriceXAF(max);
    }
  }, [allProducts.length]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeCategory, sort, minPriceXAF, maxPriceXAF]);

  useEffect(() => {
    const categoryIdParam = searchParams.get("categoryId");
    const categoryNameParam = searchParams.get("category");
    const searchParam = searchParams.get("search");
    const sortParam = searchParams.get("sort") as SortOption;

    if (categoryIdParam && categories.length > 0) {
      const category = categories.find((c) => c.id === categoryIdParam);
      if (category) setActiveCategory(category.name);
    } else if (categoryNameParam) {
      setActiveCategory(categoryNameParam);
    }

    if (searchParam) setSearch(searchParam);
    if (sortParam && Object.keys(SORT_LABELS).includes(sortParam))
      setSort(sortParam);

    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [searchParams, categories]);

  function handleAddToCart(product: (typeof products)[0]) {
    addToCart(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  }

  function handlePageChange(page: number) {
    setCurrentPage(page);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const hasActiveFilters =
    activeCategory !== null ||
    sort !== "featured" ||
    minPriceXAF > XAF_MIN ||
    maxPriceXAF < xafMax;

  function clearAll() {
    setSearch("");
    setActiveCategory(null);
    setSort("featured");
    setMinPriceXAF(XAF_MIN);
    setMaxPriceXAF(xafMax);
    setCurrentPage(1);
  }

  const sidebarProps = {
    categories,
    activeCategory,
    sort,
    minPriceXAF,
    maxPriceXAF,
    xafMax,
    rate: rate || 1,
    symbol: currency.symbol,
    currencyLoading,
    onCategoryChange: setActiveCategory,
    onSortChange: (s: SortOption) => setSort(s),
    onMinPriceChange: setMinPriceXAF,
    onMaxPriceChange: setMaxPriceXAF,
    onClearAll: clearAll,
    hasActiveFilters,
    total,
    isLoading,
  };

  const totalPages = Math.ceil(total / PRODUCTS_PER_PAGE);
  const showingFrom =
    total === 0 ? 0 : (currentPage - 1) * PRODUCTS_PER_PAGE + 1;
  const showingTo = Math.min(currentPage * PRODUCTS_PER_PAGE, total);

  return (
    <main className="min-h-screen">
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20"
        ref={topRef}
      >
        {/* ── Hero ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Gracy Global Marketplace
          </h1>
        </motion.div>



        {/* ── Layout ── */}
        <div className="flex gap-7 items-start">


          {/* Mobile overlay */}
          {mobileSidebarOpen && (
            <div
              className="fixed inset-0 z-40"
              style={{
                background: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(4px)",
              }}
              onClick={() => setMobileSidebarOpen(false)}
            />
          )}

          {/* Mobile drawer */}
          <div
            className="fixed top-0 left-0 h-full z-50 overflow-y-auto transition-transform duration-300"
            style={{
              width: "290px",
              background: "var(--bg-base)",
              borderRight: "1px solid var(--glass-border)",
              padding: "20px 16px",
              transform: mobileSidebarOpen
                ? "translateX(0)"
                : "translateX(-100%)",
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2
                className="font-bold text-base"
                style={{ color: "var(--text-primary)" }}
              >
                Filters
              </h2>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg"
                style={{ color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>
            <SidebarContent
              {...sidebarProps}
              onCategoryChange={(name) => {
                sidebarProps.onCategoryChange(name);
                setMobileSidebarOpen(false);
              }}
            />
          </div>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {/* ── Search + mobile filter ── */}
            <div className="flex items-center gap-3 mb-5">
              <div className="relative flex-1 min-w-0">
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
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl"
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
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold flex-shrink-0"
                style={{
                  background: hasActiveFilters
                    ? "linear-gradient(135deg, var(--purple), var(--blue))"
                    : "var(--glass-bg)",
                  border: hasActiveFilters
                    ? "none"
                    : "1px solid var(--glass-border)",
                  color: hasActiveFilters ? "#fff" : "var(--text-secondary)",
                }}
              >
                <SlidersHorizontal size={14} /> Filters
                {hasActiveFilters && (
                  <span
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center text-white"
                    style={{ background: "var(--scarlet)" }}
                  >
                    !
                  </span>
                )}
              </button>
            </div>
            
            <p className="text-sm font-light text-center mb-6" style={{ color: "var(--text-muted)" }}>
              Discover trusted products, services, and business opportunities from sellers worldwide.
            </p>

            {/* ── Active filter chips ── */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {activeCategory && (
                  <span
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: "var(--badge-scarlet-bg)",
                      color: "var(--scarlet-dark)",
                    }}
                  >
                    {categories.find((c) => c.name === activeCategory)?.icon}{" "}
                    {activeCategory}
                    <button onClick={() => setActiveCategory(null)}>
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
                {(minPriceXAF > XAF_MIN || maxPriceXAF < xafMax) && (
                  <span
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: "var(--badge-blue-bg)",
                      color: "var(--blue-dark)",
                    }}
                  >
                    {currency.symbol}{" "}
                    {Math.round(minPriceXAF * (rate || 1)).toLocaleString()} –{" "}
                    {Math.round(maxPriceXAF * (rate || 1)).toLocaleString()}
                    <button
                      onClick={() => {
                        setMinPriceXAF(XAF_MIN);
                        setMaxPriceXAF(xafMax);
                      }}
                    >
                      <X size={10} />
                    </button>
                  </span>
                )}
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: "var(--glass-bg-subtle)",
                    border: "1px solid var(--glass-border)",
                    color: "var(--text-muted)",
                  }}
                >
                  <X size={10} /> Clear all
                </button>
              </div>
            )}
            {!isLoading && !error && total > 0 && (
              <div className="flex items-center justify-between mb-5">
                <p
                  className="text-xs font-medium"
                  style={{ color: "var(--text-muted)" }}
                >
                  Showing{" "}
                  <span
                    className="font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {showingFrom}–{showingTo}
                  </span>{" "}
                  of{" "}
                  <span
                    className="font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {total}
                  </span>{" "}
                  products
                </p>
                {totalPages > 1 && (
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Page{" "}
                    <span
                      className="font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {currentPage}
                    </span>{" "}
                    of {totalPages}
                  </p>
                )}
              </div>
            )}

            {isLoading && (
              <p
                className="text-xs font-medium mb-5"
                style={{ color: "var(--text-muted)" }}
              >
                Loading products…
              </p>
            )}

            {error && (
              <div className="glass flex flex-col items-center justify-center py-16 text-center gap-3">
                <p
                  className="font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Failed to load products
                </p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {(error as Error).message}
                </p>
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {[...Array(PRODUCTS_PER_PAGE)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : products.length === 0 && !error ? (
              <div className="glass flex flex-col items-center justify-center py-24 text-center gap-4">
                <ShoppingBag
                  size={32}
                  style={{ color: "var(--text-disabled)" }}
                />
                <p
                  className="font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
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
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                  {products.map((product, i) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                      className="glass flex flex-col overflow-hidden group"
                    >
                      {/* Image */}
                      {/* Image Container */}
                      <div className="relative overflow-hidden flex-shrink-0 group-hover:scale-[1.02] transition-transform duration-500">
                        <Link
                          href={`/marketplace/${product.id}`}
                          className="block"
                        >
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-40 sm:h-52 object-cover transition-transform duration-500 group-hover:scale-105"
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
                              className="absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full text-white pointer-events-none"
                              style={{
                                background:
                                  "linear-gradient(135deg, var(--scarlet), var(--purple))",
                              }}
                            >
                              {product.badge}
                            </span>
                          )}
                          {product.category?.name && (
                            <span
                              className="hidden sm:block absolute top-3 right-3 text-[11px] font-semibold px-2.5 py-1 rounded-full pointer-events-none"
                              style={{
                                background: "var(--glass-bg-strong)",
                                color: "var(--text-secondary)",
                                backdropFilter: "blur(8px)",
                              }}
                            >
                              {product.category.icon &&
                                `${product.category.icon} `}
                              {product.category.name}
                            </span>
                          )}
                        </Link>
                        {/* Share Button absolute positioned on bottom right */}
                        <div className="absolute bottom-3 right-3 z-10">
                          <ShareButton
                            href={`/marketplace/${product.id}`}
                            title={product.name}
                            iconOnly
                          />
                        </div>
                      </div>

                      {/* Card body */}
                      <div className="flex flex-col gap-3 p-5 flex-1">
                        {/* Name + description */}
                        <div>
                          <Link href={`/marketplace/${product.id}`}>
                            <h3
                              className="font-extrabold text-base mb-1 hover:opacity-80 transition-opacity line-clamp-1"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {product.name}
                            </h3>
                          </Link>
                          {product.category?.name && (
                            <span
                              className="sm:hidden text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mb-1.5"
                              style={{
                                background: "var(--glass-bg-strong)",
                                color: "var(--text-secondary)",
                              }}
                            >
                              {product.category.icon &&
                                `${product.category.icon} `}
                              {product.category.name}
                            </span>
                          )}
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

                        {/* Price + actions — pushed to bottom */}
                        <div
                          className="flex flex-col gap-2 mt-auto pt-3"
                          style={{ borderTop: "1px solid var(--divider)" }}
                        >
                          {/* Price */}
                          <div className="flex items-baseline gap-2">
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
                              {currencyLoading ? "…" : convert(product.price)}
                            </span>
                            <span
                              className="text-[10px] font-light"
                              style={{ color: "var(--text-disabled)" }}
                            >
                              CFA {product.price.toLocaleString()}
                            </span>
                          </div>

                          {/* Add to Cart */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleAddToCart(product)}
                              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-[1.01] active:scale-[0.99]"
                              style={{
                                background:
                                  addedId === product.id
                                    ? "linear-gradient(135deg, #10b981, #059669)"
                                    : "linear-gradient(135deg, var(--scarlet), var(--purple))",
                                boxShadow: "0 4px 12px rgba(220,20,60,0.25)",
                              }}
                            >
                              <ShoppingBag size={12} />
                              {addedId === product.id
                                ? "Added!"
                                : "Add to Cart"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <Pagination
                  currentPage={currentPage}
                  total={total}
                  perPage={PRODUCTS_PER_PAGE}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function MarketplaceLoading() {
  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        <div className="h-10 rounded-xl mb-4 skeleton" />
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {[...Array(PRODUCTS_PER_PAGE)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </main>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<MarketplaceLoading />}>
      <MarketplacePageContent />
    </Suspense>
  );
}
