"use client";

import { Card } from "@/components/ui/card";
import { 
  Calendar, 
  ShoppingBag, 
  Briefcase, 
  MessageSquare,
  Star,
  Users,
  DollarSign,
  Wrench
} from "lucide-react";

interface StatsProps {
  bookings: number;
  orders: number;
  jobApplications: number;
  communityPosts: number;
  serviceBookings?: number;
  counselorProfile?: {
    rating: number;
    reviews: number;
  };
  affiliate?: {
    totalReferrals: number;
    totalEarnings: number;
  };
}

export default function DashboardStats({ 
  bookings, 
  orders, 
  jobApplications, 
  communityPosts,
  serviceBookings = 0,
  counselorProfile,
  affiliate 
}: StatsProps) {
  const userStats = [
    {
      title: "Counseling Sessions",
      value: bookings,
      icon: Calendar,
      color: "var(--blue)",
      bgColor: "var(--info-bg)",
    },
    {
      title: "Service Bookings",
      value: serviceBookings,
      icon: Wrench,
      color: "var(--purple)",
      bgColor: "var(--badge-purple-bg)",
    },
    {
      title: "Orders Placed",
      value: orders,
      icon: ShoppingBag,
      color: "var(--green)",
      bgColor: "var(--success-bg)",
    },
    {
      title: "Job Applications",
      value: jobApplications,
      icon: Briefcase,
      color: "var(--scarlet)",
      bgColor: "var(--error-bg)",
    },
  ];

  const counselorStats = counselorProfile ? [
    {
      title: "Rating",
      value: counselorProfile.rating.toFixed(1),
      icon: Star,
      color: "var(--yellow)",
      bgColor: "var(--warning-bg)",
    },
    {
      title: "Reviews",
      value: counselorProfile.reviews,
      icon: MessageSquare,
      color: "var(--blue)",
      bgColor: "var(--info-bg)",
    },
  ] : [];

  const affiliateStats = affiliate ? [
    {
      title: "Referrals",
      value: affiliate.totalReferrals,
      icon: Users,
      color: "var(--purple)",
      bgColor: "var(--glass-bg-subtle)",
    },
    {
      title: "Earnings",
      value: `${affiliate.totalEarnings.toLocaleString()} CFA`,
      icon: DollarSign,
      color: "var(--green)",
      bgColor: "var(--success-bg)",
    },
  ] : [];

  const allStats = [...userStats, ...counselorStats, ...affiliateStats];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {allStats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="p-6 rounded-2xl transition-all hover:scale-[1.02]"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: "var(--text-muted)" }}>
                  {stat.title}
                </p>
                <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {stat.value}
                </p>
              </div>
              <div className="p-3 rounded-full" style={{ background: stat.bgColor }}>
                <Icon className="w-6 h-6" style={{ color: stat.color }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}