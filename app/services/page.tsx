"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { services, SERVICE_CATEGORY_GROUPS, ServiceCategoryGroup } from "@/data/services";
import { Star, Clock, MapPin, Check } from "lucide-react";
import Link from "next/link";

export default function ServicesPage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  
  const [selectedGroup, setSelectedGroup] = useState<ServiceCategoryGroup | "All">(
    (categoryParam as ServiceCategoryGroup) || "All"
  );

  useEffect(() => {
    if (categoryParam) {
      setSelectedGroup(categoryParam as ServiceCategoryGroup);
    }
  }, [categoryParam]);

  const filteredServices = selectedGroup === "All" 
    ? services 
    : services.filter(s => s.group === selectedGroup);

  return (
    <div className="min-h-screen pt-24 pb-16" style={{ background: "var(--background)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black mb-4" style={{ color: "var(--text-primary)" }}>
            Book Professional Services
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
            From home care to beauty services, explore our professional service categories
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <button
            onClick={() => setSelectedGroup("All")}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: selectedGroup === "All" ? "linear-gradient(135deg, var(--purple), var(--blue))" : "var(--glass-bg)",
              color: selectedGroup === "All" ? "white" : "var(--text-secondary)",
              border: `1px solid ${selectedGroup === "All" ? "transparent" : "var(--glass-border)"}`,
            }}
          >
            All Services
          </button>
          {SERVICE_CATEGORY_GROUPS.map((group) => (
            <button
              key={group.group}
              onClick={() => setSelectedGroup(group.group)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: selectedGroup === group.group ? "linear-gradient(135deg, var(--purple), var(--blue))" : "var(--glass-bg)",
                color: selectedGroup === group.group ? "white" : "var(--text-secondary)",
                border: `1px solid ${selectedGroup === group.group ? "transparent" : "var(--glass-border)"}`,
              }}
            >
              {group.icon} {group.group}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
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
                <img
                  src={service.images[0]}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
                {service.badge && (
                  <span
                    className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white"
                    style={{
                      background: "linear-gradient(135deg, var(--scarlet), var(--purple))",
                    }}
                  >
                    {service.badge}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                  {service.name}
                </h3>
                <p className="text-sm mb-4 line-clamp-2" style={{ color: "var(--text-muted)" }}>
                  {service.description}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star size={14} fill="var(--yellow)" style={{ color: "var(--yellow)" }} />
                    <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {service.rating}
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    ({service.reviews} reviews)
                  </span>
                </div>

                {/* Availability */}
                {service.availability && (
                  <div className="flex items-center gap-2 mb-3">
                    <Clock size={14} style={{ color: "var(--text-muted)" }} />
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {service.availability}
                    </span>
                  </div>
                )}

                {/* Includes */}
                {service.includes && service.includes.length > 0 && (
                  <div className="mb-4 space-y-1">
                    {service.includes.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check size={14} className="mt-0.5" style={{ color: "var(--green)" }} />
                        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* CTA */}
                <div className="pt-4" style={{ borderTop: "1px solid var(--divider)" }}>
                  <Link
                    href={`/services/${service.id}`}
                    className="w-full block text-center px-4 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02]"
                    style={{
                      background: "linear-gradient(135deg, var(--purple), var(--blue))",
                    }}
                  >
                    View Service & Book
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-16">
            <p className="text-lg" style={{ color: "var(--text-muted)" }}>
              No services found in this category
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
