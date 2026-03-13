"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Video,
  MessageCircle,
  ChevronLeft,
  CheckCircle,
  XCircle,
  Hourglass,
  Star,
  Shield,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  Check,
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
  notes: string | null;
  counselor: {
    id: string;
    bio: string;
    rating: number;
    reviewCount: number;
    pricePerHour: number;
    specialty: string[];
    user: { name: string; image: string | null; country: string | null };
  };
}

// ─── Mock (swap with fetch(`/api/bookings/${id}`)) ───────────────────────────
const MOCK: Booking = {
  id: "bk_001",
  scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  duration: 60,
  type: "VIDEO",
  status: "CONFIRMED",
  price: 5000,
  notes:
    "I've been struggling with anxiety at work lately and would like strategies to cope better in high-pressure environments.",
  counselor: {
    id: "c1",
    bio: "Certified trauma therapist with 8 years helping clients process grief, anxiety, and past wounds in a safe, judgment-free space.",
    rating: 4.9,
    reviewCount: 124,
    pricePerHour: 5000,
    specialty: ["EMOTIONAL_WELLNESS", "MENTAL_HEALTH"],
    user: {
      name: "Grace Nfor",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      country: "Cameroon",
    },
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
function specialtyLabel(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

const STATUS_CONFIG: Record<
  BookingStatus,
  {
    label: string;
    icon: typeof CheckCircle;
    color: string;
    bg: string;
    border: string;
    description: string;
  }
> = {
  PENDING: {
    label: "Pending Confirmation",
    icon: Hourglass,
    color: "var(--warning-text)",
    bg: "var(--warning-bg)",
    border: "var(--warning-border)",
    description: "Your booking is waiting for the counselor to confirm.",
  },
  CONFIRMED: {
    label: "Confirmed",
    icon: CheckCircle,
    color: "var(--success-text)",
    bg: "var(--success-bg)",
    border: "var(--success-border)",
    description:
      "Your session is confirmed. You'll receive a reminder 1 hour before.",
  },
  COMPLETED: {
    label: "Session Completed",
    icon: CheckCircle,
    color: "var(--info-text)",
    bg: "var(--info-bg)",
    border: "var(--info-border)",
    description: "This session has been completed.",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    color: "var(--error-text)",
    bg: "var(--error-bg)",
    border: "var(--error-border)",
    description: "This booking was cancelled.",
  },
};

// Status timeline steps
const TIMELINE: { status: BookingStatus; label: string }[] = [
  { status: "PENDING", label: "Booking Received" },
  { status: "CONFIRMED", label: "Counselor Confirmed" },
  { status: "COMPLETED", label: "Session Completed" },
];

const STATUS_ORDER: BookingStatus[] = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
];

function TimelineStep({
  label,
  done,
  active,
  cancelled,
}: {
  label: string;
  done: boolean;
  active: boolean;
  cancelled: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
        style={{
          background: cancelled
            ? "var(--error-bg)"
            : done || active
              ? "linear-gradient(135deg, var(--purple), var(--blue))"
              : "var(--glass-bg-subtle)",
          border: cancelled
            ? "1px solid var(--error-border)"
            : done || active
              ? "none"
              : "1px solid var(--glass-border)",
          boxShadow:
            (done || active) && !cancelled
              ? "0 4px 12px rgba(123,47,190,0.3)"
              : "none",
        }}
      >
        {cancelled ? (
          <XCircle size={14} style={{ color: "var(--error-text)" }} />
        ) : done || active ? (
          <Check size={13} className="text-white" strokeWidth={3} />
        ) : (
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: "var(--text-disabled)" }}
          />
        )}
      </div>
      <span
        className="text-sm font-medium"
        style={{
          color:
            (done || active) && !cancelled
              ? "var(--text-primary)"
              : "var(--text-disabled)",
        }}
      >
        {label}
      </span>
    </div>
  );
}

