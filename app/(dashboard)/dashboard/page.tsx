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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchProfile}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">No profile data available</p>
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

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'counselor':
        return 'bg-blue-100 text-blue-800';
      case 'volunteer':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const memberSince = new Date(profile.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {profile.name?.split(' ')[0] || 'User'}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                Here's what's happening with your account today.
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Badge className={getRoleBadgeColor(profile.role)}>
                <Crown className="w-3 h-3 mr-1" />
                {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Profile Summary Card */}
        <Card className="p-6 mb-8">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              {profile.image ? (
                <img 
                  src={profile.image} 
                  alt={profile.name || 'User'} 
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-blue-600" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-xl font-semibold text-gray-900">
                  {profile.name || 'User'}
                </h2>
                <Badge className={getRoleBadgeColor(profile.role)}>
                  {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                </Badge>
                {!profile.emailVerified && (
                  <Badge className="bg-yellow-100 text-yellow-800">
                    Email not verified
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
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
        </Card>

        {/* Stats Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Activity</h2>
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
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <QuickActions 
                role={profile.role}
                isAffiliate={!!profile.affiliate}
                isCounselor={!!profile.counselorProfile}
              />
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Subscription Status</h2>
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
