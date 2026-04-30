"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";

export default function ServicesSection() {
  const {
    categories,
    loading: isLoading,
    error,
    refetch,
  } = useCategories("service");

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2
              className="text-4xl font-black mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              Professional Services
            </h2>
            <p
              className="text-base max-w-xl mx-auto"
              style={{ color: "var(--text-secondary)" }}
            >
              Book trusted professionals for all your needs
            </p>
          </motion.div>
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden animate-pulse"
                style={{
                  background: "var(--glass-bg)",
                  border: "1px solid var(--glass-border)",
                }}
              >
                <div className="aspect-[4/3] bg-gray-300/20" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-300/20 rounded w-3/4" />
                  <div className="h-2 bg-gray-300/20 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Service Categories Grid */}
        {!isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {categories
              .filter((cat) => cat.active)
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .slice(0, 8)
              .map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.07 }}
                >
                  <Link
                    href={`/services?category=${encodeURIComponent(category.slug)}`}
                  >
                    <div
                      className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02]"
                      style={{
                        background: "var(--glass-bg)",
                        border: "1px solid var(--glass-border)",
                      }}
                    >
                      {/* Image */}
                      {/* Image */}
                      <div className="relative aspect-[4/3] overflow-hidden">
                        {category.image ? (
                          <>
                            <img
                              src={category.image}
                              alt={category.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div
                              className="absolute inset-0"
                              style={{
                                background:
                                  "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.65) 100%)",
                              }}
                            />
                            {/* Icon badge over image */}
                            {category.icon && (
                              <div
                                className="absolute top-2 left-2 w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                                style={{
                                  background: category.color
                                    ? `${category.color}22`
                                    : "var(--glass-bg-strong)",
                                  backdropFilter: "blur(12px)",
                                  border: category.color
                                    ? `1px solid ${category.color}44`
                                    : undefined,
                                }}
                              >
                                {category.icon}
                              </div>
                            )}
                          </>
                        ) : (
                          /* No image — show icon centered as placeholder */
                          <div
                            className="w-full h-full flex items-center justify-center"
                            style={{
                              background: category.color
                                ? `${category.color}18`
                                : "var(--glass-bg-strong)",
                              border: category.color
                                ? `1px solid ${category.color}33`
                                : undefined,
                            }}
                          >
                            {category.icon ? (
                              <span className="text-5xl">{category.icon}</span>
                            ) : (
                              <img
                                src="/placeholder-service.jpg"
                                alt={category.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-3">
                        <h3
                          className="text-sm font-bold mb-1 group-hover:opacity-80 transition-opacity leading-tight"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {category.name}
                        </h3>

                        {/* Color accent dot */}
                        {category.color && (
                          <div className="flex items-center gap-1.5 mb-2">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ background: category.color }}
                            />
                            <p
                              className="text-xs"
                              style={{ color: "var(--text-muted)" }}
                            >
                              {category.slug}
                            </p>
                          </div>
                        )}

                        {/* CTA */}
                        <div
                          className="flex items-center gap-1 text-xs font-semibold group-hover:gap-2 transition-all"
                          style={{ color: "var(--blue)" }}
                        >
                          Explore
                          <ArrowRight size={13} />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && categories.length === 0 && (
          <div
            className="text-center py-16"
            style={{ color: "var(--text-muted)" }}
          >
            <p className="text-sm">No service categories found.</p>
          </div>
        )}

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center"
        >
          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, var(--purple), var(--blue))",
              boxShadow: "0 4px 14px rgba(123,47,190,0.35)",
            }}
          >
            View All Services
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
