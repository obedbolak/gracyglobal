"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import BookingCard from "@/components/counselor/BookingCard";
import { Loader2, CalendarCheck, Filter } from "lucide-react";

type BookingStatus =
  | "ALL"
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED";

interface Booking {
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
}

const STATUS_FILTERS: { value: BookingStatus; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function CounselorBookingsPage() {
  const { status: authStatus } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<BookingStatus>("ALL");

  useEffect(() => {
    if (authStatus === "authenticated") fetchBookings();
  }, [authStatus]);

  const fetchBookings = async () => {
    try {
      // First get counselor ID
      const meRes = await fetch("/api/counselors?me=true");
      const meJson = await meRes.json();
      if (!meJson.success) throw new Error("Failed to get profile");

      const counselorId = meJson.data.id;

      const res = await fetch(
        `/api/counselors/${counselorId}?include=bookings`,
      );
      const json = await res.json();
      if (json.success) setBookings(json.data);
    } catch (err) {
      console.error("Failed to load bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (
    bookingId: string,
    action: "accept" | "decline" | "complete",
  ) => {
    const statusMap = {
      accept: "CONFIRMED",
      decline: "CANCELLED",
      complete: "COMPLETED",
    };
    try {
      await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusMap[action] }),
      });
      fetchBookings();
    } catch (err) {
      console.error("Action failed:", err);
    }
  };

  const filtered =
    filter === "ALL" ? bookings : bookings.filter((b) => b.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: "var(--purple)" }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-3xl font-extrabold"
          style={{ color: "var(--text-primary)" }}
        >
          Bookings
        </h1>
        <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
          Manage all your counseling session bookings.
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background:
                filter === f.value
                  ? "linear-gradient(135deg, var(--purple), var(--blue))"
                  : "var(--glass-bg)",
              color: filter === f.value ? "#fff" : "var(--text-secondary)",
              border:
                filter === f.value ? "none" : "1px solid var(--glass-border)",
              boxShadow:
                filter === f.value ? "0 4px 12px rgba(123,47,190,0.3)" : "none",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Bookings grid */}
      {filtered.length === 0 ? (
        <div
          className="p-12 rounded-2xl text-center"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <CalendarCheck
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: "var(--text-disabled)" }}
          />
          <p
            className="text-lg font-semibold mb-1"
            style={{ color: "var(--text-muted)" }}
          >
            No bookings found
          </p>
          <p className="text-sm" style={{ color: "var(--text-disabled)" }}>
            {filter === "ALL"
              ? "You don't have any bookings yet."
              : `No ${filter.toLowerCase()} bookings.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onAccept={(id) => handleAction(id, "accept")}
              onDecline={(id) => handleAction(id, "decline")}
              onComplete={(id) => handleAction(id, "complete")}
            />
          ))}
        </div>
      )}
    </div>
  );
}
