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

/**
 * Truncates a full name to at most the first two words,
 * and caps the total display length at 10 characters (adding "…" if trimmed).
 */
function truncateName(name: string | null | undefined): string {
  if (!name) return "User";

  // Take only the first two words
  const twoWords = name.trim().split(/\s+/).slice(0, 2).join(" ");

  // Cap at 10 characters
  if (twoWords.length <= 10) return twoWords;
  return twoWords.slice(0, 9) + "…";
}

/** Returns the first letter of the name for the avatar fallback. */
function getInitial(name: string | null | undefined): string {
  return name ? name.trim().charAt(0).toUpperCase() : "U";
}

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

  const availableDashboards = dashboards.filter((dash) => {
    if (dash.role === "USER") return true;
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

  const displayName = truncateName(session?.user?.name);
  const initial = getInitial(session?.user?.name);

  /** Shared avatar element */
  const Avatar = (
    <div className="flex-shrink-0">
      {session?.user?.image ? (
        <img
          src={session.user.image}
          alt={session?.user?.name || "User"}
          className="w-8 h-8 rounded-full object-cover"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-[var(--purple)] text-white flex items-center justify-center text-sm font-semibold">
          {initial}
        </div>
      )}
    </div>
  );

  /** Shared dropdown menu */
  const DropdownMenu = (
    <div
      className="absolute top-full mt-2 rounded-lg border shadow-lg overflow-hidden z-[9999]"
      style={{
        background: "var(--bg-base)",
        borderColor: "var(--divider)",
        // Collapsed: center-aligned; expanded: stretch to button width
        ...(collapsed
          ? { left: "50%", transform: "translateX(-50%)", minWidth: "14rem" }
          : { left: 0, right: 0 }),
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
            <Icon
              className="w-4 h-4 flex-shrink-0"
              style={{ color: dash.color }}
            />
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
  );

  // ── Collapsed mode ──────────────────────────────────────────────────────────
  if (collapsed) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center hover:opacity-80 transition-opacity"
          aria-label="Switch dashboard"
        >
          {Avatar}
        </button>
        {isOpen && DropdownMenu}
      </div>
    );
  }

  // ── Single dashboard (no switcher needed) ───────────────────────────────────
  if (availableDashboards.length <= 1) {
    return (
      <div className="flex items-center gap-3 min-w-0">
        {Avatar}
        <div className="min-w-0">
          <p
            className="text-sm font-semibold text-[var(--text-primary)] truncate max-w-[8rem] sm:max-w-full"
            title={session?.user?.name || "User"}
          >
            {displayName}
          </p>
          <p className="text-xs text-[var(--text-secondary)] truncate">
            {currentDashboard?.label.replace(" Dashboard", "")}
          </p>
        </div>
      </div>
    );
  }

  // ── Full switcher ───────────────────────────────────────────────────────────
  const CurrentIcon = currentDashboard?.icon || LayoutDashboard;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 sm:gap-3 hover:bg-[var(--sidebar-item-hover)] rounded-lg p-2 transition-colors min-w-0"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {Avatar}

        <div className="min-w-0 flex-1 text-left overflow-hidden">
          <p
            className="text-sm font-semibold text-[var(--text-primary)] truncate leading-tight"
            title={session?.user?.name || "User"}
          >
            {displayName}
          </p>
          <div className="flex items-center gap-1 min-w-0">
            <CurrentIcon
              className="w-3 h-3 flex-shrink-0"
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

      {isOpen && DropdownMenu}
    </div>
  );
}
