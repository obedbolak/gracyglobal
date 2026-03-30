// components/admin/CreateCounselorForm.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Save, X, User, Search, UserPlus, Users, Check } from "lucide-react";
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

type Mode = "new" | "existing";

interface ExistingUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  country?: string;
  role: string;
}

export default function CreateCounselorForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("new");
  const [image, setImage] = useState<string>("");

  // Existing user search state
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<ExistingUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ExistingUser | null>(null);

  // New user form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    country: "CM",
    bio: "",
    specialty: "",
    customSpecialty: "",
    pricePerHour: "",
    available: true,
    verified: false,
  });

  // Counselor profile fields (shared between both modes)
  const [counselorData, setCounselorData] = useState({
    bio: "",
    specialty: "",
    customSpecialty: "",
    pricePerHour: "",
    available: true,
    verified: false,
  });

  // Debounced search for existing users
  // Replace the searchUsers callback
  const searchUsers = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setUserResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await fetch(
        `/api/users?search=${encodeURIComponent(query)}&excludeCounselors=true`,
      );

      console.log("Search status:", res.status); // Add this to debug

      if (!res.ok) {
        const errData = await res.json();
        console.error("Search error:", errData);
        setUserResults([]);
        return;
      }

      const data = await res.json();
      console.log("Search results:", data); // Add this to debug
      setUserResults(data.users || []);
    } catch (err) {
      console.error("User search failed:", err);
      setUserResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(userSearch);
    }, 400);
    return () => clearTimeout(timer);
  }, [userSearch, searchUsers]);

  const handleSelectUser = (user: ExistingUser) => {
    setSelectedUser(user);
    setUserSearch("");
    setUserResults([]);
  };

  const handleSubmitNewUser = async (e: React.FormEvent) => {
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
      // Step 1: Create user
      const userResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          country: formData.country,
          role: "COUNSELOR",
          image: image,
        }),
      });

      if (!userResponse.ok) {
        const error = await userResponse.json();
        throw new Error(error.error || "Failed to create user");
      }

      const { user } = await userResponse.json();

      // Step 2: Create counselor profile
      const counselorResponse = await fetch("/api/counselors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          bio: formData.bio,
          specialty:
            formData.specialty === "Other"
              ? formData.customSpecialty
              : formData.specialty,
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

  const handleSubmitExistingUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser) {
      alert("Please select an existing user");
      return;
    }
    if (!counselorData.specialty || !counselorData.pricePerHour) {
      alert("Specialty and price per hour are required");
      return;
    }

    setLoading(true);
    try {
      // Step 1: Update user role to COUNSELOR and image if provided
      const updateData: any = { role: "COUNSELOR" };
      if (image) {
        updateData.image = image;
      }

      const roleResponse = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!roleResponse.ok) {
        const error = await roleResponse.json();
        throw new Error(error.error || "Failed to update user role");
      }

      // Step 2: Create counselor profile
      const counselorResponse = await fetch("/api/counselors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          bio: counselorData.bio,
          specialty:
            counselorData.specialty === "Other"
              ? counselorData.customSpecialty
              : counselorData.specialty,
          pricePerHour: parseInt(counselorData.pricePerHour),
          available: counselorData.available,
          verified: counselorData.verified,
        }),
      });

      if (!counselorResponse.ok) {
        const error = await counselorResponse.json();
        throw new Error(error.error || "Failed to create counselor profile");
      }

      router.push("/admin/counselors");
      router.refresh();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to promote user to counselor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="glass p-2 rounded-xl flex gap-2">
        <button
          type="button"
          onClick={() => setMode("new")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
            mode === "new"
              ? "bg-[var(--purple)] text-white shadow"
              : "text-[var(--text-secondary)] hover:bg-[var(--glass-bg-hover)]"
          }`}
        >
          <UserPlus className="w-4 h-4" />
          Create New User
        </button>
        <button
          type="button"
          onClick={() => setMode("existing")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
            mode === "existing"
              ? "bg-[var(--purple)] text-white shadow"
              : "text-[var(--text-secondary)] hover:bg-[var(--glass-bg-hover)]"
          }`}
        >
          <Users className="w-4 h-4" />
          Select Existing User
        </button>
      </div>

      {/* ── NEW USER FLOW ── */}
      {mode === "new" && (
        <form onSubmit={handleSubmitNewUser} className="space-y-6">
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
                <div className="w-full max-w-sm">
                  <ImageUpload
                    folder="counselors"
                    label="Upload Profile Image"
                    onUploadComplete={(file) => {
                      if (typeof file === "string") {
                        setImage(file);
                      } else if (
                        file &&
                        typeof file === "object" &&
                        "url" in file
                      ) {
                        setImage((file as any).url);
                      }
                    }}
                  />
                </div>
              )}
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
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
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
          <ProfessionalInfoSection
            bio={formData.bio}
            specialty={formData.specialty}
            customSpecialty={formData.customSpecialty}
            pricePerHour={formData.pricePerHour}
            available={formData.available}
            verified={formData.verified}
            onChange={(field, value) =>
              setFormData({ ...formData, [field]: value })
            }
          />

          <FormActions loading={loading} label="Create Counselor" />
        </form>
      )}

      {/* ── EXISTING USER FLOW ── */}
      {mode === "existing" && (
        <form onSubmit={handleSubmitExistingUser} className="space-y-6">
          {/* User Search */}
          <div className="glass p-6 rounded-xl space-y-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Select User
            </h2>

            {/* Selected user card */}
            {selectedUser ? (
              <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--purple)] bg-[var(--purple)]/5">
                <div className="flex items-center gap-3">
                  {selectedUser.image ? (
                    <img
                      src={selectedUser.image}
                      alt={selectedUser.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[var(--glass-bg)] flex items-center justify-center">
                      <User className="w-5 h-5 text-[var(--text-muted)]" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">
                      {selectedUser.name}
                    </p>
                    <p className="text-sm text-[var(--text-muted)]">
                      {selectedUser.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-sm text-[var(--purple)] font-medium">
                    <Check className="w-4 h-4" /> Selected
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="p-1 hover:bg-[var(--glass-bg-hover)] rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-[var(--text-muted)]" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Search input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="glass-input w-full pl-10 pr-4 py-3"
                    placeholder="Search by name or email..."
                  />
                  {searchLoading && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]">
                      Searching...
                    </span>
                  )}
                </div>

                {/* Results dropdown */}
                {userResults.length > 0 && (
                  <div className="border border-[var(--divider)] rounded-lg overflow-hidden">
                    {userResults.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleSelectUser(user)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-[var(--glass-bg-hover)] transition-colors text-left border-b border-[var(--divider)] last:border-0"
                      >
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name}
                            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[var(--glass-bg)] flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-[var(--text-muted)]" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-[var(--text-primary)] truncate">
                            {user.name}
                          </p>
                          <p className="text-sm text-[var(--text-muted)] truncate">
                            {user.email}
                          </p>
                        </div>
                        <span className="ml-auto text-xs px-2 py-1 rounded-full bg-[var(--glass-bg)] text-[var(--text-muted)] flex-shrink-0">
                          {user.role}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {userSearch.length >= 2 &&
                  !searchLoading &&
                  userResults.length === 0 && (
                    <p className="text-sm text-[var(--text-muted)] text-center py-3">
                      No users found matching &quot;{userSearch}&quot;
                    </p>
                  )}

                <p className="text-xs text-[var(--text-muted)]">
                  Only users without an existing counselor profile are shown.
                  Their role will be updated to <strong>COUNSELOR</strong> upon
                  saving.
                </p>
              </>
            )}
          </div>

          {/* Profile Image */}
          {selectedUser && (
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
                  <div className="w-full max-w-sm">
                    <ImageUpload
                      folder="counselors"
                      label="Upload Profile Image"
                      onUploadComplete={(file) => {
                        if (typeof file === "string") {
                          setImage(file);
                        } else if (
                          file &&
                          typeof file === "object" &&
                          "url" in file
                        ) {
                          setImage((file as any).url);
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Professional Information */}
          <ProfessionalInfoSection
            bio={counselorData.bio}
            specialty={counselorData.specialty}
            customSpecialty={counselorData.customSpecialty}
            pricePerHour={counselorData.pricePerHour}
            available={counselorData.available}
            verified={counselorData.verified}
            onChange={(field, value) =>
              setCounselorData({ ...counselorData, [field]: value })
            }
          />

          <FormActions loading={loading} label="Promote to Counselor" />
        </form>
      )}
    </div>
  );
}

// ── Shared sub-components ──────────────────────────────────────────────────

interface ProfessionalInfoProps {
  bio: string;
  specialty: string;
  customSpecialty: string;
  pricePerHour: string;
  available: boolean;
  verified: boolean;
  onChange: (field: string, value: string | boolean) => void;
}

function ProfessionalInfoSection({
  bio,
  specialty,
  customSpecialty,
  pricePerHour,
  available,
  verified,
  onChange,
}: ProfessionalInfoProps) {
  return (
    <>
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
            value={bio}
            onChange={(e) => onChange("bio", e.target.value)}
            rows={5}
            className="glass-input w-full px-4 py-3 resize-none"
            placeholder="Tell clients about your background, experience, and approach to counseling..."
          />
          <p className="text-xs text-[var(--text-muted)] mt-2">
            This will be shown on the public profile
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Specialty *
          </label>
          <select
            required
            value={specialty}
            onChange={(e) => onChange("specialty", e.target.value)}
            className="glass-input w-full px-4 py-3"
          >
            <option value="">Select specialty</option>
            {COUNSELOR_SPECIALTIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {specialty === "Other" && (
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Specify Your Specialty *
            </label>
            <input
              type="text"
              required
              value={customSpecialty}
              onChange={(e) => onChange("customSpecialty", e.target.value)}
              className="glass-input w-full px-4 py-3"
              placeholder="e.g., Sports Psychology, Child Counseling, etc."
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Price per Hour (XAF) *
          </label>
          <input
            type="number"
            required
            min="0"
            step="1000"
            value={pricePerHour}
            onChange={(e) => onChange("pricePerHour", e.target.value)}
            className="glass-input w-full px-4 py-3"
            placeholder="e.g., 15000"
          />
          <p className="text-xs text-[var(--text-muted)] mt-2">
            This is the hourly rate clients will pay
          </p>
        </div>
      </div>

      <div className="glass p-6 rounded-xl space-y-4">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          Settings
        </h2>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={available}
            onChange={(e) => onChange("available", e.target.checked)}
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
            checked={verified}
            onChange={(e) => onChange("verified", e.target.checked)}
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
    </>
  );
}

function FormActions({ loading, label }: { loading: boolean; label: string }) {
  return (
    <div className="flex gap-4">
      <button
        type="submit"
        disabled={loading}
        className="btn-primary flex items-center gap-2 px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Save className="w-5 h-5" />
        {loading ? "Saving..." : label}
      </button>
      <Link
        href="/admin/counselors"
        className="btn-secondary px-6 py-3 rounded-lg"
      >
        Cancel
      </Link>
    </div>
  );
}
