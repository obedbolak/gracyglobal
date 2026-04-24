// app/(dashboard)/dashboard/settings/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  CheckCircle,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import ImageUpload from "@/components/shared/ImageUpload";

interface UserPaymentMethod {
  id: string;
  method: string;
  label: string;
  details?: { value?: string } | null;
  isDefault: boolean;
  createdAt: string;
}

interface UserProfile {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  country?: string | null;
  phone?: string | null;
  createdAt?: string;
  emailVerified?: string | null;
  role?: string[];
  paymentMethods?: UserPaymentMethod[];
}

export default function DashboardSettingsPage() {
  const router = useRouter();
  const { data: session, status, update: updateSession } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<UserPaymentMethod[]>([]);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    method: "MOBILE_MONEY_MTN",
    label: "MTN Mobile Money",
    value: "",
  });
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
      if (!res.ok || !data.success)
        throw new Error(data.error || "Failed to load profile");
      setProfile(data.data);
      setPaymentMethods(data.data.paymentMethods ?? []);
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
      if (form.password) payload.password = form.password;

      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.error || "Failed to save settings");

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      setProfile(data.data);
      setForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));

      // Refresh the session to update profile image and other changes
      await updateSession({
        name: data.data.name,
        image: data.data.image,
        email: data.data.email,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: "var(--blue)" }}
        />
      </div>
    );
  }

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      })
    : null;

  const isEmailVerified = !!profile?.emailVerified;

  return (
    <div className="py-4 sm:py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <Link
          href="/dashboard"
          className="p-2 rounded-lg transition-colors hover:opacity-80 flex-shrink-0"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <ArrowLeft
            className="w-4 h-4 sm:w-5 sm:h-5"
            style={{ color: "var(--text-primary)" }}
          />
        </Link>
        <div>
          <h1
            className="text-xl sm:text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Profile Settings
          </h1>
          <p
            className="text-xs sm:text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            Manage your account details, contact info, and security.
          </p>
        </div>
      </div>

      {/* ── Profile Summary Card (moved from dashboard) ── */}
      {profile && (
        <div
          className="p-5 rounded-2xl mb-6"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div
              className="w-14 h-14 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center"
              style={{ background: "var(--glass-bg-subtle)" }}
            >
              {form.image || profile.image ? (
                <img
                  src={form.image || profile.image || ""}
                  alt={profile.name || "User"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-7 h-7" style={{ color: "var(--blue)" }} />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h2
                  className="text-base font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {profile.name || "User"}
                </h2>

                {/* Email verification badge */}
                {isEmailVerified ? (
                  <span
                    className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    style={{
                      background: "var(--success-bg)",
                      color: "var(--green)",
                    }}
                  >
                    <ShieldCheck className="w-3 h-3" />
                    Email verified
                  </span>
                ) : (
                  <span
                    className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    style={{
                      background: "var(--warning-bg)",
                      color: "var(--yellow)",
                    }}
                  >
                    <ShieldAlert className="w-3 h-3" />
                    Email not verified
                  </span>
                )}
              </div>

              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{profile.email}</span>
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                    {profile.phone}
                  </div>
                )}
                {profile.country && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    {profile.country}
                  </div>
                )}
                {memberSince && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                    Member since {memberSince}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Personal Information */}
        <section
          className="p-4 sm:p-6 rounded-2xl"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <h2
            className="font-semibold mb-4 sm:mb-5 text-sm sm:text-base"
            style={{ color: "var(--text-primary)" }}
          >
            Personal Information
          </h2>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left — text fields */}
            <div className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Full name
                </label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full rounded-xl border border-[var(--divider)] bg-[var(--glass-bg-subtle)] px-4 py-2.5 sm:py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--purple)]"
                  placeholder="Your full name"
                  type="text"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Email address
                </label>
                <input
                  value={profile?.email ?? ""}
                  disabled
                  className="w-full rounded-xl border border-[var(--divider)] bg-[var(--glass-bg-subtle)] px-4 py-2.5 sm:py-3 text-sm text-[var(--text-secondary)] outline-none opacity-60 cursor-not-allowed"
                  type="email"
                />
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  Email cannot be changed directly. Contact support if needed.
                </p>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Phone number
                </label>
                <input
                  value={form.phone}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full rounded-xl border border-[var(--divider)] bg-[var(--glass-bg-subtle)] px-4 py-2.5 sm:py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--purple)]"
                  placeholder="+237 6XX XXX XXX"
                  type="tel"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Country
                </label>
                <input
                  value={form.country}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, country: e.target.value }))
                  }
                  className="w-full rounded-xl border border-[var(--divider)] bg-[var(--glass-bg-subtle)] px-4 py-2.5 sm:py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--purple)]"
                  placeholder="Cameroon"
                  type="text"
                />
              </div>
            </div>

            {/* Right — photo upload */}
            <div className="space-y-3">
              <ImageUpload
                label="Profile Photo"
                currentImage={form.image || undefined}
                onUploadComplete={handleUploadComplete}
                aspectRatio="square"
              />
              {form.image && (
                <p
                  className="text-xs break-all"
                  style={{ color: "var(--text-muted)" }}
                >
                  {form.image}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Saved Payment Methods */}
        <section
          className="p-4 sm:p-6 rounded-2xl"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2
                className="font-semibold text-sm sm:text-base"
                style={{ color: "var(--text-primary)" }}
              >
                Saved Payment Methods
              </h2>
              <p
                className="text-xs mt-1"
                style={{ color: "var(--text-muted)" }}
              >
                Save a payment method here and choose it when subscribing or
                checking out.
              </p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {paymentMethods.length > 0 ? (
              paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="rounded-2xl border border-[var(--divider)] bg-[var(--glass-bg-subtle)] p-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p
                        className="font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {method.label}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {method.method.replace(/_/g, " ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {method.isDefault && (
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[var(--success-bg)] text-[var(--green)]">
                          Default
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={async () => {
                          if (!window.confirm("Delete this payment method?"))
                            return;
                          setPaymentLoading(true);
                          try {
                            const res = await fetch(
                              `/api/user/payment-methods/${method.id}`,
                              {
                                method: "DELETE",
                              },
                            );
                            const data = await res.json();
                            if (!res.ok || !data.success) {
                              throw new Error(data.error || "Failed to delete");
                            }
                            setPaymentMethods((prev) =>
                              prev.filter((item) => item.id !== method.id),
                            );
                            setPaymentError("");
                          } catch (err: any) {
                            setPaymentError(err.message);
                          } finally {
                            setPaymentLoading(false);
                          }
                        }}
                        className="text-xs font-semibold text-[var(--red)] hover:text-[var(--red-dark)]"
                        disabled={paymentLoading}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p
                    className="mt-3 text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {method.details?.value ?? "No details saved"}
                  </p>
                </div>
              ))
            ) : (
              <div
                className="rounded-2xl border border-[var(--divider)] bg-[var(--glass-bg-subtle)] p-4 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                No payment methods on file. Add one below to save for future
                payments.
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                Payment type
              </label>
              <select
                value={newPaymentMethod.method}
                onChange={(e) => {
                  const method = e.target.value;
                  const defaultLabels: Record<string, string> = {
                    MOBILE_MONEY_MTN: "MTN Mobile Money",
                    MOBILE_MONEY_ORANGE: "Orange Mobile Money",
                    BANK_TRANSFER: "Bank Transfer",
                    CARD: "Card",
                    CASH: "Cash",
                  };
                  setNewPaymentMethod((prev) => ({
                    ...prev,
                    method,
                    label: prev.label || defaultLabels[method] || method,
                  }));
                }}
                className="w-full rounded-xl border border-[var(--divider)] bg-[var(--glass-bg-subtle)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none"
              >
                <option value="MOBILE_MONEY_MTN">MTN Mobile Money</option>
                <option value="MOBILE_MONEY_ORANGE">Orange Mobile Money</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CARD">Card</option>
                <option value="CASH">Cash</option>
              </select>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                Label
              </label>
              <input
                value={newPaymentMethod.label}
                onChange={(e) =>
                  setNewPaymentMethod((prev) => ({
                    ...prev,
                    label: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-[var(--divider)] bg-[var(--glass-bg-subtle)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none"
                placeholder="e.g. MTN Mobile Money"
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                Phone / details
              </label>
              <input
                value={newPaymentMethod.value}
                onChange={(e) =>
                  setNewPaymentMethod((prev) => ({
                    ...prev,
                    value: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-[var(--divider)] bg-[var(--glass-bg-subtle)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none"
                placeholder="e.g. +237 6XX XXX XXX"
              />
            </div>
          </div>

          {paymentError && (
            <div className="rounded-2xl bg-[var(--error-bg)] border border-[var(--error-border)] p-4 text-sm text-[var(--error-text)]">
              {paymentError}
            </div>
          )}

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-xs text-[var(--text-muted)]">
              Saved payment methods can be used during checkout or when
              subscribing to a plan.
            </p>
            <button
              type="button"
              onClick={async () => {
                setPaymentError("");
                if (!newPaymentMethod.value.trim()) {
                  setPaymentError("Please enter payment details.");
                  return;
                }
                setPaymentLoading(true);
                try {
                  const res = await fetch("/api/user/payment-methods", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      method: newPaymentMethod.method,
                      label: newPaymentMethod.label,
                      value: newPaymentMethod.value.trim(),
                    }),
                  });
                  const data = await res.json();
                  if (!res.ok || !data.success) {
                    throw new Error(
                      data.error || "Failed to save payment method",
                    );
                  }
                  setPaymentMethods((prev) => [data.data, ...prev]);
                  setNewPaymentMethod({
                    method: "MOBILE_MONEY_MTN",
                    label: "MTN Mobile Money",
                    value: "",
                  });
                } catch (err: any) {
                  setPaymentError(err.message);
                } finally {
                  setPaymentLoading(false);
                }
              }}
              disabled={paymentLoading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--purple)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {paymentLoading ? "Saving..." : "Save payment method"}
            </button>
          </div>
        </section>

        {/* Change Password */}
        <section
          className="p-4 sm:p-6 rounded-2xl"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <h2
            className="font-semibold mb-4 sm:mb-5 text-sm sm:text-base"
            style={{ color: "var(--text-primary)" }}
          >
            Change Password
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                New password
              </label>
              <input
                value={form.password}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, password: e.target.value }))
                }
                className="w-full rounded-xl border border-[var(--divider)] bg-[var(--glass-bg-subtle)] px-4 py-2.5 sm:py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--purple)]"
                placeholder="Leave blank to keep current"
                type="password"
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
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
                className="w-full rounded-xl border border-[var(--divider)] bg-[var(--glass-bg-subtle)] px-4 py-2.5 sm:py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--purple)]"
                placeholder="Confirm new password"
                type="password"
              />
            </div>
          </div>
          <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>
            Password must be at least 8 characters if you choose to update it.
          </p>
        </section>

        {/* Error */}
        {error && (
          <div className="rounded-2xl p-4 text-sm bg-[var(--error-bg)] text-[var(--error-text)] border border-[var(--error-border)]">
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          {saved && (
            <div className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm bg-[var(--success-bg)] text-[var(--success-text)] border border-[var(--success-border)]">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>Profile updated successfully.</span>
            </div>
          )}
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--purple)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:ml-auto"
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
  );
}
