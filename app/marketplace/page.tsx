"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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

import {
  CATEGORY_GROUPS,
  ALL_CATEGORIES,
  type ProductCategory,
  type CategoryGroup,
} from "@/data/products";
import { useProducts } from "@/hooks/UseProducts";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/hooks/useCurrency";

// ─── Types ────────────────────────────────────────────────────────────────────

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
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;

  const getPages = (): (number | "...")[] => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
        style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
          color:
            currentPage === 1
              ? "var(--text-disabled)"
              : "var(--text-secondary)",
          cursor: currentPage === 1 ? "not-allowed" : "pointer",
          opacity: currentPage === 1 ? 0.5 : 1,
        }}
      >
        <ChevronLeft size={14} /> Prev
      </button>

      <div className="flex items-center gap-1">
        {getPages().map((page, i) =>
          page === "..." ? (
            <span
              key={`ellipsis-${i}`}
              className="w-9 h-9 flex items-center justify-center text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className="w-9 h-9 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-105"
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
        disabled={currentPage === Math.ceil(total / perPage)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
        style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
          color:
            currentPage === Math.ceil(total / perPage)
              ? "var(--text-disabled)"
              : "var(--text-secondary)",
          cursor:
            currentPage === Math.ceil(total / perPage)
              ? "not-allowed"
              : "pointer",
          opacity: currentPage === Math.ceil(total / perPage) ? 0.5 : 1,
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
        className="w-full flex items-center justify-between px-4 py-3 text-left transition-all duration-200"
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
          className="flex-shrink-0 transition-transform duration-200"
          style={{
            color: "var(--text-muted)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
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

// ─── Sidebar item ─────────────────────────────────────────────────────────────

function SidebarItem({
  label,
  icon,
  isActive,
  onClick,
  count,
}: {
  label: string;
  icon?: string;
  isActive: boolean;
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 text-left w-full"
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
      {count !== undefined && !isActive && (
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
          style={{
            background: "var(--glass-bg-subtle)",
            color: "var(--text-muted)",
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// ─── Sidebar content ──────────────────────────────────────────────────────────

function SidebarContent({
  group,
  category,
  sort,
  minPriceXAF,
  maxPriceXAF,
  xafMax,
  rate,
  symbol,
  currencyLoading,
  onGroupChange,
  onCategoryChange,
  onSortChange,
  onMinPriceChange,
  onMaxPriceChange,
  onClearAll,
  hasActiveFilters,
  total,
  isLoading,
}: {
  group: CategoryGroup | "All";
  category: ProductCategory | "All";
  sort: SortOption;
  minPriceXAF: number;
  maxPriceXAF: number;
  xafMax: number;
  rate: number;
  symbol: string;
  currencyLoading: boolean;
  onGroupChange: (g: CategoryGroup | "All") => void;
  onCategoryChange: (c: ProductCategory | "All") => void;
  onSortChange: (s: SortOption) => void;
  onMinPriceChange: (v: number) => void;
  onMaxPriceChange: (v: number) => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;
  total: number;
  isLoading: boolean;
}) {
  const [openId, setOpenId] = useState<string | null>("department");
  const toggleAccordion = (id: string) =>
    setOpenId((prev) => (prev === id ? null : id));

  const STEP = 500;
  const toDisplay = (xaf: number) =>
    currencyLoading ? xaf : Math.round(xaf * rate);
  const minPct = xafMax > 0 ? (minPriceXAF / xafMax) * 100 : 0;
  const maxPct = xafMax > 0 ? (maxPriceXAF / xafMax) * 100 : 100;
  const currentGroupCategories =
    group !== "All"
      ? (CATEGORY_GROUPS.find((g) => g.group === group)?.categories ?? [])
      : [];

  return (
    <div className="flex flex-col gap-2">
      {/* Results pill */}
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

      {/* Department */}
      <AccordionSection
        id="department"
        title="Department"
        openId={openId}
        onToggle={toggleAccordion}
        badge={group !== "All" ? group : undefined}
      >
        <SidebarItem
          label="All Departments"
          icon="🛍️"
          isActive={group === "All"}
          onClick={() => {
            onGroupChange("All");
            onCategoryChange("All");
          }}
        />
        {CATEGORY_GROUPS.map((g) => (
          <SidebarItem
            key={g.group}
            label={g.group}
            icon={g.icon}
            isActive={group === g.group}
            onClick={() => {
              onGroupChange(g.group as CategoryGroup);
              onCategoryChange("All");
            }}
          />
        ))}
      </AccordionSection>

      {/* Sub-category */}
      {group !== "All" && (
        <AccordionSection
          id="subcategory"
          title="Sub-category"
          openId={openId}
          onToggle={toggleAccordion}
          badge={category !== "All" ? category : undefined}
        >
          <SidebarItem
            label={`All in ${group}`}
            isActive={category === "All"}
            onClick={() => onCategoryChange("All")}
          />
          {currentGroupCategories.map((cat) => (
            <SidebarItem
              key={cat}
              label={cat}
              isActive={category === cat}
              onClick={() => onCategoryChange(cat as ProductCategory)}
            />
          ))}
        </AccordionSection>
      )}

      {/* Sort */}
      <AccordionSection
        id="sort"
        title="Sort By"
        openId={openId}
        onToggle={toggleAccordion}
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

      {/* Price range */}
      <AccordionSection
        id="price"
        title="Price Range"
        openId={openId}
        onToggle={toggleAccordion}
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
          input[type="range"] { pointer-events: none; }
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none; pointer-events: all;
            width: 18px; height: 18px; border-radius: 50%;
            background: white; border: 2.5px solid var(--purple);
            box-shadow: 0 2px 8px rgba(123,47,190,0.4);
            cursor: grab; transition: transform 0.1s;
          }
          input[type="range"]::-webkit-slider-thumb:active {
            cursor: grabbing; transform: scale(1.2);
          }
          input[type="range"]::-moz-range-thumb {
            pointer-events: all; width: 18px; height: 18px;
            border-radius: 50%; background: white;
            border: 2.5px solid var(--purple); cursor: grab;
          }
        `}</style>
      </AccordionSection>

      {/* Clear all */}
      {hasActiveFilters && (
        <button
          onClick={onClearAll}
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all mt-1"
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

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="glass flex flex-col overflow-hidden animate-pulse">
      <div className="h-52 bg-gray-200 dark:bg-gray-700" />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        <div className="flex justify-between items-center mt-2">
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-8 w-28 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Main page content ────────────────────────────────────────────────────────

function MarketplacePageContent() {
  const { addToCart } = useCart();
  const { convert, rate, currency, loading: currencyLoading } = useCurrency();
  const searchParams = useSearchParams();
  const topRef = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState("");
  const [group, setGroup] = useState<CategoryGroup | "All">("All");
  const [category, setCategory] = useState<ProductCategory | "All">("All");
  const [sort, setSort] = useState<SortOption>("featured");
  const [minPriceXAF, setMinPriceXAF] = useState(XAF_MIN);
  const [maxPriceXAF, setMaxPriceXAF] = useState(XAF_MAX_DEFAULT);
  const [xafMax, setXafMax] = useState(XAF_MAX_DEFAULT);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // ── Fetch paginated products ───────────────────────────────────────────────
  const { products, total, isLoading, error } = useProducts({
    search: search || undefined,
    group: group !== "All" ? group : undefined,
    category: category !== "All" ? category : undefined,
    sort,
    minPrice: minPriceXAF > XAF_MIN ? minPriceXAF : undefined,
    maxPrice: maxPriceXAF < xafMax ? maxPriceXAF : undefined,
    limit: PRODUCTS_PER_PAGE,
    page: currentPage,
  });

  // ── Fetch all products once to derive price ceiling ───────────────────────
  const { products: allProducts } = useProducts({ limit: 200 });
  useEffect(() => {
    if (allProducts.length > 0) {
      const max = Math.max(...allProducts.map((p) => p.price));
      setXafMax(max);
      setMaxPriceXAF(max);
    }
  }, [allProducts.length]);

  // ── Reset page on filter change ───────────────────────────────────────────
  useEffect(() => {
    setCurrentPage(1);
  }, [search, group, category, sort, minPriceXAF, maxPriceXAF]);

  // ── URL params on mount ───────────────────────────────────────────────────
  useEffect(() => {
    const groupParam = searchParams.get("group");
    const categoryParam = searchParams.get("category");
    const searchParam = searchParams.get("search");
    const sortParam = searchParams.get("sort") as SortOption;
    if (groupParam && CATEGORY_GROUPS.some((g) => g.group === groupParam))
      setGroup(groupParam as CategoryGroup);
    if (
      categoryParam &&
      ALL_CATEGORIES.includes(categoryParam as ProductCategory)
    )
      setCategory(categoryParam as ProductCategory);
    if (searchParam) setSearch(searchParam);
    if (sortParam && Object.keys(SORT_LABELS).includes(sortParam))
      setSort(sortParam);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [searchParams]);

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
    group !== "All" ||
    category !== "All" ||
    sort !== "featured" ||
    minPriceXAF > XAF_MIN ||
    maxPriceXAF < xafMax;

  function clearAll() {
    setSearch("");
    setGroup("All");
    setCategory("All");
    setSort("featured");
    setMinPriceXAF(XAF_MIN);
    setMaxPriceXAF(xafMax);
    setCurrentPage(1);
  }

  const sidebarProps = {
    group,
    category,
    sort,
    minPriceXAF,
    maxPriceXAF,
    xafMax,
    rate: rate || 1,
    symbol: currency.symbol,
    currencyLoading,
    onGroupChange: (g: CategoryGroup | "All") => {
      setGroup(g);
      setCategory("All");
    },
    onCategoryChange: (c: ProductCategory | "All") => setCategory(c),
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
        {/* Search + mobile filter trigger */}
        <div className="flex items-center gap-3 mb-5">
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

          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold flex-shrink-0 transition-all"
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
        </div>

        {/* Active filter chips */}
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
              className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all"
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

        {/* Layout */}
        <div className="flex gap-7 items-start">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-60 flex-shrink-0 sticky top-24">
            <SidebarContent {...sidebarProps} />
          </aside>

          {/* Mobile sidebar overlay */}
          {mobileSidebarOpen && (
            <div
              className="fixed inset-0 z-40 lg:hidden"
              style={{
                background: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(4px)",
              }}
              onClick={() => setMobileSidebarOpen(false)}
            />
          )}

          {/* Mobile sidebar drawer */}
          <div
            className="fixed top-0 left-0 h-full z-50 lg:hidden overflow-y-auto transition-transform duration-300"
            style={{
              width: "290px",
              background: "var(--background)",
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
              onGroupChange={(g) => {
                sidebarProps.onGroupChange(g);
                setMobileSidebarOpen(false);
              }}
              onCategoryChange={(c) => {
                sidebarProps.onCategoryChange(c);
                setMobileSidebarOpen(false);
              }}
            />
          </div>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {/* Result count + page info */}
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

            {/* Error */}
            {error && (
              <div className="glass flex flex-col items-center justify-center py-16 text-center gap-3 mb-6">
                <p
                  className="font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Failed to load products
                </p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {error.message}
                </p>
              </div>
            )}

            {/* Skeleton */}
            {isLoading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(PRODUCTS_PER_PAGE)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : products.length === 0 && !error ? (
              /* Empty state */
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
                {/* Product cards */}
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {products.map((product, i) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
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
                              {currencyLoading ? "…" : convert(product.price)}
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

                {/* Pagination */}
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

// ─── Loading fallback ─────────────────────────────────────────────────────────

function MarketplaceLoading() {
  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        <div
          className="h-10 rounded-xl mb-4 animate-pulse"
          style={{ background: "var(--glass-bg)" }}
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(PRODUCTS_PER_PAGE)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </main>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function MarketplacePage() {
  return (
    <Suspense fallback={<MarketplaceLoading />}>
      <MarketplacePageContent />
    </Suspense>
  );
}
