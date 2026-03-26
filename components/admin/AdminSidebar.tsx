// components/admin/AdminSidebar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Briefcase,
  Users,
  GraduationCap,
  Video,
  FileText,
  Settings,
  Package,
} from "lucide-react";

const menuItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: ShoppingBag,
  },
  {
    label: "Services",
    href: "/admin/services",
    icon: Briefcase,
  },
  {
    label: "Courses",
    href: "/admin/courses",
    icon: GraduationCap,
  },
  {
    label: "Jobs",
    href: "/admin/jobs",
    icon: FileText,
  },
  {
    label: "Counselors",
    href: "/admin/counselors",
    icon: Users,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Live Sessions",
    href: "/admin/live-sessions",
    icon: Video,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: Package,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 glass-nav border-r border-[var(--divider)] min-h-screen sticky top-0">
      <div className="p-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          Admin Panel
        </h2>
      </div>

      <nav className="px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${
                  isActive
                    ? "bg-[var(--sidebar-item-active)] text-[var(--purple)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--sidebar-item-hover)]"
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
