// app/admin/users/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, Search, Shield, UserCheck } from "lucide-react";
import UsersLiveTable from "@/components/admin/UsersLiveTable";

export default async function UsersPage() {
  // Server can still provide an initial dataset if desired — for now we'll
  // render the client live table which fetches data itself.
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          User Management
        </h1>
        <p className="text-[var(--text-muted)] mt-1">
          Manage all platform users
        </p>
      </div>

      <UsersLiveTable />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          User Management
        </h1>
        <p className="text-[var(--text-muted)] mt-1">
          Manage all platform users
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--text-muted)]">
              Total Users
            </span>
            <Users className="w-5 h-5 text-[var(--purple)]" />
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">
            {stats.total}
          </p>
        </div>

        <div className="glass p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--text-muted)]">Admins</span>
            <Shield className="w-5 h-5 text-[var(--scarlet)]" />
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">
            {stats.admins}
          </p>
        </div>

        <div className="glass p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--text-muted)]">Counselors</span>
            <UserCheck className="w-5 h-5 text-[var(--blue)]" />
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">
            {stats.counselors}
          </p>
        </div>

        <div className="glass p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--text-muted)]">Volunteers</span>
            <UserCheck className="w-5 h-5 text-[var(--purple)]" />
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">
            {stats.volunteers}
          </p>
        </div>

        <div className="glass p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--text-muted)]">Regular</span>
            <Users className="w-5 h-5 text-[var(--text-muted)]" />
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">
            {stats.users}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass p-4 rounded-xl">
        <form method="get" className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
              <UsersSearch defaultValue={search} />
            </div>
          </div>

          <select
            name="role"
            defaultValue={role}
            className="glass-input px-4 py-2.5"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="COUNSELOR">Counselor</option>
            <option value="VOLUNTEER">Volunteer</option>
            <option value="USER">User</option>
          </select>

          <select
            name="status"
            defaultValue={status}
            className="glass-input px-4 py-2.5"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <div className="ml-auto">
            <button type="submit" className="btn-primary px-4 py-2.5">
              Apply
            </button>
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--glass-bg-strong)] border-b border-[var(--divider)]">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-secondary)]">
                  User
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-secondary)]">
                  Role
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-secondary)]">
                  Subscription
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-secondary)]">
                  Activity
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-secondary)]">
                  Joined
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-[var(--text-secondary)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--divider)]">
              {usersWithSubscription.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-[var(--glass-bg-subtle)] transition-colors"
                >
                  {/* User Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name || "User"}
                          className="w-10 h-10 rounded-full object-cover z-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[var(--purple-faint)] flex items-center justify-center">
                          <span className="text-[var(--purple)] font-semibold">
                            {user.name?.charAt(0) ||
                              user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">
                          {user.name || "No name"}
                        </p>
                        <p className="text-sm text-[var(--text-muted)]">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(Array.isArray(user.role) ? user.role : [user.role]).map(
                        (role) => (
                          <span
                            key={role}
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              role === "ADMIN"
                                ? "bg-[var(--badge-scarlet-bg)] text-[var(--badge-scarlet-text)]"
                                : role === "COUNSELOR"
                                  ? "bg-[var(--badge-blue-bg)] text-[var(--badge-blue-text)]"
                                  : role === "VOLUNTEER"
                                    ? "bg-[var(--badge-purple-bg)] text-[var(--badge-purple-text)]"
                                    : "bg-[var(--badge-neutral-bg)] text-[var(--badge-neutral-text)]"
                            }`}
                          >
                            {role}
                          </span>
                        ),
                      )}
                    </div>
                  </td>

                  {/* Subscription */}
                  <td className="px-6 py-4">
                    {user.subscription ? (
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          {user.subscription.plan.name}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {user.subscription.status}
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm text-[var(--text-muted)]">
                        Free
                      </span>
                    )}
                  </td>

                  {/* Activity */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                      <span>{user._count.enrollments} courses</span>
                      <span>•</span>
                      <span>{user._count.bookings} bookings</span>
                      <span>•</span>
                      <span>{user._count.orders} orders</span>
                    </div>
                  </td>

                  {/* Joined Date */}
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <UserActions
                      userId={user.id}
                      userName={user.name || user.email}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {users.length === 0 && (
        <div className="glass rounded-xl p-12 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-[var(--text-muted)]" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            No users found
          </h3>
          <p className="text-[var(--text-muted)]">
            Users will appear here once they sign up
          </p>
        </div>
      )}
    </div>
  );
}
