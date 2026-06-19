"use client";

import { useState } from "react";
import ServicesDashSidebar, { ServicesDashMobileSidebar } from "@/components/services-dashboard/ServicesDashSidebar";

export default function ServicesDashShell({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <ServicesDashSidebar collapsed={collapsed} onToggleCollapse={setCollapsed} session={session} />
      <ServicesDashMobileSidebar session={session} />
      <main className={`flex-1 p-8 transition-all duration-300 ${collapsed ? "lg:ml-20" : "lg:ml-64"}`}>
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
