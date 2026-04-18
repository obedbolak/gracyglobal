"use client";

import { useState, useEffect } from "react";
import MultiImageUpload from "@/components/shared/MultiImageUpload";
import {
  Save,
  Plus,
  X,
  Package,
  ArrowLeft,
  AlertTriangle,
  Lock,
} from "lucide-react";
import {
  CATEGORY_GROUPS,
  type CategoryGroup,
  type ProductCategory,
} from "@/data/products";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ExistingProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  group: string;
  category: string;
  badge: string | null;
  featured: boolean;
  active: boolean;
  benefits: string[];
  ingredients: string[];
  images: string[];
}

interface Props {
  /** If provided, form is in edit mode */
  product?: ExistingProduct;
  onSuccess: () => void;
  onCancel: () => void;
}

interface UserSubscription {
  id: string;
  status: "ACTIVE" | "PAST_DUE" | "CANCELLED" | "EXPIRED" | "TRIALING";
  productsUsed: number;
  plan: {
    id: string;
    planCode: string;
    name: string;
    category: string;
    productLimit: number | null;
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CreatorProductForm({
  product,
  onSuccess,
  onCancel,
}: Props) {
  const isEdit = !!product;

  const [loading, setLoading] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [subscription, setSubscription] = useState<UserSubscription | null>(
    null,
  );
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);

  const [images, setImages] = useState<
    Array<{ url: string; publicId: string }>
  >(product?.images.map((url) => ({ url, publicId: "" })) ?? []);

  const [formData, setFormData] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product?.price?.toString() ?? "",
    stock: product?.stock?.toString() ?? "",
    group: (product?.group ?? "") as CategoryGroup | "",
    category: (product?.category ?? "") as ProductCategory | "",
    badge: product?.badge ?? "",
    featured: product?.featured ?? false,
    active: product?.active ?? true,
    benefits: product?.benefits.length ? product.benefits : [""],
    ingredients: product?.ingredients.length ? product.ingredients : [""],
  });

  // Fetch user's marketplace subscription
  useEffect(() => {
    if (isEdit) {
      // Skip subscription check for edits
      setCheckingSubscription(false);
      return;
    }

    fetchSubscription();
  }, [isEdit]);

  const fetchSubscription = async () => {
    try {
      const res = await fetch("/api/user/subscriptions");
      const data = await res.json();

      if (res.ok && data.success) {
        const marketplaceSub = data.data.subscriptions?.find(
          (sub: UserSubscription) =>
            sub.plan.category === "MARKETPLACE" && sub.status === "ACTIVE",
        );
        setSubscription(marketplaceSub || null);
      }
    } catch (error) {
      console.error("Failed to fetch subscription:", error);
    } finally {
      setCheckingSubscription(false);
    }
  };

  const subCategories = formData.group
    ? (CATEGORY_GROUPS.find((g) => g.group === formData.group)?.categories ??
      [])
    : [];

  function set<K extends keyof typeof formData>(
    key: K,
    value: (typeof formData)[K],
  ) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function addListItem(field: "benefits" | "ingredients") {
    set(field, [...formData[field], ""]);
  }

  function updateListItem(
    field: "benefits" | "ingredients",
    index: number,
    value: string,
  ) {
    const updated = [...formData[field]];
    updated[index] = value;
    set(field, updated);
  }

  function removeListItem(field: "benefits" | "ingredients", index: number) {
    set(
      field,
      formData[field].filter((_, i) => i !== index),
    );
  }

  const canAddProduct = () => {
    if (isEdit) return true; // Always allow edits
    if (!subscription) return false; // No subscription = no access

    const limit = subscription.plan.productLimit;
    if (limit === null || limit === 0) return true; // Unlimited

    return subscription.productsUsed < limit; // Check limit
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (images.length === 0) {
      alert("Please upload at least one image.");
      return;
    }
    if (!formData.group) {
      alert("Please select a department.");
      return;
    }
    if (!formData.category) {
      alert("Please select a sub-category.");
      return;
    }

    // Check if user can add product
    if (!isEdit && !canAddProduct()) {
      if (!subscription) {
        alert("You need an active Marketplace subscription to list products.");
        return;
      }

      const limit = subscription.plan.productLimit;
      alert(
        `You've reached your product limit (${limit}). Please upgrade your plan.`,
      );
      return;
    }

    // If no subscription, show payment modal
    if (!isEdit && !subscription) {
      setPendingSubmit(true);
      setShowPaymentModal(true);
      return;
    }

    // Proceed with submission
    await submitProduct();
  };

  const submitProduct = async () => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        price: parseInt(formData.price),
        stock: parseInt(formData.stock),
        images: images.map((img) => img.url),
        badge: formData.badge.trim() || null,
        benefits: formData.benefits.filter((b) => b.trim()),
        ingredients: formData.ingredients.filter((i) => i.trim()),
      };

      const res = await fetch(
        isEdit ? `/api/products/${product.id}` : "/api/products",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to save product");

      onSuccess();
    } catch (error: any) {
      alert(error.message ?? "Failed to save product");
    } finally {
      setLoading(false);
      setPendingSubmit(false);
    }
  };

  const handlePaymentSuccess = async (transactionId: string) => {
    setShowPaymentModal(false);
    await fetchSubscription(); // Refresh subscription
    if (pendingSubmit) {
      await submitProduct(); // Submit the pending product
    }
  };

  const handlePaymentError = (error: string) => {
    alert(error);
    setShowPaymentModal(false);
    setPendingSubmit(false);
  };

  const inputCls = "glass-input w-full px-4 py-3 rounded-lg";
  const labelCls =
    "block text-sm font-medium mb-2 text-[var(--text-secondary)]";
  const sectionCls = "glass p-6 rounded-xl space-y-4";

  // Show loading state while checking subscription
  if (checkingSubscription) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--purple)] mx-auto mb-4" />
          <p style={{ color: "var(--text-secondary)" }}>
            Checking your subscription...
          </p>
        </div>
      </div>
    );
  }

  // Show subscription warning for new products
  const showSubscriptionWarning = !isEdit && !subscription;
  const showLimitWarning =
    !isEdit &&
    subscription &&
    subscription.plan.productLimit &&
    subscription.productsUsed >= subscription.plan.productLimit;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="p-2 hover:bg-[var(--glass-bg-hover)] rounded-lg transition-colors"
        >
          <ArrowLeft
            className="w-5 h-5"
            style={{ color: "var(--text-primary)" }}
          />
        </button>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-5 h-5" style={{ color: "var(--purple)" }} />
            <span
              className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{
                background: "var(--purple-faint)",
                color: "var(--purple)",
              }}
            >
              {isEdit ? "Edit Product" : "New Product"}
            </span>
          </div>
          <h2
            className="text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {isEdit ? `Editing: ${product.name}` : "List a Product"}
          </h2>
          <p style={{ color: "var(--text-muted)" }} className="mt-1 text-sm">
            {isEdit
              ? "Update your product details below"
              : "Add a new product to the marketplace"}
          </p>
        </div>
      </div>

      {/* Subscription Warning */}
      {showSubscriptionWarning && (
        <div
          className="p-4 rounded-xl flex items-start gap-3"
          style={{
            background: "var(--warning-bg)",
            border: "1px solid var(--warning-border)",
          }}
        >
          <Lock
            className="w-5 h-5 flex-shrink-0 mt-0.5"
            style={{ color: "var(--warning-text)" }}
          />
          <div>
            <p
              className="font-semibold mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              Marketplace Subscription Required
            </p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              You need an active Marketplace subscription to list products.
              Complete the form and you'll be prompted to subscribe before
              publishing.
            </p>
          </div>
        </div>
      )}

      {/* Limit Warning */}
      {showLimitWarning && (
        <div
          className="p-4 rounded-xl flex items-start gap-3"
          style={{
            background: "var(--error-bg)",
            border: "1px solid var(--error-border)",
          }}
        >
          <AlertTriangle
            className="w-5 h-5 flex-shrink-0 mt-0.5"
            style={{ color: "var(--error-text)" }}
          />
          <div>
            <p
              className="font-semibold mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              Product Limit Reached
            </p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              You've used {subscription.productsUsed} of{" "}
              {subscription.plan.productLimit} products on your{" "}
              {subscription.plan.name} plan. Please upgrade to list more
              products.
            </p>
          </div>
        </div>
      )}

      {/* Subscription Info (if active) */}
      {!isEdit && subscription && !showLimitWarning && (
        <div
          className="p-4 rounded-xl flex items-center justify-between"
          style={{
            background: "var(--success-bg)",
            border: "1px solid var(--success-border)",
          }}
        >
          <div className="flex items-center gap-3">
            <Package
              className="w-5 h-5"
              style={{ color: "var(--success-text)" }}
            />
            <div>
              <p
                className="font-semibold text-sm"
                style={{ color: "var(--text-primary)" }}
              >
                {subscription.plan.name} Plan Active
              </p>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {subscription.plan.productLimit
                  ? `${subscription.productsUsed} / ${subscription.plan.productLimit} products used`
                  : "Unlimited products"}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Images */}
        <div className={sectionCls}>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            Product Images
          </h3>
          <MultiImageUpload
            folder="products"
            maxImages={6}
            onUploadComplete={setImages}
          />
          {images.length === 0 && (
            <p className="text-xs text-[var(--warning-text)]">
              At least one image is required.
            </p>
          )}
        </div>

        {/* Basic Info */}
        <div className={sectionCls}>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            Basic Information
          </h3>

          <div>
            <label className={labelCls}>Product Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              placeholder="Enter product name"
              onChange={(e) => set("name", e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Description *</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              placeholder="Describe the product"
              onChange={(e) => set("description", e.target.value)}
              className={`${inputCls} resize-none`}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Department *</label>
              <select
                required
                value={formData.group}
                onChange={(e) => {
                  set("group", e.target.value as CategoryGroup);
                  set("category", "");
                }}
                className={inputCls}
              >
                <option value="">Select department</option>
                {CATEGORY_GROUPS.map((g) => (
                  <option key={g.group} value={g.group}>
                    {g.icon} {g.group}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Sub-category *</label>
              <select
                required
                value={formData.category}
                disabled={!formData.group}
                onChange={(e) =>
                  set("category", e.target.value as ProductCategory)
                }
                className={`${inputCls} disabled:opacity-50`}
              >
                <option value="">
                  {formData.group
                    ? "Select sub-category"
                    : "Select a department first"}
                </option>
                {subCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Price (XAF) *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                placeholder="0"
                onChange={(e) => set("price", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Stock *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.stock}
                placeholder="0"
                onChange={(e) => set("stock", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>
              Badge{" "}
              <span className="text-[var(--text-disabled)]">(optional)</span>
            </label>
            <input
              type="text"
              value={formData.badge}
              placeholder='e.g. "New", "Handmade", "Limited"'
              onChange={(e) => set("badge", e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        {/* Benefits */}
        <div className={sectionCls}>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            Benefits
          </h3>
          <div className="space-y-2">
            {formData.benefits.map((benefit, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={benefit}
                  placeholder={`Benefit ${i + 1}`}
                  onChange={(e) =>
                    updateListItem("benefits", i, e.target.value)
                  }
                  className="glass-input flex-1 px-4 py-3 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeListItem("benefits", i)}
                  disabled={formData.benefits.length === 1}
                  className="p-3 rounded-lg bg-[var(--error-bg)] text-[var(--error-text)] hover:bg-[var(--error-border)] transition-colors disabled:opacity-30"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => addListItem("benefits")}
            className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
          >
            <Plus className="w-4 h-4" /> Add Benefit
          </button>
        </div>

        {/* Ingredients */}
        <div className={sectionCls}>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            Ingredients{" "}
            <span className="text-sm font-normal text-[var(--text-disabled)]">
              (optional)
            </span>
          </h3>
          <div className="space-y-2">
            {formData.ingredients.map((ingredient, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={ingredient}
                  placeholder={`Ingredient ${i + 1}`}
                  onChange={(e) =>
                    updateListItem("ingredients", i, e.target.value)
                  }
                  className="glass-input flex-1 px-4 py-3 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeListItem("ingredients", i)}
                  disabled={formData.ingredients.length === 1}
                  className="p-3 rounded-lg bg-[var(--error-bg)] text-[var(--error-text)] hover:bg-[var(--error-border)] transition-colors disabled:opacity-30"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => addListItem("ingredients")}
            className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
          >
            <Plus className="w-4 h-4" /> Add Ingredient
          </button>
        </div>

        {/* Settings */}
        <div className={sectionCls}>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            Settings
          </h3>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => set("featured", e.target.checked)}
              className="w-5 h-5 rounded border-[var(--input-border)] text-[var(--purple)] focus:ring-[var(--purple)]"
            />
            <div>
              <span className="text-sm font-medium text-[var(--text-secondary)]">
                Feature this product
              </span>
              <p className="text-xs text-[var(--text-disabled)]">
                Requests featured placement — subject to admin approval
              </p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => set("active", e.target.checked)}
              className="w-5 h-5 rounded border-[var(--input-border)] text-[var(--purple)] focus:ring-[var(--purple)]"
            />
            <div>
              <span className="text-sm font-medium text-[var(--text-secondary)]">
                List immediately
              </span>
              <p className="text-xs text-[var(--text-disabled)]">
                Make this product visible on the marketplace right away
              </p>
            </div>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pb-4">
          <button
            type="submit"
            disabled={
              loading || images.length === 0 || Boolean(showLimitWarning)
            }
            className="btn-primary flex items-center gap-2 px-6 py-3 rounded-lg disabled:opacity-50"
          >
            {showSubscriptionWarning && <Lock className="w-5 h-5" />}
            <Save className="w-5 h-5" />
            {loading
              ? "Saving…"
              : showSubscriptionWarning
                ? "Subscribe & List Product"
                : isEdit
                  ? "Save Changes"
                  : "List Product"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary px-6 py-3 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
