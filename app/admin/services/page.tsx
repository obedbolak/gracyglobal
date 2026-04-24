// app/admin/services/page.tsx

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Package } from "lucide-react";
import { ServiceActions } from "./_components/ServiceActions";
import { useCategories } from "@/hooks/useCategories";

export default async function ServicesPage() {
  const { categories } = await useCategories("service");

  const services = await prisma.service.findMany({
    include: {
      options: {
        where: { active: true },
        orderBy: { amount: "asc" },
      },
      _count: {
        select: { bookings: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            Services
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Manage all service offerings and pricing options
          </p>
        </div>

        <Link
          href="/admin/services/create"
          className="btn-primary flex items-center justify-center gap-2 px-6 py-3 rounded-lg w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          Add Service
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass p-4 rounded-xl">
          <p className="text-sm text-[var(--text-muted)]">Total Services</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
            {services.length}
          </p>
        </div>
        <div className="glass p-4 rounded-xl">
          <p className="text-sm text-[var(--text-muted)]">Active Services</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {services.filter((s) => s.active).length}
          </p>
        </div>
        <div className="glass p-4 rounded-xl">
          <p className="text-sm text-[var(--text-muted)]">Featured</p>
          <p className="text-2xl font-bold text-[var(--purple)] mt-1">
            {services.filter((s) => s.featured).length}
          </p>
        </div>
        <div className="glass p-4 rounded-xl">
          <p className="text-sm text-[var(--text-muted)]">Total Bookings</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
            {services.reduce((acc, s) => acc + s._count.bookings, 0)}
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            className="glass rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Service Image */}
            {service.images[0] ? (
              <div className="relative h-32 sm:h-40 lg:h-48 z-0">
                <img
                  src={service.images[0]}
                  alt={service.name}
                  className="w-full h-full object-cover z-0"
                />
                {service.badge && (
                  <div className="absolute top-3 left-3 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-semibold rounded-full shadow-lg z-10">
                    {service.badge}
                  </div>
                )}
                {service.featured && !service.badge && (
                  <div className="absolute top-3 left-3 px-3 py-1 bg-[var(--purple)] text-white text-xs font-semibold rounded-full z-10">
                    Featured
                  </div>
                )}
                <div className="absolute top-3 right-3 z-10">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      service.active
                        ? "bg-green-500/90 text-white"
                        : "bg-gray-500/90 text-white"
                    }`}
                  >
                    {service.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-32 sm:h-40 lg:h-48 bg-gradient-to-br from-[var(--purple-faint)] to-[var(--glass-bg)] flex items-center justify-center">
                <Package className="w-12 h-12 sm:w-16 sm:h-16 text-[var(--text-muted)] opacity-50" />
              </div>
            )}

            {/* Service Info */}
            <div className="p-4 sm:p-6 space-y-3">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-[var(--text-primary)] line-clamp-1">
                  {service.name}
                </h3>
                <p className="text-sm text-[var(--text-muted)] mt-1 line-clamp-2">
                  {service.description}
                </p>
              </div>

              {/* Category & Group */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-1 bg-[var(--purple-faint)] text-[var(--purple)] text-xs rounded-full">
                  {service.group}
                </span>
                <span className="px-2 py-1 bg-[var(--glass-bg)] text-[var(--text-secondary)] text-xs rounded-full">
                  {categories.find((cat) => cat.id === service.categoryId)
                    ?.name || "Uncategorized"}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[var(--divider)]">
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Options</p>
                  <p className="text-sm font-semibold text-[var(--text-secondary)]">
                    {service.options.length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Bookings</p>
                  <p className="text-sm font-semibold text-[var(--text-secondary)]">
                    {service._count.bookings}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Rating</p>
                  <p className="text-sm font-semibold text-[var(--text-secondary)]">
                    ⭐ {service.rating.toFixed(1)}
                  </p>
                </div>
              </div>

              {/* Price Range */}
              {service.options.length > 0 && (
                <div className="pt-3 border-t border-[var(--divider)]">
                  <p className="text-xs text-[var(--text-muted)] mb-1">
                    Price Range
                  </p>
                  <p className="text-base sm:text-lg font-bold text-[var(--purple)]">
                    {Math.min(
                      ...service.options.map((o) => o.amount),
                    ).toLocaleString()}{" "}
                    -{" "}
                    {Math.max(
                      ...service.options.map((o) => o.amount),
                    ).toLocaleString()}{" "}
                    XAF
                  </p>
                </div>
              )}

              {/* Availability */}
              {service.availability && (
                <div className="text-xs text-[var(--text-muted)]">
                  📅 {service.availability}
                </div>
              )}

              {/* Actions - Now a Client Component */}
              <ServiceActions
                serviceId={service.id}
                serviceName={service.name}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {services.length === 0 && (
        <div className="glass rounded-xl p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-[var(--purple-faint)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-[var(--purple)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              No services yet
            </h3>
            <p className="text-[var(--text-muted)] mb-6">
              Create your first service to start offering your services to
              customers
            </p>
            <Link
              href="/admin/services/create"
              className="inline-flex items-center gap-2 btn-primary px-6 py-3 rounded-lg"
            >
              <Plus className="w-5 h-5" />
              Create Service
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
