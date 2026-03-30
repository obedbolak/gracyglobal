// components/admin/EditUserForm.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { User, UserRole } from "@prisma/client";

const userRoles: UserRole[] = ["USER", "COUNSELOR", "VOLUNTEER", "ADMIN"];

interface EditUserFormProps {
  user: User;
}

export default function EditUserForm({ user }: EditUserFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<UserRole[]>(
    Array.isArray(user.role) ? user.role : [user.role as UserRole],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const initialRoles = Array.isArray(user.role)
      ? user.role
      : [user.role as UserRole];
    const isSelfAdminDemotion =
      user.id === user.id &&
      initialRoles.includes("ADMIN") &&
      !roles.includes("ADMIN");

    if (isSelfAdminDemotion) {
      if (
        !confirm(
          "Are you sure you want to remove admin privileges from this user?",
        )
      ) {
        return;
      }
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: roles }),
      });

      if (!response.ok) throw new Error("Failed to update user");

      router.push(`/admin/users/${user.id}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/admin/users/${user.id}`}
          className="p-2 hover:bg-[var(--glass-bg-hover)] rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Edit User Role
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Change user role and permissions
          </p>
        </div>
      </div>

      {/* Warning */}
      <div className="glass p-4 rounded-xl bg-[var(--warning-bg)] border border-[var(--warning-border)]">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[var(--warning-text)] flex-shrink-0 mt-0.5" />
          <div className="text-sm text-[var(--warning-text)]">
            <p className="font-semibold mb-1">Important Notice</p>
            <p>
              Changing a user's role will affect their access permissions. Users
              cannot be deleted from the system for data integrity purposes.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Info */}
        <div className="glass p-6 rounded-xl">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            User Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                Name
              </label>
              <p className="text-[var(--text-primary)]">
                {user.name || "No name"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                Email
              </label>
              <p className="text-[var(--text-primary)]">{user.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                Current Role
              </label>
              {(Array.isArray(user.role) ? user.role : [user.role]).map(
                (role) => (
                  <span
                    key={role}
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      role === "ADMIN"
                        ? "bg-[var(--scarlet-faint)] text-[var(--scarlet)]"
                        : role === "COUNSELOR"
                          ? "bg-[var(--blue-faint)] text-[var(--blue)]"
                          : role === "VOLUNTEER"
                            ? "bg-[var(--purple-faint)] text-[var(--purple)]"
                            : "badge-neutral"
                    }`}
                  >
                    {role}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>

        {/* Role Selection */}
        <div className="glass p-6 rounded-xl">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Change Roles
          </h2>

          <div className="space-y-3">
            {userRoles.map((roleOption) => (
              <label
                key={roleOption}
                className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  roles.includes(roleOption)
                    ? "border-[var(--purple)] bg-[var(--purple-faint)]"
                    : "border-[var(--divider)] hover:border-[var(--purple-light)]"
                }`}
              >
                <input
                  type="checkbox"
                  checked={roles.includes(roleOption)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setRoles([...roles, roleOption]);
                    } else {
                      setRoles(roles.filter((r) => r !== roleOption));
                    }
                  }}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="font-semibold text-[var(--text-primary)]">
                    {roleOption}
                  </p>
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    {roleOption === "ADMIN" &&
                      "Full access to admin dashboard and all management features"}
                    {roleOption === "COUNSELOR" &&
                      "Can offer counseling services and manage client bookings"}
                    {roleOption === "VOLUNTEER" &&
                      "Can participate in volunteer activities and events"}
                    {roleOption === "USER" &&
                      "Standard user access with no special privileges"}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || roles.length === 0}
            className="btn-primary flex items-center gap-2 px-6 py-3 rounded-lg disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {loading ? "Updating..." : "Update Roles"}
          </button>
          <Link
            href={`/admin/users/${user.id}`}
            className="btn-secondary px-6 py-3 rounded-lg"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
