"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft,
  ShoppingBag, 
  Calendar, 
  Package, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Truck,
  Clock,
  Filter,
  X,
  User
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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      const data = await response.json();
      if (data.success) {
        setOrders(data.data || []);
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

  const statusOptions = [
    { value: "all", label: "All Orders" },
    { value: "PENDING", label: "Pending" },
    { value: "PAID", label: "Paid" },
    { value: "PROCESSING", label: "Processing" },
    { value: "SHIPPED", label: "Shipped" },
    { value: "DELIVERED", label: "Delivered" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  const filteredOrders = filter === "all" 
    ? orders 
    : orders.filter(order => order.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="p-2 rounded-lg transition-colors hover:bg-[var(--glass-bg-hover)]"
        >
          <ArrowLeft
            className="w-5 h-5"
            style={{ color: "var(--text-muted)" }}
          />
        </Link>
        <div className="flex-1">
          <h1
            className="text-3xl font-extrabold"
            style={{ color: "var(--text-primary)" }}
          >
            My Orders
          </h1>
          <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
            Track and manage your product orders
          </p>
        </div>
      </div>

      {/* Filters */}
      <div
        className="p-4 rounded-xl flex items-center gap-4"
        style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
        }}
      >
        <Filter
          className="w-5 h-5"
          style={{ color: "var(--text-muted)" }}
        />
        <div className="flex gap-2 flex-wrap">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === option.value
                  ? "text-white"
                  : ""
              }`}
              style={{
                background: filter === option.value
                  ? "linear-gradient(135deg, var(--purple), var(--blue))"
                  : "var(--glass-bg-subtle)",
                color: filter === option.value
                  ? "#fff"
                  : "var(--text-secondary)",
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div
          className="p-6 rounded-2xl"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div
          className="p-12 rounded-2xl text-center"
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
            No Orders Found
          </h3>
          <p 
            className="text-sm mb-6" 
            style={{ color: "var(--text-muted)" }}
          >
            {filter === "all" 
              ? "You haven't placed any orders yet. Start shopping to see your orders here."
              : `No orders with status "${filter}" found.`
            }
          </p>
          {filter === "all" && (
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg, var(--purple), var(--blue))",
              }}
            >
              Browse Products
            </Link>
          )}
        </div>
      ) : (
        <div
          className="p-6 rounded-2xl"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="p-5 rounded-xl transition-all hover:scale-[1.01]"
                style={{
                  background: "var(--glass-bg-subtle)",
                  border: "1px solid var(--divider)",
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h4
                        className="font-semibold text-lg"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Order #{order.id.slice(0, 8)}
                      </h4>
                      <span
                        className="px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2"
                        style={getStatusColor(order.status)}
                      >
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </div>
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Placed on {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span
                      className="font-bold text-lg"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {order.total.toLocaleString()} XAF
                    </span>
                    {canCancelOrder(order.status) && (
                      <button
                        onClick={() => cancelOrder(order.id)}
                        disabled={cancellingOrder === order.id}
                        className="px-3 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-2"
                        style={{
                          background: "var(--error-bg)",
                          color: "var(--error-text)",
                          border: "1px solid var(--error-border)",
                        }}
                      >
                        {cancellingOrder === order.id ? (
                          <>
                            <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4" />
                            Cancel Order
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-3 rounded-lg"
                      style={{ background: "var(--glass-bg)" }}
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        {item.product.images?.[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center"
                            style={{ background: "var(--glass-bg-subtle)" }}
                          >
                            <Package
                              className="w-6 h-6"
                              style={{ color: "var(--text-muted)" }}
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h5
                          className="font-semibold truncate"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {item.product.name}
                        </h5>
                        {item.product.seller && (
                          <p
                            className="text-sm flex items-center gap-1"
                            style={{ color: "var(--text-muted)" }}
                          >
                            <User className="w-3 h-3" />
                            Sold by {item.product.seller.name}
                          </p>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <p
                          className="font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {item.price.toLocaleString()} XAF
                        </p>
                        <p
                          className="text-sm"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}