// app/admin/orders/page.tsx

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Package,
  DollarSign,
  Calendar,
  Users,
  ClipboardList,
} from "lucide-react";

function getStatusStyle(status: string) {
  switch (status.toUpperCase()) {
    case "DELIVERED":
    case "PAID":
      return "bg-[var(--green-faint)] text-[var(--green)]";
    case "PROCESSING":
    case "SHIPPED":
      return "bg-[var(--blue-faint)] text-[var(--blue)]";
    case "PENDING":
      return "bg-[var(--yellow-faint)] text-[var(--yellow)]";
    case "CANCELLED":
      return "bg-[var(--scarlet-faint)] text-[var(--scarlet)]";
    default:
      return "bg-[var(--glass-bg-subtle)] text-[var(--text-secondary)]";
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      items: {
        include: {
          product: {
            select: { id: true, name: true, images: true },
          },
        },
      },
    },
  });

  const stats = {
    total: orders.length,
    revenue: orders.reduce((sum, order) => sum + order.total, 0),
    pending: orders.filter((order) => order.status === "PENDING").length,
    completed: orders.filter((order) => order.status === "DELIVERED" || order.status === "PAID").length,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          Order Management
        </h1>
        <p className="text-[var(--text-muted)] mt-2">
          Review marketplace orders placed by your users.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass p-5 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[var(--text-muted)]">Total Orders</span>
            <Package className="w-5 h-5 text-[var(--purple)]" />
          </div>
          <p className="text-3xl font-bold text-[var(--text-primary)]">{stats.total}</p>
        </div>

        <div className="glass p-5 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[var(--text-muted)]">Revenue</span>
            <DollarSign className="w-5 h-5 text-[var(--green)]" />
          </div>
          <p className="text-3xl font-bold text-[var(--text-primary)]">{formatCurrency(stats.revenue)}</p>
        </div>

        <div className="glass p-5 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[var(--text-muted)]">Pending / Completed</span>
            <ClipboardList className="w-5 h-5 text-[var(--blue)]" />
          </div>
          <p className="text-3xl font-bold text-[var(--text-primary)]">
            {stats.pending} / {stats.completed}
          </p>
        </div>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead className="bg-[var(--glass-bg-strong)] border-b border-[var(--divider)]">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-secondary)]">Order</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-secondary)]">Customer</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-secondary)]">Items</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-secondary)]">Total</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-secondary)]">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-secondary)]">Placed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--divider)]">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-[var(--glass-bg-subtle)] transition-colors">
                  <td className="px-6 py-4">#{order.id.slice(0, 8)}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-[var(--text-primary)]">
                        {order.user?.name || "Unknown"}
                      </span>
                      <span className="text-sm text-[var(--text-muted)]">{order.user?.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {order.items.slice(0, 3).map((item) => (
                        <span
                          key={item.id}
                          className="px-2 py-1 rounded-full text-xs bg-[var(--glass-bg)] text-[var(--text-secondary)]"
                        >
                          {item.product?.name || "Item"}
                        </span>
                      ))}
                      {order.items.length > 3 && (
                        <span className="px-2 py-1 rounded-full text-xs bg-[var(--glass-bg)] text-[var(--text-secondary)]">
                          +{order.items.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-[var(--text-primary)]">{formatCurrency(order.total)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-muted)]">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">
          Showing the latest {orders.length} order{orders.length === 1 ? "" : "s"}.
        </p>
        <Link href="/admin" className="text-sm font-medium text-[var(--purple)]">
          Back to admin dashboard
        </Link>
      </div>
    </div>
  );
}
