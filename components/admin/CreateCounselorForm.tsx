// components/admin/CreateCounselorForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, X, User } from "lucide-react";
import Link from "next/link";
import ImageUpload from "@/components/shared/ImageUpload";

const COUNSELOR_SPECIALTIES = [
  "Relationship Counseling",
  "Emotional Wellness",
  "Life Coaching",
  "Family Counseling",
  "Career Counseling",
  "Mental Health",
  "Grief & Loss",
  "Addiction Recovery",
  "Stress Management",
  "Self-Esteem & Confidence",
  "Trauma & PTSD",
  "Anxiety & Depression",
  "Other",
];

export default function CreateCounselorForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string>(""); // Simplified to just string

  const [formData, setFormData] = useState({
    // User fields
    name: "",
    email: "",
    password: "",
    phone: "",
    country: "CM",

    // Counselor fields
    bio: "",
    specialty: "",
    pricePerHour: "",
    available: true,
    verified: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      alert("Email and password are required");
      return;
    }

    if (formData.password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      // Create the user with all fields in one go
      const userResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          country: formData.country,
          role: "COUNSELOR", // Set role to COUNSELOR
          image: image, // Include image here
        }),
      });

      if (!userResponse.ok) {
        const error = await userResponse.json();
        throw new Error(error.error || "Failed to create user");
      }

      const { user } = await userResponse.json();
      console.log("✅ User created with image:", user);

      // Create the counselor profile
      const counselorResponse = await fetch("/api/counselors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          bio: formData.bio,
          specialty: formData.specialty,
          pricePerHour: parseInt(formData.pricePerHour),
          available: formData.available,
          verified: formData.verified,
        }),
      });

      if (!counselorResponse.ok) {
        const error = await counselorResponse.json();
        throw new Error(error.error || "Failed to create counselor");
      }

      router.push("/admin/counselors");
      router.refresh();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to create counselor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Image */}
      <div className="glass p-6 rounded-xl">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          Profile Image
        </h2>
        <div className="flex items-center gap-6">
          {image ? (
            <div className="relative">
              <img
                src={image}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover"
              />
              <button
                type="button"
                onClick={() => setImage("")}
                className="absolute -top-2 -right-2 p-1 bg-[var(--error-bg)] text-[var(--error-text)] rounded-full hover:bg-[var(--error-border)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-[var(--glass-bg)] flex items-center justify-center border-2 border-dashed border-[var(--divider)]">
              <User className="w-10 h-10 text-[var(--text-muted)]" />
            </div>
          )}
          <ImageUpload
            folder="counselors"
            onUploadComplete={(file) => {
              // Handle both string and object returns
              if (typeof file === "string") {
                setImage(file);
              } else if (file && typeof file === "object" && "url" in file) {
                setImage(file);
              }
            }}
          />
        </div>
      </div>

      {/* Account Information */}
      <div className="glass p-6 rounded-xl space-y-4">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          Account Information
        </h2>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="glass-input w-full px-4 py-3"
            placeholder="e.g., Dr. Sarah Johnson"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="glass-input w-full px-4 py-3"
              placeholder="sarah@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Password *
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="glass-input w-full px-4 py-3"
              placeholder="Min. 8 characters"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Phone (Optional)
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="glass-input w-full px-4 py-3"
              placeholder="+237 6XX XXX XXX"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Country
            </label>
            <select
              value={formData.country}
              onChange={(e) =>
                setFormData({ ...formData, country: e.target.value })
              }
              className="glass-input w-full px-4 py-3"
            >
              <option value="CM">Cameroon</option>
              <option value="NG">Nigeria</option>
              <option value="GH">Ghana</option>
              <option value="KE">Kenya</option>
              <option value="ZA">South Africa</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Professional Information */}
      <div className="glass p-6 rounded-xl space-y-4">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          Professional Information
        </h2>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Bio *
          </label>
          <textarea
            required
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={5}
            className="glass-input w-full px-4 py-3 resize-none"
            placeholder="Tell clients about your background, experience, and approach to counseling..."
          />
          <p className="text-xs text-[var(--text-muted)] mt-2">
            This will be shown on your public profile
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Specialty *
          </label>
          <select
            required
            value={formData.specialty}
            onChange={(e) =>
              setFormData({ ...formData, specialty: e.target.value })
            }
            className="glass-input w-full px-4 py-3"
          >
            <option value="">Select specialty</option>
            {COUNSELOR_SPECIALTIES.map((specialty) => (
              <option key={specialty} value={specialty}>
                {specialty}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Price per Hour (XAF) *
          </label>
          <input
            type="number"
            required
            min="0"
            step="1000"
            value={formData.pricePerHour}
            onChange={(e) =>
              setFormData({ ...formData, pricePerHour: e.target.value })
            }
            className="glass-input w-full px-4 py-3"
            placeholder="e.g., 15000"
          />
          <p className="text-xs text-[var(--text-muted)] mt-2">
            This is the hourly rate clients will pay
          </p>
        </div>
      </div>

      {/* Settings */}
      <div className="glass p-6 rounded-xl space-y-4">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          Settings
        </h2>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={formData.available}
            onChange={(e) =>
              setFormData({ ...formData, available: e.target.checked })
            }
            className="w-5 h-5 rounded border-[var(--input-border)] text-[var(--purple)] focus:ring-[var(--purple)]"
          />
          <div>
            <span className="text-[var(--text-secondary)] font-medium">
              Available for Bookings
            </span>
            <p className="text-xs text-[var(--text-muted)]">
              Clients can book sessions with this counselor
            </p>
          </div>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={formData.verified}
            onChange={(e) =>
              setFormData({ ...formData, verified: e.target.checked })
            }
            className="w-5 h-5 rounded border-[var(--input-border)] text-[var(--purple)] focus:ring-[var(--purple)]"
          />
          <div>
            <span className="text-[var(--text-secondary)] font-medium">
              Verified Counselor
            </span>
            <p className="text-xs text-[var(--text-muted)]">
              Show verification badge on profile
            </p>
          </div>
        </label>
      </div>

      {/* Submit */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex items-center gap-2 px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          {loading ? "Creating..." : "Create Counselor"}
        </button>
        <Link
          href="/admin/counselors"
          className="btn-secondary px-6 py-3 rounded-lg"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
