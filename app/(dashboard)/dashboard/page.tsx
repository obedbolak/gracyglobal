"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import DashboardStats from "@/components/dashboard/DashboardStats";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentActivity from "@/components/dashboard/RecentActivity";
import SubscriptionStatus from "@/components/dashboard/SubscriptionStatus";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Crown, 
  MapPin, 
  Calendar,
  Mail,
  Phone,
  Loader2
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  country?: string;
  phone?: string;
  createdAt: string;
  emailVerified?: string;
  counselorProfile?: {
    id: string;
    specialty: string;
    rating: number;
    reviews: number;
    pricePerHour: number;
    available: boolean;
    verified: boolean;
  };
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

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status]);

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/user");
      const data = await response.json();
      
      if (data.success) {
        setProfile(data.data);
      } else {
        setError(data.error || "Failed to load profile");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--background)" }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: "var(--blue)" }} />
          <p style={{ color: "var(--text-secondary)" }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--background)" }}>
        <div className="text-center">
          <p className="mb-4" style={{ color: "var(--error-text)" }}>{error}</p>
          <button 
            onClick={fetchProfile}
            className="px-4 py-2 text-white rounded-lg transition-all"
            style={{ background: "linear-gradient(135deg, var(--purple), var(--blue))" }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--background)" }}>
        <p style={{ color: "var(--text-secondary)" }}>No profile data available</p>
      </div>
    );
  }

  // Mock recent activity data (replace with real API call)
  const recentActivities = [
    {
      id: "1",
      type: "booking" as const,
      title: "Counseling Session Booked",
      description: "Session with Dr. Sarah Johnson",
      status: "Confirmed",
      date: "2 hours ago"
    },
    {
      id: "2",
      type: "application" as const,
      title: "Job Application Submitted",
      description: "Frontend Developer at TechCorp",
      status: "Applied",
      date: "1 day ago"
    },
    {
      id: "3",
      type: "order" as const,
      title: "Order Placed",
      description: "Skincare bundle from marketplace",
      status: "Processing",
      date: "2 days ago"
    }
  ];

  const getRoleBadgeStyle = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return { background: "var(--error-bg)", color: "var(--error-text)" };
      case 'counselor':
        return { background: "var(--info-bg)", color: "var(--blue)" };
      case 'volunteer':
        return { background: "var(--success-bg)", color: "var(--green)" };
      default:
        return { background: "var(--glass-bg)", color: "var(--text-secondary)" };
    }
  };

  const memberSince = new Date(profile.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });

  return (
    <div className="min-h-screen py-8" style={{ background: "var(--background)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
                Welcome back, {profile.name?.split(' ')[0] || 'User'}! 👋
              </h1>
              <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
                Here's what's happening with your account today.
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <span className="px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1" style={getRoleBadgeStyle(profile.role)}>
                <Crown className="w-3 h-3" />
                {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Summary Card */}
        <div className="p-6 mb-8 rounded-2xl" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "var(--glass-bg-subtle)" }}>
              {profile.image ? (
                <img 
                  src={profile.image} 
                  alt={profile.name || 'User'} 
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <User className="w-8 h-8" style={{ color: "var(--blue)" }} />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
                  {profile.name || 'User'}
                </h2>
                <span className="px-3 py-1 rounded-full text-sm font-semibold" style={getRoleBadgeStyle(profile.role)}>
                  {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                </span>
                {!profile.emailVerified && (
                  <span className="px-3 py-1 rounded-full text-sm font-semibold" style={{ background: "var(--warning-bg)", color: "var(--yellow)" }}>
                    Email not verified
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm" style={{ color: "var(--text-secondary)" }}>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  {profile.email}
                </div>
                {profile.phone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    {profile.phone}
                  </div>
                )}
                {profile.country && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {profile.country}
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Member since {memberSince}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Your Activity</h2>
          <DashboardStats 
            bookings={profile._count.bookings}
            orders={profile._count.orders}
            jobApplications={profile._count.jobApplications}
            communityPosts={profile._count.communityPosts}
            counselorProfile={profile.counselorProfile}
            affiliate={profile.affiliate}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Actions & Subscription */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Quick Actions</h2>
              <QuickActions 
                role={profile.role}
                isAffiliate={!!profile.affiliate}
                isCounselor={!!profile.counselorProfile}
              />
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Subscription Status</h2>
              <SubscriptionStatus />
            </div>
          </div>

          {/* Right Column - Recent Activity */}
          <div>
            <RecentActivity activities={recentActivities} />
          </div>
        </div>
      </div>
    </div>
  );
}
