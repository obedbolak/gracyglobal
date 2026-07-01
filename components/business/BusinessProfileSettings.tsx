"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { AlertCircle, Copy, ExternalLink, Loader2, Save } from "lucide-react";
import ImageUpload from "@/components/shared/ImageUpload";

export interface BusinessProfile {
  id: string;
  slug?: string | null;
  businessName: string;
  businessType?: string | null;
  image?: string | null;
  location?: string | null;
  quarter?: string | null;
  openingHours?: string | null;
  description?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
}

function PublicPageBanner({
  slug,
  hrefPrefix,
  label,
}: {
  slug: string;
  hrefPrefix: string;
  label: string;
}) {
  const [copied, setCopied] = useState(false);
  const path = `${hrefPrefix}/${slug}`;
  const url =
    typeof window !== "undefined" ? `${window.location.origin}${path}` : path;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be unavailable.
    }
  };

  return (
    <div
      className="glass flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl"
      style={{ border: "1px solid var(--glass-border)" }}
    >
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          {label}
        </p>
        <p
          className="text-xs truncate mt-0.5"
          style={{ color: "var(--text-secondary)" }}
        >
          {url}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-[var(--sidebar-item-hover)] transition-colors"
          style={{
            border: "1px solid var(--glass-border)",
            color: "var(--text-primary)",
          }}
        >
          <Copy className="w-3.5 h-3.5" /> {copied ? "Copied!" : "Copy link"}
        </button>
        <a
          href={path}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white hover:opacity-90 transition-opacity"
          style={{
            background: "linear-gradient(135deg, var(--purple), var(--blue))",
          }}
        >
          <ExternalLink className="w-3.5 h-3.5" /> View page
        </a>
      </div>
    </div>
  );
}

export default function BusinessProfileSettings({
  profile,
  onSaved,
  title = "Business Profile",
  incompleteMessage = "Complete your business profile so customers can find and trust you.",
  imageLabel = "Business Logo / Image",
  descriptionPlaceholder = "Tell customers about your business...",
  uploadFolder = "gracyglobal/stores",
  publicPage,
}: {
  profile: BusinessProfile | null;
  onSaved: (profile: BusinessProfile) => void;
  title?: string;
  incompleteMessage?: string;
  imageLabel?: string;
  descriptionPlaceholder?: string;
  uploadFolder?: string;
  publicPage?: {
    hrefPrefix: string;
    label: string;
  };
}) {
  const [form, setForm] = useState({
    businessName: profile?.businessName ?? "",
    businessType: profile?.businessType ?? "",
    location: profile?.location ?? "",
    quarter: profile?.quarter ?? "",
    openingHours: profile?.openingHours ?? "",
    phone: profile?.phone ?? "",
    whatsapp: profile?.whatsapp ?? "",
    description: profile?.description ?? "",
    image: profile?.image ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const res = await fetch("/api/store", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok && data.store) {
        onSaved(data.store);
        setSaved(true);
      } else {
        setError(data.error || "Failed to save");
      }
    } catch {
      setError("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const incomplete =
    !profile?.businessName || !profile?.location || !profile?.openingHours;

  const fields = [
    ["businessName", "Business Name *", "e.g. Gracy Electronics"],
    ["businessType", "Business Type", "e.g. Electronics, Fashion, Food"],
    ["location", "Location", "e.g. Douala"],
    ["quarter", "Quarter / Neighborhood", "e.g. Akwa"],
    ["openingHours", "Opening Hours", "e.g. Mon-Sat, 8am-6pm"],
    ["phone", "Phone", "e.g. +237..."],
    ["whatsapp", "WhatsApp", "e.g. +237..."],
  ] as const;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1
        className="text-3xl font-bold"
        style={{ color: "var(--text-primary)" }}
      >
        {title}
      </h1>

      {profile?.slug && publicPage && (
        <PublicPageBanner
          slug={profile.slug}
          hrefPrefix={publicPage.hrefPrefix}
          label={publicPage.label}
        />
      )}

      {incomplete && (
        <div
          className="glass flex items-start gap-3 p-4 rounded-xl"
          style={{ border: "1px solid var(--glass-border)" }}
        >
          <AlertCircle
            className="w-5 h-5 flex-shrink-0 mt-0.5"
            style={{ color: "var(--yellow, #f59e0b)" }}
          />
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {incompleteMessage}
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="glass p-6 rounded-2xl space-y-4"
        style={{ border: "1px solid var(--glass-border)" }}
      >
        <ImageUpload
          label={imageLabel}
          aspectRatio="square"
          previewShape="circle"
          currentImage={form.image || undefined}
          folder={uploadFolder}
          onUploadComplete={(url) => set("image", url)}
          onRemove={() => set("image", "")}
        />

        {fields.map(([key, label, placeholder]) => (
          <div key={key}>
            <label
              className="block text-sm font-semibold mb-1.5"
              style={{ color: "var(--text-primary)" }}
            >
              {label}
            </label>
            <input
              type="text"
              value={form[key]}
              onChange={(event) => set(key, event.target.value)}
              placeholder={placeholder}
              className="glass-input w-full px-4 py-2.5 text-sm"
              required={key === "businessName"}
            />
          </div>
        ))}

        <div>
          <label
            className="block text-sm font-semibold mb-1.5"
            style={{ color: "var(--text-primary)" }}
          >
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(event) => set("description", event.target.value)}
            rows={3}
            placeholder={descriptionPlaceholder}
            className="glass-input w-full px-4 py-2.5 text-sm"
          />
        </div>

        {error && (
          <p
            className="text-sm font-medium"
            style={{ color: "var(--error-text)" }}
          >
            {error}
          </p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
            style={{
              background: "linear-gradient(135deg, var(--purple), var(--blue))",
            }}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Saving..." : "Save Profile"}
          </button>
          {saved && (
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--green)" }}
            >
              Saved
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
