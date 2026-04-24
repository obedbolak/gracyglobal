"use client";

// components/admin/EditProductForm.tsx

import { useState } from "react";
import { useRouter } from "next/navigation";
import MultiImageUpload from "@/components/shared/MultiImageUpload";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCategories } from "@/hooks/useCategories";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  group: string;
  stock: number;
  images: string[];
  featured: boolean;
  active: boolean;
  benefits: string[];
  ingredients: string[];
}

interface EditProductFormProps {
  product: Product;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EditProductForm({ product }: EditProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch categories via hook ─────────────────────────────────────────────
  const { categories, loading: categoriesLoading } = useCategories("product");

  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description,
    price: product.price.toString(),
    categoryId: product.categoryId,
    group: product.group,
    stock: product.stock.toString(),
    featured: product.featured,
    active: product.active,
    benefits: product.benefits.length > 0 ? product.benefits : [""],
    ingredients: product.ingredients.length > 0 ? product.ingredients : [""],
  });

  const [images, setImages] = useState<
    Array<{ url: string; publicId: string }>
  >(
    product.images.map((url) => ({
      url,
      publicId: url.split("/").pop()?.split(".")[0] || "",
    })),
  );

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseInt(formData.price),
          stock: parseInt(formData.stock),
          images: images.map((img) => img.url),
          benefits: formData.benefits.filter((b) => b.trim()),
          ingredients: formData.ingredients.filter((i) => i.trim()),
        }),
      });

      if (!res.ok) throw new Error("Failed to update product");
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete product");
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to delete product");
      setDeleting(false);
    }
  };

  // ── Array field helpers ───────────────────────────────────────────────────
  const addField = (field: "benefits" | "ingredients") => {
    setFormData({ ...formData, [field]: [...formData[field], ""] });
  };

  const updateField = (
    field: "benefits" | "ingredients",
    index: number,
    value: string,
  ) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData({ ...formData, [field]: updated });
  };

  const removeField = (field: "benefits" | "ingredients", index: number) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index),
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="p-2 hover:bg-[var(--glass-bg-hover)] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">
              Edit Product
            </h1>
            <p className="text-[var(--text-muted)] mt-1">
              Update product information
            </p>
          </div>
        </div>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-lg"
          style={{ background: "var(--error-bg)", color: "var(--error-text)" }}
        >
          <Trash2 className="w-4 h-4" />
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Images */}
        <div className="glass p-6 rounded-xl">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Product Images
          </h2>
          <MultiImageUpload
            folder="products"
            maxImages={6}
            currentImages={images}
            onUploadComplete={setImages}
          />
        </div>

        {/* Basic Info */}
        <div className="glass p-6 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Basic Information
          </h2>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="glass-input w-full px-4 py-3"
              placeholder="Enter product name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Description *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="glass-input w-full px-4 py-3 resize-none"
              placeholder="Describe the product"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Category dropdown — from DB via hook */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Category *
              </label>
              {categoriesLoading ? (
                <div className="skeleton h-12 rounded-lg" />
              ) : (
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                  className="glass-input w-full px-4 py-3"
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
                Manage categories in{" "}
                <Link
                  href="/admin/products/categories"
                  className="underline"
                  style={{ color: "var(--purple-light)" }}
                >
                  Admin → Products → Categories
                </Link>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Group
              </label>
              <input
                type="text"
                value={formData.group}
                onChange={(e) =>
                  setFormData({ ...formData, group: e.target.value })
                }
                className="glass-input w-full px-4 py-3"
                placeholder="Product group (optional)"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Price (XAF) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="glass-input w-full px-4 py-3"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Stock *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                className="glass-input w-full px-4 py-3"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="glass p-6 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Benefits
          </h2>
          {formData.benefits.map((benefit, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={benefit}
                onChange={(e) => updateField("benefits", index, e.target.value)}
                className="glass-input flex-1 px-4 py-3"
                placeholder="Enter benefit"
              />
              {formData.benefits.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeField("benefits", index)}
                  className="px-4 py-3 rounded-lg transition-colors"
                  style={{
                    background: "var(--error-bg)",
                    color: "var(--error-text)",
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addField("benefits")}
            className="btn-secondary px-4 py-2 rounded-lg"
          >
            + Add Benefit
          </button>
        </div>

        {/* Ingredients */}
        <div className="glass p-6 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Ingredients
          </h2>
          {formData.ingredients.map((ingredient, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={ingredient}
                onChange={(e) =>
                  updateField("ingredients", index, e.target.value)
                }
                className="glass-input flex-1 px-4 py-3"
                placeholder="Enter ingredient"
              />
              {formData.ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeField("ingredients", index)}
                  className="px-4 py-3 rounded-lg transition-colors"
                  style={{
                    background: "var(--error-bg)",
                    color: "var(--error-text)",
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addField("ingredients")}
            className="btn-secondary px-4 py-2 rounded-lg"
          >
            + Add Ingredient
          </button>
        </div>

        {/* Settings */}
        <div className="glass p-6 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Settings
          </h2>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) =>
                setFormData({ ...formData, featured: e.target.checked })
              }
              className="w-5 h-5 rounded"
            />
            <span className="text-[var(--text-secondary)]">
              Featured Product
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) =>
                setFormData({ ...formData, active: e.target.checked })
              }
              className="w-5 h-5 rounded"
            />
            <span className="text-[var(--text-secondary)]">Active</span>
          </label>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || images.length === 0}
            className="btn-primary flex items-center gap-2 px-6 py-3 rounded-lg disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {loading ? "Updating..." : "Update Product"}
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
