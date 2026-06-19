"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import {
  Package,
  PlusCircle,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Loader2,
  Pencil,
  Trash2,
  Star,
  Search,
  AlertCircle,
  Save,
} from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import CreatorProductForm from "@/components/creator/creatorProductForm";
import ImageUpload from "@/components/shared/ImageUpload";
import type { StoreView } from "@/components/store/StoreSidebar";
import type { StoreProfile } from "@/components/store/StoreShell";

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

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: any;
  color: string;
}) {
  return (
    <div
      className="glass p-5 rounded-2xl"
      style={{ border: "1px solid var(--glass-border)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <p
          className="text-sm font-medium"
          style={{ color: "var(--text-muted)" }}
        >
          {label}
        </p>
        <div
          className="p-2 rounded-xl"
          style={{ background: "var(--glass-bg-subtle)" }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <p
        className="text-2xl font-extrabold"
        style={{ color: "var(--text-primary)" }}
      >
        {value}
      </p>
    </div>
  );
}

// ── Overview ──────────────────────────────────────────────────────────────────

function Overview({
  products,
  orders,
  onViewChange,
  convert,
  storeIncomplete,
}: {
  products: Product[];
  orders: any[];
  onViewChange: (v: StoreView) => void;
  convert: (n: number) => string;
  storeIncomplete: boolean;
}) {
  const totalEarnings = orders
    .filter((o) => ["DELIVERED", "PAID"].includes(o.status))
    .reduce((a, o) => a + (o.total ?? 0), 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-3xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            My Store 🛍️
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            Manage your products and track sales.
          </p>
        </div>
        <button
          onClick={() => onViewChange("create")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:scale-105 transition-transform"
          style={{
            background: "linear-gradient(135deg, var(--purple), var(--blue))",
            boxShadow: "0 4px 16px rgba(123,47,190,0.4)",
          }}
        >
          <PlusCircle className="w-4 h-4" /> New Product
        </button>
      </div>

      {storeIncomplete && (
        <button
          onClick={() => onViewChange("settings")}
          className="glass w-full flex items-start gap-3 p-4 rounded-xl text-left hover:bg-[var(--glass-bg-hover)] transition-colors"
          style={{ border: "1px solid var(--glass-border)" }}
        >
          <AlertCircle
            className="w-5 h-5 flex-shrink-0 mt-0.5"
            style={{ color: "var(--yellow, #f59e0b)" }}
          />
          <div>
            <p
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Complete your store profile
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--text-secondary)" }}
            >
              Add your business name, location and opening hours so customers
              can find you. Click to set up →
            </p>
          </div>
        </button>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Products"
          value={products.length}
          icon={Package}
          color="var(--purple)"
        />
        <StatCard
          label="Active"
          value={products.filter((p) => p.active).length}
          icon={TrendingUp}
          color="var(--blue)"
        />
        <StatCard
          label="Orders"
          value={orders.length}
          icon={ShoppingCart}
          color="var(--green)"
        />
        <StatCard
          label="Earnings"
          value={convert(totalEarnings)}
          icon={DollarSign}
          color="var(--yellow, #f59e0b)"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Recent Products
          </h2>
          <button
            onClick={() => onViewChange("products")}
            className="text-sm font-semibold"
            style={{ color: "var(--blue)" }}
          >
            View All →
          </button>
        </div>
        {products.length === 0 ? (
          <div
            className="glass p-12 rounded-2xl text-center"
            style={{ border: "1px solid var(--glass-border)" }}
          >
            <Package
              className="w-14 h-14 mx-auto mb-3"
              style={{ color: "var(--text-disabled)" }}
            />
            <p
              className="font-semibold mb-4"
              style={{ color: "var(--text-muted)" }}
            >
              No products yet
            </p>
            <button
              onClick={() => onViewChange("create")}
              className="btn-primary px-6 py-2.5 text-sm font-semibold rounded-xl"
            >
              Add your first product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.slice(0, 6).map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                convert={convert}
                onEdit={() => onViewChange("products")}
                onDelete={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Product Card ──────────────────────────────────────────────────────────────

function ProductCard({
  product,
  convert,
  onEdit,
  onDelete,
}: {
  product: Product;
  convert: (n: number) => string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="glass rounded-2xl overflow-hidden"
      style={{ border: "1px solid var(--glass-border)" }}
    >
      <div className="relative h-40 bg-[var(--glass-bg-subtle)]">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Package
              className="w-10 h-10 opacity-20"
              style={{ color: "var(--text-muted)" }}
            />
          </div>
        )}
        <span
          className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-1 rounded-full ${product.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
        >
          {product.active ? "Active" : "Inactive"}
        </span>
      </div>
      <div className="p-4">
        <p
          className="text-[10px] uppercase tracking-wider mb-1"
          style={{ color: "var(--text-muted)" }}
        >
          {product.category?.name ?? "Uncategorized"}
        </p>
        <h3
          className="font-semibold truncate mb-1"
          style={{ color: "var(--text-primary)" }}
        >
          {product.name}
        </h3>
        <div className="flex items-center justify-between mb-3">
          <span
            className="font-bold text-sm"
            style={{ color: "var(--accent-primary)" }}
          >
            {convert(product.price)}
          </span>
          <div
            className="flex items-center gap-1 text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {product.rating.toFixed(1)} ({product.reviews})
          </div>
        </div>
        <div
          className="flex items-center justify-between pt-3"
          style={{ borderTop: "1px solid var(--divider)" }}
        >
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            Stock: {product.stock}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="flex items-center gap-1 text-xs font-semibold"
              style={{ color: "var(--purple)" }}
            >
              <Pencil className="w-3 h-3" /> Edit
            </button>
            <button
              onClick={onDelete}
              className="flex items-center gap-1 text-xs font-semibold"
              style={{ color: "var(--error-text)" }}
            >
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Products List ─────────────────────────────────────────────────────────────

function ProductsList({
  products,
  convert,
  onAdd,
  onEdit,
  onDelete,
  loading,
}: {
  products: Product[];
  convert: (n: number) => string;
  onAdd: () => void;
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
  loading: boolean;
}) {
  const [search, setSearch] = useState("");
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1
          className="text-3xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          My Products
        </h1>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:scale-105 transition-transform"
          style={{
            background: "linear-gradient(135deg, var(--purple), var(--blue))",
          }}
        >
          <PlusCircle className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="relative max-w-md">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
          style={{ color: "var(--text-muted)" }}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="glass-input w-full pl-9 pr-4 py-2.5 text-sm"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2
            className="w-8 h-8 animate-spin"
            style={{ color: "var(--purple)" }}
          />
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="glass p-12 rounded-2xl text-center"
          style={{ border: "1px solid var(--glass-border)" }}
        >
          <Package
            className="w-14 h-14 mx-auto mb-3"
            style={{ color: "var(--text-disabled)" }}
          />
          <p
            className="font-semibold mb-4"
            style={{ color: "var(--text-muted)" }}
          >
            {search ? `No products matching "${search}"` : "No products yet"}
          </p>
          {!search && (
            <button
              onClick={onAdd}
              className="btn-primary px-6 py-2.5 text-sm font-semibold rounded-xl"
            >
              Add your first product
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              convert={convert}
              onEdit={() => onEdit(p)}
              onDelete={() => onDelete(p.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Orders View ───────────────────────────────────────────────────────────────

function OrdersView({
  orders,
  convert,
}: {
  orders: any[];
  convert: (n: number) => string;
}) {
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
      <h1
        className="text-3xl font-bold"
        style={{ color: "var(--text-primary)" }}
      >
        Orders
      </h1>
      {orders.length === 0 ? (
        <div
          className="glass p-12 rounded-2xl text-center"
          style={{ border: "1px solid var(--glass-border)" }}
        >
          <ShoppingCart
            className="w-14 h-14 mx-auto mb-3"
            style={{ color: "var(--text-disabled)" }}
          />
          <p className="font-semibold" style={{ color: "var(--text-muted)" }}>
            No orders yet
          </p>
        </div>
      ) : (
        <div
          className="glass rounded-2xl overflow-hidden"
          style={{ border: "1px solid var(--glass-border)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid var(--divider)",
                  background: "var(--glass-bg-subtle)",
                }}
              >
                {["Order ID", "Items", "Total", "Status", "Date"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr
                  key={o.id}
                  style={{ borderBottom: "1px solid var(--divider)" }}
                >
                  <td
                    className="px-4 py-3 font-mono text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    #{o.id.slice(-8)}
                  </td>
                  <td
                    className="px-4 py-3"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {o.items?.length ?? 0} item(s)
                  </td>
                  <td
                    className="px-4 py-3 font-semibold"
                    style={{ color: "var(--accent-primary)" }}
                  >
                    {convert(o.total)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusColors[o.status] ?? "bg-gray-100 text-gray-600"}`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td
                    className="px-4 py-3 text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
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

function EarningsView({
  orders,
  convert,
}: {
  orders: any[];
  convert: (n: number) => string;
}) {
  const completed = orders.filter((o) =>
    ["DELIVERED", "PAID"].includes(o.status),
  );
  const total = completed.reduce((a, o) => a + (o.total ?? 0), 0);
  const thisMonth = completed
    .filter((o) => new Date(o.createdAt).getMonth() === new Date().getMonth())
    .reduce((a, o) => a + (o.total ?? 0), 0);

  return (
    <div className="space-y-6">
      <h1
        className="text-3xl font-bold"
        style={{ color: "var(--text-primary)" }}
      >
        Earnings
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Total Earnings"
          value={convert(total)}
          icon={DollarSign}
          color="var(--green)"
        />
        <StatCard
          label="This Month"
          value={convert(thisMonth)}
          icon={TrendingUp}
          color="var(--purple)"
        />
        <StatCard
          label="Completed Orders"
          value={completed.length}
          icon={ShoppingCart}
          color="var(--blue)"
        />
      </div>
      <div
        className="glass p-6 rounded-2xl"
        style={{ border: "1px solid var(--glass-border)" }}
      >
        <h2
          className="text-lg font-bold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Recent Payouts
        </h2>
        {completed.length === 0 ? (
          <p
            className="text-sm text-center py-8"
            style={{ color: "var(--text-muted)" }}
          >
            No completed orders yet
          </p>
        ) : (
          <div className="space-y-3">
            {completed.slice(0, 10).map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between py-2"
                style={{ borderBottom: "1px solid var(--divider)" }}
              >
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Order #{o.id.slice(-8)}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {new Date(o.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="font-bold" style={{ color: "var(--green)" }}>
                  {convert(o.total)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Settings View ─────────────────────────────────────────────────────────────

function StoreSettings({
  store,
  onSaved,
}: {
  store: StoreProfile | null;
  onSaved: (s: StoreProfile) => void;
}) {
  const [form, setForm] = useState({
    businessName: store?.businessName ?? "",
    businessType: store?.businessType ?? "",
    location: store?.location ?? "",
    quarter: store?.quarter ?? "",
    openingHours: store?.openingHours ?? "",
    phone: store?.phone ?? "",
    whatsapp: store?.whatsapp ?? "",
    description: store?.description ?? "",
    image: store?.image ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch("/api/store", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.store) {
        onSaved(data.store);
        setSaved(true);
      } else {
        setError(data.error || "Failed to save");
      }
    } catch {
      setError("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const incomplete =
    !store?.businessName || !store?.location || !store?.openingHours;

  const fields = [
    ["businessName", "Business Name *", "e.g. Gracy Electronics"],
    ["businessType", "Business Type", "e.g. Electronics, Fashion, Food"],
    ["location", "Location", "e.g. Douala"],
    ["quarter", "Quarter / Neighborhood", "e.g. Akwa"],
    ["openingHours", "Opening Hours", "e.g. Mon–Sat, 8am–6pm"],
    ["phone", "Phone", "e.g. +237..."],
    ["whatsapp", "WhatsApp", "e.g. +237..."],
  ] as const;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1
        className="text-3xl font-bold"
        style={{ color: "var(--text-primary)" }}
      >
        Store Settings
      </h1>

      {incomplete && (
        <div
          className="glass flex items-start gap-3 p-4 rounded-xl"
          style={{ border: "1px solid var(--glass-border)" }}
        >
          <AlertCircle
            className="w-5 h-5 flex-shrink-0 mt-0.5"
            style={{ color: "var(--yellow, #f59e0b)" }}
          />
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Complete your store profile so customers can find and trust your
            shop.
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="glass p-6 rounded-2xl space-y-4"
        style={{ border: "1px solid var(--glass-border)" }}
      >
        <ImageUpload
          label="Store Logo / Image"
          aspectRatio="square"
          currentImage={form.image || undefined}
          folder="gracyglobal/stores"
          onUploadComplete={(url) => set("image", url)}
          onRemove={() => set("image", "")}
        />

        {fields.map(([key, label, placeholder]) => (
          <div key={key}>
            <label
              className="block text-sm font-semibold mb-1.5"
              style={{ color: "var(--text-primary)" }}
            >
              {label}
            </label>
            <input
              type="text"
              value={form[key]}
              onChange={(e) => set(key, e.target.value)}
              placeholder={placeholder}
              className="glass-input w-full px-4 py-2.5 text-sm"
              required={key === "businessName"}
            />
          </div>
        ))}

        <div>
          <label
            className="block text-sm font-semibold mb-1.5"
            style={{ color: "var(--text-primary)" }}
          >
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            placeholder="Tell customers about your store..."
            className="glass-input w-full px-4 py-2.5 text-sm"
          />
        </div>

        {error && (
          <p
            className="text-sm font-medium"
            style={{ color: "var(--error-text)" }}
          >
            {error}
          </p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
            style={{
              background: "linear-gradient(135deg, var(--purple), var(--blue))",
            }}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Saving..." : "Save Profile"}
          </button>
          {saved && (
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--green)" }}
            >
              Saved ✓
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function StorePageContent({
  view,
  setView,
  store,
  onStoreSaved,
}: {
  view: StoreView;
  setView: (v: StoreView) => void;
  store: StoreProfile | null;
  onStoreSaved: (s: StoreProfile) => void;
}) {
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

  const storeIncomplete =
    !store?.businessName || !store?.location || !store?.openingHours;

  // Settings does not need product/order data, render immediately.
  if (view === "settings") {
    return <StoreSettings store={store} onSaved={onStoreSaved} />;
  }

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: "var(--purple)" }}
        />
      </div>
    );

  // Create / Edit form
  if (view === "create" || view === "edit") {
    return (
      <CreatorProductForm
        product={editingProduct ?? undefined}
        onSuccess={handleFormSuccess}
        onCancel={() => {
          setEditingProduct(null);
          setView("products");
        }}
      />
    );
  }

  if (view === "products")
    return (
      <ProductsList
        products={products}
        convert={convert}
        loading={false}
        onAdd={() => {
          setEditingProduct(null);
          setView("create");
        }}
        onEdit={(p) => {
          setEditingProduct(p);
          setView("edit");
        }}
        onDelete={handleDeleteProduct}
      />
    );

  if (view === "orders")
    return <OrdersView orders={orders} convert={convert} />;
  if (view === "earnings")
    return <EarningsView orders={orders} convert={convert} />;

  return (
    <Overview
      products={products}
      orders={orders}
      onViewChange={setView}
      convert={convert}
      storeIncomplete={storeIncomplete}
    />
  );
}
