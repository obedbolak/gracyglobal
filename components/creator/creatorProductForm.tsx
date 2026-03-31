// components/creator/CreatorProductForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MultiImageUpload from "@/components/shared/MultiImageUpload";
import { ArrowLeft, Save, Plus, X, Package } from "lucide-react";
import Link from "next/link";
import {
  CATEGORY_GROUPS,
  type CategoryGroup,
  type ProductCategory,
} from "@/data/products";

export default function CreatorProductForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<
    Array<{ url: string; publicId: string }>
  >([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    group: "" as CategoryGroup | "",
    category: "" as ProductCategory | "",
    badge: "",
    featured: false,
    active: true,
    benefits: [""],
    ingredients: [""],
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    setLoading(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseInt(formData.price),
          stock: parseInt(formData.stock),
          images: images.map((img) => img.url),
          badge: formData.badge.trim() || null,
          benefits: formData.benefits.filter((b) => b.trim()),
          ingredients: formData.ingredients.filter((i) => i.trim()),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to create product");

      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      alert(error.message ?? "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "glass-input w-full px-4 py-3 rounded-lg";
  const labelCls =
    "block text-sm font-medium mb-2 text-[var(--text-secondary)]";
  const sectionCls = "glass p-6 rounded-xl space-y-4";

  return (
    <div
      className="min-h-screen py-8"
      style={{ background: "var(--background)" }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 hover:bg-[var(--glass-bg-hover)] rounded-lg transition-colors"
          >
            <ArrowLeft
              className="w-5 h-5"
              style={{ color: "var(--text-primary)" }}
            />
          </Link>
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
                Creator
              </span>
            </div>
            <h1
              className="text-3xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              List a Product
            </h1>
            <p style={{ color: "var(--text-muted)" }} className="mt-1">
              Add a new product to the marketplace
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Images */}
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
              <p className="text-xs text-[var(--warning-text)]">
                At least one image is required.
              </p>
            )}
          </div>

          {/* Basic Info */}
          <div className={sectionCls}>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Basic Information
            </h2>

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
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Ingredients{" "}
              <span className="text-sm font-normal text-[var(--text-disabled)]">
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
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Settings
            </h2>

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

          {/* Submit */}
          <div className="flex gap-4 pb-8">
            <button
              type="submit"
              disabled={loading || images.length === 0}
              className="btn-primary flex items-center gap-2 px-6 py-3 rounded-lg disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {loading ? "Listing…" : "List Product"}
            </button>
            <Link
              href="/dashboard"
              className="btn-secondary px-6 py-3 rounded-lg"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
