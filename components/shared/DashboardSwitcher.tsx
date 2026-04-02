"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  LayoutDashboard,
  Shield,
  GraduationCap,
  Heart,
} from "lucide-react";

interface DashboardOption {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  role: string;
  color: string;
}

const dashboards: DashboardOption[] = [
  {
    label: "User Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    role: "USER",
    color: "var(--purple)",
  },
  {
    label: "Admin Dashboard",
    href: "/admin",
    icon: Shield,
    role: "ADMIN",
    color: "var(--error-text)",
  },
  {
    label: "Teacher Dashboard",
    href: "/teacher",
    icon: GraduationCap,
    role: "TEACHER",
    color: "var(--blue)",
  },
  {
    label: "Counselor Dashboard",
    href: "/counselor",
    icon: Heart,
    role: "COUNSELOR",
    color: "var(--green)",
  },
];

export default function DashboardSwitcher({
  session,
  collapsed = false,
}: {
  session?: {
    user?: {
      name?: string | null;
      image?: string | null;
      role?: string | string[];
    };
  } | null;
  collapsed?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const userRoles = Array.isArray(session?.user?.role)
    ? session.user.role
    : session?.user?.role
    ? [session.user.role]
    : ["USER"];

  // User Dashboard is available to everyone, other dashboards require specific roles
  const availableDashboards = dashboards.filter((dash) => {
    if (dash.role === "USER") return true; // Everyone can access User Dashboard
    return userRoles.includes(dash.role);
  });

  const currentDashboard =
    availableDashboards.find((dash) => pathname.startsWith(dash.href)) ||
    availableDashboards[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (collapsed) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center hover:opacity-80 transition-opacity"
        >
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || "User"}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[var(--purple)] text-white flex items-center justify-center text-sm font-semibold">
              {session?.user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
        </button>

        {isOpen && (
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 rounded-lg border shadow-lg overflow-hidden z-[9999]"
            style={{
              background: "var(--bg-base)",
              borderColor: "var(--divider)",
            }}
          >
            {availableDashboards.map((dash) => {
              const Icon = dash.icon;
              const isCurrent = dash.href === currentDashboard?.href;
              return (
                <Link
                  key={dash.href}
                  href={dash.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                    isCurrent
                      ? "bg-[var(--sidebar-item-active)]"
                      : "hover:bg-[var(--sidebar-item-hover)]"
                  }`}
                >
                  <Icon className="w-4 h-4" style={{ color: dash.color }} />
                  <span
                    className="text-sm font-medium"
                    style={{
                      color: isCurrent ? dash.color : "var(--text-primary)",
                    }}
                  >
                    {dash.label}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (availableDashboards.length <= 1) {
    return (
      <div className="flex items-center gap-3">
        {session?.user?.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || "User"}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[var(--purple)] text-white flex items-center justify-center text-sm font-semibold">
            {session?.user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
            {session?.user?.name || "User"}
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            {currentDashboard?.label.replace(" Dashboard", "")}
          </p>
        </div>
      </div>
    );
  }

  const CurrentIcon = currentDashboard?.icon || LayoutDashboard;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 hover:bg-[var(--sidebar-item-hover)] rounded-lg p-2 transition-colors"
      >
        {session?.user?.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || "User"}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[var(--purple)] text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
            {session?.user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
        )}
        <div className="min-w-0 flex-1 text-left">
          <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
            {session?.user?.name || "User"}
          </p>
          <div className="flex items-center gap-1">
            <CurrentIcon
              className="w-3 h-3"
              style={{ color: currentDashboard?.color }}
            />
            <p
              className="text-xs truncate"
              style={{ color: currentDashboard?.color }}
            >
              {currentDashboard?.label.replace(" Dashboard", "")}
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-[var(--text-secondary)] transition-transform flex-shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 mt-2 rounded-lg border shadow-lg overflow-hidden z-[9999]"
          style={{
            background: "var(--bg-base)",
            borderColor: "var(--divider)",
          }}
        >
          {availableDashboards.map((dash) => {
            const Icon = dash.icon;
            const isCurrent = dash.href === currentDashboard?.href;
            return (
              <Link
                key={dash.href}
                href={dash.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                  isCurrent
                    ? "bg-[var(--sidebar-item-active)]"
                    : "hover:bg-[var(--sidebar-item-hover)]"
                }`}
              >
                <Icon className="w-4 h-4" style={{ color: dash.color }} />
                <span
                  className="text-sm font-medium"
                  style={{
                    color: isCurrent ? dash.color : "var(--text-primary)",
                  }}
                >
                  {dash.label}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
