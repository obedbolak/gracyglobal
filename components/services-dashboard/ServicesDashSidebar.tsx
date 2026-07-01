"use client";

import { useState, useEffect } from "react";
import DashboardSwitcher from "@/components/shared/DashboardSwitcher";
import {
  LayoutDashboard, Wrench, PlusCircle, DollarSign, CalendarCheck,
  ChevronLeft, ChevronRight, PanelLeft, Crown, Settings,
} from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

export type DashboardSession = {
  user?: {
    name?: string | null;
    image?: string | null;
    role?: string | string[];
  };
} | null;

export type ServicesView = "overview" | "services" | "create" | "edit" | "bookings" | "earnings" | "settings";

const menuItems: { label: string; icon: typeof LayoutDashboard; view: ServicesView }[] = [
  { label: "Overview", icon: LayoutDashboard, view: "overview" },
  { label: "My Services", icon: Wrench, view: "services" },
  { label: "Add Service", icon: PlusCircle, view: "create" },
  { label: "Bookings", icon: CalendarCheck, view: "bookings" },
  { label: "Earnings", icon: DollarSign, view: "earnings" },
  { label: "Settings", icon: Settings, view: "settings" },
];

function SubscriptionItem() {
  const { getSubscriptionByCategory, loading } = useSubscription();
  if (loading) return null;
  const subscription = getSubscriptionByCategory("SERVICE");
  if (!subscription) return null;
  return (
    <div className="px-3 mt-2">
      <div className="flex items-center gap-2 px-4 py-2">
        <div className="flex-1 h-px bg-[var(--divider)]" />
        <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-secondary)] opacity-60">Plan</span>
        <div className="flex-1 h-px bg-[var(--divider)]" />
      </div>
      <div className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--text-secondary)]">
        <Crown className="w-5 h-5 flex-shrink-0" style={{ color: "var(--green)" }} />
        <div className="flex-1 text-left">
          <div className="font-medium truncate">{subscription.plan.name}</div>
          <div className="text-xs opacity-70">{subscription.plan.leadLimit ?? "Unlimited"} leads</div>
        </div>
      </div>
    </div>
  );
}

function NavItems({ activeView, onViewChange, onNavigate, profileIncomplete }: { activeView: ServicesView; onViewChange: (v: ServicesView) => void; onNavigate?: () => void; profileIncomplete?: boolean }) {
  return (
    <>
      <nav className="px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.view;
          const showBadge = item.view === "settings" && profileIncomplete;
          return (
            <button
              key={item.view}
              onClick={() => { onViewChange(item.view); onNavigate?.(); }}
              className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-[var(--sidebar-item-active)] text-[var(--purple)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--sidebar-item-hover)]"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium truncate">{item.label}</span>
              {showBadge && (
                <span className="ml-auto w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </nav>
      <SubscriptionItem />
    </>
  );
}

function CollapsedNavItems({ activeView, onViewChange, profileIncomplete }: { activeView: ServicesView; onViewChange: (v: ServicesView) => void; profileIncomplete?: boolean }) {
  return (
    <nav className="px-3 space-y-1">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.view;
        const showBadge = item.view === "settings" && profileIncomplete;
        return (
          <button
            key={item.view}
            onClick={() => onViewChange(item.view)}
            title={item.label}
            className={`relative w-full flex items-center justify-center px-4 py-3 rounded-lg transition-all ${
              isActive
                ? "bg-[var(--sidebar-item-active)] text-[var(--purple)]"
                : "text-[var(--text-secondary)] hover:bg-[var(--sidebar-item-hover)]"
            }`}
          >
            <Icon className="w-5 h-5" />
            {showBadge && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>
        );
      })}
    </nav>
  );
}

export function ServicesDashMobileSidebar({ session, activeView, onViewChange, profileIncomplete }: { session?: DashboardSession; activeView: ServicesView; onViewChange: (v: ServicesView) => void; profileIncomplete?: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileOpen(false); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <>
      <button onClick={() => setMobileOpen(true)} className="lg:hidden fixed top-20 right-4 z-[1000] w-9 h-9 flex items-center justify-center rounded-full shadow-lg bg-[var(--purple)] text-white hover:opacity-90 transition-opacity">
        <PanelLeft className="w-4 h-4" />
      </button>
      <div className={`lg:hidden fixed z-[999] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} style={{ top: "4rem", left: 0, right: 0, bottom: 0 }} onClick={() => setMobileOpen(false)} />
      <aside className="lg:hidden fixed left-0 z-[1000] w-64 bg-[var(--bg-base)] border-r border-[var(--divider)] flex flex-col" style={{ top: "4rem", bottom: 0, transform: mobileOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform 300ms ease-in-out" }}>
        <div className="flex items-center p-6 border-b border-[var(--divider)] flex-shrink-0">
          <DashboardSwitcher session={session} />
        </div>
        <div className="flex-1 py-4 overflow-y-auto">
          <NavItems activeView={activeView} onViewChange={onViewChange} onNavigate={() => setMobileOpen(false)} profileIncomplete={profileIncomplete} />
        </div>
      </aside>
    </>
  );
}

export default function ServicesDashSidebar({ collapsed = false, onToggleCollapse, session, activeView, onViewChange, profileIncomplete }: { collapsed?: boolean; onToggleCollapse?: (c: boolean) => void; session?: DashboardSession; activeView: ServicesView; onViewChange: (v: ServicesView) => void; profileIncomplete?: boolean }) {
  return (
    <aside className={`hidden lg:flex flex-col glass-nav border-r border-[var(--divider)] fixed top-16 left-0 h-[calc(100vh-4rem)] flex-shrink-0 z-[1000] transition-all duration-300 ease-in-out ${collapsed ? "w-20" : "w-64"}`}>
      <div className="flex items-center justify-between p-4 border-b border-[var(--divider)] flex-shrink-0">
        {!collapsed && <DashboardSwitcher session={session} />}
        <button onClick={() => onToggleCollapse?.(!collapsed)} className={`p-2 rounded-lg hover:bg-[var(--sidebar-item-hover)] transition-colors flex-shrink-0 ${collapsed ? "mx-auto" : ""}`}>
          {collapsed ? <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" /> : <ChevronLeft className="w-4 h-4 text-[var(--text-secondary)]" />}
        </button>
      </div>
      <div className="flex-1 py-4 overflow-y-auto">
        {collapsed ? <CollapsedNavItems activeView={activeView} onViewChange={onViewChange} profileIncomplete={profileIncomplete} /> : <NavItems activeView={activeView} onViewChange={onViewChange} profileIncomplete={profileIncomplete} />}
      </div>
    </aside>
  );
}
