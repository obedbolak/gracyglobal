"use client";
import React, { useEffect, useState } from "react";

type User = any;

export default function UsersLiveTable({
  initialUsers = [],
}: {
  initialUsers?: User[];
}) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    async function fetchUsers() {
      setLoading(true);
      try {
        const qs = new URLSearchParams();
        if (search) qs.set("search", search);
        if (role) qs.set("role", role);
        if (status) qs.set("status", status);
        const res = await fetch(`/api/admin/users?${qs.toString()}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (mounted) setUsers(data.users || []);
      } catch (e) {
        if ((e as any).name !== "AbortError") console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    const id = setTimeout(fetchUsers, 250);
    return () => {
      mounted = false;
      controller.abort();
      clearTimeout(id);
    };
  }, [search, role, status]);

  return (
    <div>
      <div className="glass p-4 rounded-xl mb-4">
        <div className="flex gap-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="glass-input px-4 py-2.5 flex-1"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="glass-input px-4 py-2.5"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="COUNSELOR">Counselor</option>
            <option value="VOLUNTEER">Volunteer</option>
            <option value="USER">User</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="glass-input px-4 py-2.5"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

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
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-[var(--glass-bg-subtle)] transition-colors"
                >
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

                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(Array.isArray(user.role) ? user.role : [user.role]).map(
                        (r: string) => (
                          <span
                            key={r}
                            className="px-2 py-1 rounded-full text-xs font-medium bg-[var(--badge-neutral-bg)] text-[var(--badge-neutral-text)]"
                          >
                            {r}
                          </span>
                        ),
                      )}
                    </div>
                  </td>

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

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                      <span>{user._count.enrollments} courses</span>
                      <span>•</span>
                      <span>{user._count.bookings} bookings</span>
                      <span>•</span>
                      <span>{user._count.orders} orders</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>

                  <td className="px-6 py-4 text-right">
                    {/* Keep actions client-side or route links */}
                    <a
                      href={`/admin/users/${user.id}`}
                      className="text-sm text-[var(--blue)]"
                    >
                      Manage
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
