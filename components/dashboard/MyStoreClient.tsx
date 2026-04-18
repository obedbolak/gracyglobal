// app/(dashboard)/dashboard/creator/_components/MyStoreClient.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Package,
  Wrench,
  Plus,
  Lock,
  ShoppingBag,
  Star,
  AlertCircle,
  ArrowRight,
  Pencil,
} from "lucide-react";
import PlansModal from "./PlansModal";
import CreatorProductForm from "@/components/creator/creatorProductForm";
import CreatorServiceForm from "@/components/creator/creatorServiceForm";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  group: string;
  stock: number;
  active: boolean;
  featured: boolean;
  rating: number;
  reviews: number;
  badge: string | null;
  benefits: string[];
  ingredients: string[];
  createdAt: Date | string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  group: string;
  active: boolean;
  featured: boolean;
  rating: number;
  reviews: number;
  badge: string | null;
  includes: string[];
  availability: string | null;
  images: string[];
  createdAt: Date | string;
}

interface Props {
  hasMarketplaceSub: boolean;
  hasServiceSub: boolean;
  products: Product[];
  services: Service[];
}

type Tab = "products" | "services";
type ViewState = "list" | "create" | "edit";

// ── Upgrade Prompt ────────────────────────────────────────────────────────────

function UpgradePrompt({
  type,
  onViewPlans,
}: {
  type: Tab;
  onViewPlans: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[var(--sidebar-item-active)] flex items-center justify-center mb-4">
        <Lock className="w-7 h-7 text-[var(--purple)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
        {type === "products"
          ? "Marketplace plan required"
          : "Service plan required"}
      </h3>
      <p className="text-[var(--text-secondary)] text-sm max-w-sm mb-6 leading-relaxed">
        {type === "products"
          ? "Subscribe to a Marketplace plan to list and manage your products on GracyGlobal."
          : "Subscribe to a Service plan to offer and manage your services on GracyGlobal."}
      </p>
      <button
        onClick={onViewPlans}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--purple)] text-white font-medium text-sm hover:opacity-90 transition-opacity"
      >
        View Plans <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ type, onCreate }: { type: Tab; onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[var(--sidebar-item-active)] flex items-center justify-center mb-4">
        {type === "products" ? (
          <ShoppingBag className="w-7 h-7 text-[var(--purple)]" />
        ) : (
          <Wrench className="w-7 h-7 text-[var(--purple)]" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
        No {type} yet
      </h3>
      <p className="text-[var(--text-secondary)] text-sm max-w-sm mb-6">
        You haven't created any {type} yet. Get started by creating your first
        one.
      </p>
      <button
        onClick={onCreate}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--purple)] text-white font-medium text-sm hover:opacity-90 transition-opacity"
      >
        <Plus className="w-4 h-4" />
        Create {type === "products" ? "Product" : "Service"}
      </button>
    </div>
  );
}

// ── Product Card ──────────────────────────────────────────────────────────────

