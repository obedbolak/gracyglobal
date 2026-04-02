"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SERVICE_CATEGORY_GROUPS } from "@/data/services";
import { ArrowRight, Star } from "lucide-react";

export default function ServicesSection() {
  // Service category images mapping
  const categoryImages: Record<string, string> = {
    "Home & Errand":
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&q=80",
    Transport:
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&q=80",
    "Home Comfort":
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
    "Home Management":
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80",
    "Care Services":
      "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&q=80",
    "Beauty & Wellness":
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80",
    "Priority Access":
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&q=80",
  };

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
              className="text-4xl font-black mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Professional Services
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: "var(--text-secondary)" }}
            >
              From home care to beauty services, book trusted professionals for
              all your needs
            </p>
          </motion.div>
        </div>

        {/* Service Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {SERVICE_CATEGORY_GROUPS.map((group, index) => (
            <motion.div
              key={group.group}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                href={`/services?category=${encodeURIComponent(group.group)}`}
              >
                <div
                  className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: "var(--glass-bg)",
                    border: "1px solid var(--glass-border)",
                  }}
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={categoryImages[group.group]}
                      alt={group.group}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.7) 100%)",
                      }}
                    />

                    {/* Icon Badge */}
                    <div
                      className="absolute top-3 left-3 w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{
                        background: "var(--glass-bg-strong)",
                        backdropFilter: "blur(12px)",
                      }}
                    >
                      {group.icon}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3
                      className="text-lg font-bold mb-2 group-hover:opacity-80 transition-opacity"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {group.group}
                    </h3>
                    <p
                      className="text-sm mb-3"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {group.categories.length} service
                      {group.categories.length > 1 ? "s" : ""} available
                    </p>

                    {/* Categories List */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {group.categories.slice(0, 2).map((cat, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 rounded-full"
                          style={{
                            background: "var(--glass-bg-subtle)",
                            color: "var(--text-muted)",
                          }}
                        >
                          {cat}
                        </span>
                      ))}
                      {group.categories.length > 2 && (
                        <span
                          className="text-xs px-2 py-1 rounded-full"
                          style={{
                            background: "var(--glass-bg-subtle)",
                            color: "var(--text-muted)",
                          }}
                        >
                          +{group.categories.length - 2}
                        </span>
                      )}
                    </div>

                    {/* CTA */}
                    <div
                      className="flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all"
                      style={{ color: "var(--blue)" }}
                    >
                      Explore Services
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

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
