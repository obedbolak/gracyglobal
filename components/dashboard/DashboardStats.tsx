"use client";

import { Card } from "@/components/ui/card";
import { 
  Calendar, 
  ShoppingBag, 
  Briefcase, 
  MessageSquare,
  Star,
  Users,
  DollarSign
} from "lucide-react";

interface StatsProps {
  bookings: number;
  orders: number;
  jobApplications: number;
  communityPosts: number;
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
  counselorProfile,
  affiliate 
}: StatsProps) {
  const userStats = [
    {
      title: "Counseling Sessions",
      value: bookings,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Orders Placed",
      value: orders,
      icon: ShoppingBag,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Job Applications",
      value: jobApplications,
      icon: Briefcase,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Community Posts",
      value: communityPosts,
      icon: MessageSquare,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  const counselorStats = counselorProfile ? [
    {
      title: "Rating",
      value: counselorProfile.rating.toFixed(1),
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Reviews",
      value: counselorProfile.reviews,
      icon: MessageSquare,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ] : [];

  const affiliateStats = affiliate ? [
    {
      title: "Referrals",
      value: affiliate.totalReferrals,
      icon: Users,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
    },
    {
      title: "Earnings",
      value: `${affiliate.totalEarnings.toLocaleString()} CFA`,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
  ] : [];

  const allStats = [...userStats, ...counselorStats, ...affiliateStats];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {allStats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}