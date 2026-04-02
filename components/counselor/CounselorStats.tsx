"use client";

import {
  CalendarCheck,
  DollarSign,
  Star,
  Users,
  Clock,
  TrendingUp,
} from "lucide-react";

interface CounselorStatsProps {
  totalBookings: number;
  upcomingBookings: number;
  completedSessions: number;
  totalEarnings: number;
  rating: number;
  totalClients: number;
}

export default function CounselorStats({
  totalBookings,
  upcomingBookings,
  completedSessions,
  totalEarnings,
  rating,
  totalClients,
}: CounselorStatsProps) {
  const stats = [
    {
      title: "Total Bookings",
      value: totalBookings,
      icon: CalendarCheck,
      color: "var(--blue)",
      bgColor: "var(--info-bg)",
    },
    {
      title: "Upcoming",
      value: upcomingBookings,
      icon: Clock,
      color: "var(--purple)",
      bgColor: "var(--badge-purple-bg)",
    },
    {
      title: "Completed",
      value: completedSessions,
      icon: TrendingUp,
      color: "var(--success-text)",
      bgColor: "var(--success-bg)",
    },
    {
      title: "Earnings",
      value: `${totalEarnings.toLocaleString()} XAF`,
      icon: DollarSign,
      color: "var(--success-text)",
      bgColor: "var(--success-bg)",
    },
    {
      title: "Rating",
      value: rating.toFixed(1),
      icon: Star,
      color: "var(--warning-text)",
      bgColor: "var(--warning-bg)",
    },
    {
      title: "Total Clients",
      value: totalClients,
      icon: Users,
      color: "var(--blue)",
      bgColor: "var(--info-bg)",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="p-5 rounded-2xl transition-all hover:scale-[1.02]"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-xs font-medium mb-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  {stat.title}
                </p>
                <p
                  className="text-2xl font-extrabold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {stat.value}
                </p>
              </div>
              <div
                className="p-3 rounded-full"
                style={{ background: stat.bgColor }}
              >
                <Icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