function ProductCard({
  product,
  onEdit,
}: {
  product: Product;
  onEdit: () => void;
}) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--divider)] rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-44 bg-[var(--sidebar-item-hover)]">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="w-10 h-10 text-[var(--text-secondary)] opacity-30" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span
            className={`text-[10px] font-semibold px-2 py-1 rounded-full ${product.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
          >
            {product.active ? "Active" : "Inactive"}
          </span>
        </div>
      </div>
      <div className="p-4">
        <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] mb-1">
          {product.category}
        </p>
        <h3 className="font-semibold text-[var(--text-primary)] truncate mb-1">
          {product.name}
        </h3>
        <p className="text-[var(--text-secondary)] text-xs line-clamp-2 mb-3">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="font-bold text-[var(--purple)]">
            {product.price.toLocaleString()} XAF
          </span>
          <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{product.rating.toFixed(1)}</span>
            <span className="opacity-50">({product.reviews})</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-[var(--divider)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span>Stock: {product.stock}</span>
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-1 text-[var(--purple)] font-medium hover:underline"
          >
            <Pencil className="w-3 h-3" /> Edit
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Service Card ──────────────────────────────────────────────────────────────

function ServiceCard({
  service,
  onEdit,
}: {
  service: Service;
  onEdit: () => void;
}) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--divider)] rounded-2xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--sidebar-item-active)] flex items-center justify-center">
          <Wrench className="w-5 h-5 text-[var(--purple)]" />
        </div>
        <span
          className={`text-[10px] font-semibold px-2 py-1 rounded-full ${service.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
        >
          {service.active ? "Active" : "Inactive"}
        </span>
      </div>
      <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] mb-1">
        {service.category}
      </p>
      <h3 className="font-semibold text-[var(--text-primary)] truncate mb-1">
        {service.name}
      </h3>
      <p className="text-[var(--text-secondary)] text-xs line-clamp-2 mb-3">
        {service.description}
      </p>
      <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{service.rating.toFixed(1)}</span>
          <span className="opacity-50">({service.reviews})</span>
        </div>
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-1 text-[var(--purple)] font-medium hover:underline"
        >
          <Pencil className="w-3 h-3" /> Edit
        </button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function MyStoreClient({
  hasMarketplaceSub,
  hasServiceSub,
  products,
  services,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── Derive initial tab from URL param ──────────────────────────────────────
  const getTabFromParams = (): Tab => {
    const param = searchParams.get("tab");
    if (param === "services") return "services";
    if (param === "products") return "products";
    // No param — default to whichever plan they have
    return hasMarketplaceSub
      ? "products"
      : hasServiceSub
        ? "services"
        : "products";
  };

  const [activeTab, setActiveTab] = useState<Tab>(getTabFromParams);
  const [viewState, setViewState] = useState<ViewState>("list");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [modalCategory, setModalCategory] = useState<
    "MARKETPLACE" | "SERVICE" | null
  >(null);

  // Sync tab state if URL changes externally (browser back/forward)
  useEffect(() => {
    const param = searchParams.get("tab");
    if (param === "services" || param === "products") {
      setActiveTab(param);
      setViewState("list");
      setEditingProduct(null);
      setEditingService(null);
    }
  }, [searchParams]);

  // ── Switch tab + update URL ────────────────────────────────────────────────
  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    setViewState("list");
    setEditingProduct(null);
    setEditingService(null);

    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`/dashboard/creator?${params.toString()}`, {
      scroll: false,
    });
  };

  // ── Form callbacks ─────────────────────────────────────────────────────────
  const handleSuccess = () => {
    setViewState("list");
    setEditingProduct(null);
    setEditingService(null);
    router.refresh();
  };

  const handleCancel = () => {
    setViewState("list");
    setEditingProduct(null);
    setEditingService(null);
  };

  const tabs = [
    {
      id: "products" as Tab,
      label: "Products",
      icon: Package,
      locked: !hasMarketplaceSub,
    },
    {
      id: "services" as Tab,
      label: "Services",
      icon: Wrench,
      locked: !hasServiceSub,
    },
  ];

  const isFormView = viewState === "create" || viewState === "edit";

  return (
    <>
      <PlansModal
        open={modalCategory !== null}
        onClose={() => setModalCategory(null)}
        filterCategory={modalCategory ?? "MARKETPLACE"}
      />

      <div className="space-y-6">
        {/* Header */}
        {!isFormView && (
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                My Store
              </h1>
              <p className="text-[var(--text-secondary)] text-sm mt-1">
                Manage your products and services
              </p>
            </div>
            {activeTab === "products" && hasMarketplaceSub && (
              <button
                onClick={() => setViewState("create")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--purple)] text-white font-medium text-sm hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" /> New Product
              </button>
            )}
            {activeTab === "services" && hasServiceSub && (
              <button
                onClick={() => setViewState("create")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--purple)] text-white font-medium text-sm hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" /> New Service
              </button>
            )}
          </div>
        )}

        {/* No subscription banner */}
        {!isFormView && !hasMarketplaceSub && !hasServiceSub && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">No active merchant plan</p>
              <p className="text-xs mt-0.5">
                Subscribe to a Marketplace or Service plan to start selling.{" "}
                <button
                  onClick={() => setModalCategory("MARKETPLACE")}
                  className="underline font-medium hover:opacity-70"
                >
                  View plans →
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        {!isFormView && (
          <div className="flex gap-1 p-1 bg-[var(--sidebar-item-hover)] rounded-xl w-fit">
            {tabs.map(({ id, label, icon: Icon, locked }) => (
              <button
                key={id}
                onClick={() => switchTab(id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === id
                    ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                {locked && <Lock className="w-3 h-3 opacity-50" />}
              </button>
            ))}
          </div>
        )}

        {/* ── LIST VIEW ──────────────────────────────────────────────────────── */}
        {viewState === "list" && (
          <div>
            {activeTab === "products" &&
              (!hasMarketplaceSub ? (
                <UpgradePrompt
                  type="products"
                  onViewPlans={() => setModalCategory("MARKETPLACE")}
                />
              ) : products.length === 0 ? (
                <EmptyState
                  type="products"
                  onCreate={() => setViewState("create")}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onEdit={() => {
                        setEditingProduct(p);
                        setViewState("edit");
                      }}
                    />
                  ))}
                </div>
              ))}

            {activeTab === "services" &&
              (!hasServiceSub ? (
                <UpgradePrompt
                  type="services"
                  onViewPlans={() => setModalCategory("SERVICE")}
                />
              ) : services.length === 0 ? (
                <EmptyState
                  type="services"
                  onCreate={() => setViewState("create")}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {services.map((s) => (
                    <ServiceCard
                      key={s.id}
                      service={s}
                      onEdit={() => {
                        setEditingService(s);
                        setViewState("edit");
                      }}
                    />
                  ))}
                </div>
              ))}
          </div>
        )}

        {/* ── CREATE VIEW ────────────────────────────────────────────────────── */}
        {viewState === "create" && activeTab === "products" && (
          <CreatorProductForm
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        )}
        {viewState === "create" && activeTab === "services" && (
          <CreatorServiceForm
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        )}

        {/* ── EDIT VIEW ──────────────────────────────────────────────────────── */}
        {viewState === "edit" && editingProduct && (
          <CreatorProductForm
            product={editingProduct}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        )}
        {viewState === "edit" && editingService && (
          <CreatorServiceForm
            service={editingService}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        )}
      </div>
    </>
  );
}
