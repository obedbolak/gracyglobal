// app/admin/services/page.tsx

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Edit, Trash2, Plus, Eye } from "lucide-react";

export default async function ServicesPage() {
  const services = await prisma.product.findMany({
    where: {
      // Assuming services are products with specific categories or groups
      // Adjust this filter based on how you distinguish services
      group: { not: "" }, // or any other criteria
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Services
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Manage spiritual and wellness services
          </p>
        </div>

        <Link
          href="/admin/services/create"
          className="btn-primary flex items-center gap-2 px-6 py-3 rounded-lg"
        >
          <Plus className="w-5 h-5" />
          Add Service
        </Link>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            className="glass rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Service Image */}
            {service.images[0] && (
              <div className="relative h-48">
                <img
                  src={service.images[0]}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
                {service.featured && (
                  <div className="absolute top-3 left-3 px-3 py-1 bg-[var(--purple)] text-white text-xs font-semibold rounded-full">
                    Featured
                  </div>
                )}
                <div className="absolute top-3 right-3">
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
            )}

            {/* Service Info */}
            <div className="p-6 space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] line-clamp-1">
                  {service.name}
                </h3>
                <p className="text-sm text-[var(--text-muted)] mt-1 line-clamp-2">
                  {service.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[var(--divider)]">
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Category</p>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">
                    {service.category}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[var(--text-muted)]">Price</p>
                  <p className="text-lg font-bold text-[var(--purple)]">
                    {service.price.toLocaleString()} XAF
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3">
                <Link
                  href={`/services/${service.id}`}
                  className="flex-1 btn-secondary flex items-center justify-center gap-2 py-2 rounded-lg text-sm"
                >
                  <Eye className="w-4 h-4" />
                  View
                </Link>
                <Link
                  href={`/admin/services/${service.id}/edit`}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 py-2 rounded-lg text-sm"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Link>
                <button className="p-2 hover:bg-[var(--error-bg)] text-[var(--error-text)] rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

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
              Create your first service to get started
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
