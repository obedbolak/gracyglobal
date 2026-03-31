// app/(dashboard)/dashboard/counselor/edit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  CheckCircle,
  ShieldCheck,
  ShieldOff,
  Star,
  MessageSquare,
  DollarSign,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import ImageUpload from "@/components/shared/ImageUpload";

interface CounselorProfile {
  id: string;
  specialty: string;
  rating: number;
  reviews: number;
  pricePerHour: number;
  available: boolean;
  verified: boolean;
  bio?: string;
}

const specialties = [
  "Relationship Counseling",
  "Emotional Wellness",
  "Life Coaching",
  "Family Counseling",
  "Career Counseling",
  "Mental Health",
  "Grief Counseling",
  "Trauma Recovery",
  "Addiction Support",
  "Spiritual Guidance",
];

export default function CounselorEditPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [counselor, setCounselor] = useState<CounselorProfile | null>(null);
  const [form, setForm] = useState({
    specialty: "",
    bio: "",
    pricePerHour: "",
    available: true,
  });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status]);

  useEffect(() => {
    if (session?.user) fetchCounselor();
  }, [session]);

  const fetchCounselor = async () => {
    try {
      const res = await fetch("/api/user");
      const data = await res.json();
      if (data.success && data.data.counselorProfile) {
        const cp = data.data.counselorProfile;
        setCounselor(cp);
        setForm({
          specialty: cp.specialty,
          bio: cp.bio || "",
          pricePerHour: cp.pricePerHour.toString(),
          available: cp.available,
        });
      } else {
        setError("Counselor profile not found");
      }
    } catch {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!counselor) return;
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/counselors/${counselor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          specialty: form.specialty,
          bio: form.bio,
          pricePerHour: parseInt(form.pricePerHour) || 0,
          available: form.available,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
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
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Header */}
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
              Edit Counselor Profile
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Update your public counselor details
            </p>
          </div>
        </div>

        {counselor && (
          /* Stats banner */
          <div
            className="grid grid-cols-3 gap-4 mb-6 p-4 rounded-2xl"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
            }}
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="w-4 h-4" style={{ color: "var(--yellow)" }} />
                <span
                  className="font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {counselor.rating.toFixed(1)}
                </span>
              </div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Rating
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <MessageSquare
                  className="w-4 h-4"
                  style={{ color: "var(--blue)" }}
                />
                <span
                  className="font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {counselor.reviews}
                </span>
              </div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Reviews
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                {counselor.verified ? (
                  <ShieldCheck
                    className="w-4 h-4"
                    style={{ color: "var(--green)" }}
                  />
                ) : (
                  <ShieldOff
                    className="w-4 h-4"
                    style={{ color: "var(--yellow)" }}
                  />
                )}
                <span
                  className="font-bold text-sm"
                  style={{ color: "var(--text-primary)" }}
                >
                  {counselor.verified ? "Verified" : "Pending"}
                </span>
              </div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Verification
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Specialty */}
          <div
            className="p-6 rounded-2xl space-y-4"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
            }}
          >
            <h2
              className="font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Professional Details
            </h2>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-secondary)" }}
              >
                Specialty *
              </label>
              <select
                required
                value={form.specialty}
                onChange={(e) =>
                  setForm({ ...form, specialty: e.target.value })
                }
                className="glass-input w-full px-4 py-3"
              >
                <option value="">Select specialty</option>
                {specialties.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-secondary)" }}
              >
                Bio
              </label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={4}
                className="glass-input w-full px-4 py-3 resize-none"
                placeholder="Tell clients about your background, approach, and experience..."
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-secondary)" }}
              >
                Hourly Rate (XAF) *
              </label>
              <div className="relative">
                <DollarSign
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  type="number"
                  required
                  min="0"
                  value={form.pricePerHour}
                  onChange={(e) =>
                    setForm({ ...form, pricePerHour: e.target.value })
                  }
                  className="glass-input w-full pl-9 pr-4 py-3"
                  placeholder="5000"
                />
              </div>
            </div>
          </div>

          {/* Availability */}
          <div
            className="p-6 rounded-2xl"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
            }}
          >
            <h2
              className="font-semibold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Availability
            </h2>
            <button
              type="button"
              onClick={() => setForm({ ...form, available: !form.available })}
              className="flex items-center gap-3 w-full p-4 rounded-xl transition-all"
              style={{
                background: form.available
                  ? "var(--success-bg)"
                  : "var(--glass-bg-subtle)",
                border: `1px solid ${form.available ? "var(--green)" : "var(--divider)"}`,
              }}
            >
              {form.available ? (
                <ToggleRight
                  className="w-6 h-6"
                  style={{ color: "var(--green)" }}
                />
              ) : (
                <ToggleLeft
                  className="w-6 h-6"
                  style={{ color: "var(--text-muted)" }}
                />
              )}
              <div className="text-left">
                <p
                  className="font-medium text-sm"
                  style={{ color: "var(--text-primary)" }}
                >
                  {form.available
                    ? "Available for bookings"
                    : "Not accepting bookings"}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {form.available
                    ? "Clients can book sessions with you"
                    : "You won't appear in counselor listings"}
                </p>
              </div>
            </button>
          </div>

          {/* Error */}
          {error && (
            <div
              className="px-4 py-3 rounded-xl text-sm"
              style={{
                background: "var(--error-bg)",
                color: "var(--error-text)",
                border: "1px solid var(--error-border)",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all disabled:opacity-60"
              style={{
                background:
                  "linear-gradient(135deg, var(--purple), var(--blue))",
                color: "white",
              }}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saved ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
            </button>
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-xl font-semibold text-center transition-all hover:opacity-80"
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
                color: "var(--text-primary)",
              }}
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
