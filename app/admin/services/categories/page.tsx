import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Edit,
  Trash2,
  Plus,
  ArrowLeft,
  EyeOff,
  Briefcase,
  Users,
  BarChart3,
} from "lucide-react";
import StatsCard from "@/components/admin/StatsCard";
import DeleteServiceCategoryButton from "./_components/DeleteServiceCategoryButton";

export default async function ServiceCategoriesPage() {
  const [categories, totalServices, categoriesWithServices] = await Promise.all(
    [
      prisma.serviceCategory.findMany({
        orderBy: { sortOrder: "asc" },
        include: {
          _count: {
            select: { services: true },
          },
        },
      }),
      prisma.service.count(),
      prisma.serviceCategory.count({
        where: {
          services: {
            some: {},
          },
        },
      }),
    ],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-4 mb-3">
            <Link
              href="/admin/services"
              className="p-2 hover:bg-[var(--glass-bg-hover)] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[var(--text-primary)]" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                Service Categories
              </h1>
              <p className="text-[var(--text-muted)] mt-1">
                Manage categories used for services.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/services/categories/create"
            className="btn-primary flex items-center gap-2 px-6 py-3 rounded-lg"
          >
            <Plus className="w-5 h-5" />
            Add Category
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Total Categories"
          value={categories.length}
          icon={BarChart3}
          color="purple"
        />
        <StatsCard
          title="Categories with Services"
          value={categoriesWithServices}
          icon={Briefcase}
          color="blue"
        />
        <StatsCard
          title="Total Services"
          value={totalServices}
          icon={Users}
          color="scarlet"
        />
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[var(--glass-bg-strong)] border-b border-[var(--divider)]">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-secondary)]">
                Order
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-secondary)]">
                Category
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-secondary)]">
                Slug
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-secondary)]">
                Services
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-secondary)]">
                Status
              </th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-[var(--text-secondary)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--divider)]">
            {categories.map((category) => (
              <tr
                key={category.id}
                className="hover:bg-[var(--glass-bg-subtle)] transition-colors"
              >
                <td className="px-6 py-4">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--glass-bg-strong)] text-[var(--text-primary)] font-semibold text-sm">
                    {category.sortOrder}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {category.image ? (
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-[var(--glass-bg-strong)]">
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : category.icon ? (
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                        style={{
                          background: category.color
                            ? `${category.color}20`
                            : "var(--glass-bg-strong)",
                        }}
                      >
                        {category.icon}
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-[var(--glass-bg-strong)]" />
                    )}
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">
                        {category.name}
                      </p>
                      {category.color && (
                        <div className="flex items-center gap-2 mt-1">
                          <div
                            className="w-4 h-4 rounded border border-[var(--divider)]"
                            style={{ background: category.color }}
                          />
                          <span className="text-xs text-[var(--text-muted)]">
                            {category.color}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-[var(--text-secondary)] font-mono text-sm">
                  {category.slug}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[var(--purple-faint)] text-[var(--purple)]">
                    {category._count.services} services
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                      category.active
                        ? "bg-[var(--success-bg)] text-[var(--success-text)]"
                        : "bg-[var(--error-bg)] text-[var(--error-text)]"
                    }`}
                  >
                    {category.active ? (
                      "Active"
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3" /> Hidden
                      </>
                    )}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/services/categories/${category.id}/edit`}
                      className="p-2 hover:bg-[var(--purple-faint)] text-[var(--purple)] rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <DeleteServiceCategoryButton
                      id={category.id}
                      name={category.name}
                      serviceCount={category._count.services}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[var(--text-muted)]">No categories found</p>
            <Link
              href="/admin/services/categories/create"
              className="inline-block mt-4 text-[var(--purple)] hover:underline"
            >
              Create your first category
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
