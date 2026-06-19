"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import {
  Package, PlusCircle, DollarSign, ShoppingCart, TrendingUp,
  Loader2, Pencil, Trash2, Star, Search, AlertCircle, ArrowLeft,
} from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { useCategories } from "@/hooks/useCategories";
import CreatorProductForm from "@/components/creator/creatorProductForm";
import type { StoreView } from "@/components/store/StoreSidebar";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  categoryId: string;
  group: string;
  stock: number;
  active: boolean;
  featured: boolean;
  rating: number;
  reviews: number;
  badge: string | null;
  benefits: string[];
  ingredients: string[];
  createdAt: string;
  category?: { id: string; name: string; icon: string | null };
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <div className="glass p-5 rounded-2xl" style={{ border: "1px solid var(--glass-border)" }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>{label}</p>
        <div className="p-2 rounded-xl" style={{ background: "var(--glass-bg-subtle)" }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>{value}</p>
    </div>
  );
}

// ── Overview ──────────────────────────────────────────────────────────────────

function Overview({ products, orders, onViewChange, convert }: { products: Product[]; orders: any[]; onViewChange: (v: StoreView) => void; convert: (n: number) => string }) {
  const totalEarnings = orders.filter((o) => ["DELIVERED", "PAID"].includes(o.status)).reduce((a, o) => a + (o.total ?? 0), 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>My Store 🛍️</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>Manage your products and track sales.</p>
        </div>
        <button onClick={() => onViewChange("create")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:scale-105 transition-transform" style={{ background: "linear-gradient(135deg, var(--purple), var(--blue))", boxShadow: "0 4px 16px rgba(123,47,190,0.4)" }}>
          <PlusCircle className="w-4 h-4" /> New Product
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Products" value={products.length} icon={Package} color="var(--purple)" />
        <StatCard label="Active" value={products.filter((p) => p.active).length} icon={TrendingUp} color="var(--blue)" />
        <StatCard label="Orders" value={orders.length} icon={ShoppingCart} color="var(--green)" />
        <StatCard label="Earnings" value={convert(totalEarnings)} icon={DollarSign} color="var(--yellow, #f59e0b)" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Recent Products</h2>
          <button onClick={() => onViewChange("products")} className="text-sm font-semibold" style={{ color: "var(--blue)" }}>View All →</button>
        </div>
        {products.length === 0 ? (
          <div className="glass p-12 rounded-2xl text-center" style={{ border: "1px solid var(--glass-border)" }}>
            <Package className="w-14 h-14 mx-auto mb-3" style={{ color: "var(--text-disabled)" }} />
            <p className="font-semibold mb-4" style={{ color: "var(--text-muted)" }}>No products yet</p>
            <button onClick={() => onViewChange("create")} className="btn-primary px-6 py-2.5 text-sm font-semibold rounded-xl">Add your first product</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.slice(0, 6).map((p) => (
              <ProductCard key={p.id} product={p} convert={convert} onEdit={() => onViewChange("products")} onDelete={() => {}} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Product Card ──────────────────────────────────────────────────────────────

function ProductCard({ product, convert, onEdit, onDelete }: { product: Product; convert: (n: number) => string; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="glass rounded-2xl overflow-hidden" style={{ border: "1px solid var(--glass-border)" }}>
      <div className="relative h-40 bg-[var(--glass-bg-subtle)]">
        {product.images?.[0] ? (
          <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="w-10 h-10 opacity-20" style={{ color: "var(--text-muted)" }} />
          </div>
        )}
        <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-1 rounded-full ${product.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
          {product.active ? "Active" : "Inactive"}
        </span>
      </div>
      <div className="p-4">
        <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
          {product.category?.name ?? "Uncategorized"}
        </p>
        <h3 className="font-semibold truncate mb-1" style={{ color: "var(--text-primary)" }}>{product.name}</h3>
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-sm" style={{ color: "var(--accent-primary)" }}>{convert(product.price)}</span>
          <div className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {product.rating.toFixed(1)} ({product.reviews})
          </div>
        </div>
        <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid var(--divider)" }}>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>Stock: {product.stock}</span>
          <div className="flex items-center gap-2">
            <button onClick={onEdit} className="flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--purple)" }}>
              <Pencil className="w-3 h-3" /> Edit
            </button>
            <button onClick={onDelete} className="flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--error-text)" }}>
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Products List ─────────────────────────────────────────────────────────────

function ProductsList({ products, convert, onAdd, onEdit, onDelete, loading }: { products: Product[]; convert: (n: number) => string; onAdd: () => void; onEdit: (p: Product) => void; onDelete: (id: string) => void; loading: boolean }) {
  const [search, setSearch] = useState("");
  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>My Products</h1>
        <button onClick={onAdd} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:scale-105 transition-transform" style={{ background: "linear-gradient(135deg, var(--purple), var(--blue))" }}>
          <PlusCircle className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="glass-input w-full pl-9 pr-4 py-2.5 text-sm" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--purple)" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass p-12 rounded-2xl text-center" style={{ border: "1px solid var(--glass-border)" }}>
          <Package className="w-14 h-14 mx-auto mb-3" style={{ color: "var(--text-disabled)" }} />
          <p className="font-semibold mb-4" style={{ color: "var(--text-muted)" }}>{search ? `No products matching "${search}"` : "No products yet"}</p>
          {!search && <button onClick={onAdd} className="btn-primary px-6 py-2.5 text-sm font-semibold rounded-xl">Add your first product</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} convert={convert} onEdit={() => onEdit(p)} onDelete={() => onDelete(p.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Orders View ───────────────────────────────────────────────────────────────

function OrdersView({ orders, convert }: { orders: any[]; convert: (n: number) => string }) {
  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    PAID: "bg-blue-100 text-blue-700",
    PROCESSING: "bg-purple-100 text-purple-700",
    SHIPPED: "bg-indigo-100 text-indigo-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-600",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>Orders</h1>
      {orders.length === 0 ? (
        <div className="glass p-12 rounded-2xl text-center" style={{ border: "1px solid var(--glass-border)" }}>
          <ShoppingCart className="w-14 h-14 mx-auto mb-3" style={{ color: "var(--text-disabled)" }} />
          <p className="font-semibold" style={{ color: "var(--text-muted)" }}>No orders yet</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden" style={{ border: "1px solid var(--glass-border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--divider)", background: "var(--glass-bg-subtle)" }}>
                {["Order ID", "Items", "Total", "Status", "Date"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} style={{ borderBottom: "1px solid var(--divider)" }}>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--text-muted)" }}>#{o.id.slice(-8)}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>{o.items?.length ?? 0} item(s)</td>
                  <td className="px-4 py-3 font-semibold" style={{ color: "var(--accent-primary)" }}>{convert(o.total)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusColors[o.status] ?? "bg-gray-100 text-gray-600"}`}>{o.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Earnings View ─────────────────────────────────────────────────────────────

function EarningsView({ orders, convert }: { orders: any[]; convert: (n: number) => string }) {
  const completed = orders.filter((o) => ["DELIVERED", "PAID"].includes(o.status));
  const total = completed.reduce((a, o) => a + (o.total ?? 0), 0);
  const thisMonth = completed.filter((o) => new Date(o.createdAt).getMonth() === new Date().getMonth()).reduce((a, o) => a + (o.total ?? 0), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>Earnings</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Earnings" value={convert(total)} icon={DollarSign} color="var(--green)" />
        <StatCard label="This Month" value={convert(thisMonth)} icon={TrendingUp} color="var(--purple)" />
        <StatCard label="Completed Orders" value={completed.length} icon={ShoppingCart} color="var(--blue)" />
      </div>
      <div className="glass p-6 rounded-2xl" style={{ border: "1px solid var(--glass-border)" }}>
        <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>Recent Payouts</h2>
        {completed.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>No completed orders yet</p>
        ) : (
          <div className="space-y-3">
            {completed.slice(0, 10).map((o) => (
              <div key={o.id} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid var(--divider)" }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Order #{o.id.slice(-8)}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{new Date(o.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="font-bold" style={{ color: "var(--green)" }}>{convert(o.total)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function StorePageContent({ view, setView }: { view: StoreView; setView: (v: StoreView) => void }) {
  const { data: session } = useSession();
  const { convert } = useCurrency();

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetchData();
  }, [session?.user?.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, oRes] = await Promise.all([
        fetch("/api/products?mine=true"),
        fetch("/api/orders"),
      ]);
      const [pData, oData] = await Promise.all([pRes.json(), oRes.json()]);
      setProducts(pData.products ?? []);
      setOrders(oData.orders ?? []);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleFormSuccess = () => {
    setEditingProduct(null);
    setView("products");
    fetchData();
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--purple)" }} />
    </div>
  );

  // Create / Edit form
  if (view === "create" || view === "edit") {
    return (
      <CreatorProductForm
        product={editingProduct ?? undefined}
        onSuccess={handleFormSuccess}
        onCancel={() => { setEditingProduct(null); setView("products"); }}
      />
    );
  }

  if (view === "products") return (
    <ProductsList
      products={products}
      convert={convert}
      loading={false}
      onAdd={() => { setEditingProduct(null); setView("create"); }}
      onEdit={(p) => { setEditingProduct(p); setView("edit"); }}
      onDelete={handleDeleteProduct}
    />
  );

  if (view === "orders") return <OrdersView orders={orders} convert={convert} />;
  if (view === "earnings") return <EarningsView orders={orders} convert={convert} />;

  return <Overview products={products} orders={orders} onViewChange={setView} convert={convert} />;
}
