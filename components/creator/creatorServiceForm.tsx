"use client";

import { useState, useEffect } from "react";
import MultiImageUpload from "@/components/shared/MultiImageUpload";
import { Save, Plus, X, Wrench, ArrowLeft, Loader2 } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ServiceOption {
  id?: string;
  name: string;
  description: string;
  pricingType: "PER_SESSION" | "ONE_TIME" | "MONTHLY";
  amount: string;
  yearlyAmount: string;
  label: string;
  duration: string;
  popular: boolean;
  active: boolean;
}

interface ExistingService {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  group: string;
  badge: string | null;
  availability: string | null;
  featured: boolean;
  active: boolean;
  includes: string[];
  images: string[];
  rating?: number;
  reviews?: number;
  createdAt?: Date | string;
}

interface Props {
  service?: ExistingService;
  onSuccess: () => void;
  onCancel: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CreatorServiceForm({
  service,
  onSuccess,
  onCancel,
}: Props) {
  const isEdit = !!service;
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);

  // ✅ Fetch real categories from DB
  const { categories, loading: categoriesLoading } = useCategories("service");

  // ✅ Service groups (predefined or from your DB)
  const SERVICE_GROUPS = [
    "Digital Services",
    "Creative Services",
    "Professional Services",
    "Technical Services",
    "Lifestyle Services",
    "Education Services",
  ];

  const [images, setImages] = useState<
    Array<{ url: string; publicId: string }>
  >(
    service?.images.map((url) => ({
      url,
      publicId: url.split("/").pop()?.split(".")[0] || "",
    })) ?? [],
  );

  const [formData, setFormData] = useState({
    name: service?.name ?? "",
    description: service?.description ?? "",
    categoryId: service?.categoryId ?? "",
    group: service?.group ?? "",
    badge: service?.badge ?? "",
    availability: service?.availability ?? "",
    featured: service?.featured ?? false,
    active: service?.active ?? true,
    includes: service?.includes.length ? service.includes : [""],
  });

  const [options, setOptions] = useState<ServiceOption[]>([
    {
      name: "",
      description: "",
      pricingType: "PER_SESSION",
      amount: "",
      yearlyAmount: "",
      label: "",
      duration: "",
      popular: false,
      active: true,
    },
  ]);

