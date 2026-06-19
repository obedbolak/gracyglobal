"use client";

import { useState } from "react";
import ServicesDashSidebar, { ServicesDashMobileSidebar, ServicesView } from "@/components/services-dashboard/ServicesDashSidebar";
import ServicesDashPageContent from "@/app/services-dashboard/ServicesDashPageContent";

export default function ServicesDashShell({ session }: { session: any }) {
  const [collapsed, setCollapsed] = useState(false);
  const [view, setView] = useState<ServicesView>("overview");

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <ServicesDashSidebar collapsed={collapsed} onToggleCollapse={setCollapsed} session={session} activeView={view} onViewChange={setView} />
      <ServicesDashMobileSidebar session={session} activeView={view} onViewChange={setView} />
      <main className={`flex-1 p-8 transition-all duration-300 ${collapsed ? "lg:ml-20" : "lg:ml-64"}`}>
        <div className="max-w-7xl mx-auto">
          <ServicesDashPageContent view={view} setView={setView} />
        </div>
      </main>
    </div>
  );
}
