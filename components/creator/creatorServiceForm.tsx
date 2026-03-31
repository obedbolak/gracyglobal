// components/creator/CreatorServiceForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MultiImageUpload from "@/components/shared/MultiImageUpload";
import { ArrowLeft, Save, Plus, X, Wrench } from "lucide-react";
import Link from "next/link";
import { SERVICE_CATEGORY_GROUPS } from "@/data/services";

const serviceCategories = SERVICE_CATEGORY_GROUPS.flatMap((g) => g.categories);
const serviceGroups = SERVICE_CATEGORY_GROUPS.map((g) => g.group);

export default function CreatorServiceForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<
    Array<{ url: string; publicId: string }>
  >([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    group: "",
    badge: "",
    availability: "",
    featured: false,
    active: true,
    includes: [""],
  });

  const [options, setOptions] = useState([
    {
      name: "",
      description: "",
      pricingType: "PER_SESSION",
      amount: "",
      yearlyAmount: "",
      label: "",
      duration: "",
      popular: false,
    },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length === 0) {
      alert("Please upload at least one image");
      return;
    }
    if (!options[0]?.name) {
      alert("Please add at least one pricing option");
      return;
    }

    setLoading(true);
    try {
      const serviceRes = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          images: images.map((img) => img.url),
          category: formData.category,
          group: formData.group,
          featured: formData.featured,
          active: formData.active,
          badge: formData.badge || null,
          includes: formData.includes.filter((i) => i.trim()),
          availability: formData.availability || null,
        }),
      });

      if (!serviceRes.ok) {
        const err = await serviceRes.json();
        throw new Error(err.error || "Failed to create service");
      }

      const { service } = await serviceRes.json();

      // Create options sequentially
      for (const option of options) {
        if (!option.name || !option.amount) continue;
        await fetch(`/api/services/${service.id}/options`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
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
          }),
        });
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Failed to create service");
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
      },
    ]);

  const updateOption = (i: number, field: string, value: any) => {
    const u = [...options];
    u[i] = { ...u[i], [field]: value };
    setOptions(u);
  };

  const removeOption = (i: number) =>
    setOptions(options.filter((_, idx) => idx !== i));

  return (
    <div
      className="min-h-screen py-8"
      style={{ background: "var(--background)" }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6 pb-12">
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
              <Wrench className="w-5 h-5" style={{ color: "var(--purple)" }} />
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
              Create a Service
            </h1>
            <p className="mt-1" style={{ color: "var(--text-muted)" }}>
              Offer your skills and services to the community
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Images */}
          <div className="glass p-6 rounded-xl">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Service Images *
            </h2>
            <MultiImageUpload
              folder="services"
              maxImages={4}
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
                  {serviceGroups.map((group) => (
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
                <select
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="glass-input w-full px-4 py-3"
                >
                  <option value="">Select category</option>
                  {serviceCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
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
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              What's Included
            </h2>
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
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  Pricing Options *
                </h2>
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
                key={index}
                className="p-4 border-2 border-[var(--divider)] rounded-lg space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-[var(--text-primary)]">
                    Option {index + 1}
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

          {/* Submit */}
          <div className="flex gap-4 pb-8">
            <button
              type="submit"
              disabled={loading || images.length === 0}
              className="btn-primary flex items-center gap-2 px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {loading ? "Creating…" : "Create Service"}
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
