"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  AlertTriangle,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Shield,
  ShieldCheck,
  GraduationCap,
  Heart,
  Crown,
  BookOpen,
  Loader2,
  CheckCircle,
  Trash2,
  Calendar,
  ShoppingBag,
  MessageSquare,
  X,
} from "lucide-react";
import Link from "next/link";
import { User, UserRole } from "@prisma/client";
import ImageUpload from "@/components/shared/ImageUpload";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExtendedUser extends User {
  counselorProfile?: {
    id: string;
    specialty: string;
    verified: boolean;
  } | null;
  _count?: {
    bookings: number;
    orders: number;
    communityPosts: number;
    teacherCourses: number;
  };
}

interface EditUserFormProps {
  user: ExtendedUser;
}

// ─── Role config ──────────────────────────────────────────────────────────────

const ROLE_CONFIG: {
  value: UserRole;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
}[] = [
  {
    value: "USER",
    label: "User",
    description:
      "Standard access — browse marketplace, book sessions, apply for jobs, enroll in courses.",
    icon: UserIcon,
    color: "var(--text-secondary)",
    bg: "var(--glass-bg-subtle)",
    border: "var(--glass-border)",
  },
  {
    value: "COUNSELOR",
    label: "Counselor",
    description:
      "Offer counseling services, manage bookings, set availability, track earnings from sessions.",
    icon: Heart,
    color: "var(--blue)",
    bg: "var(--info-bg)",
    border: "var(--info-border)",
  },
  {
    value: "TEACHER",
    label: "Teacher",
    description:
      "Create and manage courses, upload lessons, track student progress, earn from course sales.",
    icon: GraduationCap,
    color: "var(--purple)",
    bg: "var(--badge-purple-bg)",
    border: "rgba(123, 47, 190, 0.25)",
  },
  {
    value: "VOLUNTEER",
    label: "Volunteer",
    description:
      "Participate in community events, volunteer activities, and support programs.",
    icon: ShieldCheck,
    color: "var(--success-text)",
    bg: "var(--success-bg)",
    border: "var(--success-border)",
  },
  {
    value: "ADMIN",
    label: "Administrator",
    description:
      "Full platform access — manage users, content, settings, and all administrative features.",
    icon: Crown,
    color: "var(--scarlet)",
    bg: "var(--error-bg)",
    border: "var(--error-border)",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function EditUserForm({ user }: EditUserFormProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [country, setCountry] = useState(user.country || "");
  const [image, setImage] = useState(user.image || "");
  const [roles, setRoles] = useState<UserRole[]>(
    Array.isArray(user.role) ? user.role : [user.role as UserRole],
  );

  const initialRoles = Array.isArray(user.role)
    ? user.role
    : [user.role as UserRole];

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ── Role toggle ──────────────────────────────────────────────────────────

  const toggleRole = (role: UserRole) => {
    setRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  // ── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (roles.length === 0) {
      setError("User must have at least one role");
      return;
    }

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    // Warn if removing admin
    const isRemovingAdmin =
      initialRoles.includes("ADMIN") && !roles.includes("ADMIN");
    if (isRemovingAdmin) {
      if (
        !confirm(
          "⚠️ You are removing admin privileges from this user. Are you sure?",
        )
      ) {
        return;
      }
    }

    // Warn if adding admin
    const isAddingAdmin =
      !initialRoles.includes("ADMIN") && roles.includes("ADMIN");
    if (isAddingAdmin) {
      if (
        !confirm(
          "⚠️ You are granting ADMIN privileges to this user. They will have full platform access. Continue?",
        )
      ) {
        return;
      }
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          country: country.trim() || null,
          image: image || null,
          role: roles,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update user");
      }

      setSaved(true);
      setTimeout(() => {
        router.push(`/admin/users/${user.id}`);
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Computed ─────────────────────────────────────────────────────────────

  const hasChanges =
    name !== (user.name || "") ||
    email !== user.email ||
    phone !== (user.phone || "") ||
    country !== (user.country || "") ||
    image !== (user.image || "") ||
    JSON.stringify(roles.sort()) !== JSON.stringify([...initialRoles].sort());

  const addedRoles = roles.filter((r) => !initialRoles.includes(r));
  const removedRoles = initialRoles.filter((r) => !roles.includes(r));

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/admin/users/${user.id}`}
          className="p-2 rounded-lg transition-colors hover:bg-[var(--glass-bg-hover)]"
        >
          <ArrowLeft
            className="w-5 h-5"
            style={{ color: "var(--text-muted)" }}
          />
        </Link>
        <div className="flex-1">
          <h1
            className="text-3xl font-extrabold"
            style={{ color: "var(--text-primary)" }}
          >
            Edit User
          </h1>
          <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
            Update profile, roles, and permissions
          </p>
        </div>
        <span
          className="text-xs px-3 py-1.5 rounded-full"
          style={{
            background: "var(--glass-bg-subtle)",
            color: "var(--text-muted)",
          }}
        >
          ID: {user.id.slice(0, 8)}…
        </span>
      </div>

      {/* Success */}
      {saved && (
        <div
          className="p-4 rounded-xl flex items-center gap-3 text-sm font-medium"
          style={{
            background: "var(--success-bg)",
            color: "var(--success-text)",
            border: "1px solid var(--success-border)",
          }}
        >
          <CheckCircle className="w-5 h-5" />
          User updated successfully! Redirecting...
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="p-4 rounded-xl flex items-center justify-between text-sm"
          style={{
            background: "var(--error-bg)",
            color: "var(--error-text)",
            border: "1px solid var(--error-border)",
          }}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
          <button onClick={() => setError("")}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Profile Picture + Basic Info ── */}
        <div
          className="p-6 rounded-2xl"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <h2
            className="text-lg font-bold mb-5"
            style={{ color: "var(--text-primary)" }}
          >
            Profile
          </h2>

          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="w-full sm:w-auto">
              <ImageUpload
                folder="users/avatars"
                label="Profile Photo"
                currentImage={image}
                aspectRatio="square"
                maxSize={5}
                onUploadComplete={(url) => setImage(url)}
              />
            </div>

            {/* Name + Email fields */}
            <div className="flex-1 w-full space-y-4">
              <div>
                <label
                  className="flex items-center gap-1.5 text-sm font-semibold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  <UserIcon
                    className="w-3.5 h-3.5"
                    style={{ color: "var(--text-muted)" }}
                  />
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full p-3 rounded-xl glass-input text-sm"
                  required
                />
              </div>

              <div>
                <label
                  className="flex items-center gap-1.5 text-sm font-semibold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  <Mail
                    className="w-3.5 h-3.5"
                    style={{ color: "var(--text-muted)" }}
                  />
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full p-3 rounded-xl glass-input text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className="flex items-center gap-1.5 text-sm font-semibold mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    <Phone
                      className="w-3.5 h-3.5"
                      style={{ color: "var(--text-muted)" }}
                    />
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+237 6XX XXX XXX"
                    className="w-full p-3 rounded-xl glass-input text-sm"
                  />
                </div>

                <div>
                  <label
                    className="flex items-center gap-1.5 text-sm font-semibold mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    <MapPin
                      className="w-3.5 h-3.5"
                      style={{ color: "var(--text-muted)" }}
                    />
                    Country
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Cameroon"
                    className="w-full p-3 rounded-xl glass-input text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Member info bar */}
          <div
            className="mt-5 pt-4 flex items-center gap-6 flex-wrap text-xs"
            style={{
              borderTop: "1px solid var(--divider)",
              color: "var(--text-muted)",
            }}
          >
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Joined {memberSince}
            </span>
            {user._count && (
              <>
                <span className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5" />
                  {user._count.bookings} bookings
                </span>
                <span className="flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  {user._count.orders} orders
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  {user._count.communityPosts} posts
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  {user._count.teacherCourses} courses
                </span>
              </>
            )}
          </div>
        </div>

        {/* ── Roles ── */}
        <div
          className="p-6 rounded-2xl"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <h2
              className="text-lg font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Roles & Permissions
            </h2>
            <span
              className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{
                background: "var(--badge-purple-bg)",
                color: "var(--badge-purple-text)",
              }}
            >
              {roles.length} role{roles.length !== 1 ? "s" : ""} selected
            </span>
          </div>
          <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
            Select one or more roles. Each role grants additional platform
            access.
          </p>

          <div className="space-y-3">
            {ROLE_CONFIG.map(
              ({
                value,
                label,
                description,
                icon: Icon,
                color,
                bg,
                border,
              }) => {
                const isSelected = roles.includes(value);
                const wasAdded = addedRoles.includes(value);
                const wasRemoved = removedRoles.includes(value);

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleRole(value)}
                    className="w-full text-left p-4 rounded-xl transition-all duration-200 hover:scale-[1.005]"
                    style={{
                      background: isSelected ? bg : "var(--glass-bg-subtle)",
                      border: isSelected
                        ? `2px solid ${border}`
                        : "2px solid transparent",
                      boxShadow: isSelected ? "var(--glass-shadow)" : "none",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <div
                        className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                        style={{
                          background: isSelected
                            ? `linear-gradient(135deg, ${color}, var(--purple))`
                            : "var(--glass-bg)",
                          border: isSelected
                            ? "none"
                            : "2px solid var(--glass-border)",
                        }}
                      >
                        {isSelected && (
                          <CheckCircle
                            className="w-3.5 h-3.5 text-white"
                            strokeWidth={3}
                          />
                        )}
                      </div>

                      {/* Icon */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: isSelected ? bg : "var(--glass-bg)",
                          border: `1px solid ${isSelected ? border : "var(--glass-border)"}`,
                        }}
                      >
                        <Icon
                          className="w-5 h-5"
                          style={{
                            color: isSelected ? color : "var(--text-disabled)",
                          }}
                        />
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span
                            className="font-bold text-sm"
                            style={{
                              color: isSelected
                                ? "var(--text-primary)"
                                : "var(--text-secondary)",
                            }}
                          >
                            {label}
                          </span>

                          {/* Change indicator */}
                          {wasAdded && (
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                              style={{
                                background: "var(--success-bg)",
                                color: "var(--success-text)",
                              }}
                            >
                              + NEW
                            </span>
                          )}
                          {wasRemoved && (
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                              style={{
                                background: "var(--error-bg)",
                                color: "var(--error-text)",
                              }}
                            >
                              − REMOVING
                            </span>
                          )}
                        </div>
                        <p
                          className="text-xs leading-relaxed"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {description}
                        </p>

                        {/* Extra info for counselor */}
                        {value === "COUNSELOR" &&
                          isSelected &&
                          user.counselorProfile && (
                            <div
                              className="mt-2 flex items-center gap-2 text-xs"
                              style={{ color }}
                            >
                              <ShieldCheck className="w-3 h-3" />
                              Has counselor profile (
                              {user.counselorProfile.specialty})
                              {user.counselorProfile.verified && " • Verified"}
                            </div>
                          )}

                        {value === "COUNSELOR" &&
                          isSelected &&
                          !user.counselorProfile && (
                            <div
                              className="mt-2 flex items-center gap-2 text-xs"
                              style={{ color: "var(--warning-text)" }}
                            >
                              <AlertTriangle className="w-3 h-3" />
                              No counselor profile yet — create one in{" "}
                              <Link
                                href="/admin/counselors/create"
                                className="underline font-semibold"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Counselors
                              </Link>
                            </div>
                          )}

                        {/* Extra info for teacher */}
                        {value === "TEACHER" && isSelected && user._count && (
                          <div
                            className="mt-2 flex items-center gap-2 text-xs"
                            style={{ color }}
                          >
                            <BookOpen className="w-3 h-3" />
                            {user._count.teacherCourses} course
                            {user._count.teacherCourses !== 1 ? "s" : ""}{" "}
                            created
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              },
            )}
          </div>

          {/* Role warning */}
          {roles.length === 0 && (
            <div
              className="mt-4 p-3 rounded-xl text-sm flex items-center gap-2"
              style={{
                background: "var(--error-bg)",
                color: "var(--error-text)",
                border: "1px solid var(--error-border)",
              }}
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              User must have at least one role selected.
            </div>
          )}
        </div>

        {/* ── Changes Summary ── */}
        {hasChanges && (
          <div
            className="p-5 rounded-2xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(123,47,190,0.06), rgba(26,58,219,0.04))",
              border: "1px solid var(--glass-border)",
            }}
          >
            <h3
              className="text-sm font-bold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              📝 Pending Changes
            </h3>
            <div
              className="space-y-1.5 text-xs"
              style={{ color: "var(--text-secondary)" }}
            >
              {name !== (user.name || "") && (
                <p>
                  Name:{" "}
                  <span style={{ color: "var(--text-muted)" }}>
                    {user.name || "—"}
                  </span>{" "}
                  →{" "}
                  <span
                    style={{ color: "var(--text-primary)" }}
                    className="font-semibold"
                  >
                    {name}
                  </span>
                </p>
              )}
              {email !== user.email && (
                <p>
                  Email:{" "}
                  <span style={{ color: "var(--text-muted)" }}>
                    {user.email}
                  </span>{" "}
                  →{" "}
                  <span
                    style={{ color: "var(--text-primary)" }}
                    className="font-semibold"
                  >
                    {email}
                  </span>
                </p>
              )}
              {phone !== (user.phone || "") && (
                <p>
                  Phone:{" "}
                  <span style={{ color: "var(--text-muted)" }}>
                    {user.phone || "—"}
                  </span>{" "}
                  →{" "}
                  <span
                    style={{ color: "var(--text-primary)" }}
                    className="font-semibold"
                  >
                    {phone || "—"}
                  </span>
                </p>
              )}
              {country !== (user.country || "") && (
                <p>
                  Country:{" "}
                  <span style={{ color: "var(--text-muted)" }}>
                    {user.country || "—"}
                  </span>{" "}
                  →{" "}
                  <span
                    style={{ color: "var(--text-primary)" }}
                    className="font-semibold"
                  >
                    {country || "—"}
                  </span>
                </p>
              )}
              {image !== (user.image || "") && (
                <p>
                  Profile photo:{" "}
                  <span
                    style={{ color: "var(--text-primary)" }}
                    className="font-semibold"
                  >
                    {image ? "Updated" : "Removed"}
                  </span>
                </p>
              )}
              {addedRoles.length > 0 && (
                <p>
                  Roles added:{" "}
                  {addedRoles.map((r) => (
                    <span
                      key={r}
                      className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold mr-1"
                      style={{
                        background: "var(--success-bg)",
                        color: "var(--success-text)",
                      }}
                    >
                      +{r}
                    </span>
                  ))}
                </p>
              )}
              {removedRoles.length > 0 && (
                <p>
                  Roles removed:{" "}
                  {removedRoles.map((r) => (
                    <span
                      key={r}
                      className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold mr-1"
                      style={{
                        background: "var(--error-bg)",
                        color: "var(--error-text)",
                      }}
                    >
                      −{r}
                    </span>
                  ))}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Admin Warning ── */}
        {(addedRoles.includes("ADMIN") || removedRoles.includes("ADMIN")) && (
          <div
            className="p-4 rounded-xl flex items-start gap-3"
            style={{
              background: "var(--warning-bg)",
              border: "1px solid var(--warning-border)",
            }}
          >
            <Shield
              className="w-5 h-5 flex-shrink-0 mt-0.5"
              style={{ color: "var(--warning-text)" }}
            />
            <div className="text-sm" style={{ color: "var(--warning-text)" }}>
              <p className="font-bold mb-1">Admin Privilege Change</p>
              <p>
                {addedRoles.includes("ADMIN")
                  ? "This user will gain full administrative access to the platform including user management, content moderation, and system settings."
                  : "This user will lose all administrative privileges. They will no longer be able to access the admin dashboard."}
              </p>
            </div>
          </div>
        )}

        {/* ── Actions ── */}
        <div
          className="flex items-center justify-between pt-4"
          style={{ borderTop: "1px solid var(--divider)" }}
        >
          <Link
            href={`/admin/users/${user.id}`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              color: "var(--text-secondary)",
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading || !hasChanges || roles.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            style={{
              background: hasChanges
                ? "linear-gradient(135deg, var(--purple), var(--blue))"
                : "var(--glass-bg-strong)",
              boxShadow: hasChanges
                ? "0 4px 16px rgba(123,47,190,0.4)"
                : "none",
              color: hasChanges ? "#fff" : "var(--text-disabled)",
            }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
