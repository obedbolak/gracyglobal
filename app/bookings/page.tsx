"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Video,
  MessageCircle,
  ChevronRight,
  RefreshCw,
  Plus,
  Hourglass,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// ─── Types ────────────────────────────────────────────────────────────────────
type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

interface Booking {
  id: string;
  scheduledAt: string;
  duration: number;
  type: "VIDEO" | "TEXT" | "SUPPORT_GROUP";
  status: BookingStatus;
  price: number;
  counselor: {
    id: string;
    user: { name: string; image: string | null };
    specialty: string[];
    rating: number;
  };
}

// ─── Mock data (swap with real API fetch) ─────────────────────────────────────
const MOCK_BOOKINGS: Booking[] = [
  {
    id: "bk_001",
    scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 60,
    type: "VIDEO",
    status: "CONFIRMED",
    price: 5000,
    counselor: {
      id: "c1",
      user: {
        name: "Grace Nfor",
        image: "https://randomuser.me/api/portraits/women/44.jpg",
      },
      specialty: ["EMOTIONAL_WELLNESS"],
      rating: 4.9,
    },
  },
  {
    id: "bk_002",
    scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 60,
    type: "TEXT",
    status: "PENDING",
    price: 7000,
    counselor: {
      id: "c2",
      user: {
        name: "Daniel Evans",
        image: "https://randomuser.me/api/portraits/men/32.jpg",
      },
      specialty: ["RELATIONSHIP"],
      rating: 4.8,
    },
  },
  {
    id: "bk_003",
    scheduledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 60,
    type: "VIDEO",
    status: "COMPLETED",
    price: 4500,
    counselor: {
      id: "c3",
      user: {
        name: "Sarah Johnson",
        image: "https://randomuser.me/api/portraits/women/58.jpg",
      },
      specialty: ["LIFE_COACH"],
      rating: 4.8,
    },
  },
  {
    id: "bk_004",
    scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 60,
    type: "TEXT",
    status: "CANCELLED",
    price: 5000,
    counselor: {
      id: "c1",
      user: {
        name: "Grace Nfor",
        image: "https://randomuser.me/api/portraits/women/44.jpg",
      },
      specialty: ["EMOTIONAL_WELLNESS"],
      rating: 4.9,
    },
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_CONFIG: Record<
  BookingStatus,
  {
    label: string;
    icon: typeof CheckCircle;
    color: string;
    bg: string;
    border: string;
  }
> = {
  PENDING: {
    label: "Pending",
    icon: Hourglass,
    color: "var(--warning-text)",
    bg: "var(--warning-bg)",
    border: "var(--warning-border)",
  },
  CONFIRMED: {
    label: "Confirmed",
    icon: CheckCircle,
    color: "var(--success-text)",
    bg: "var(--success-bg)",
    border: "var(--success-border)",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle,
    color: "var(--info-text)",
    bg: "var(--info-bg)",
    border: "var(--info-border)",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    color: "var(--error-text)",
    bg: "var(--error-bg)",
    border: "var(--error-border)",
  },
};

const FILTERS = ["All", "Upcoming", "Completed", "Cancelled"] as const;
type Filter = (typeof FILTERS)[number];

// ─── Booking card ─────────────────────────────────────────────────────────────
function BookingCard({ booking, index }: { booking: Booking; index: number }) {
  const status = STATUS_CONFIG[booking.status];
  const StatusIcon = status.icon;
  const isUpcoming = ["PENDING", "CONFIRMED"].includes(booking.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
    >
      <Link
        href={`/bookings/${booking.id}`}
        className="glass flex flex-col sm:flex-row sm:items-center gap-4 p-5 group transition-all duration-200 hover:scale-[1.01] block"
      >
        {/* Counselor avatar */}
        <div className="relative flex-shrink-0">
          <img
            src={booking.counselor.user.image ?? ""}
            alt={booking.counselor.user.name}
            className="w-14 h-14 rounded-2xl object-cover"
          />
          <div
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
            style={{
              background: "var(--card-bg)",
              border: "2px solid var(--glass-border)",
            }}
          >
            {booking.type === "VIDEO" ? (
              <Video size={11} style={{ color: "var(--blue-light)" }} />
            ) : (
              <MessageCircle
                size={11}
                style={{ color: "var(--purple-light)" }}
              />
            )}
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-1.5">
            <span
              className="font-bold text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              {booking.counselor.user.name}
            </span>
            {/* Status badge */}
            <span
              className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
              style={{
                background: status.bg,
                color: status.color,
                border: `1px solid ${status.border}`,
              }}
            >
              <StatusIcon size={10} />
              {status.label}
            </span>
          </div>

          <div
            className="flex flex-wrap gap-3 text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            <span className="flex items-center gap-1.5">
              <Calendar size={11} style={{ color: "var(--accent-primary)" }} />
              {formatDate(booking.scheduledAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={11} style={{ color: "var(--accent-primary)" }} />
              {formatTime(booking.scheduledAt)} · {booking.duration} min
            </span>
            <span className="flex items-center gap-1.5">
              {booking.type === "VIDEO" ? (
                <Video size={11} />
              ) : (
                <MessageCircle size={11} />
              )}
              {booking.type === "VIDEO" ? "Video" : "Text"} session
            </span>
          </div>
        </div>

        {/* Price + arrow */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 flex-shrink-0">
          <span
            className="text-sm font-extrabold"
            style={{ color: "var(--accent-primary)" }}
          >
            CFA {booking.price.toLocaleString()}
          </span>
          <div className="flex items-center gap-2">
            {isUpcoming && (
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: "var(--badge-purple-bg)",
                  color: "var(--badge-purple-text)",
                }}
              >
                Upcoming
              </span>
            )}
            <ChevronRight
              size={15}
              className="transition-transform duration-200 group-hover:translate-x-1"
              style={{ color: "var(--text-muted)" }}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function BookingsPage() {
  const [filter, setFilter] = useState<Filter>("All");
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [loading, setLoading] = useState(false);

  // Swap this with real fetch:
  // useEffect(() => {
  //   fetch("/api/bookings").then(r => r.json()).then(d => setBookings(d.data.items));
  // }, []);

  const filtered = bookings.filter((b) => {
    if (filter === "All") return true;
    if (filter === "Upcoming")
      return ["PENDING", "CONFIRMED"].includes(b.status);
    if (filter === "Completed") return b.status === "COMPLETED";
    if (filter === "Cancelled") return b.status === "CANCELLED";
    return true;
  });

  const upcoming = bookings.filter((b) =>
    ["PENDING", "CONFIRMED"].includes(b.status),
  );
  const past = bookings.filter((b) =>
    ["COMPLETED", "CANCELLED"].includes(b.status),
  );

  return (
    <main className="min-h-screen">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-start justify-between gap-4 mb-10 flex-wrap"
        >
          <div>
            <h1
              className="text-3xl font-extrabold tracking-tight mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              My Bookings
            </h1>
            <p
              className="text-sm font-light"
              style={{ color: "var(--text-muted)" }}
            >
              {upcoming.length} upcoming · {past.length} past sessions
            </p>
          </div>
          <Link
            href="/counselors"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, var(--purple), var(--blue))",
              boxShadow: "0 4px 14px rgba(123,47,190,0.35)",
            }}
          >
            <Plus size={15} /> Book a Session
          </Link>
        </motion.div>

        {/* Filter tabs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex gap-2 mb-8 flex-wrap"
        >
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200"
              style={
                filter === f
                  ? {
                      background:
                        "linear-gradient(135deg, var(--purple), var(--blue))",
                      color: "#fff",
                      boxShadow: "0 4px 14px rgba(123,47,190,0.3)",
                    }
                  : {
                      background: "var(--glass-bg)",
                      border: "1px solid var(--glass-border)",
                      color: "var(--text-muted)",
                    }
              }
            >
              {f}
              {f === "Upcoming" && upcoming.length > 0 && (
                <span
                  className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ background: "rgba(255,255,255,0.25)" }}
                >
                  {upcoming.length}
                </span>
              )}
            </button>
          ))}
        </motion.div>

        {/* Bookings list */}
        <div className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass flex flex-col items-center justify-center py-20 text-center gap-4"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "var(--glass-bg-subtle)",
                    border: "1px solid var(--glass-border)",
                  }}
                >
                  <Calendar
                    size={24}
                    style={{ color: "var(--text-disabled)" }}
                  />
                </div>
                <div>
                  <p
                    className="font-bold mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    No bookings here
                  </p>
                  <p
                    className="text-sm font-light"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {filter === "All"
                      ? "You haven't booked any sessions yet."
                      : `No ${filter.toLowerCase()} sessions.`}
                  </p>
                </div>
                <Link
                  href="/counselors"
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-105"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--purple), var(--blue))",
                  }}
                >
                  Browse Counselors
                </Link>
              </motion.div>
            ) : (
              filtered.map((booking, i) => (
                <BookingCard key={booking.id} booking={booking} index={i} />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      <Footer />
    </main>
  );
}
