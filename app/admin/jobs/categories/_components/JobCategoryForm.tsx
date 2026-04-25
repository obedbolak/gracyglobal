"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, X } from "lucide-react";

interface JobCategoryFormProps {
  category?: {
    id: string;
    name: string;
    slug: string;
    icon?: string | null;
    color?: string | null;
    description?: string | null;
    sortOrder: number;
    active: boolean;
  };
}

export default function JobCategoryForm({ category }: JobCategoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    icon: category?.icon ?? "",
    color: category?.color ?? "#7b2fbe",
    description: category?.description ?? "",
    sortOrder: category?.sortOrder ?? 0,
    active: category?.active ?? true,
  });

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: category
        ? formData.slug
        : name
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]+/g, ""),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = category
        ? `/api/jobs/job-categories/${category.id}`
        : "/api/jobs/job-categories";
      const method = category ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save category");
      }

      router.push("/admin/jobs/categories");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-[var(--error-bg)] border border-[var(--error-border)] flex items-start gap-3">
          <X className="w-5 h-5 text-[var(--error-text)] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[var(--error-text)]">{error}</p>
        </div>
      )}

      <div className="glass p-6 rounded-xl space-y-4">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          Category Details
        </h2>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Category Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="glass-input w-full px-4 py-3"
            placeholder="e.g., Tech, Marketing"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Slug *
          </label>
          <input
            type="text"
            required
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="glass-input w-full px-4 py-3 font-mono"
            placeholder="e.g., tech, marketing"
          />
          <p className="text-xs text-[var(--text-muted)] mt-1">
            URL-friendly lowercase identifier.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="glass-input w-full px-4 py-3 resize-none"
            rows={4}
            placeholder="Optional description for this category"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Icon (Emoji)
            </label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) =>
                setFormData({ ...formData, icon: e.target.value })
              }
              className="glass-input w-full px-4 py-3 text-2xl"
              placeholder="🌐"
              maxLength={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                className="w-14 h-12 rounded-lg border-2 border-[var(--divider)] cursor-pointer"
              />
              <input
                type="text"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                className="glass-input flex-1 px-4 py-3 font-mono"
                placeholder="#7b2fbe"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Sort Order
            </label>
            <input
              type="number"
              value={formData.sortOrder}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sortOrder: parseInt(e.target.value, 10) || 0,
                })
              }
              className="glass-input w-full px-4 py-3"
              placeholder="0"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Status
            </label>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) =>
                    setFormData({ ...formData, active: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-[var(--input-border)] text-[var(--purple)] focus:ring-[var(--purple)]"
                />
                Active
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex items-center gap-2 px-6 py-3 rounded-lg disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {loading
            ? "Saving..."
            : category
              ? "Update Category"
              : "Create Category"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary px-6 py-3 rounded-lg"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
