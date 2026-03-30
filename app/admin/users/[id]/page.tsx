// app/admin/users/[id]/page.tsx

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { hasRole, roleLabel } from "@/lib/roleHelpers";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Shield,
  GraduationCap,
  ShoppingBag,
  Calendar as CalendarIcon,
  Edit,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UserDetailsPage({ params }: PageProps) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      subscription: {
        include: { plan: true },
      },
      enrollments: {
        include: { course: true },
        orderBy: { enrolledAt: "desc" },
        take: 5,
      },
      bookings: {
        include: {
          counselor: {
            include: { user: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      orders: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      _count: {
        select: {
          enrollments: true,
          bookings: true,
          orders: true,
          jobApplications: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/users"
            className="p-2 hover:bg-[var(--glass-bg-hover)] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">
              User Details
            </h1>
            <p className="text-[var(--text-muted)] mt-1">
              View and manage user information
            </p>
          </div>
        </div>

        <Link
          href={`/admin/users/${user.id}/edit`}
          className="btn-primary flex items-center gap-2 px-6 py-3 rounded-lg"
        >
          <Edit className="w-5 h-5" />
          Edit User
        </Link>
      </div>

      {/* User Profile Card */}
      <div className="glass p-8 rounded-xl">
        <div className="flex items-start gap-6">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || "User"}
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-[var(--purple-faint)] flex items-center justify-center">
              <span className="text-3xl font-bold text-[var(--purple)]">
                {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                  {user.name || "No name provided"}
                </h2>
                <p className="text-[var(--text-muted)] mt-1">{user.email}</p>
              </div>

              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  hasRole(user.role, "ADMIN")
                    ? "bg-[var(--scarlet-faint)] text-[var(--scarlet)]"
                    : hasRole(user.role, "COUNSELOR")
                      ? "bg-[var(--blue-faint)] text-[var(--blue)]"
                      : hasRole(user.role, "VOLUNTEER")
                        ? "bg-[var(--purple-faint)] text-[var(--purple)]"
                        : "badge-neutral"
                }`}
              >
                {roleLabel(user.role)}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {user.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-[var(--text-muted)]" />
                  <span className="text-[var(--text-secondary)]">
                    {user.phone}
                  </span>
                </div>
              )}

              {user.country && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-[var(--text-muted)]" />
                  <span className="text-[var(--text-secondary)]">
                    {user.country}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-[var(--text-muted)]" />
                <span className="text-[var(--text-secondary)]">
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="w-8 h-8 text-[var(--purple)]" />
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {user._count.enrollments}
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                Courses Enrolled
              </p>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <CalendarIcon className="w-8 h-8 text-[var(--blue)]" />
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {user._count.bookings}
              </p>
              <p className="text-sm text-[var(--text-muted)]">Bookings Made</p>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingBag className="w-8 h-8 text-[var(--scarlet)]" />
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {user._count.orders}
              </p>
              <p className="text-sm text-[var(--text-muted)]">Orders Placed</p>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-[var(--purple)]" />
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {user._count.jobApplications}
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                Job Applications
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Info */}
      <div className="glass p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          Subscription
        </h3>
        {user.subscription ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-muted)]">Plan</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {user.subscription.plan.displayName}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-muted)]">Billing</span>
              <span className="font-medium text-[var(--text-secondary)]">
                {user.subscription.billing}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-muted)]">Status</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  user.subscription.status === "ACTIVE"
                    ? "bg-[var(--success-bg)] text-[var(--success-text)]"
                    : "bg-[var(--error-bg)] text-[var(--error-text)]"
                }`}
              >
                {user.subscription.status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-muted)]">Period Ends</span>
              <span className="font-medium text-[var(--text-secondary)]">
                {new Date(
                  user.subscription.currentPeriodEnd,
                ).toLocaleDateString()}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-[var(--text-muted)]">No active subscription</p>
        )}
      </div>

      {/* Recent Activity Tabs */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="border-b border-[var(--divider)]">
          <div className="flex gap-6 px-6">
            <button className="px-4 py-4 text-sm font-medium text-[var(--purple)] border-b-2 border-[var(--purple)]">
              Courses ({user.enrollments.length})
            </button>
            <button className="px-4 py-4 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              Bookings ({user.bookings.length})
            </button>
            <button className="px-4 py-4 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              Orders ({user.orders.length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {user.enrollments.length > 0 ? (
            <div className="space-y-3">
              {user.enrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-[var(--glass-bg-subtle)] transition-colors"
                >
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">
                      {enrollment.course.title}
                    </p>
                    <p className="text-sm text-[var(--text-muted)]">
                      Enrolled{" "}
                      {new Date(enrollment.enrolledAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      enrollment.status === "ACTIVE"
                        ? "bg-[var(--success-bg)] text-[var(--success-text)]"
                        : enrollment.status === "COMPLETED"
                          ? "bg-[var(--blue-faint)] text-[var(--blue)]"
                          : "bg-[var(--error-bg)] text-[var(--error-text)]"
                    }`}
                  >
                    {enrollment.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-[var(--text-muted)]">
              No courses enrolled yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
