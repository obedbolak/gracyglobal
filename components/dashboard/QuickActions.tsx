"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
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
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Browse Jobs",
      description: "Find opportunities",
      href: "/jobs",
      icon: Briefcase,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Marketplace",
      description: "Shop products",
      href: "/marketplace",
      icon: ShoppingCart,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Community",
      description: "Connect & share",
      href: "/community",
      icon: MessageCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  const affiliateActions = isAffiliate ? [
    {
      title: "Affiliate Program",
      description: "Manage referrals",
      href: "/affiliate",
      icon: Share2,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
    },
  ] : [];

  const counselorActions = isCounselor ? [
    {
      title: "My Sessions",
      description: "Manage bookings",
      href: "/bookings",
      icon: Users,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ] : [];

  const settingsActions = [
    {
      title: "Profile Settings",
      description: "Update your info",
      href: "/dashboard/settings",
      icon: Settings,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
    {
      title: "Subscription",
      description: "Manage your plan",
      href: "/dashboard/subscription",
      icon: CreditCard,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
  ];

  const allActions = [...baseActions, ...affiliateActions, ...counselorActions, ...settingsActions];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {allActions.map((action, index) => {
        const Icon = action.icon;
        return (
          <Link key={index} href={action.href}>
            <Card className="p-4 hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${action.bgColor}`}>
                  <Icon className={`w-5 h-5 ${action.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {action.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {action.description}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}