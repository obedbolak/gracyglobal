"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Wrench, CalendarCheck, DollarSign, TrendingUp, PlusCircle, Loader2 } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";

export default function ServicesDashOverviewPage() {
  const { data: session } = useSession();
  const { convert } = useCurrency();
  const [services, setServices] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;
    Promise.all([
      fetch(`/api/services?sellerId=${session.user.id}`).then((r) => r.json()),
      fetch("/api/service-bookings").then((r) => r.json()),
    ]).then(([sData, bData]) => {
      setServices(sData.services ?? []);
      setBookings(bData.bookings ?? []);
    }).finally(() => setLoading(false));
  }, [session?.user?.id]);

  const totalEarnings = bookings
    .filter((b) => b.status === "COMPLETED")
    .reduce((acc: number, b: any) => acc + (b.totalPrice ?? 0), 0);

  const stats = [
    { label: "Total Services", value: services.length, icon: Wrench, color: "var(--purple)" },
    { label: "Active Services", value: services.filter((s) => s.active).length, icon: TrendingUp, color: "var(--blue)" },
    { label: "Total Bookings", value: bookings.length, icon: CalendarCheck, color: "var(--green)" },
    { label: "Earnings", value: convert(totalEarnings), icon: DollarSign, color: "var(--yellow, #f59e0b)", isText: true },
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--purple)" }} />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>My Services</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>Manage your services and track bookings.</p>
        </div>
        <Link
          href="/services-dashboard/services/create"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:scale-105 transition-transform"
          style={{ background: "linear-gradient(135deg, var(--purple), var(--blue))", boxShadow: "0 4px 16px rgba(123,47,190,0.4)" }}
        >
          <PlusCircle className="w-4 h-4" /> New Service
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass p-5 rounded-2xl" style={{ border: "1px solid var(--glass-border)" }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>{stat.label}</p>
                <div className="p-2 rounded-xl" style={{ background: "var(--glass-bg-subtle)" }}>
                  <Icon className="w-4 h-4" style={{ color: stat.color }} />
                </div>
              </div>
              <p className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>
                {stat.isText ? stat.value : stat.value.toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent Services */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>Recent Services</h2>
          <Link href="/services-dashboard/services" className="text-sm font-semibold" style={{ color: "var(--blue)" }}>View All →</Link>
        </div>
        {services.length === 0 ? (
          <div className="glass p-12 rounded-2xl text-center" style={{ border: "1px solid var(--glass-border)" }}>
            <Wrench className="w-12 h-12 mx-auto mb-3" style={{ color: "var(--text-disabled)" }} />
            <p className="font-semibold mb-1" style={{ color: "var(--text-muted)" }}>No services yet</p>
            <Link href="/services-dashboard/services/create" className="btn-primary mt-4 inline-block px-6 py-2.5 text-sm font-semibold rounded-xl">
              Add your first service
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.slice(0, 6).map((s: any) => (
              <div key={s.id} className="glass p-4 rounded-2xl flex items-center gap-4" style={{ border: "1px solid var(--glass-border)" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--glass-bg-subtle)" }}>
                  <Wrench className="w-5 h-5" style={{ color: "var(--purple)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>{s.name}</p>
                  <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{s.category?.name ?? "Service"}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${s.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                    {s.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <Link href={`/admin/services/${s.id}`} className="text-xs font-semibold" style={{ color: "var(--blue)" }}>Edit</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
