"use client";

import { useState } from "react";
import TeacherSidebar, {
  TeacherMobileSidebar,
} from "@/components/teacher/TeacherSidebar";

export default function TeacherShell({
  children,
  session,
}: {
  children: React.ReactNode;
  session: {
    user?: {
      name?: string | null;
      image?: string | null;
      role?: string | string[];
    };
  } | null;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <TeacherSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={setSidebarCollapsed}
        session={session}
      />
      <TeacherMobileSidebar session={session} />

      <main
        className={`flex-1 p-8 transition-all duration-300 ${
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
