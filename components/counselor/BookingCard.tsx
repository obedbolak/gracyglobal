"use client";

import {
  Video,
  MessageCircle,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
} from "lucide-react";

interface BookingCardProps {
  booking: {
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
  };
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
  onComplete?: (id: string) => void;
}

const statusConfig = {
  PENDING: {
    label: "Pending",
    icon: AlertCircle,
    bg: "var(--warning-bg)",
    color: "var(--warning-text)",
    border: "var(--warning-border)",
  },
  CONFIRMED: {
    label: "Confirmed",
    icon: CheckCircle,
    bg: "var(--info-bg)",
    color: "var(--info-text)",
    border: "var(--info-border)",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle,
    bg: "var(--success-bg)",
    color: "var(--success-text)",
    border: "var(--success-border)",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    bg: "var(--error-bg)",
    color: "var(--error-text)",
    border: "var(--error-border)",
  },
};

const typeIcons = {
  VIDEO: Video,
  TEXT: MessageCircle,
  SUPPORT_GROUP: User,
};

export default function BookingCard({
  booking,
  onAccept,
  onDecline,
  onComplete,
}: BookingCardProps) {
  const status = statusConfig[booking.status];
  const StatusIcon = status.icon;
  const TypeIcon = typeIcons[booking.type];
  const scheduledDate = new Date(booking.scheduledAt);
  const isPast = scheduledDate < new Date();

  return (
    <div
      className="p-5 rounded-2xl transition-all hover:scale-[1.005]"
      style={{
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
        boxShadow: "var(--glass-shadow)",
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {booking.user.image ? (
            <img
              src={booking.user.image}
              alt={booking.user.name || "Client"}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "var(--glass-bg-subtle)" }}
            >
              <User
                className="w-5 h-5"
                style={{ color: "var(--text-muted)" }}
              />
            </div>
          )}
          <div>
            <p
              className="font-semibold text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              {booking.user.name || booking.user.email}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {booking.user.email}
            </p>
          </div>
        </div>
        <span
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{
            background: status.bg,
            color: status.color,
            border: `1px solid ${status.border}`,
          }}
        >
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div
          className="p-3 rounded-xl"
          style={{ background: "var(--glass-bg-subtle)" }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Calendar
              className="w-3 h-3"
              style={{ color: "var(--text-muted)" }}
            />
            <span
              className="text-[10px] font-medium"
              style={{ color: "var(--text-muted)" }}
            >
              Date
            </span>
          </div>
          <p
            className="text-xs font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {scheduledDate.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        <div
          className="p-3 rounded-xl"
          style={{ background: "var(--glass-bg-subtle)" }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="w-3 h-3" style={{ color: "var(--text-muted)" }} />
            <span
              className="text-[10px] font-medium"
              style={{ color: "var(--text-muted)" }}
            >
              Time
            </span>
          </div>
          <p
            className="text-xs font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {scheduledDate.toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div
          className="p-3 rounded-xl"
          style={{ background: "var(--glass-bg-subtle)" }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <TypeIcon
              className="w-3 h-3"
              style={{ color: "var(--text-muted)" }}
            />
            <span
              className="text-[10px] font-medium"
              style={{ color: "var(--text-muted)" }}
            >
              Type
            </span>
          </div>
          <p
            className="text-xs font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {booking.type === "VIDEO"
              ? "Video"
              : booking.type === "TEXT"
                ? "Text"
                : "Group"}
          </p>
        </div>
      </div>

      {booking.notes && (
        <div
          className="p-3 rounded-xl mb-4"
          style={{
            background: "var(--glass-bg-subtle)",
            border: "1px solid var(--glass-border-subtle)",
          }}
        >
          <p
            className="text-[10px] font-semibold mb-1"
            style={{ color: "var(--text-muted)" }}
          >
            Client's Note
          </p>
          <p
            className="text-xs font-light leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            {booking.notes}
          </p>
        </div>
      )}

      <div
        className="flex items-center justify-between pt-3"
        style={{ borderTop: "1px solid var(--divider)" }}
      >
        <span
          className="text-sm font-extrabold"
          style={{ color: "var(--accent-primary)" }}
        >
          {booking.price.toLocaleString()} XAF
        </span>

        <div className="flex items-center gap-2">
          {booking.status === "PENDING" && (
            <>
              <button
                onClick={() => onDecline?.(booking.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                style={{
                  background: "var(--error-bg)",
                  color: "var(--error-text)",
                  border: "1px solid var(--error-border)",
                }}
              >
                Decline
              </button>
              <button
                onClick={() => onAccept?.(booking.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:scale-105"
                style={{
                  background:
                    "linear-gradient(135deg, var(--purple), var(--blue))",
                  boxShadow: "0 2px 8px rgba(123,47,190,0.3)",
                }}
              >
                Accept
              </button>
            </>
          )}
          {booking.status === "CONFIRMED" && !isPast && (
            <button
              onClick={() => onComplete?.(booking.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:scale-105"
              style={{
                background:
                  "linear-gradient(135deg, var(--purple), var(--blue))",
                boxShadow: "0 2px 8px rgba(123,47,190,0.3)",
              }}
            >
              Mark Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
