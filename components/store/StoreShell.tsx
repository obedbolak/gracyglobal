"use client";

import { useState } from "react";
import StoreSidebar, { StoreMobileSidebar, StoreView } from "@/components/store/StoreSidebar";
import StorePageContent from "@/app/store/StorePageContent";

export default function StoreShell({ session }: { session: any }) {
  const [collapsed, setCollapsed] = useState(false);
  const [view, setView] = useState<StoreView>("overview");

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <StoreSidebar collapsed={collapsed} onToggleCollapse={setCollapsed} session={session} activeView={view} onViewChange={setView} />
      <StoreMobileSidebar session={session} activeView={view} onViewChange={setView} />
      <main className={`flex-1 p-8 transition-all duration-300 ${collapsed ? "lg:ml-20" : "lg:ml-64"}`}>
        <div className="max-w-7xl mx-auto">
          <StorePageContent view={view} setView={setView} />
        </div>
      </main>
    </div>
  );
}
