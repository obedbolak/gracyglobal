"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ShoppingBag, 
  Calendar, 
  Package, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Truck,
  Clock,
  ArrowRight,
  X
} from "lucide-react";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    images: string[];
    seller: {
      id: string;
      name: string;
      image: string | null;
    } | null;
  };
}

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

export default function UserOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      const data = await response.json();
      if (data.success) {
        setOrders(data.data?.slice(0, 5) || []);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
      return;
    }

    setCancellingOrder(orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: "CANCELLED",
          cancelReason: "Cancelled by user"
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Update the order in the local state
        setOrders(orders.map(order => 
          order.id === orderId 
            ? { ...order, status: "CANCELLED" }
            : order
        ));
      } else {
        alert(data.error || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Failed to cancel order:", error);
      alert("Failed to cancel order. Please try again.");
    } finally {
      setCancellingOrder(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PAID":
        return <CheckCircle className="w-4 h-4" style={{ color: "var(--green)" }} />;
      case "PROCESSING":
        return <Package className="w-4 h-4" style={{ color: "var(--blue)" }} />;
      case "SHIPPED":
        return <Truck className="w-4 h-4" style={{ color: "var(--purple)" }} />;
      case "DELIVERED":
        return <CheckCircle className="w-4 h-4" style={{ color: "var(--success-text)" }} />;
      case "CANCELLED":
        return <XCircle className="w-4 h-4" style={{ color: "var(--error-text)" }} />;
      default:
        return <Clock className="w-4 h-4" style={{ color: "var(--warning-text)" }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return { background: "var(--success-bg)", color: "var(--success-text)" };
      case "PROCESSING":
        return { background: "var(--info-bg)", color: "var(--blue)" };
      case "SHIPPED":
        return { background: "var(--badge-purple-bg)", color: "var(--purple)" };
      case "DELIVERED":
        return { background: "var(--success-bg)", color: "var(--success-text)" };
      case "CANCELLED":
        return { background: "var(--error-bg)", color: "var(--error-text)" };
      default:
        return { background: "var(--warning-bg)", color: "var(--warning-text)" };
    }
  };

  const canCancelOrder = (status: string) => {
    return ["PENDING", "PAID"].includes(status);
  };

  if (loading) {
    return (
      <div
        className="p-6 rounded-2xl"
        style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
        }}
      >
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div
        className="p-6 rounded-2xl text-center"
        style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
        }}
      >
        <ShoppingBag 
          className="w-12 h-12 mx-auto mb-3" 
          style={{ color: "var(--text-muted)" }} 
        />
        <h3 
          className="font-semibold mb-1" 
          style={{ color: "var(--text-primary)" }}
        >
          No Orders Yet
        </h3>
        <p 
          className="text-sm mb-4" 
          style={{ color: "var(--text-muted)" }}
        >
          Start shopping in our marketplace to see your orders here.
        </p>
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:scale-105"
          style={{
            background: "linear-gradient(135deg, var(--purple), var(--blue))",
          }}
        >
          Browse Products
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div
      className="p-6 rounded-2xl"
      style={{
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-lg font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Recent Orders
        </h3>
        <Link
          href="/dashboard/orders"
          className="text-sm font-semibold flex items-center gap-1"
          style={{ color: "var(--blue)" }}
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <div
            key={order.id}
            className="p-4 rounded-xl transition-all hover:scale-[1.01]"
            style={{
              background: "var(--glass-bg-subtle)",
              border: "1px solid var(--divider)",
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4
                    className="font-semibold text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Order #{order.id.slice(0, 8)}
                  </h4>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1"
                    style={getStatusColor(order.status)}
                  >
                    {getStatusIcon(order.status)}
                    {order.status}
                  </span>
                </div>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <span
                  className="font-semibold text-sm"
                  style={{ color: "var(--text-primary)" }}
                >
                  {order.total.toLocaleString()} XAF
                </span>
                {canCancelOrder(order.status) && (
                  <button
                    onClick={() => cancelOrder(order.id)}
                    disabled={cancellingOrder === order.id}
                    className="p-1.5 rounded-lg transition-all hover:scale-110 disabled:opacity-50"
                    style={{
                      background: "var(--error-bg)",
                      color: "var(--error-text)",
                    }}
                    title="Cancel Order"
                  >
                    {cancellingOrder === order.id ? (
                      <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <X className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Order Items Preview */}
            <div className="flex items-center gap-2 overflow-x-auto">
              {order.items.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-8 h-8 rounded overflow-hidden">
                    {item.product.images?.[0] ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: "var(--glass-bg)" }}
                      >
                        <Package
                          className="w-4 h-4"
                          style={{ color: "var(--text-muted)" }}
                        />
                      </div>
                    )}
                  </div>
                  <span
                    className="text-xs truncate max-w-20"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {item.product.name}
                  </span>
                  {item.quantity > 1 && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full"
                      style={{
                        background: "var(--glass-bg)",
                        color: "var(--text-muted)",
                      }}
                    >
                      ×{item.quantity}
                    </span>
                  )}
                </div>
              ))}
              {order.items.length > 3 && (
                <span
                  className="text-xs px-2 py-1 rounded-full flex-shrink-0"
                  style={{
                    background: "var(--glass-bg)",
                    color: "var(--text-muted)",
                  }}
                >
                  +{order.items.length - 3} more
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}