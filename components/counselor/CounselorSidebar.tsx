"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import DashboardSwitcher from "@/components/shared/DashboardSwitcher";
import {
  LayoutDashboard,
  CalendarCheck,
  Clock,
  UserCircle,
  DollarSign,
  Users,
  ChevronLeft,
  ChevronRight,
  PanelLeft,
} from "lucide-react";

const menuItems = [
  { label: "Overview", href: "/counselor", icon: LayoutDashboard },
  { label: "Bookings", href: "/counselor/bookings", icon: CalendarCheck },
  { label: "Availability", href: "/counselor/availability", icon: Clock },
  { label: "Profile", href: "/counselor/profile", icon: UserCircle },
  { label: "Earnings", href: "/counselor/earnings", icon: DollarSign },
  { label: "Clients", href: "/counselor/clients", icon: Users },
];

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="px-3 space-y-1">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/counselor" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg transition-all
              ${
                isActive
                  ? "bg-[var(--sidebar-item-active)] text-[var(--purple)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--sidebar-item-hover)]"
              }
            `}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function CollapsedNavItems() {
  const pathname = usePathname();
  return (
    <nav className="px-3 space-y-1">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/counselor" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            className={`
              flex items-center justify-center px-4 py-3 rounded-lg transition-all
              ${
                isActive
                  ? "bg-[var(--sidebar-item-active)] text-[var(--purple)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--sidebar-item-hover)]"
              }
            `}
          >
            <Icon className="w-5 h-5" />
          </Link>
        );
      })}
    </nav>
  );
}

// ── MOBILE SIDEBAR ──
export function CounselorMobileSidebar({
  session,
}: {
  session?: {
    user?: {
      name?: string | null;
      image?: string | null;
      role?: string | string[];
    };
  } | null;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-20 right-4 z-[1000]
          w-9 h-9 flex items-center justify-center
          rounded-full shadow-lg
          bg-[var(--purple)] text-white
          hover:opacity-90 transition-opacity"
        aria-label="Open sidebar"
      >
        <PanelLeft className="w-4 h-4" />
      </button>

      <div
        className={`
          lg:hidden fixed z-[999] bg-black/50 backdrop-blur-sm
          transition-opacity duration-300
          ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
        style={{ top: "4rem", left: 0, right: 0, bottom: 0 }}
        onClick={() => setMobileOpen(false)}
      />

      <aside
        className="lg:hidden fixed left-0 z-[1000] w-64 bg-[var(--bg-base)] border-r border-[var(--divider)] flex flex-col"
        style={{
          top: "4rem",
          bottom: 0,
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 300ms ease-in-out",
        }}
      >
        <div className="flex items-center justify-between p-6 border-b border-[var(--divider)] flex-shrink-0">
          <DashboardSwitcher session={session} />
        </div>
        <div className="flex-1 py-4 overflow-y-auto">
          <NavItems onNavigate={() => setMobileOpen(false)} />
        </div>
      </aside>
    </>
  );
}

// ── DESKTOP SIDEBAR ──
export default function CounselorSidebar({
  collapsed = false,
  onToggleCollapse,
  session,
}: {
  collapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
  session?: {
    user?: {
      name?: string | null;
      image?: string | null;
      role?: string | string[];
    };
  } | null;
}) {
  return (
    <aside
      className={`
        hidden lg:flex flex-col
        glass-nav border-r border-[var(--divider)]
        fixed top-16 left-0 h-[calc(100vh-4rem)] flex-shrink-0 z-[1000]
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-20" : "w-64"}
      `}
    >
      <div className="flex items-center justify-between p-4 border-b border-[var(--divider)] flex-shrink-0">
        {!collapsed && <DashboardSwitcher session={session} />}
        <button
          onClick={() => onToggleCollapse?.(!collapsed)}
          className={`
            p-2 rounded-lg hover:bg-[var(--sidebar-item-hover)]
            transition-colors flex-shrink-0
            ${collapsed ? "mx-auto" : ""}
          `}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-[var(--text-secondary)]" />
          )}
        </button>
      </div>
      <div className="flex-1 py-4 overflow-y-auto">
        {collapsed ? <CollapsedNavItems /> : <NavItems />}
      </div>
    </aside>
  );
}
