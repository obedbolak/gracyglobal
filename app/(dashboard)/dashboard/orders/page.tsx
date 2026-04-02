"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  Calendar,
  Loader2,
  ShoppingBag,
  ExternalLink,
  AlertCircle,
} from "lucide-react";

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  items: {
    id: string;
    quantity: number;
    price: number;
    product?: {
      id: string;
      name: string;
      images: string[];
    };
    service?: {
      id: string;
      title: string;
      images: string[];
    };
  }[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) {
        throw new Error("Failed to fetch");
      }
      const data = await res.json();
      if (data.success) {
        setOrders(data.data || []);
      } else {
        setError(data.error || "Failed to load orders");
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
        return "var(--green)";
      case "PENDING":
        return "var(--yellow)";
      case "CANCELLED":
        return "var(--scarlet)";
      default:
        return "var(--text-muted)";
    }
  };

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            My Orders
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            View and track your order history
          </p>
        </div>
        <div
          className="text-center py-16 rounded-2xl"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <AlertCircle
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: "var(--scarlet)" }}
          />
          <h3
            className="text-xl font-semibold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Failed to load orders
          </h3>
          <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
            {error}
          </p>
          <button
            onClick={fetchOrders}
            className="px-6 py-3 rounded-lg text-white font-semibold"
            style={{
              background: "linear-gradient(135deg, var(--purple), var(--blue))",
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2
            className="w-8 h-8 animate-spin mx-auto mb-4"
            style={{ color: "var(--blue)" }}
          />
          <p style={{ color: "var(--text-secondary)" }}>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          My Orders
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          View and track your order history
        </p>
      </div>

      {orders.length === 0 ? (
        <div
          className="text-center py-16 rounded-2xl"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <ShoppingBag
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: "var(--text-muted)" }}
          />
          <h3
            className="text-xl font-semibold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            No orders yet
          </h3>
          <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
            Start shopping to see your orders here
          </p>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold"
            style={{
              background: "linear-gradient(135deg, var(--purple), var(--blue))",
            }}
          >
            Browse Marketplace
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-6 rounded-2xl"
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3
                      className="text-lg font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Order #{order.id.slice(0, 8)}
                    </h3>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: `${getStatusColor(order.status)}20`,
                        color: getStatusColor(order.status),
                      }}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div
                    className="flex items-center gap-2 text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <Calendar className="w-4 h-4" />
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className="text-sm mb-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Total
                  </p>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {order.total.toLocaleString()} XAF
                  </p>
                </div>
              </div>

              <div
                className="pt-4 space-y-3"
                style={{ borderTop: "1px solid var(--divider)" }}
              >
                {order.items.map((item) => {
                  const itemName =
                    item.product?.name || item.service?.title || "Unknown Item";
                  const itemImage =
                    item.product?.images[0] || item.service?.images[0];

                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-3 rounded-lg"
                      style={{ background: "var(--glass-bg-subtle)" }}
                    >
                      {itemImage ? (
                        <img
                          src={itemImage}
                          alt={itemName}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div
                          className="w-16 h-16 rounded-lg flex items-center justify-center"
                          style={{ background: "var(--glass-bg)" }}
                        >
                          <Package
                            className="w-6 h-6"
                            style={{ color: "var(--text-muted)" }}
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <p
                          className="font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {itemName}
                        </p>
                        <p
                          className="text-sm"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <p
                        className="font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {item.price.toLocaleString()} XAF
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
