// components/dashboard/UserSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import DashboardSwitcher from "@/components/shared/DashboardSwitcher";
import {
  LayoutDashboard,
  BookOpen,
  ShoppingBag,
  Briefcase,
  MessageSquare,
  Heart,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  PanelLeft,
} from "lucide-react";

// ── Menu Items ────────────────────────────────────────────────────────────────

const menuItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Courses", href: "/dashboard/my-courses", icon: BookOpen },
  { label: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
  { label: "Jobs", href: "/jobs", icon: Briefcase },
  { label: "Community", href: "/dashboard/community", icon: MessageSquare },
  { label: "Counseling", href: "/counselors", icon: Heart },
  { label: "Affiliate", href: "/dashboard/affiliate-dashboard", icon: Users },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

// ── My Store Link ─────────────────────────────────────────────────────────────
// NOTE: useSubscription only returns ONE subscription (the latest).
// It checks if that sub is MARKETPLACE or SERVICE category.
// If your user can have both at once, consider fetching all subs server-side
// (already done in the page.tsx) — this sidebar just shows the link.

function MyStoreNavItem({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { subscription, loading } = useSubscription();

  const isStoreActive = pathname.startsWith("/dashboard/store");
  const isServicesActive = pathname.startsWith("/dashboard/services");

  const hasMerchantSub =
    subscription?.status === "ACTIVE" &&
    (subscription.plan.category === "MARKETPLACE" ||
      subscription.plan.category === "SERVICE");

  if (loading) return null;

  return (
    <div className="px-3 mt-1">
      <div className="flex items-center gap-2 px-4 py-2">
        <div className="flex-1 h-px bg-[var(--divider)]" />
        <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-secondary)] opacity-60">
          Merchant
        </span>
        <div className="flex-1 h-px bg-[var(--divider)]" />
      </div>

      <Link
        href="/dashboard/store"
        onClick={onNavigate}
        className={`
          flex items-center gap-3 px-4 py-3 rounded-lg transition-all
          ${
            isStoreActive
              ? "bg-[var(--sidebar-item-active)] text-[var(--purple)]"
              : "text-[var(--text-secondary)] hover:bg-[var(--sidebar-item-hover)]"
          }
        `}
      >
        <Store className="w-5 h-5 flex-shrink-0" />
        <span className="font-medium truncate flex-1">My Store</span>
        {!hasMerchantSub && <Lock className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />}
      </Link>

      <Link
        href="/dashboard/services"
        onClick={onNavigate}
        className={`
          flex items-center gap-3 px-4 py-3 rounded-lg transition-all
          ${
            isServicesActive
              ? "bg-[var(--sidebar-item-active)] text-[var(--purple)]"
              : "text-[var(--text-secondary)] hover:bg-[var(--sidebar-item-hover)]"
          }
        `}
      >
        <Wrench className="w-5 h-5 flex-shrink-0" />
        <span className="font-medium truncate flex-1">My Services</span>
        {!hasMerchantSub && <Lock className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />}
      </Link>
    </div>
  );
}

// Collapsed version — icon only
function CollapsedMyStoreItem() {
  const pathname = usePathname();
  const isStoreActive = pathname.startsWith("/dashboard/store");
  const isServicesActive = pathname.startsWith("/dashboard/services");

  return (
    <div className="px-3 mt-1">
      <div className="w-full h-px bg-[var(--divider)] mb-1" />
      <Link
        href="/dashboard/store"
        title="My Store"
        className={`
          flex items-center justify-center px-4 py-3 rounded-lg transition-all
          ${
            isStoreActive
              ? "bg-[var(--sidebar-item-active)] text-[var(--purple)]"
              : "text-[var(--text-secondary)] hover:bg-[var(--sidebar-item-hover)]"
          }
        `}
      >
        <Store className="w-5 h-5" />
      </Link>
      <Link
        href="/dashboard/services"
        title="My Services"
        className={`
          flex items-center justify-center px-4 py-3 rounded-lg transition-all
          ${
            isServicesActive
              ? "bg-[var(--sidebar-item-active)] text-[var(--purple)]"
              : "text-[var(--text-secondary)] hover:bg-[var(--sidebar-item-hover)]"
          }
        `}
      >
        <Wrench className="w-5 h-5" />
      </Link>
    </div>
  );
}

// ── Nav Items ─────────────────────────────────────────────────────────────────

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="px-3 space-y-1">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));
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
          (item.href !== "/dashboard" && pathname.startsWith(item.href));
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

// ── Mobile Sidebar ────────────────────────────────────────────────────────────

export function UserMobileSidebar({
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

// ── Desktop Sidebar ───────────────────────────────────────────────────────────

export default function UserSidebar({
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
