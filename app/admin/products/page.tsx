// app/admin/products/page.tsx

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Edit, Trash2, Plus } from "lucide-react";
import DeleteProductButton from "@/components/ui/deleteButton";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Products
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Manage marketplace products
          </p>
        </div>

        <Link
          href="/admin/products/create"
          className="btn-primary flex items-center gap-2 px-6 py-3 rounded-lg"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </Link>
      </div>

      {/* Products Table */}
      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[var(--glass-bg-strong)] border-b border-[var(--divider)]">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-secondary)]">
                Product
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-secondary)]">
                Category
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-secondary)]">
                Price (XAF)
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-secondary)]">
                Stock
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
            {products.map((product) => (
              <tr
                key={product.id}
                className="hover:bg-[var(--glass-bg-subtle)] transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {product.images[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">
                        {product.name}
                      </p>
                      <p className="text-sm text-[var(--text-muted)] line-clamp-1">
                        {product.description}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-[var(--text-secondary)]">
                  {product.category}
                </td>
                <td className="px-6 py-4 font-medium text-[var(--text-primary)]">
                  {product.price.toLocaleString()} XAF
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      product.stock > 0
                        ? "bg-[var(--success-bg)] text-[var(--success-text)]"
                        : "bg-[var(--error-bg)] text-[var(--error-text)]"
                    }`}
                  >
                    {product.stock}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      product.active
                        ? "bg-[var(--success-bg)] text-[var(--success-text)]"
                        : "bg-[var(--error-bg)] text-[var(--error-text)]"
                    }`}
                  >
                    {product.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="p-2 hover:bg-[var(--purple-faint)] text-[var(--purple)] rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <DeleteProductButton id={product.id} name={product.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[var(--text-muted)]">No products found</p>
            <Link
              href="/admin/products/create"
              className="inline-block mt-4 text-[var(--purple)] hover:underline"
            >
              Create your first product
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
