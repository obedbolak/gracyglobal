"use client";

// app/services/page.tsx

import { useState, useEffect, Suspense, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { useCategories } from "@/hooks/useCategories";
import { useServices } from "@/hooks/useServices";
import { useCurrency } from "@/hooks/useCurrency";
import {
  Star,
  Clock,
  Check,
  Loader2,
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import ShareButton from "@/components/shared/ShareButton";

// ─── Tab bar ─────────────────────────────────────────────────────────────────

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
  children: ReactNode;
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
        color: isActive ? "var(--text-inverse)" : "var(--text-secondary)",
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

function SidebarContent({
  categories,
  activeCategory,
  featuredOnly,
  total,
  isLoading,
  onCategoryChange,
  onFeaturedToggle,
  onClearAll,
}: {
  categories: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  }[];
  activeCategory: string | null;
  featuredOnly: boolean;
  total: number;
  isLoading: boolean;
  onCategoryChange: (name: string | null) => void;
  onFeaturedToggle: () => void;
  onClearAll: () => void;
}) {
  const [openId, setOpenId] = useState<string | null>("category");
  const toggle = (id: string) =>
    setOpenId((current) => (current === id ? null : id));

  return (
    <div className="flex flex-col gap-3">
      <div
        className="px-3 py-2 rounded-xl text-xs font-medium text-center"
        style={{
          background: "var(--badge-blue-bg)",
          color: "var(--blue-dark)",
        }}
      >
        {isLoading
          ? "Loading…"
          : `${total} service${total !== 1 ? "s" : ""} found`}
      </div>

      <AccordionSection
        id="category"
        title="Category"
        badge={activeCategory ?? undefined}
        openId={openId}
        onToggle={toggle}
      >
        <SidebarItem
          label="All Services"
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
            onClick={() =>
              onCategoryChange(activeCategory === cat.name ? null : cat.name)
            }
          />
        ))}
      </AccordionSection>

      <AccordionSection
        id="featured"
        title="Featured"
        badge={featuredOnly ? "On" : undefined}
        openId={openId}
        onToggle={toggle}
      >
        <SidebarItem
          label="Only featured"
          icon="★"
          isActive={featuredOnly}
          onClick={onFeaturedToggle}
        />
      </AccordionSection>

      <button
        onClick={onClearAll}
        className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold"
        style={{
          background: "var(--glass-bg-subtle)",
          border: "1px solid var(--glass-border)",
          color: "var(--text-muted)",
        }}
      >
        <X size={12} /> Clear all filters
      </button>
    </div>
  );
}

// ─── Main content ─────────────────────────────────────────────────────────────

function ServicesPageContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [activeCategory, setActiveCategory] = useState<string | null>(
    categoryParam ?? null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const { convert, currency, loading: currencyLoading } = useCurrency();
  const { categories, loading: categoriesLoading } = useCategories("service");

  const {
    services,
    total,
    loading: servicesLoading,
  } = useServices({
    category: activeCategory ?? undefined,
    featured: featuredOnly ? true : undefined,
    search: searchQuery || undefined,
  });

  useEffect(() => {
    if (categoryParam) setActiveCategory(categoryParam);
  }, [categoryParam]);

  const getPricingDisplay = (service: (typeof services)[0]) => {
    const opt = service.options.find((o) => o.popular) || service.options[0];
    if (!opt) return "Contact for pricing";
    const formattedAmount = currencyLoading
      ? opt.amount.toLocaleString()
      : convert(opt.amount);

    if (opt.pricingType === "MONTHLY")
      return currencyLoading
        ? `${currency.symbol}${formattedAmount}/mo`
        : `${formattedAmount}/mo`;

    return currencyLoading
      ? `${currency.symbol}${formattedAmount}${opt.label ? ` ${opt.label}` : ""}`
      : `${formattedAmount}${opt.label ? ` ${opt.label}` : ""}`;
  };

  const getCategoryName = (service: (typeof services)[0]) =>
    service.category?.name ?? "Service";

  const getCategoryIcon = (service: (typeof services)[0]) =>
    service.category?.icon ?? null;

  const hasActiveFilters = activeCategory !== null || featuredOnly;

  const clearAll = () => {
    setSearchQuery("");
    setActiveCategory(null);
    setFeaturedOnly(false);
    setMobileSidebarOpen(false);
  };

  const sidebarProps = {
    categories,
    activeCategory,
    featuredOnly,
    total,
    isLoading: servicesLoading,
    onCategoryChange: (name: string | null) => {
      setActiveCategory(name);
      setMobileSidebarOpen(false);
    },
    onFeaturedToggle: () => setFeaturedOnly((prev) => !prev),
    onClearAll: clearAll,
  };

  return (
    <div
      className="min-h-screen pt-14 pb-16"
      style={{ background: "var(--bg-base)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p
            className="text-sm font-semibold uppercase tracking-[0.24em]"
            style={{ color: "var(--purple-dark)" }}
          >
            Service marketplace
          </p>
          <h1
            className="mt-3 text-3xl sm:text-4xl font-black leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Find trusted professionals for home, care, beauty and lifestyle.
          </h1>
          <p
            className="mt-4 text-sm max-w-2xl"
            style={{ color: "var(--text-secondary)" }}
          >
            Browse curated services, filter by category, and book the right
            expert for your needs.
          </p>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl text-sm"
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
            className="lg:hidden relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold flex-shrink-0"
            style={{
              background: hasActiveFilters
                ? "linear-gradient(135deg, var(--purple), var(--blue))"
                : "var(--glass-bg)",
              border: hasActiveFilters
                ? "none"
                : "1px solid var(--glass-border)",
              color: hasActiveFilters
                ? "var(--text-inverse)"
                : "var(--text-secondary)",
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
            {featuredOnly && (
              <span
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  background: "var(--badge-purple-bg)",
                  color: "var(--purple-dark)",
                }}
              >
                ★ Featured only
                <button onClick={() => setFeaturedOnly(false)}>
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

        <div className="flex gap-7 items-start">
          <aside className="hidden lg:block w-60 flex-shrink-0 sticky top-24">
            <SidebarContent {...sidebarProps} />
          </aside>

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

          <div
            className="fixed top-0 left-0 h-full z-50 lg:hidden overflow-y-auto transition-transform duration-300"
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

          <div className="flex-1 min-w-0">
            {!servicesLoading && services.length > 0 && (
              <div
                className="mb-6 text-sm text-center"
                style={{ color: "var(--text-muted)" }}
              >
                Showing {services.length} service
                {services.length !== 1 ? "s" : ""}
                {activeCategory && ` in ${activeCategory}`}
                {searchQuery && ` matching "${searchQuery}"`}
              </div>
            )}

            {servicesLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2
                  className="w-8 h-8 animate-spin"
                  style={{ color: "var(--purple)" }}
                />
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-16">
                <div className="glass p-12 rounded-xl max-w-md mx-auto">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: "var(--purple-faint)" }}
                  >
                    <span className="text-4xl">🔍</span>
                  </div>
                  <h3
                    className="text-xl font-bold mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    No Services Found
                  </h3>
                  <p
                    className="text-sm mb-6"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {searchQuery
                      ? `No services match "${searchQuery}".`
                      : activeCategory
                        ? `No services available in ${activeCategory} yet.`
                        : "No services available at the moment."}
                  </p>
                  {(searchQuery || activeCategory || featuredOnly) && (
                    <button
                      onClick={clearAll}
                      className="px-6 py-3 rounded-xl text-sm font-bold text-white"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--purple), var(--blue))",
                      }}
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="rounded-2xl overflow-hidden transition-all hover:scale-[1.02]"
                    style={{
                      background: "var(--glass-bg)",
                      border: "1px solid var(--glass-border)",
                    }}
                  >
                    <div className="relative h-48 overflow-hidden">
                      {service.images[0] ? (
                        <img
                          src={service.images[0]}
                          alt={service.name}
                          className="w-full h-full object-cover object-center"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{
                            background:
                              "linear-gradient(135deg, var(--purple-faint), var(--blue-faint))",
                          }}
                        >
                          <span className="text-6xl opacity-50">🛎️</span>
                        </div>
                      )}
                      {service.badge && (
                        <span
                          className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white"
                          style={{
                            background:
                              "linear-gradient(135deg, var(--scarlet), var(--purple))",
                          }}
                        >
                          {service.badge}
                        </span>
                      )}
                      {service.featured && (
                        <span
                          className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold"
                          style={{
                            background: "var(--glass-bg-strong)",
                            color: "var(--text-primary)",
                            backdropFilter: "blur(8px)",
                          }}
                        >
                          ★ Featured
                        </span>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="mb-2">
                        <span
                          className="text-xs px-2 py-1 rounded-full inline-flex items-center gap-1"
                          style={{
                            background: "var(--badge-purple-bg)",
                            color: "var(--badge-purple-text)",
                          }}
                        >
                          {getCategoryIcon(service) && (
                            <span>{getCategoryIcon(service)}</span>
                          )}
                          {getCategoryName(service)}
                        </span>
                      </div>

                      <h3
                        className="text-lg font-bold mb-2"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {service.name}
                      </h3>
                      <p
                        className="text-sm mb-4 line-clamp-2"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {service.description}
                      </p>

                      <div className="flex items-center gap-2 mb-3">
                        <Star
                          size={14}
                          fill="#fbbf24"
                          style={{ color: "#fbbf24" }}
                        />
                        <span
                          className="text-sm font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {service.rating.toFixed(1)}
                        </span>
                        <span
                          className="text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          ({service.reviews} reviews)
                        </span>
                      </div>

                      {service.availability && (
                        <div className="flex items-center gap-2 mb-3">
                          <Clock
                            size={14}
                            style={{ color: "var(--text-muted)" }}
                          />
                          <span
                            className="text-xs"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {service.availability}
                          </span>
                        </div>
                      )}

                      {service.includes?.length > 0 && (
                        <div className="mb-4 space-y-1">
                          {service.includes.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <Check
                                size={14}
                                className="mt-0.5 text-green-500 flex-shrink-0"
                              />
                              <span
                                className="text-xs"
                                style={{ color: "var(--text-secondary)" }}
                              >
                                {item}
                              </span>
                            </div>
                          ))}
                          {service.includes.length > 3 && (
                            <p
                              className="text-xs ml-5"
                              style={{ color: "var(--text-muted)" }}
                            >
                              +{service.includes.length - 3} more
                            </p>
                          )}
                        </div>
                      )}

                      <div
                        className="pt-4 space-y-3"
                        style={{ borderTop: "1px solid var(--divider)" }}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="text-xs font-semibold"
                            style={{ color: "var(--text-primary)" }}
                          >
                            From {getPricingDisplay(service)}
                          </span>
                          <span
                            className="text-xs px-2 py-1 rounded-full"
                            style={{
                              background: "var(--badge-blue-bg)",
                              color: "var(--blue-dark)",
                            }}
                          >
                            {service.options.length} option
                            {service.options.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href={`/services/${service.id}`}
                            className="flex-1 block text-center px-4 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02]"
                            style={{
                              background:
                                "linear-gradient(135deg, var(--purple), var(--blue))",
                            }}
                          >
                            View & Book
                          </Link>
                          <ShareButton
                            href={`/services/${service.id}`}
                            title={service.name}
                            className="!px-3 !min-h-0 py-3"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function ServicesPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex items-center justify-center min-h-screen"
          style={{ background: "var(--bg-base)" }}
        >
          <div className="text-center">
            <Loader2
              className="w-16 h-16 mx-auto mb-4 animate-spin"
              style={{ color: "var(--purple)" }}
            />
            <p style={{ color: "var(--text-secondary)" }}>
              Loading services...
            </p>
          </div>
        </div>
      }
    >
      <ServicesPageContent />
    </Suspense>
  );
}
