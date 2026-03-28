// app/services/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SERVICE_CATEGORY_GROUPS, ServiceCategoryGroup } from "@/data/services";
import { useServices } from "@/hooks/useServices";
import { useCurrency } from "@/hooks/useCurrency";
import { Star, Clock, Check, Loader2, Search, Filter } from "lucide-react";
import Link from "next/link";

function ServicesPageContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [selectedGroup, setSelectedGroup] = useState<
    ServiceCategoryGroup | "All"
  >((categoryParam as ServiceCategoryGroup) || "All");
  const [searchQuery, setSearchQuery] = useState("");

  const { convert, currency, loading: currencyLoading } = useCurrency();

  // Use the hook to fetch services
  const { services, loading: servicesLoading } = useServices({
    group: selectedGroup === "All" ? undefined : selectedGroup,
    search: searchQuery || undefined,
  });

  useEffect(() => {
    if (categoryParam) {
      setSelectedGroup(categoryParam as ServiceCategoryGroup);
    }
  }, [categoryParam]);

  const getPricingDisplay = (service: (typeof services)[0]) => {
    const displayOption =
      service.options.find((opt) => opt.popular) || service.options[0];
    if (!displayOption) return "Contact for pricing";

    const displayAmount = currencyLoading
      ? displayOption.amount
      : convert(displayOption.amount);

    if (displayOption.pricingType === "MONTHLY") {
      return `${currency.symbol}${displayAmount.toLocaleString()}/mo`;
    } else if (displayOption.pricingType === "PER_SESSION") {
      return `${currency.symbol}${displayAmount.toLocaleString()}${displayOption.label ? ` ${displayOption.label}` : ""}`;
    } else {
      return `${currency.symbol}${displayAmount.toLocaleString()}${displayOption.label ? ` ${displayOption.label}` : ""}`;
    }
  };

  const getBasePricing = (service: (typeof services)[0]) => {
    const displayOption =
      service.options.find((opt) => opt.popular) || service.options[0];
    return displayOption?.amount || 0;
  };

  return (
    <div
      className="min-h-screen pt-24 pb-16"
      style={{ background: "var(--background)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className="text-4xl font-black mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Book Professional Services
          </h1>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            From home care to beauty services, explore our professional service
            categories
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
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
              }}
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedGroup("All")}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
              style={{
                background:
                  selectedGroup === "All"
                    ? "linear-gradient(135deg, var(--purple), var(--blue))"
                    : "var(--glass-bg)",
                color:
                  selectedGroup === "All" ? "white" : "var(--text-secondary)",
                border: `1px solid ${selectedGroup === "All" ? "transparent" : "var(--glass-border)"}`,
              }}
            >
              All Services
            </button>
            {SERVICE_CATEGORY_GROUPS.map((group) => (
              <button
                key={group.group}
                onClick={() => setSelectedGroup(group.group)}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                style={{
                  background:
                    selectedGroup === group.group
                      ? "linear-gradient(135deg, var(--purple), var(--blue))"
                      : "var(--glass-bg)",
                  color:
                    selectedGroup === group.group
                      ? "white"
                      : "var(--text-secondary)",
                  border: `1px solid ${selectedGroup === group.group ? "transparent" : "var(--glass-border)"}`,
                }}
              >
                {group.icon}{" "}
                <span className="hidden sm:inline">{group.group}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        {!servicesLoading && services.length > 0 && (
          <div className="mb-6 text-center">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Showing {services.length} service
              {services.length !== 1 ? "s" : ""}
              {selectedGroup !== "All" && ` in ${selectedGroup}`}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>
        )}

        {/* Loading State */}
        {servicesLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--purple)]" />
          </div>
        ) : services.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="glass p-12 rounded-xl max-w-md mx-auto">
              <div className="w-16 h-16 bg-[var(--purple-faint)] rounded-full flex items-center justify-center mx-auto mb-4">
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
                  ? `No services match "${searchQuery}". Try adjusting your search.`
                  : selectedGroup !== "All"
                    ? `No services available in ${selectedGroup} yet.`
                    : "No services available at the moment."}
              </p>
              {(searchQuery || selectedGroup !== "All") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedGroup("All");
                  }}
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
          /* Services Grid */
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
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  {service.images[0] ? (
                    <img
                      src={service.images[0]}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[var(--purple-faint)] to-[var(--blue-faint)] flex items-center justify-center">
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
                      Featured
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="mb-2">
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        background: "var(--badge-purple-bg)",
                        color: "var(--purple-dark)",
                      }}
                    >
                      {service.category}
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

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
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
                    </div>
                    <span
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      ({service.reviews} reviews)
                    </span>
                  </div>

                  {/* Availability */}
                  {service.availability && (
                    <div className="flex items-center gap-2 mb-3">
                      <Clock size={14} style={{ color: "var(--text-muted)" }} />
                      <span
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {service.availability}
                      </span>
                    </div>
                  )}

                  {/* Includes */}
                  {service.includes && service.includes.length > 0 && (
                    <div className="mb-4 space-y-1">
                      {service.includes.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check size={14} className="mt-0.5 text-green-500" />
                          <span
                            className="text-xs"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {item}
                          </span>
                        </div>
                      ))}
                      {service.includes.length > 3 && (
                        <p className="text-xs text-[var(--text-muted)] ml-5">
                          +{service.includes.length - 3} more
                        </p>
                      )}
                    </div>
                  )}

                  {/* Price & CTA */}
                  <div
                    className="pt-4 space-y-3"
                    style={{ borderTop: "1px solid var(--divider)" }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className="text-lg font-bold"
                          style={{
                            background:
                              "linear-gradient(135deg, var(--purple), var(--blue))",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                          }}
                        >
                          {getPricingDisplay(service)}
                        </p>
                        <p
                          className="text-[10px]"
                          style={{ color: "var(--text-muted)" }}
                        >
                          XAF {getBasePricing(service).toLocaleString()}
                        </p>
                      </div>
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

                    <Link
                      href={`/services/${service.id}`}
                      className="w-full block text-center px-4 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02]"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--purple), var(--blue))",
                      }}
                    >
                      View Service & Book
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex items-center justify-center min-h-screen"
          style={{ background: "var(--background)" }}
        >
          <div className="text-center">
            <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-[var(--purple)]" />
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