// Cancel confirmation modal
function CancelModal({
  onConfirm,
  onClose,
  loading,
}: {
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{
        background: "var(--modal-backdrop)",
        backdropFilter: "blur(8px)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="glass-modal w-full max-w-md p-8 flex flex-col gap-5"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "var(--error-bg)",
              border: "1px solid var(--error-border)",
            }}
          >
            <AlertTriangle size={18} style={{ color: "var(--error-text)" }} />
          </div>
          <div>
            <h3
              className="font-extrabold text-base"
              style={{ color: "var(--text-primary)" }}
            >
              Cancel this booking?
            </h3>
            <p
              className="text-xs font-light mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              This action cannot be undone.
            </p>
          </div>
        </div>

        <p
          className="text-sm leading-relaxed font-light"
          style={{ color: "var(--text-secondary)" }}
        >
          Cancellations made more than 24 hours before the session are free.
          Late cancellations may incur a fee as per our policy.
        </p>

        <div className="flex gap-3 mt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.01]"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              color: "var(--text-secondary)",
            }}
          >
            Keep Booking
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-[1.01] disabled:opacity-60"
            style={{
              background:
                "linear-gradient(135deg, var(--scarlet-dark), var(--scarlet))",
              boxShadow: "0 4px 14px rgba(220,20,60,0.35)",
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Cancelling...
              </span>
            ) : (
              "Yes, Cancel"
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [booking] = useState<Booking>(MOCK); // swap: fetch(`/api/bookings/${params.id}`)
  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  const status = STATUS_CONFIG[cancelled ? "CANCELLED" : booking.status];
  const StatusIcon = status.icon;
  const currentStatus: BookingStatus = cancelled ? "CANCELLED" : booking.status;
  const isUpcoming = ["PENDING", "CONFIRMED"].includes(currentStatus);
  const statusIndex = STATUS_ORDER.indexOf(currentStatus);

  // Add to Google Calendar
  const calendarUrl = () => {
    const start = new Date(booking.scheduledAt);
    const end = new Date(start.getTime() + booking.duration * 60000);
    const fmt = (d: Date) =>
      d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Counseling+Session+with+${encodeURIComponent(booking.counselor.user.name)}&dates=${fmt(start)}/${fmt(end)}&details=GracyGlobal+counseling+session`;
  };

  async function handleCancel() {
    setCancelling(true);
    await new Promise((r) => setTimeout(r, 1200)); // swap: PATCH /api/bookings/${booking.id}
    setCancelling(false);
    setCancelled(true);
    setShowCancel(false);
  }

  return (
    <main className="min-h-screen">
      <Navbar />

      {showCancel && (
        <CancelModal
          onConfirm={handleCancel}
          onClose={() => setShowCancel(false)}
          loading={cancelling}
        />
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm font-medium mb-8 transition-colors duration-200 hover:opacity-70"
          style={{ color: "var(--text-muted)" }}
        >
          <ChevronLeft size={16} /> My Bookings
        </button>

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {/* ── LEFT col ── */}
          <div className="flex flex-col gap-5">
            {/* Counselor card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="glass p-5"
            >
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-4"
                style={{ color: "var(--text-muted)" }}
              >
                Your Counselor
              </p>
              <div className="flex items-start gap-3 mb-4">
                <img
                  src={booking.counselor.user.image ?? ""}
                  alt={booking.counselor.user.name}
                  className="w-14 h-14 rounded-2xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p
                    className="font-extrabold text-sm mb-0.5"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {booking.counselor.user.name}
                  </p>
                  <p
                    className="text-xs mb-2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {booking.counselor.user.country}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Star
                      size={11}
                      className="fill-yellow-400 text-yellow-400"
                    />
                    <span
                      className="text-xs font-bold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {booking.counselor.rating}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      ({booking.counselor.reviewCount})
                    </span>
                  </div>
                </div>
              </div>

              <p
                className="text-xs leading-relaxed font-light mb-4"
                style={{ color: "var(--text-secondary)" }}
              >
                {booking.counselor.bio}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {booking.counselor.specialty.map((s) => (
                  <span
                    key={s}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{
                      background: "var(--badge-purple-bg)",
                      color: "var(--badge-purple-text)",
                    }}
                  >
                    {specialtyLabel(s)}
                  </span>
                ))}
              </div>

              <Link
                href={`/counselors/${booking.counselor.id}/book`}
                className="flex items-center justify-center gap-2 w-full mt-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-[1.01]"
                style={{
                  background: "var(--glass-bg)",
                  border: "1px solid var(--glass-border)",
                  color: "var(--text-secondary)",
                }}
              >
                <RefreshCw size={12} /> Rebook This Counselor
              </Link>
            </motion.div>

            {/* Status timeline */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="glass p-5"
            >
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-4"
                style={{ color: "var(--text-muted)" }}
              >
                Session Status
              </p>
              <div className="flex flex-col gap-3">
                {currentStatus === "CANCELLED" ? (
                  <TimelineStep
                    label="Booking Cancelled"
                    done={false}
                    active={false}
                    cancelled={true}
                  />
                ) : (
                  TIMELINE.map(({ status: s, label }, i) => {
                    const sIndex = STATUS_ORDER.indexOf(s);
                    return (
                      <TimelineStep
                        key={s}
                        label={label}
                        done={statusIndex > sIndex}
                        active={statusIndex === sIndex}
                        cancelled={false}
                      />
                    );
                  })
                )}
              </div>
            </motion.div>

            {/* Trust */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="glass p-4"
            >
              <div
                className="flex items-center gap-2.5 text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                <Shield
                  size={13}
                  style={{ color: "var(--accent-primary)", flexShrink: 0 }}
                />
                Your session is 100% private and confidential.
              </div>
            </motion.div>
          </div>

          {/* ── RIGHT col ── */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Status banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-start gap-3 p-4 rounded-2xl"
              style={{
                background: status.bg,
                border: `1px solid ${status.border}`,
              }}
            >
              <StatusIcon
                size={18}
                style={{ color: status.color, flexShrink: 0, marginTop: 1 }}
              />
              <div>
                <p
                  className="text-sm font-bold mb-0.5"
                  style={{ color: status.color }}
                >
                  {status.label}
                </p>
                <p
                  className="text-xs font-light"
                  style={{ color: status.color, opacity: 0.8 }}
                >
                  {status.description}
                </p>
              </div>
            </motion.div>

            {/* Session details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="glass p-6"
            >
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-5"
                style={{ color: "var(--text-muted)" }}
              >
                Session Details
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  {
                    icon: Calendar,
                    label: "Date",
                    value: formatDate(booking.scheduledAt),
                  },
                  {
                    icon: Clock,
                    label: "Time",
                    value: formatTime(booking.scheduledAt),
                  },
                  {
                    icon: Clock,
                    label: "Duration",
                    value: `${booking.duration} minutes`,
                  },
                  {
                    icon: booking.type === "VIDEO" ? Video : MessageCircle,
                    label: "Session Type",
                    value:
                      booking.type === "VIDEO" ? "Video Call" : "Text Chat",
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex items-start gap-3 p-3 rounded-xl"
                    style={{
                      background: "var(--glass-bg-subtle)",
                      border: "1px solid var(--glass-border-subtle)",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--purple), var(--blue))",
                        boxShadow: "0 2px 8px rgba(123,47,190,0.3)",
                      }}
                    >
                      <Icon size={14} className="text-white" />
                    </div>
                    <div>
                      <p
                        className="text-[11px] font-medium mb-0.5"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {label}
                      </p>
                      <p
                        className="text-sm font-bold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Notes */}
            {booking.notes && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="glass p-6"
              >
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-3"
                  style={{ color: "var(--text-muted)" }}
                >
                  Your Note to Counselor
                </p>
                <p
                  className="text-sm leading-relaxed font-light"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {booking.notes}
                </p>
              </motion.div>
            )}

            {/* Payment */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="glass p-6"
            >
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-4"
                style={{ color: "var(--text-muted)" }}
              >
                Payment
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    1 session × {booking.duration} min
                  </p>
                  <p
                    className="text-xs font-light mt-0.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Booking #{booking.id}
                  </p>
                </div>
                <span
                  className="text-2xl font-extrabold"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--purple), var(--blue))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  CFA {booking.price.toLocaleString()}
                </span>
              </div>
            </motion.div>

            {/* Actions */}
            {isUpcoming && !cancelled && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <a
                  href={calendarUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.01]"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--purple), var(--blue))",
                    color: "#fff",
                    boxShadow: "0 4px 14px rgba(123,47,190,0.35)",
                  }}
                >
                  <ExternalLink size={14} /> Add to Calendar
                </a>
                <button
                  onClick={() => setShowCancel(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.01]"
                  style={{
                    background: "var(--error-bg)",
                    border: "1px solid var(--error-border)",
                    color: "var(--error-text)",
                  }}
                >
                  <XCircle size={14} /> Cancel Booking
                </button>
              </motion.div>
            )}

            {/* Post-cancel rebook */}
            {cancelled && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-5 flex flex-col sm:flex-row items-center gap-4 justify-between"
              >
                <p
                  className="text-sm font-light"
                  style={{ color: "var(--text-muted)" }}
                >
                  Booking cancelled. Want to reschedule?
                </p>
                <Link
                  href={`/counselors/${booking.counselor.id}/book`}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 flex-shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--purple), var(--blue))",
                  }}
                >
                  <RefreshCw size={13} /> Rebook
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
