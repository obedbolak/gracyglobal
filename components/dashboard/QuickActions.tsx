"use client";

import Link from "next/link";
import { 
  Calendar,
  ShoppingCart,
  Briefcase,
  MessageCircle,
  Users,
  Settings,
  CreditCard,
  Share2
} from "lucide-react";

interface QuickActionsProps {
  role: string;
  isAffiliate?: boolean;
  isCounselor?: boolean;
}

export default function QuickActions({ role, isAffiliate, isCounselor }: QuickActionsProps) {
  const baseActions = [
    {
      title: "Book Counseling",
      description: "Schedule a session",
      href: "/counselors",
      icon: Calendar,
      color: "var(--blue)",
      bgColor: "var(--info-bg)",
    },
    {
      title: "Browse Jobs",
      description: "Find opportunities",
      href: "/jobs",
      icon: Briefcase,
      color: "var(--purple)",
      bgColor: "var(--glass-bg-subtle)",
    },
    {
      title: "Marketplace",
      description: "Shop products",
      href: "/marketplace",
      icon: ShoppingCart,
      color: "var(--green)",
      bgColor: "var(--success-bg)",
    },
    {
      title: "Community",
      description: "Connect & share",
      href: "/community",
      icon: MessageCircle,
      color: "var(--scarlet)",
      bgColor: "var(--error-bg)",
    },
  ];

  const affiliateActions = isAffiliate ? [
    {
      title: "Affiliate Program",
      description: "Manage referrals",
      href: "/affiliate",
      icon: Share2,
      color: "var(--purple)",
      bgColor: "var(--glass-bg-subtle)",
    },
  ] : [];

  const counselorActions = isCounselor ? [
    {
      title: "My Sessions",
      description: "Manage bookings",
      href: "/bookings",
      icon: Users,
      color: "var(--blue)",
      bgColor: "var(--info-bg)",
    },
  ] : [];

  const settingsActions = [
    {
      title: "Profile Settings",
      description: "Update your info",
      href: "/dashboard/settings",
      icon: Settings,
      color: "var(--text-secondary)",
      bgColor: "var(--glass-bg)",
    },
    {
      title: "Subscription",
      description: "Manage your plan",
      href: "/dashboard/subscription",
      icon: CreditCard,
      color: "var(--green)",
      bgColor: "var(--success-bg)",
    },
  ];

  const allActions = [...baseActions, ...affiliateActions, ...counselorActions, ...settingsActions];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {allActions.map((action, index) => {
        const Icon = action.icon;
        return (
          <Link key={index} href={action.href}>
            <div className="p-4 rounded-2xl transition-all duration-200 hover:scale-105 cursor-pointer" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg" style={{ background: action.bgColor }}>
                  <Icon className="w-5 h-5" style={{ color: action.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                    {action.title}
                  </h3>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    {action.description}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}