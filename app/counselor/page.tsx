"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import CounselorStats from "@/components/counselor/CounselorStats";
import BookingCard from "@/components/counselor/BookingCard";
import {
  Loader2,
  CalendarCheck,
  ArrowRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface CounselorDashboardData {
  counselor: {
    id: string;
    specialty: string;
    rating: number;
    reviews: number;
    pricePerHour: number;
    available: boolean;
    verified: boolean;
  };
  stats: {
    totalBookings: number;
    upcomingBookings: number;
    completedSessions: number;
    totalEarnings: number;
    totalClients: number;
  };
  recentBookings: {
    id: string;
    type: "VIDEO" | "TEXT" | "SUPPORT_GROUP";
    status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
    scheduledAt: string;
    duration: number;
    price: number;
    notes?: string | null;
    user: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
    };
  }[];
}

export default function CounselorDashboardPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<CounselorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated") fetchDashboard();
  }, [status]);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/counselors?dashboard=true");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.error || "Failed to load dashboard");
      }
    } catch {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (
    bookingId: string,
    action: "accept" | "decline" | "complete",
  ) => {
    const statusMap = {
      accept: "CONFIRMED",
      decline: "CANCELLED",
      complete: "COMPLETED",
    };

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusMap[action] }),
      });
      if (res.ok) fetchDashboard();
    } catch (err) {
      console.error("Action failed:", err);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2
            className="w-8 h-8 animate-spin mx-auto mb-4"
            style={{ color: "var(--purple)" }}
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
          <AlertCircle
            className="w-12 h-12 mx-auto mb-4"
            style={{ color: "var(--error-text)" }}
          />
          <p className="mb-4" style={{ color: "var(--error-text)" }}>
            {error}
          </p>
          <button
            onClick={fetchDashboard}
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

  if (!data) return null;

  const pendingBookings = data.recentBookings.filter(
    (b) => b.status === "PENDING",
  );
  const upcomingConfirmed = data.recentBookings.filter(
    (b) => b.status === "CONFIRMED",
  );

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-3xl font-extrabold"
            style={{ color: "var(--text-primary)" }}
          >
            Counselor Dashboard 🩺
          </h1>
          <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
            Manage your sessions, clients, and earnings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {data.counselor.verified ? (
            <span
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{
                background: "var(--success-bg)",
                color: "var(--success-text)",
              }}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Verified
            </span>
          ) : (
            <span
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{
                background: "var(--warning-bg)",
                color: "var(--warning-text)",
              }}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              Pending Verification
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <CounselorStats
        totalBookings={data.stats.totalBookings}
        upcomingBookings={data.stats.upcomingBookings}
        completedSessions={data.stats.completedSessions}
        totalEarnings={data.stats.totalEarnings}
        rating={data.counselor.rating}
        totalClients={data.stats.totalClients}
      />

      {/* Pending Bookings Alert */}
      {pendingBookings.length > 0 && (
        <div
          className="p-5 rounded-2xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(123,47,190,0.05))",
            border: "1px solid var(--warning-border)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle
                className="w-5 h-5"
                style={{ color: "var(--warning-text)" }}
              />
              <h3
                className="text-sm font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {pendingBookings.length} Pending Booking
                {pendingBookings.length > 1 ? "s" : ""}
              </h3>
            </div>
            <Link
              href="/counselor/bookings"
              className="flex items-center gap-1 text-xs font-semibold"
              style={{ color: "var(--purple)" }}
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingBookings.slice(0, 2).map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onAccept={(id) => handleBookingAction(id, "accept")}
                onDecline={(id) => handleBookingAction(id, "decline")}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Sessions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Upcoming Sessions
          </h2>
          <Link
            href="/counselor/bookings"
            className="flex items-center gap-1 text-sm font-semibold"
            style={{ color: "var(--purple)" }}
          >
            All Bookings <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {upcomingConfirmed.length === 0 ? (
          <div
            className="p-8 rounded-2xl text-center"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
            }}
          >
            <CalendarCheck
              className="w-12 h-12 mx-auto mb-3"
              style={{ color: "var(--text-disabled)" }}
            />
            <p
              className="text-sm font-medium"
              style={{ color: "var(--text-muted)" }}
            >
              No upcoming sessions
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingConfirmed.slice(0, 4).map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onComplete={(id) => handleBookingAction(id, "complete")}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
