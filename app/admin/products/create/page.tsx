"use client";

// app/admin/products/create/page.tsx

import { useState } from "react";
import { useRouter } from "next/navigation";
import MultiImageUpload from "@/components/shared/MultiImageUpload";
import { ArrowLeft, Save, Plus, X } from "lucide-react";
import Link from "next/link";
import { useCategories } from "@/hooks/useCategories";

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<
    Array<{ url: string; publicId: string }>
  >([]);

  // ── Fetch categories from DB ──────────────────────────────────────────────
  const { categories, loading: categoriesLoading } = useCategories("product");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    group: "",
    badge: "",
    featured: false,
    active: true,
    benefits: [""],
    ingredients: [""],
  });

  // ── Field helpers ─────────────────────────────────────────────────────────
  function set<K extends keyof typeof formData>(
    key: K,
    value: (typeof formData)[K],
  ) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function addListItem(field: "benefits" | "ingredients") {
    set(field, [...formData[field], ""] as any);
  }

  function updateListItem(
    field: "benefits" | "ingredients",
    index: number,
    value: string,
  ) {
    const updated = [...formData[field]];
    updated[index] = value;
    set(field, updated as any);
  }

  function removeListItem(field: "benefits" | "ingredients", index: number) {
    set(
      field,
      (formData[field] as string[]).filter((_, i) => i !== index) as any,
    );
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length === 0) {
      alert("Please upload at least one image.");
      return;
    }
    if (!formData.categoryId) {
      alert("Please select a category.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseInt(formData.price),
          stock: parseInt(formData.stock),
          categoryId: formData.categoryId,
          group: formData.group,
          badge: formData.badge.trim() || null,
          featured: formData.featured,
          active: formData.active,
          images: images.map((img) => img.url),
          benefits: formData.benefits.filter((b) => b.trim()),
          ingredients: formData.ingredients.filter((i) => i.trim()),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to create product");

      router.push("/admin/products");
      router.refresh();
    } catch (error: any) {
      console.error(error);
      alert(error.message ?? "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  // ── Shared styles ─────────────────────────────────────────────────────────
  const inputCls = "glass-input w-full px-4 py-3 rounded-lg";
  const labelCls =
    "block text-sm font-medium mb-2 text-[var(--text-secondary)]";
  const sectionCls = "glass p-6 rounded-xl space-y-4";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="p-2 hover:bg-[var(--glass-bg-hover)] rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Create Product
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Add a new product to the marketplace
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Images ── */}
        <div className={sectionCls}>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Product Images
          </h2>
          <MultiImageUpload
            folder="products"
            maxImages={6}
            onUploadComplete={setImages}
          />
          {images.length === 0 && (
            <p className="text-xs" style={{ color: "var(--warning-text)" }}>
              At least one image is required.
            </p>
          )}
        </div>

        {/* ── Basic Info ── */}
        <div className={sectionCls}>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Basic Information
          </h2>

          {/* Name */}
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

          {/* Description */}
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

          {/* Category — from DB */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Category *</label>
              {categoriesLoading ? (
                <div className="skeleton h-12 rounded-lg" />
              ) : categories.length === 0 ? (
                <div
                  className="px-4 py-3 rounded-lg text-sm"
                  style={{
                    background: "var(--warning-bg)",
                    color: "var(--warning-text)",
                    border: "1px solid var(--warning-border)",
                  }}
                >
                  No categories yet.{" "}
                  <Link
                    href="/admin/products/categories"
                    className="underline font-semibold"
                  >
                    Create one first →
                  </Link>
                </div>
              ) : (
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => set("categoryId", e.target.value)}
                  className={inputCls}
                  style={{
                    color: "var(--text-primary)",
                    background: "var(--input-bg)",
                  }}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon ? `${cat.icon} ` : ""}
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}
              <p
                className="text-xs mt-1"
                style={{ color: "var(--text-muted)" }}
              >
                Manage in{" "}
                <Link
                  href="/admin/products/categories"
                  className="underline"
                  style={{ color: "var(--purple-light)" }}
                >
                  Admin → Products → Categories
                </Link>
              </p>
            </div>

            {/* Group — free text, optional */}
            <div>
              <label className={labelCls}>
                Group{" "}
                <span style={{ color: "var(--text-disabled)" }}>
                  (optional)
                </span>
              </label>
              <input
                type="text"
                value={formData.group}
                placeholder="e.g. Herbal, Organic…"
                onChange={(e) => set("group", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {/* Price + Stock */}
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

          {/* Badge */}
          <div>
            <label className={labelCls}>
              Badge{" "}
              <span style={{ color: "var(--text-disabled)" }}>(optional)</span>
            </label>
            <input
              type="text"
              value={formData.badge}
              placeholder='e.g. "Best Seller", "New", "Premium"'
              onChange={(e) => set("badge", e.target.value)}
              className={inputCls}
            />
            <p
              className="text-xs mt-1"
              style={{ color: "var(--text-disabled)" }}
            >
              Shown as a pill on the product card. Leave blank for no badge.
            </p>
          </div>
        </div>

        {/* ── Benefits ── */}
        <div className={sectionCls}>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Benefits
          </h2>
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
                  className="p-3 rounded-lg transition-colors disabled:opacity-30"
                  style={{
                    background: "var(--error-bg)",
                    color: "var(--error-text)",
                  }}
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

        {/* ── Ingredients ── */}
        <div className={sectionCls}>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Ingredients{" "}
            <span
              className="text-sm font-normal"
              style={{ color: "var(--text-disabled)" }}
            >
              (optional)
            </span>
          </h2>
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
                  className="p-3 rounded-lg transition-colors disabled:opacity-30"
                  style={{
                    background: "var(--error-bg)",
                    color: "var(--error-text)",
                  }}
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

        {/* ── Settings ── */}
        <div className={sectionCls}>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Settings
          </h2>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => set("featured", e.target.checked)}
              className="w-5 h-5 rounded"
            />
            <div>
              <span className="text-sm font-medium text-[var(--text-secondary)]">
                Featured Product
              </span>
              <p className="text-xs" style={{ color: "var(--text-disabled)" }}>
                Pinned to the top of the marketplace listing
              </p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => set("active", e.target.checked)}
              className="w-5 h-5 rounded"
            />
            <div>
              <span className="text-sm font-medium text-[var(--text-secondary)]">
                Active
              </span>
              <p className="text-xs" style={{ color: "var(--text-disabled)" }}>
                Inactive products are hidden from the marketplace
              </p>
            </div>
          </label>
        </div>

        {/* ── Submit ── */}
        <div className="flex gap-4 pb-8">
          <button
            type="submit"
            disabled={loading || images.length === 0 || !formData.categoryId}
            className="btn-primary flex items-center gap-2 px-6 py-3 rounded-lg disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {loading ? "Creating…" : "Create Product"}
          </button>
          <Link
            href="/admin/products"
            className="btn-secondary px-6 py-3 rounded-lg"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
