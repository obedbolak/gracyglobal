// components/admin/EditServiceForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MultiImageUpload from "@/components/shared/MultiImageUpload";
import { ArrowLeft, Save, Trash2, Plus, X } from "lucide-react";
import Link from "next/link";
import { useCategories } from "@/hooks/useCategories";

interface ServiceOption {
  id: string;
  name: string;
  description: string;
  pricingType: string;
  amount: number;
  yearlyAmount: number | null;
  label: string | null;
  duration: string | null;
  popular: boolean;
  active: boolean;
}

interface Service {
  id: string;
  name: string;
  description: string;
  images: string[];
  categoryId: string;
  group: string;
  featured: boolean;
  active: boolean;
  badge: string | null;
  includes: string[];
  availability: string | null;
  options: ServiceOption[];
}

interface EditServiceFormProps {
  service: Service;
}

export default function EditServiceForm({ service }: EditServiceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { categories } = useCategories("service");

  const [formData, setFormData] = useState({
    name: service.name,
    description: service.description,
    categoryId: service.categoryId,
    group: service.group,
    badge: service.badge || "",
    availability: service.availability || "",
    featured: service.featured,
    active: service.active,
    includes: service.includes.length > 0 ? service.includes : [""],
  });

  const [images, setImages] = useState<
    Array<{ url: string; publicId: string }>
  >(
    service.images.map((url) => ({
      url,
      publicId: url.split("/").pop()?.split(".")[0] || "",
    })),
  );

  const [options, setOptions] = useState(
    service.options.map((opt) => ({
      id: opt.id,
      name: opt.name,
      description: opt.description,
      pricingType: opt.pricingType,
      amount: opt.amount.toString(),
      yearlyAmount: opt.yearlyAmount?.toString() || "",
      label: opt.label || "",
      duration: opt.duration || "",
      popular: opt.popular,
      isExisting: true,
    })),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update service
      const serviceResponse = await fetch(`/api/services/${service.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          images: images.map((img) => img.url),
          categoryId: formData.categoryId,
          group: formData.group,
          featured: formData.featured,
          active: formData.active,
          badge: formData.badge || null,
          includes: formData.includes.filter((i) => i.trim()),
          availability: formData.availability || null,
        }),
      });

      if (!serviceResponse.ok) {
        const error = await serviceResponse.json();
        throw new Error(error.error || "Failed to update service");
      }

      // Delete removed options
      const existingOptionIds = service.options.map((o) => o.id);
      const currentOptionIds = options
        .filter((o) => o.isExisting)
        .map((o) => o.id);
      const deletedIds = existingOptionIds.filter(
        (id) => !currentOptionIds.includes(id),
      );

      for (const id of deletedIds) {
        await fetch(`/api/services/${service.id}/options/${id}`, {
          method: "DELETE",
        });
      }

      // Update or create options
      for (const option of options) {
        if (!option.name || !option.amount) continue;

        const optionData = {
          name: option.name,
          description: option.description,
          pricingType: option.pricingType,
          amount: parseInt(option.amount),
          yearlyAmount: option.yearlyAmount
            ? parseInt(option.yearlyAmount)
            : null,
          label: option.label || null,
          duration: option.duration || null,
          popular: option.popular,
        };

        if (option.isExisting && option.id) {
          // Update existing
          await fetch(`/api/services/${service.id}/options/${option.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(optionData),
          });
        } else {
          // Create new
          await fetch(`/api/services/${service.id}/options`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(optionData),
          });
        }
      }

      router.push("/admin/services");
      router.refresh();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to update service");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${service.name}"? This cannot be undone.`,
      )
    ) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/services/${service.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete service");
      }

      router.push("/admin/services");
      router.refresh();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to delete service");
      setDeleting(false);
    }
  };

  const addInclude = () => {
    setFormData({ ...formData, includes: [...formData.includes, ""] });
  };

  const updateInclude = (index: number, value: string) => {
    const updated = [...formData.includes];
    updated[index] = value;
    setFormData({ ...formData, includes: updated });
  };

  const removeInclude = (index: number) => {
    setFormData({
      ...formData,
      includes: formData.includes.filter((_, i) => i !== index),
    });
  };

  const addOption = () => {
    setOptions([
      ...options,
      {
        id: "",
        name: "",
        description: "",
        pricingType: "PER_SESSION",
        amount: "",
        yearlyAmount: "",
        label: "",
        duration: "",
        popular: false,
        isExisting: false,
      },
    ]);
  };

  const updateOption = (index: number, field: string, value: any) => {
    const updated = [...options];
    updated[index] = { ...updated[index], [field]: value };
    setOptions(updated);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/services"
            className="p-2 hover:bg-[var(--glass-bg-hover)] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">
              Edit Service
            </h1>
            <p className="text-[var(--text-muted)] mt-1">
              Update service information and pricing options
            </p>
          </div>
        </div>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--error-bg)] text-[var(--error-text)] hover:bg-[var(--error-border)] disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Service Images */}
        <div className="glass p-6 rounded-xl">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Service Images
          </h2>
          <MultiImageUpload
            folder="services"
            maxImages={4}
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
              Service Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="glass-input w-full px-4 py-3"
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
              rows={5}
              className="glass-input w-full px-4 py-3 resize-none"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Service Group *
              </label>
              <input
                type="text"
                required
                value={formData.group}
                onChange={(e) =>
                  setFormData({ ...formData, group: e.target.value })
                }
                className="glass-input w-full px-4 py-3"
                placeholder="e.g., Logistics"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Category *
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                className="glass-input w-full px-4 py-3"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Badge (Optional)
              </label>
              <input
                type="text"
                value={formData.badge}
                onChange={(e) =>
                  setFormData({ ...formData, badge: e.target.value })
                }
                className="glass-input w-full px-4 py-3"
                placeholder="e.g., Popular, Top Rated"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Availability (Optional)
              </label>
              <input
                type="text"
                value={formData.availability}
                onChange={(e) =>
                  setFormData({ ...formData, availability: e.target.value })
                }
                className="glass-input w-full px-4 py-3"
                placeholder="e.g., Mon–Sat, 7am–8pm"
              />
            </div>
          </div>
        </div>

        {/* What's Included */}
        <div className="glass p-6 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            What's Included
          </h2>
          {formData.includes.map((include, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={include}
                onChange={(e) => updateInclude(index, e.target.value)}
                className="glass-input flex-1 px-4 py-3"
                placeholder="e.g., Live tracking, SMS alerts"
              />
              {formData.includes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeInclude(index)}
                  className="p-3 bg-[var(--error-bg)] text-[var(--error-text)] rounded-lg hover:bg-[var(--error-border)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addInclude}
            className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-lg"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>

        {/* Service Options */}
        <div className="glass p-6 rounded-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Pricing Options
              </h2>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Manage pricing tiers for this service
              </p>
            </div>
            <button
              type="button"
              onClick={addOption}
              className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-lg"
            >
              <Plus className="w-4 h-4" />
              Add Option
            </button>
          </div>

          {options.map((option, index) => (
            <div
              key={index}
              className="p-4 border-2 border-[var(--divider)] rounded-lg space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[var(--text-primary)]">
                  {option.isExisting
                    ? `${option.name || `Option ${index + 1}`}`
                    : `New Option ${index + 1}`}
                </h3>
                {options.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="p-2 text-[var(--error-text)] hover:bg-[var(--error-bg)] rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Option Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={option.name}
                    onChange={(e) =>
                      updateOption(index, "name", e.target.value)
                    }
                    className="glass-input w-full px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Pricing Type *
                  </label>
                  <select
                    value={option.pricingType}
                    onChange={(e) =>
                      updateOption(index, "pricingType", e.target.value)
                    }
                    className="glass-input w-full px-4 py-3"
                  >
                    <option value="PER_SESSION">Per Session</option>
                    <option value="ONE_TIME">One Time</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Description *
                </label>
                <textarea
                  required
                  value={option.description}
                  onChange={(e) =>
                    updateOption(index, "description", e.target.value)
                  }
                  rows={2}
                  className="glass-input w-full px-4 py-3 resize-none"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Price (XAF) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={option.amount}
                    onChange={(e) =>
                      updateOption(index, "amount", e.target.value)
                    }
                    className="glass-input w-full px-4 py-3"
                  />
                </div>

                {option.pricingType === "MONTHLY" && (
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Yearly Price (XAF)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={option.yearlyAmount}
                      onChange={(e) =>
                        updateOption(index, "yearlyAmount", e.target.value)
                      }
                      className="glass-input w-full px-4 py-3"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Label
                  </label>
                  <input
                    type="text"
                    value={option.label}
                    onChange={(e) =>
                      updateOption(index, "label", e.target.value)
                    }
                    className="glass-input w-full px-4 py-3"
                    placeholder="e.g., Per delivery"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={option.duration}
                    onChange={(e) =>
                      updateOption(index, "duration", e.target.value)
                    }
                    className="glass-input w-full px-4 py-3"
                    placeholder="e.g., 2 hours"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={option.popular}
                  onChange={(e) =>
                    updateOption(index, "popular", e.target.checked)
                  }
                  className="w-5 h-5 rounded border-[var(--input-border)] text-[var(--purple)] focus:ring-[var(--purple)]"
                />
                <span className="text-sm text-[var(--text-secondary)]">
                  Mark as popular option
                </span>
              </label>
            </div>
          ))}
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
            <div>
              <span className="text-[var(--text-secondary)] font-medium">
                Featured Service
              </span>
              <p className="text-xs text-[var(--text-muted)]">
                Display prominently on the services page
              </p>
            </div>
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
            <div>
              <span className="text-[var(--text-secondary)} font-medium">
                Active
              </span>
              <p className="text-xs text-[var(--text-muted)]">
                Make this service available for booking
              </p>
            </div>
          </label>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || images.length === 0}
            className="btn-primary flex items-center gap-2 px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {loading ? "Updating..." : "Update Service"}
          </button>
          <Link
            href="/admin/services"
            className="btn-secondary px-6 py-3 rounded-lg"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