  // ── Fetch existing options when editing ────────────────────────────────────
  useEffect(() => {
    if (!isEdit || !service?.id) return;

    const fetchOptions = async () => {
      try {
        const res = await fetch(`/api/services/${service.id}/options`);
        if (!res.ok) throw new Error("Failed to fetch options");
        const data = await res.json();

        if (data.options && data.options.length > 0) {
          setOptions(
            data.options.map((o: any) => ({
              id: o.id,
              name: o.name,
              description: o.description,
              pricingType: o.pricingType,
              amount: o.amount?.toString() ?? "",
              yearlyAmount: o.yearlyAmount?.toString() ?? "",
              label: o.label ?? "",
              duration: o.duration ?? "",
              popular: o.popular ?? false,
              active: o.active ?? true,
            })),
          );
        }
      } catch (err: any) {
        console.error("Error fetching options:", err);
        setError("Failed to load pricing options");
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, [isEdit, service?.id]);

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (images.length === 0) {
      setError("Please upload at least one image");
      return;
    }
    if (!options[0]?.name || !options[0]?.amount) {
      setError("Please add at least one pricing option with name and price");
      return;
    }

    setLoading(true);
    try {
      const servicePayload = {
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
      };

      // Create or update service
      const serviceRes = await fetch(
        isEdit ? `/api/services/${service.id}` : "/api/services",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(servicePayload),
        },
      );

      if (!serviceRes.ok) {
        const err = await serviceRes.json();
        throw new Error(err.error || "Failed to save service");
      }

      const result = await serviceRes.json();
      const serviceId = isEdit ? service.id : result.service.id;

      // Handle options (create, update, or delete)
      if (isEdit) {
        // Get existing option IDs
        const existingOptionIds = options.filter((o) => o.id).map((o) => o.id!);

        // Fetch current options from server to find deleted ones
        const currentRes = await fetch(`/api/services/${serviceId}/options`);
        if (currentRes.ok) {
          const currentData = await currentRes.json();
          const currentIds = currentData.options.map((o: any) => o.id);

          // Delete removed options
          const deletedIds = currentIds.filter(
            (id: string) => !existingOptionIds.includes(id),
          );

          for (const id of deletedIds) {
            await fetch(`/api/services/${serviceId}/options/${id}`, {
              method: "DELETE",
            });
          }
        }
      }

      // Create or update options
      for (const option of options) {
        if (!option.name || !option.amount) continue;

        const optionPayload = {
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
          active: option.active,
        };

        if (isEdit && option.id) {
          // Update existing option
          await fetch(`/api/services/${serviceId}/options/${option.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(optionPayload),
          });
        } else {
          // Create new option
          await fetch(`/api/services/${serviceId}/options`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(optionPayload),
          });
        }
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to save service");
    } finally {
      setLoading(false);
    }
  };

  // ── List helpers ──────────────────────────────────────────────────────────

  const addInclude = () =>
    setFormData({ ...formData, includes: [...formData.includes, ""] });

  const updateInclude = (i: number, v: string) => {
    const u = [...formData.includes];
    u[i] = v;
    setFormData({ ...formData, includes: u });
  };

  const removeInclude = (i: number) =>
    setFormData({
      ...formData,
      includes: formData.includes.filter((_, idx) => idx !== i),
    });

  const addOption = () =>
    setOptions([
      ...options,
      {
        name: "",
        description: "",
        pricingType: "PER_SESSION",
        amount: "",
        yearlyAmount: "",
        label: "",
        duration: "",
        popular: false,
        active: true,
      },
    ]);

  const updateOption = (i: number, field: string, value: any) => {
    const u = [...options];
    u[i] = { ...u[i], [field]: value };
    setOptions(u);
  };

  const removeOption = (i: number) => {
    if (options.length === 1) {
      setError("You must have at least one pricing option");
      return;
    }
    setOptions(options.filter((_, idx) => idx !== i));
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (loadingOptions) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--purple)]" />
      </div>
    );
  }

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
            <Wrench className="w-5 h-5" style={{ color: "var(--purple)" }} />
            <span
              className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{
                background: "var(--purple-faint)",
                color: "var(--purple)",
              }}
            >
              {isEdit ? "Edit Service" : "New Service"}
            </span>
          </div>
          <h2
            className="text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {isEdit ? `Editing: ${service.name}` : "Create a Service"}
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            {isEdit
              ? "Update your service details below"
              : "Offer your skills and services to the community"}
          </p>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div
          className="p-4 rounded-xl flex items-start gap-3"
          style={{
            background: "var(--error-bg)",
            border: "1px solid var(--error-border)",
          }}
        >
          <X
            className="w-5 h-5 flex-shrink-0 mt-0.5"
            style={{ color: "var(--error-text)" }}
          />
          <p className="text-sm" style={{ color: "var(--error-text)" }}>
            {error}
          </p>
          <button
            onClick={() => setError(null)}
            className="ml-auto opacity-60 hover:opacity-100"
          >
            <X className="w-4 h-4" style={{ color: "var(--error-text)" }} />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Images */}
        <div className="glass p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Service Images *
          </h3>
          <MultiImageUpload
            folder="services"
            maxImages={4}
            currentImages={images} // ✅ Pass existing images in edit mode
            onUploadComplete={setImages}
          />
        </div>

        {/* Basic Info */}
        <div className="glass p-6 rounded-xl space-y-4">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            Basic Information
          </h3>

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
              placeholder="e.g., Logo Design, Web Development, Photography"
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
              placeholder="Describe what you offer, your experience, and what clients can expect..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Service Group *
              </label>
              <select
                required
                value={formData.group}
                onChange={(e) =>
                  setFormData({ ...formData, group: e.target.value })
                }
                className="glass-input w-full px-4 py-3"
              >
                <option value="">Select group</option>
                {SERVICE_GROUPS.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Category *
              </label>
              {categoriesLoading ? (
                <div className="glass-input w-full px-4 py-3 text-[var(--text-muted)]">
                  Loading categories...
                </div>
              ) : (
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
              )}
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
                placeholder="e.g., Top Rated, Fast Delivery"
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
                placeholder="e.g., Mon–Fri, 9am–6pm"
              />
            </div>
          </div>
        </div>

        {/* What's Included */}
        <div className="glass p-6 rounded-xl space-y-4">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            What's Included
          </h3>
          {formData.includes.map((include, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={include}
                onChange={(e) => updateInclude(i, e.target.value)}
                className="glass-input flex-1 px-4 py-3"
                placeholder="e.g., 3 revisions, Source files, 48h delivery"
              />
              {formData.includes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeInclude(i)}
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
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>

        {/* Pricing Options */}
        <div className="glass p-6 rounded-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Pricing Options *
              </h3>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Add one or more pricing tiers
              </p>
            </div>
            <button
              type="button"
              onClick={addOption}
              className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-lg"
            >
              <Plus className="w-4 h-4" /> Add Option
            </button>
          </div>

          {options.map((option, index) => (
            <div
              key={option.id || index}
              className="p-4 border-2 border-[var(--divider)] rounded-lg space-y-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-[var(--text-primary)]">
                  {option.name || `Option ${index + 1}`}
                  {option.id && (
                    <span className="ml-2 text-xs text-[var(--text-muted)]">
                      (existing)
                    </span>
                  )}
                </h4>
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
                    placeholder="e.g., Basic Package"
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
                  placeholder="What's included in this option?"
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
                    placeholder="0"
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
                      placeholder="Optional"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Label (Optional)
                  </label>
                  <input
                    type="text"
                    value={option.label}
                    onChange={(e) =>
                      updateOption(index, "label", e.target.value)
                    }
                    className="glass-input w-full px-4 py-3"
                    placeholder="e.g., Per session"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Duration (Optional)
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

              <div className="flex items-center gap-6">
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
                    Mark as popular
                  </span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={option.active}
                    onChange={(e) =>
                      updateOption(index, "active", e.target.checked)
                    }
                    className="w-5 h-5 rounded border-[var(--input-border)] text-[var(--purple)] focus:ring-[var(--purple)]"
                  />
                  <span className="text-sm text-[var(--text-secondary)]">
                    Active
                  </span>
                </label>
              </div>
            </div>
          ))}
        </div>

        {/* Settings */}
        <div className="glass p-6 rounded-xl space-y-4">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            Settings
          </h3>

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
              <span className="text-sm font-medium text-[var(--text-secondary)]">
                Request featured placement
              </span>
              <p className="text-xs text-[var(--text-muted)]">
                Subject to admin review and approval
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
              <span className="text-sm font-medium text-[var(--text-secondary)]">
                List immediately
              </span>
              <p className="text-xs text-[var(--text-muted)]">
                Make your service visible for booking right away
              </p>
            </div>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pb-8">
          <button
            type="submit"
            disabled={loading || images.length === 0 || categoriesLoading}
            className="btn-primary flex items-center gap-2 px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {loading ? "Saving…" : isEdit ? "Save Changes" : "Create Service"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="btn-secondary px-6 py-3 rounded-lg disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
