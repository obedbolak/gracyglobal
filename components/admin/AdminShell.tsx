"use client";

import { useState } from "react";
import Adminsidebar from "@/components/admin/Adminsidebar";
import { AdminMobileSidebar } from "@/components/admin/Adminsidebar";

export default function AdminShell({
  children,
  session,
}: {
  children: React.ReactNode;
  session: {
    user?: {
      name?: string | null;
      image?: string | null;
      role?: string;
    };
  } | null;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <Adminsidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={setSidebarCollapsed}
        session={session}
      />
      <AdminMobileSidebar session={session} />

      <main
        className={`flex-1 p-8 transition-all duration-300 ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"}`}
      >
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
