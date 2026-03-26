// app/admin/services/create/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MultiImageUpload from "@/components/shared/MultiImageUpload";
import { ArrowLeft, Save, Plus, X } from "lucide-react";
import Link from "next/link";

const serviceCategories = [
  "Spiritual Counseling",
  "Meditation & Mindfulness",
  "Energy Healing",
  "Tarot & Oracle Reading",
  "Astrology",
  "Life Coaching",
  "Relationship Guidance",
  "Wellness Consultation",
  "Ritual & Ceremony",
  "Other",
];

const spiritSystems = [
  "Ancestral Wisdom",
  "Chakra Energy",
  "Divine Feminine",
  "Elemental Magic",
  "Lunar Cycles",
  "Sacred Geometry",
  "Crystal Healing",
  "Sound Therapy",
];

export default function CreateServicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    group: "",
    duration: "", // in minutes
    sessionType: "VIDEO", // VIDEO, TEXT, IN_PERSON
    featured: false,
    active: true,
    benefits: [""],
    whatToExpect: [""],
    requirements: [""],
    spiritSystems: [] as string[],
  });
  const [images, setImages] = useState<
    Array<{ url: string; publicId: string }>
  >([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseInt(formData.price),
          category: formData.category,
          group: formData.group,
          images: images.map((img) => img.url),
          featured: formData.featured,
          active: formData.active,
          benefits: formData.benefits.filter((b) => b.trim()),
          ingredients: [
            // Store service details in ingredients field
            `Duration: ${formData.duration} minutes`,
            `Session Type: ${formData.sessionType}`,
            ...formData.whatToExpect
              .filter((w) => w.trim())
              .map((w) => `Expect: ${w}`),
            ...formData.requirements
              .filter((r) => r.trim())
              .map((r) => `Requirement: ${r}`),
          ],
          stock: 999, // Services have unlimited "stock"
        }),
      });

      if (!response.ok) throw new Error("Failed to create service");

      router.push("/admin/services");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to create service");
    } finally {
      setLoading(false);
    }
  };

  const addField = (field: "benefits" | "whatToExpect" | "requirements") => {
    setFormData({
      ...formData,
      [field]: [...formData[field], ""],
    });
  };

  const updateField = (
    field: "benefits" | "whatToExpect" | "requirements",
    index: number,
    value: string,
  ) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData({ ...formData, [field]: updated });
  };

  const removeField = (
    field: "benefits" | "whatToExpect" | "requirements",
    index: number,
  ) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index),
    });
  };

  const toggleSpiritSystem = (system: string) => {
    setFormData({
      ...formData,
      spiritSystems: formData.spiritSystems.includes(system)
        ? formData.spiritSystems.filter((s) => s !== system)
        : [...formData.spiritSystems, system],
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/services"
          className="p-2 hover:bg-[var(--glass-bg-hover)] rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Create Service
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Add a new spiritual or wellness service
          </p>
        </div>
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
              placeholder="e.g., Tarot Card Reading Session"
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
              placeholder="Describe what this service offers..."
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
                {serviceCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Group/Tag
              </label>
              <input
                type="text"
                value={formData.group}
                onChange={(e) =>
                  setFormData({ ...formData, group: e.target.value })
                }
                className="glass-input w-full px-4 py-3"
                placeholder="e.g., Premium, Beginner-Friendly"
              />
            </div>
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
                Duration (minutes) *
              </label>
              <input
                type="number"
                required
                min="15"
                step="15"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                className="glass-input w-full px-4 py-3"
                placeholder="60"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Session Type *
              </label>
              <select
                required
                value={formData.sessionType}
                onChange={(e) =>
                  setFormData({ ...formData, sessionType: e.target.value })
                }
                className="glass-input w-full px-4 py-3"
              >
                <option value="VIDEO">Video Call</option>
                <option value="TEXT">Text/Chat</option>
                <option value="IN_PERSON">In-Person</option>
              </select>
            </div>
          </div>
        </div>

        {/* Spirit Systems */}
        <div className="glass p-6 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Spirit Systems
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            Select the spiritual systems this service aligns with
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {spiritSystems.map((system) => (
              <label
                key={system}
                className={`
                  flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 cursor-pointer transition-all
                  ${
                    formData.spiritSystems.includes(system)
                      ? "border-[var(--purple)] bg-[var(--purple-faint)] text-[var(--purple)]"
                      : "border-[var(--divider)] hover:border-[var(--purple-light)]"
                  }
                `}
              >
                <input
                  type="checkbox"
                  checked={formData.spiritSystems.includes(system)}
                  onChange={() => toggleSpiritSystem(system)}
                  className="sr-only"
                />
                <span className="text-sm font-medium">{system}</span>
              </label>
            ))}
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
                placeholder="e.g., Gain clarity on life decisions"
              />
              {formData.benefits.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeField("benefits", index)}
                  className="p-3 bg-[var(--error-bg)] text-[var(--error-text)] rounded-lg hover:bg-[var(--error-border)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addField("benefits")}
            className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-lg"
          >
            <Plus className="w-4 h-4" />
            Add Benefit
          </button>
        </div>

        {/* What to Expect */}
        <div className="glass p-6 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            What to Expect
          </h2>
          {formData.whatToExpect.map((item, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) =>
                  updateField("whatToExpect", index, e.target.value)
                }
                className="glass-input flex-1 px-4 py-3"
                placeholder="e.g., A personalized reading based on your energy"
              />
              {formData.whatToExpect.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeField("whatToExpect", index)}
                  className="p-3 bg-[var(--error-bg)] text-[var(--error-text)] rounded-lg hover:bg-[var(--error-border)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addField("whatToExpect")}
            className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-lg"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>

        {/* Requirements */}
        <div className="glass p-6 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Requirements (Optional)
          </h2>
          {formData.requirements.map((req, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={req}
                onChange={(e) =>
                  updateField("requirements", index, e.target.value)
                }
                className="glass-input flex-1 px-4 py-3"
                placeholder="e.g., Bring specific questions or topics"
              />
              {formData.requirements.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeField("requirements", index)}
                  className="p-3 bg-[var(--error-bg)] text-[var(--error-text)] rounded-lg hover:bg-[var(--error-border)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addField("requirements")}
            className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-lg"
          >
            <Plus className="w-4 h-4" />
            Add Requirement
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
              <span className="text-[var(--text-secondary)] font-medium">
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
            className="btn-primary flex items-center gap-2 px-6 py-3 rounded-lg disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {loading ? "Creating..." : "Create Service"}
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
