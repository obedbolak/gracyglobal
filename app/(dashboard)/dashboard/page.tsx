// app/(dashboard)/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import DashboardStats from "@/components/dashboard/DashboardStats";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentActivity from "@/components/dashboard/RecentActivity";
import SubscriptionStatus from "@/components/dashboard/SubscriptionStatus";
import {
  User,
  Crown,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Loader2,
  Star,
  ShieldCheck,
  ShieldOff,
  Lock,
  Package,
  Wrench,
  ChevronRight,
  Pencil,
  CheckCircle,
  XCircle,
  LayoutDashboard,
  GraduationCap,
  Heart,
  Shield,
  BookOpen,
  PlayCircle,
  ArrowRight,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface CounselorProfile {
  id: string;
  specialty: string;
  rating: number;
  reviews: number;
  pricePerHour: number;
  available: boolean;
  verified: boolean;
  bio?: string;
}

interface Subscription {
  id: string;
  status: string;
  billing: string;
  currentPeriodEnd: string;
  sessionsUsed: number;
  cancelAtPeriodEnd: boolean;
  plan: {
    id: string;
    name: string;
    displayName: string;
    priceMonthly: number;
    counselorSessions: number;
  };
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string[];
  country?: string;
  phone?: string;
  createdAt: string;
  emailVerified?: string;
  counselorProfile?: CounselorProfile;
  subscription?: Subscription;
  affiliate?: {
    id: string;
    code: string;
    tier: string;
    totalReferrals: number;
    totalEarnings: number;
    pendingPayout: number;
  };
  _count: {
    bookings: number;
    orders: number;
    communityPosts: number;
    jobApplications: number;
  };
}

interface EnrolledCourse {
  enrollment: {
    id: string;
    status: string;
    enrolledAt: string;
    completedAt: string | null;
  };
  course: {
    id: string;
    title: string;
    description: string;
    thumbnail: string | null;
    level: string;
  };
  progress: {
    totalLessons: number;
    completedLessons: number;
    percentage: number;
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

// Plans that unlock product/service creation
const CREATOR_PLANS = ["growth", "elite", "elite / pro", "elite/pro"];

function canCreate(subscription?: Subscription): boolean {
  if (!subscription) return false;
  if (subscription.status !== "ACTIVE") return false;
  return CREATOR_PLANS.includes(subscription.plan.name.toLowerCase());
}

function getPrimaryRole(roles: string[]): string {
  if (roles.includes("ADMIN")) return "ADMIN";
  if (roles.includes("COUNSELOR")) return "COUNSELOR";
  if (roles.includes("VOLUNTEER")) return "VOLUNTEER";
  return "USER";
}

function getRoleBadgeStyle(role: string) {
  switch (role.toUpperCase()) {
    case "ADMIN":
      return { background: "var(--error-bg)", color: "var(--error-text)" };
    case "COUNSELOR":
      return { background: "var(--info-bg)", color: "var(--blue)" };
    case "VOLUNTEER":
      return { background: "var(--success-bg)", color: "var(--green)" };
    default:
      return { background: "var(--glass-bg)", color: "var(--text-secondary)" };
  }
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function CounselorCard({ profile }: { profile: CounselorProfile }) {
  return (
    <div
      className="p-6 rounded-2xl"
      style={{
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-lg font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Counselor Profile
        </h3>
        <Link
          href="/dashboard/counselor/edit"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:opacity-80"
          style={{ background: "var(--info-bg)", color: "var(--blue)" }}
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit Profile
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div
          className="p-4 rounded-xl"
          style={{ background: "var(--glass-bg-subtle)" }}
        >
          <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
            Specialty
          </p>
          <p
            className="font-semibold text-sm"
            style={{ color: "var(--text-primary)" }}
          >
            {profile.specialty}
          </p>
        </div>
        <div
          className="p-4 rounded-xl"
          style={{ background: "var(--glass-bg-subtle)" }}
        >
          <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
            Rate
          </p>
          <p
            className="font-semibold text-sm"
            style={{ color: "var(--text-primary)" }}
          >
            {profile.pricePerHour.toLocaleString()} XAF/hr
          </p>
        </div>
        <div
          className="p-4 rounded-xl flex items-center gap-2"
          style={{ background: "var(--glass-bg-subtle)" }}
        >
          <Star className="w-4 h-4" style={{ color: "var(--yellow)" }} />
          <div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Rating
            </p>
            <p
              className="font-semibold text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              {profile.rating.toFixed(1)} ({profile.reviews} reviews)
            </p>
          </div>
        </div>
        <div
          className="p-4 rounded-xl"
          style={{ background: "var(--glass-bg-subtle)" }}
        >
          <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
            Status
          </p>
          <div className="flex items-center gap-1.5">
            {profile.available ? (
              <>
                <CheckCircle
                  className="w-4 h-4"
                  style={{ color: "var(--green)" }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--green)" }}
                >
                  Available
                </span>
              </>
            ) : (
              <>
                <XCircle
                  className="w-4 h-4"
                  style={{ color: "var(--text-muted)" }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--text-muted)" }}
                >
                  Unavailable
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {profile.verified ? (
          <span
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: "var(--success-bg)", color: "var(--green)" }}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Counselor
          </span>
        ) : (
          <span
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: "var(--warning-bg)", color: "var(--yellow)" }}
          >
            <ShieldOff className="w-3.5 h-3.5" />
            Pending Verification
          </span>
        )}
      </div>
    </div>
  );
}

function CreatorSection({ subscription }: { subscription?: Subscription }) {
  const canCreateItems = canCreate(subscription);
  const planName = subscription?.plan?.displayName ?? null;
  const isSubscribed = !!subscription && subscription.status === "ACTIVE";

  const cards = [
    {
      title: "Create a Service",
      description: "Offer your skills & services to the community",
      href: "/creator/services/create",
      icon: Wrench,
      color: "var(--purple)",
      bg: "var(--glass-bg-subtle)",
    },
    {
      title: "List a Product",
      description: "Sell physical or digital products on the marketplace",
      href: "/creator/products/create",
      icon: Package,
      color: "var(--green)",
      bg: "var(--success-bg)",
    },
  ];

  return (
    <div
      className="p-6 rounded-2xl"
      style={{
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3
          className="text-lg font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Creator Tools
        </h3>
        {!canCreateItems && (
          <span
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: "var(--warning-bg)", color: "var(--yellow)" }}
          >
            <Lock className="w-3 h-3" />
            Locked
          </span>
        )}
      </div>

      {!canCreateItems && (
        <div
          className="mb-4 px-4 py-3 rounded-xl text-sm"
          style={{
            background: "var(--warning-bg)",
            border: "1px solid var(--yellow)",
            color: "var(--text-primary)",
          }}
        >
          {!isSubscribed ? (
            <>
              You need an active subscription to create products or services.{" "}
              <Link
                href="/plans"
                className="font-semibold underline"
                style={{ color: "var(--yellow)" }}
              >
                View Plans
              </Link>
            </>
          ) : (
            <>
              Your <strong>{planName}</strong> plan doesn't include creator
              access. Upgrade to <strong>Growth</strong> or{" "}
              <strong>Elite</strong> to unlock.{" "}
              <Link
                href="/plans"
                className="font-semibold underline"
                style={{ color: "var(--yellow)" }}
              >
                Upgrade now
              </Link>
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const locked = !canCreateItems;
          const inner = (
            <div
              className={`p-4 rounded-xl flex items-start gap-3 transition-all ${
                locked
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:scale-[1.02] cursor-pointer"
              }`}
              style={{
                background: card.bg,
                border: "1px solid var(--divider)",
              }}
            >
              <div
                className="p-2 rounded-lg"
                style={{ background: "var(--glass-bg)" }}
              >
                <Icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p
                    className="font-semibold text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {card.title}
                  </p>
                  {locked && (
                    <Lock
                      className="w-3 h-3"
                      style={{ color: "var(--text-muted)" }}
                    />
                  )}
                </div>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  {card.description}
                </p>
              </div>
              {!locked && (
                <ChevronRight
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                  style={{ color: "var(--text-muted)" }}
                />
              )}
            </div>
          );

          return locked ? (
            <div key={card.title}>{inner}</div>
          ) : (
            <Link key={card.title} href={card.href}>
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
      fetchEnrollments();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user");
      const data = await res.json();
      if (data.success) {
        setProfile(data.data);
      } else {
        setError(data.error || "Failed to load profile");
      }
    } catch {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const res = await fetch("/api/learn/my-courses");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setEnrollments(data.data?.slice(0, 3) || []);
        }
      }
    } catch (error) {
      console.error("Failed to fetch enrollments:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2
            className="w-8 h-8 animate-spin mx-auto mb-4"
            style={{ color: "var(--blue)" }}
          />
          <p style={{ color: "var(--text-secondary)" }}>
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="mb-4" style={{ color: "var(--error-text)" }}>
            {error}
          </p>
          <button
            onClick={fetchProfile}
            className="px-4 py-2 text-white rounded-lg"
            style={{
              background: "linear-gradient(135deg, var(--purple), var(--blue))",
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  // ✅ FIX: role is an array — derive display role correctly
  const primaryRole = getPrimaryRole(profile.role);
  const isCounselor = profile.role.includes("COUNSELOR");
  const memberSince = new Date(profile.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  const recentActivities = [
    {
      id: "1",
      type: "booking" as const,
      title: "Counseling Session Booked",
      description: "Session with Dr. Sarah Johnson",
      status: "Confirmed",
      date: "2 hours ago",
    },
    {
      id: "2",
      type: "application" as const,
      title: "Job Application Submitted",
      description: "Frontend Developer at TechCorp",
      status: "Applied",
      date: "1 day ago",
    },
    {
      id: "3",
      type: "order" as const,
      title: "Order Placed",
      description: "Skincare bundle from marketplace",
      status: "Processing",
      date: "2 days ago",
    },
  ];

  return (
    <div className="space-y-8">
        {/* ── Welcome Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-3xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Welcome back, {profile.name?.split(" ")[0] || "User"}! 👋
            </h1>
            <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
              Here's what's happening with your account today.
            </p>
          </div>
          <span
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
            style={getRoleBadgeStyle(primaryRole)}
          >
            <Crown className="w-3.5 h-3.5" />
            {primaryRole.charAt(0) + primaryRole.slice(1).toLowerCase()}
          </span>
        </div>

        {/* ── Profile Summary ── */}
        <div
          className="p-6 rounded-2xl"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-16 h-16 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center"
              style={{ background: "var(--glass-bg-subtle)" }}
            >
              {profile.image ? (
                <img
                  src={profile.image}
                  alt={profile.name || "User"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8" style={{ color: "var(--blue)" }} />
              )}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h2
                  className="text-xl font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {profile.name || "User"}
                </h2>
                <span
                  className="px-3 py-1 rounded-full text-sm font-semibold"
                  style={getRoleBadgeStyle(primaryRole)}
                >
                  {primaryRole.charAt(0) + primaryRole.slice(1).toLowerCase()}
                </span>
                {!profile.emailVerified && (
                  <span
                    className="px-3 py-1 rounded-full text-sm font-semibold"
                    style={{
                      background: "var(--warning-bg)",
                      color: "var(--yellow)",
                    }}
                  >
                    Email not verified
                  </span>
                )}
              </div>
              <div
                className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {profile.email}
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {profile.phone}
                  </div>
                )}
                {profile.country && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {profile.country}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Member since {memberSince}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div>
          <h2
            className="text-xl font-semibold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Your Activity
          </h2>
          <DashboardStats
            bookings={profile._count.bookings}
            orders={profile._count.orders}
            jobApplications={profile._count.jobApplications}
            communityPosts={profile._count.communityPosts}
            counselorProfile={profile.counselorProfile}
            affiliate={profile.affiliate}
          />
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Actions + Counselor + Creator */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2
                className="text-xl font-semibold mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                Quick Actions
              </h2>
              <QuickActions
                role={primaryRole}
                isAffiliate={!!profile.affiliate}
                isCounselor={isCounselor}
              />
            </div>

            {/* Enrolled Courses */}
            {enrollments.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className="text-xl font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    My Courses
                  </h2>
                  <Link
                    href="/dashboard/my-courses"
                    className="text-sm font-semibold flex items-center gap-1"
                    style={{ color: "var(--blue)" }}
                  >
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {enrollments.map((item) => {
                    const { course, progress } = item;
                    const totalLessons = progress.totalLessons;
                    const isCompleted = progress.percentage >= 100;

                    return (
                      <Link
                        key={item.enrollment.id}
                        href={`/learn/${course.id}`}
                        className="group"
                      >
                        <div
                          className="p-4 rounded-xl transition-all hover:scale-[1.02]"
                          style={{
                            background: "var(--glass-bg)",
                            border: "1px solid var(--glass-border)",
                          }}
                        >
                          <div className="flex gap-4">
                            <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                              {course.thumbnail ? (
                                <img
                                  src={course.thumbnail}
                                  alt={course.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div
                                  className="w-full h-full flex items-center justify-center"
                                  style={{
                                    background: "var(--glass-bg-subtle)",
                                  }}
                                >
                                  <BookOpen
                                    className="w-8 h-8"
                                    style={{ color: "var(--text-muted)" }}
                                  />
                                </div>
                              )}
                              {isCompleted && (
                                <div
                                  className="absolute inset-0 flex items-center justify-center"
                                  style={{
                                    background: "rgba(0,0,0,0.7)",
                                  }}
                                >
                                  <CheckCircle
                                    className="w-6 h-6"
                                    style={{ color: "var(--green)" }}
                                  />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3
                                className="font-semibold mb-1 truncate"
                                style={{ color: "var(--text-primary)" }}
                              >
                                {course.title}
                              </h3>
                              <p
                                className="text-sm mb-2 line-clamp-1"
                                style={{ color: "var(--text-secondary)" }}
                              >
                                {course.description}
                              </p>
                              <div className="flex items-center gap-4 text-xs mb-2">
                                <span
                                  style={{ color: "var(--text-muted)" }}
                                >
                                  {totalLessons} lessons
                                </span>
                                <span
                                  className="px-2 py-0.5 rounded-full"
                                  style={{
                                    background: "var(--glass-bg-subtle)",
                                    color: "var(--text-secondary)",
                                  }}
                                >
                                  {course.level}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <div
                                  className="flex-1 h-1.5 rounded-full overflow-hidden"
                                  style={{
                                    background: "var(--glass-bg-subtle)",
                                  }}
                                >
                                  <div
                                    className="h-full transition-all"
                                    style={{
                                      width: `${progress.percentage}%`,
                                      background: isCompleted
                                        ? "var(--green)"
                                        : "linear-gradient(90deg, var(--purple), var(--blue))",
                                    }}
                                  />
                                </div>
                                <span
                                  className="text-xs font-semibold"
                                  style={{ color: "var(--text-primary)" }}
                                >
                                  {progress.percentage}%
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <PlayCircle
                                className="w-8 h-8 group-hover:scale-110 transition-transform"
                                style={{ color: "var(--blue)" }}
                              />
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Counselor profile card — only shown to counselors */}
            {isCounselor && profile.counselorProfile && (
              <div>
                <h2
                  className="text-xl font-semibold mb-4"
                  style={{ color: "var(--text-primary)" }}
                >
                  Your Counselor Profile
                </h2>
                <CounselorCard profile={profile.counselorProfile} />
              </div>
            )}

            {/* Creator tools — gated by plan */}
            <div>
              <h2
                className="text-xl font-semibold mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                Sell on Gracyglobal
              </h2>
              <CreatorSection subscription={profile.subscription} />
            </div>
          </div>

          {/* Right: Subscription + Activity */}
          <div className="space-y-8">
            <div>
              <h2
                className="text-xl font-semibold mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                Subscription
              </h2>
              <SubscriptionStatus subscription={profile.subscription} />
            </div>
            <RecentActivity activities={recentActivities} />
          </div>
        </div>
    </div>
  );
}
