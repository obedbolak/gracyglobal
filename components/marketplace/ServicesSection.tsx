// components/home/ServicesSection.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Clock, Calendar, Loader2 } from "lucide-react";
import {
  SERVICE_CATEGORY_GROUPS,
  type ServiceCategoryGroup,
} from "@/data/services";
import { useServices } from "@/hooks/useServices";
import { useCurrency } from "@/hooks/useCurrency";

export default function ServicesSection() {
  const [selectedGroup, setSelectedGroup] = useState<
    ServiceCategoryGroup | "All"
  >("All");
  const { convert, currency, loading: currencyLoading } = useCurrency();

  // Use the hook to fetch services
  const { services, loading: servicesLoading } = useServices({
    group: selectedGroup === "All" ? undefined : selectedGroup,
  });

  const getPricingDisplay = (service: (typeof services)[0]) => {
    // Get the most popular option, or the first option if none marked as popular
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
    <section
      className="mt-16 pt-16"
      style={{ borderTop: "1px solid var(--divider)" }}
    >
      {/* Header */}
      <div className="mb-8">
        <h2
          className="text-3xl font-bold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          Professional Services
        </h2>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Book trusted professionals for home, care, beauty, and lifestyle
          services
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelectedGroup("All")}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200"
          style={
            selectedGroup === "All"
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
          All Services
        </button>
        {SERVICE_CATEGORY_GROUPS.map((group) => (
          <button
            key={group.group}
            onClick={() => setSelectedGroup(group.group)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200"
            style={
              selectedGroup === group.group
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
            <span>{group.icon}</span>
            <span className="hidden sm:inline">{group.group}</span>
          </button>
        ))}
      </div>

      {/* Loading State */}
      {servicesLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--scarlet)]" />
        </div>
      ) : services.length === 0 ? (
        /* Empty State */
        <div className="text-center py-20">
          <div className="glass p-12 rounded-xl max-w-md mx-auto">
            <div className="w-16 h-16 bg-[var(--scarlet-faint)] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🛎️</span>
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
              No Services Available
            </h3>
            <p className="text-sm text-[var(--text-muted)]">
              {selectedGroup === "All"
                ? "Check back soon for new services."
                : `No services in ${selectedGroup} category yet.`}
            </p>
          </div>
        </div>
      ) : (
        /* Services Grid */
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="glass flex flex-col overflow-hidden group"
            >
              <Link
                href={`/services/${service.id}`}
                className="relative overflow-hidden"
              >
                {service.images[0] ? (
                  <img
                    src={service.images[0]}
                    alt={service.name}
                    className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-52 bg-gradient-to-br from-[var(--scarlet-faint)] to-[var(--purple-faint)] flex items-center justify-center">
                    <span className="text-6xl opacity-50">🛎️</span>
                  </div>
                )}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.15) 100%)",
                  }}
                />
                {service.badge && (
                  <span
                    className="absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full text-white"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--scarlet), var(--purple))",
                    }}
                  >
                    {service.badge}
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
                  {service.category}
                </span>
              </Link>

              <div className="flex flex-col gap-3 p-5 flex-1">
                <div>
                  <Link href={`/services/${service.id}`}>
                    <h3
                      className="font-extrabold text-base mb-1 hover:opacity-80 transition-opacity"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {service.name}
                    </h3>
                  </Link>
                  <p
                    className="text-xs leading-relaxed font-light line-clamp-2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {service.description}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={11}
                      className={
                        s <= Math.round(service.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }
                    />
                  ))}
                  <span
                    className="text-xs font-semibold ml-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {service.rating.toFixed(1)}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    ({service.reviews})
                  </span>
                </div>

                {service.availability && (
                  <div
                    className="flex items-center gap-1.5 text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <Clock size={12} />
                    {service.availability}
                  </div>
                )}

                {service.includes && service.includes.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {service.includes.slice(0, 2).map((item, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{
                          background: "var(--badge-blue-bg)",
                          color: "var(--blue-dark)",
                        }}
                      >
                        {item}
                      </span>
                    ))}
                    {service.includes.length > 2 && (
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{
                          background: "var(--glass-bg-subtle)",
                          color: "var(--text-muted)",
                        }}
                      >
                        +{service.includes.length - 2} more
                      </span>
                    )}
                  </div>
                )}

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
                      {getPricingDisplay(service)}
                    </span>
                    <span
                      className="text-[10px] font-light"
                      style={{ color: "var(--text-disabled)" }}
                    >
                      XAF {getBasePricing(service).toLocaleString()}
                    </span>
                  </div>
                  <Link
                    href={`/services/${service.id}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all duration-200 hover:scale-105"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--scarlet), var(--purple))",
                      boxShadow: "0 4px 12px rgba(220,20,60,0.25)",
                    }}
                  >
                    <Calendar size={12} />
                    Book Now
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* View All Services Link */}
      {!servicesLoading && services.length > 0 && (
        <div className="text-center mt-8">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              color: "var(--text-secondary)",
            }}
          >
            View All Services
          </Link>
        </div>
      )}
    </section>
  );
}
