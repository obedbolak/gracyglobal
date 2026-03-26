// components/admin/EditProductForm.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MultiImageUpload from "@/components/shared/MultiImageUpload";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
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

export default function EditProductForm({ product }: EditProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description,
    price: product.price.toString(),
    category: product.category,
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

  const categories = [
    "Herbal Teas",
    "Supplements",
    "Skincare",
    "Aromatherapy",
    "Books",
    "Accessories",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/products/${product.id}`, {
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

      if (!response.ok) throw new Error("Failed to update product");

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    setDeleting(true);

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete product");

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to delete product");
      setDeleting(false);
    }
  };

  const addField = (field: "benefits" | "ingredients") => {
    setFormData({
      ...formData,
      [field]: [...formData[field], ""],
    });
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
          className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--error-bg)] text-[var(--error-text)] hover:bg-[var(--error-border)]"
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
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="glass-input w-full px-4 py-3"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
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
                  className="px-4 py-3 bg-[var(--error-bg)] text-[var(--error-text)] rounded-lg hover:bg-[var(--error-border)] transition-colors"
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
            Add Benefit
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
                  className="px-4 py-3 bg-[var(--error-bg)] text-[var(--error-text)] rounded-lg hover:bg-[var(--error-border)] transition-colors"
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
            Add Ingredient
          </button>
        </div>

        {/* Settings */}
        <div className="glass p-6 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Settings
          </h2>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) =>
                setFormData({ ...formData, featured: e.target.checked })
              }
              className="w-5 h-5 rounded border-[var(--input-border)] text-[var(--purple)] focus:ring-[var(--purple)]"
            />
            <span className="text-[var(--text-secondary)]">
              Featured Product
            </span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) =>
                setFormData({ ...formData, active: e.target.checked })
              }
              className="w-5 h-5 rounded border-[var(--input-border)] text-[var(--purple)] focus:ring-[var(--purple)]"
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
