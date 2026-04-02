"use client";

import {
  BookOpen,
  Users,
  DollarSign,
  TrendingUp,
  Eye,
  CheckCircle,
} from "lucide-react";

interface TeacherStatsProps {
  totalCourses: number;
  publishedCourses: number;
  totalStudents: number;
  totalEarnings: number;
  totalLessons: number;
  completionRate: number;
}

export default function TeacherStats({
  totalCourses,
  publishedCourses,
  totalStudents,
  totalEarnings,
  totalLessons,
  completionRate,
}: TeacherStatsProps) {
  const stats = [
    {
      title: "Total Courses",
      value: totalCourses,
      icon: BookOpen,
      color: "var(--blue)",
      bgColor: "var(--info-bg)",
    },
    {
      title: "Published",
      value: publishedCourses,
      icon: Eye,
      color: "var(--success-text)",
      bgColor: "var(--success-bg)",
    },
    {
      title: "Total Students",
      value: totalStudents,
      icon: Users,
      color: "var(--purple)",
      bgColor: "var(--badge-purple-bg)",
    },
    {
      title: "Total Lessons",
      value: totalLessons,
      icon: CheckCircle,
      color: "var(--blue)",
      bgColor: "var(--info-bg)",
    },
    {
      title: "Earnings",
      value: `${totalEarnings.toLocaleString()} XAF`,
      icon: DollarSign,
      color: "var(--success-text)",
      bgColor: "var(--success-bg)",
    },
    {
      title: "Avg. Completion",
      value: `${completionRate}%`,
      icon: TrendingUp,
      color: "var(--warning-text)",
      bgColor: "var(--warning-bg)",
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
