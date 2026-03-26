// components/admin/AdminHeader.tsx

"use client";

import { signOut } from "next-auth/react";
import { Bell, LogOut, User } from "lucide-react";

interface AdminHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="glass-nav border-b border-[var(--divider)] sticky top-0 z-50">
      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            GracyGlobal Admin
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="p-2 hover:bg-[var(--glass-bg-hover)] rounded-full transition-colors relative">
            <Bell className="w-5 h-5 text-[var(--text-secondary)]" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--scarlet)] rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {user.name || "Admin"}
              </p>
              <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
            </div>

            {user.image ? (
              <img
                src={user.image}
                alt={user.name || "Admin"}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[var(--purple-faint)] flex items-center justify-center">
                <User className="w-5 h-5 text-[var(--purple)]" />
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-2 hover:bg-[var(--error-bg)] hover:text-[var(--error-text)] rounded-full transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
