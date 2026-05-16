"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft,
  Wrench, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  User,
  Filter,
  Search
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

export default function ServiceBookingsPage() {
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchServiceBookings();
  }, [filter]);

  const fetchServiceBookings = async () => {
    try {
      const url = filter === "all" 
        ? "/api/service-bookings" 
        : `/api/service-bookings?status=${filter}`;
      
      const response = await fetch(url);
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

  const statusOptions = [
    { value: "all", label: "All Bookings" },
    { value: "PENDING", label: "Pending" },
    { value: "CONFIRMED", label: "Confirmed" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="p-2 rounded-lg transition-colors hover:bg-[var(--glass-bg-hover)]"
        >
          <ArrowLeft
            className="w-5 h-5"
            style={{ color: "var(--text-muted)" }}
          />
        </Link>
        <div className="flex-1">
          <h1
            className="text-3xl font-extrabold"
            style={{ color: "var(--text-primary)" }}
          >
            Service Bookings
          </h1>
          <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
            Manage your service bookings and track their status
          </p>
        </div>
      </div>

      {/* Filters */}
      <div
        className="p-4 rounded-xl flex items-center gap-4"
        style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
        }}
      >
        <Filter
          className="w-5 h-5"
          style={{ color: "var(--text-muted)" }}
        />
        <div className="flex gap-2 flex-wrap">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === option.value
                  ? "text-white"
                  : ""
              }`}
              style={{
                background: filter === option.value
                  ? "linear-gradient(135deg, var(--purple), var(--blue))"
                  : "var(--glass-bg-subtle)",
                color: filter === option.value
                  ? "#fff"
                  : "var(--text-secondary)",
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div
          className="p-6 rounded-2xl"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      ) : bookings.length === 0 ? (
        <div
          className="p-12 rounded-2xl text-center"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <Wrench 
            className="w-16 h-16 mx-auto mb-4" 
            style={{ color: "var(--text-muted)" }} 
          />
          <h3 
            className="text-xl font-semibold mb-2" 
            style={{ color: "var(--text-primary)" }}
          >
            No Service Bookings Found
          </h3>
          <p 
            className="text-sm mb-6" 
            style={{ color: "var(--text-muted)" }}
          >
            {filter === "all" 
              ? "You haven't booked any services yet. Browse our marketplace to get started."
              : `No bookings with status "${filter}" found.`
            }
          </p>
          {filter === "all" && (
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg, var(--purple), var(--blue))",
              }}
            >
              Browse Services
            </Link>
          )}
        </div>
      ) : (
        <div
          className="p-6 rounded-2xl"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="p-5 rounded-xl transition-all hover:scale-[1.01]"
                style={{
                  background: "var(--glass-bg-subtle)",
                  border: "1px solid var(--divider)",
                }}
              >
                <div className="flex items-start gap-4">
                  {/* Service Image */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
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
                          className="w-8 h-8"
                          style={{ color: "var(--text-muted)" }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4
                          className="font-semibold text-lg mb-1"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {booking.service.name}
                        </h4>
                        {booking.serviceOption && (
                          <p
                            className="text-sm"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {booking.serviceOption.name}
                          </p>
                        )}
                      </div>
                      <span
                        className="px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 flex-shrink-0"
                        style={getStatusColor(booking.status)}
                      >
                        {getStatusIcon(booking.status)}
                        {booking.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {booking.service.seller && (
                        <div
                          className="flex items-center gap-2"
                          style={{ color: "var(--text-muted)" }}
                        >
                          <User className="w-4 h-4" />
                          <span>Provider: {booking.service.seller.name}</span>
                        </div>
                      )}
                      
                      <div
                        className="flex items-center gap-2"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <Calendar className="w-4 h-4" />
                        <span>
                          {booking.scheduledAt 
                            ? `Scheduled: ${new Date(booking.scheduledAt).toLocaleDateString()}`
                            : `Booked: ${new Date(booking.createdAt).toLocaleDateString()}`
                          }
                        </span>
                      </div>

                      <div
                        className="flex items-center gap-2 font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        <span>{booking.totalPrice.toLocaleString()} XAF</span>
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="mt-3 p-3 rounded-lg" style={{ background: "var(--glass-bg)" }}>
                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                          <strong>Notes:</strong> {booking.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}