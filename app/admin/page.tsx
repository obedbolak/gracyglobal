// app/admin/page.tsx

import { prisma } from "@/lib/prisma";
import StatsCard from "@/components/admin/StatsCard";
import {
  ShoppingBag,
  Briefcase,
  GraduationCap,
  Users,
  Package,
  DollarSign,
  Globe,
} from "lucide-react";

export default async function AdminDashboard() {
  // Fetch stats
  const [
    productsCount,
    coursesCount,
    jobsCount,
    counselorsCount,
    ordersCount,
    usersCount,
    communitiesCount,
  ] = await Promise.all([
    prisma.product.count({ where: { active: true } }),
    prisma.course.count({ where: { published: true } }),
    prisma.job.count({ where: { active: true } }),
    prisma.counselor.count({ where: { verified: true } }),
    prisma.order.count(),
    prisma.user.count(),
    prisma.community.count(),
  ]);

  const stats = [
    {
      title: "Total Products",
      value: productsCount,
      icon: ShoppingBag,
      color: "purple" as const,
      trend: { value: 12, isPositive: true },
    },
    {
      title: "Active Courses",
      value: coursesCount,
      icon: GraduationCap,
      color: "blue" as const,
      trend: { value: 8, isPositive: true },
    },
    {
      title: "Job Listings",
      value: jobsCount,
      icon: Briefcase,
      color: "scarlet" as const,
      trend: { value: 5, isPositive: false },
    },
    {
      title: "Communities",
      value: communitiesCount,
      icon: Globe,
      color: "purple" as const,
    },
    {
      title: "Verified Counselors",
      value: counselorsCount,
      icon: Users,
      color: "purple" as const,
    },
    {
      title: "Total Orders",
      value: ordersCount,
      icon: Package,
      color: "blue" as const,
    },
    {
      title: "Total Users",
      value: usersCount,
      icon: Users,
      color: "scarlet" as const,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          Dashboard Overview
        </h1>
        <p className="text-[var(--text-muted)] mt-2">
          Welcome to your admin dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="glass p-6 rounded-xl">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/admin/products/create"
            className="btn-primary text-center py-3 rounded-lg"
          >
            Add Product
          </a>
          <a
            href="/admin/courses/create"
            className="btn-primary text-center py-3 rounded-lg"
          >
            Add Course
          </a>
          <a
            href="/admin/jobs/create"
            className="btn-primary text-center py-3 rounded-lg"
          >
            Add Job
          </a>
          <a
            href="/admin/services/create"
            className="btn-primary text-center py-3 rounded-lg"
          >
            Add Service
          </a>
        </div>
      </div>
    </div>
  );
}
