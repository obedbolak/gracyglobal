"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Wrench, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ArrowRight,
  User
} from "lucide-react";

interface ServiceBooking {
  id: string;
  status: string;
  scheduledAt: string | null;
  totalPrice: number;
  notes: string | null;
  createdAt: string;
  service: {
    id: string;
    name: string;
    images: string[];
    seller: {
      id: string;
      name: string;
      image: string | null;
    } | null;
  };
  serviceOption: {
    id: string;
    name: string;
    amount: number;
    pricingType: string;
    duration: string | null;
  } | null;
}

export default function ServiceBookings() {
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServiceBookings();
  }, []);

  const fetchServiceBookings = async () => {
    try {
      const response = await fetch("/api/service-bookings?limit=5");
      const data = await response.json();
      if (data.success) {
        setBookings(data.data.items || []);
      }
    } catch (error) {
      console.error("Failed to fetch service bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <CheckCircle className="w-4 h-4" style={{ color: "var(--green)" }} />;
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4" style={{ color: "var(--success-text)" }} />;
      case "CANCELLED":
        return <XCircle className="w-4 h-4" style={{ color: "var(--error-text)" }} />;
      default:
        return <AlertCircle className="w-4 h-4" style={{ color: "var(--warning-text)" }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return { background: "var(--success-bg)", color: "var(--success-text)" };
      case "COMPLETED":
        return { background: "var(--info-bg)", color: "var(--blue)" };
      case "CANCELLED":
        return { background: "var(--error-bg)", color: "var(--error-text)" };
      default:
        return { background: "var(--warning-bg)", color: "var(--warning-text)" };
    }
  };

  if (loading) {
    return (
      <div
        className="p-6 rounded-2xl"
        style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
        }}
      >
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div
        className="p-6 rounded-2xl text-center"
        style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
        }}
      >
        <Wrench 
          className="w-12 h-12 mx-auto mb-3" 
          style={{ color: "var(--text-muted)" }} 
        />
        <h3 
          className="font-semibold mb-1" 
          style={{ color: "var(--text-primary)" }}
        >
          No Service Bookings Yet
        </h3>
        <p 
          className="text-sm mb-4" 
          style={{ color: "var(--text-muted)" }}
        >
          Book services from our marketplace to get started.
        </p>
        <Link
          href="/services"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:scale-105"
          style={{
            background: "linear-gradient(135deg, var(--purple), var(--blue))",
          }}
        >
          Browse Services
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

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
          Recent Service Bookings
        </h3>
        <Link
          href="/dashboard/service-bookings"
          className="text-sm font-semibold flex items-center gap-1"
          style={{ color: "var(--blue)" }}
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="p-4 rounded-xl transition-all hover:scale-[1.01]"
            style={{
              background: "var(--glass-bg-subtle)",
              border: "1px solid var(--divider)",
            }}
          >
            <div className="flex items-start gap-3">
              {/* Service Image */}
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                {booking.service.images?.[0] ? (
                  <img
                    src={booking.service.images[0]}
                    alt={booking.service.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ background: "var(--glass-bg)" }}
                  >
                    <Wrench
                      className="w-6 h-6"
                      style={{ color: "var(--text-muted)" }}
                    />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h4
                    className="font-semibold text-sm truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {booking.service.name}
                  </h4>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 flex-shrink-0 ml-2"
                    style={getStatusColor(booking.status)}
                  >
                    {getStatusIcon(booking.status)}
                    {booking.status}
                  </span>
                </div>

                {booking.serviceOption && (
                  <p
                    className="text-xs mb-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {booking.serviceOption.name} • {booking.totalPrice.toLocaleString()} XAF
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs">
                  {booking.service.seller && (
                    <span
                      className="flex items-center gap-1"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <User className="w-3 h-3" />
                      {booking.service.seller.name}
                    </span>
                  )}
                  
                  {booking.scheduledAt ? (
                    <span
                      className="flex items-center gap-1"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <Calendar className="w-3 h-3" />
                      {new Date(booking.scheduledAt).toLocaleDateString()}
                    </span>
                  ) : (
                    <span
                      className="flex items-center gap-1"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <Clock className="w-3 h-3" />
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}