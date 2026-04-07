"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, CheckCircle, XCircle } from "lucide-react";
import ImageUpload from "@/components/shared/ImageUpload";

interface UserProfile {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  country?: string | null;
  phone?: string | null;
}

export default function DashboardSettingsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    country: "",
    image: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/user");
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load profile");
      }

      setProfile(data.data);
      setForm({
        name: data.data.name ?? "",
        phone: data.data.phone ?? "",
        country: data.data.country ?? "",
        image: data.data.image ?? "",
        password: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = (url: string) => {
    setForm((prev) => ({ ...prev, image: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password && form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, string> = {
        name: form.name,
        phone: form.phone,
        country: form.country,
        image: form.image,
      };
      if (form.password) {
        payload.password = form.password;
      }

      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save settings");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      setProfile(data.data);
      setForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: "var(--background)" }}
      >
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: "var(--blue)" }}
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-8"
      style={{ background: "var(--background)" }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard"
            className="p-2 rounded-lg transition-colors hover:opacity-80"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
            }}
          >
            <ArrowLeft
              className="w-5 h-5"
              style={{ color: "var(--text-primary)" }}
            />
          </Link>
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Profile Settings
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Update your name, image, contact info, and password.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section
            className="p-6 rounded-2xl"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
            }}
          >
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Full name
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full rounded-xl border border-[var(--divider)] bg-[var(--glass-bg-subtle)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--purple)]"
                    placeholder="Your full name"
                    type="text"
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Email address
                  </label>
                  <input
                    value={profile?.email ?? ""}
                    disabled
                    className="w-full rounded-xl border border-[var(--divider)] bg-[var(--glass-bg-subtle)] px-4 py-3 text-sm text-[var(--text-secondary)] outline-none"
                    type="email"
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Phone number
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    className="w-full rounded-xl border border-[var(--divider)] bg-[var(--glass-bg-subtle)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--purple)]"
                    placeholder="+234 123 4567"
                    type="tel"
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Country
                  </label>
                  <input
                    value={form.country}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, country: e.target.value }))
                    }
                    className="w-full rounded-xl border border-[var(--divider)] bg-[var(--glass-bg-subtle)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--purple)]"
                    placeholder="Cameroon"
                    type="text"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <ImageUpload
                  label="Profile Photo"
                  currentImage={form.image || undefined}
                  onUploadComplete={handleUploadComplete}
                  aspectRatio="square"
                />
                {form.image && (
                  <p className="text-xs text-[var(--text-muted)]">
                    Uploaded image URL: {form.image}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section
            className="p-6 rounded-2xl"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
            }}
          >
            <h2
              className="font-semibold mb-5"
              style={{ color: "var(--text-primary)" }}
            >
              Change Password
            </h2>
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  New password
                </label>
                <input
                  value={form.password}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  className="w-full rounded-xl border border-[var(--divider)] bg-[var(--glass-bg-subtle)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--purple)]"
                  placeholder="Leave blank to keep current password"
                  type="password"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Confirm password
                </label>
                <input
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-[var(--divider)] bg-[var(--glass-bg-subtle)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--purple)]"
                  placeholder="Confirm password"
                  type="password"
                />
              </div>
            </div>
            <p className="text-xs mt-3 text-[var(--text-muted)]">
              Password must be at least 8 characters if you choose to update it.
            </p>
          </section>

          {error && (
            <div className="rounded-2xl p-4 bg-[var(--error-bg)] text-[var(--error-text)] border border-[var(--error-border)]">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4 sm:flex-row items-stretch sm:items-center justify-between">
            {saved && (
              <div className="flex items-center gap-2 rounded-2xl px-4 py-3 bg-[var(--success-bg)] text-[var(--success-text)] border border-[var(--success-border)]">
                <CheckCircle className="w-4 h-4" />
                <span>Profile updated successfully.</span>
              </div>
            )}
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--purple)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
