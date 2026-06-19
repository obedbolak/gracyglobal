"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import {
  Wrench, PlusCircle, DollarSign, CalendarCheck, TrendingUp,
  Loader2, Pencil, Trash2, Star, Search,
} from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import CreatorServiceForm from "@/components/creator/creatorServiceForm";
import type { ServicesView } from "@/components/services-dashboard/ServicesDashSidebar";

interface Service {
  id: string;
  name: string;
  description: string;
  images: string[];
  categoryId: string;
  group: string;
  active: boolean;
  featured: boolean;
  rating: number;
  reviews: number;
  badge: string | null;
  includes: string[];
  availability: string | null;
  createdAt: string;
  category?: { id: string; name: string; icon: string | null };
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <div className="glass p-5 rounded-2xl" style={{ border: "1px solid var(--glass-border)" }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>{label}</p>
        <div className="p-2 rounded-xl" style={{ background: "var(--glass-bg-subtle)" }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>{value}</p>
    </div>
  );
}

// ── Service Card ──────────────────────────────────────────────────────────────

function ServiceCard({ service, onEdit, onDelete }: { service: Service; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="glass rounded-2xl overflow-hidden" style={{ border: "1px solid var(--glass-border)" }}>
      <div className="relative h-40 bg-[var(--glass-bg-subtle)]">
        {service.images?.[0] ? (
          <Image src={service.images[0]} alt={service.name} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Wrench className="w-10 h-10 opacity-20" style={{ color: "var(--text-muted)" }} />
          </div>
        )}
        <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-1 rounded-full ${service.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
          {service.active ? "Active" : "Inactive"}
        </span>
      </div>
      <div className="p-4">
        <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
          {service.category?.name ?? "Uncategorized"}
        </p>
        <h3 className="font-semibold truncate mb-1" style={{ color: "var(--text-primary)" }}>{service.name}</h3>
        <p className="text-xs line-clamp-2 mb-3" style={{ color: "var(--text-secondary)" }}>{service.description}</p>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {service.rating.toFixed(1)} ({service.reviews})
          </div>
          {service.availability && (
            <span className="text-xs truncate max-w-[100px]" style={{ color: "var(--text-muted)" }}>{service.availability}</span>
          )}
        </div>
        <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid var(--divider)" }}>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>{service.includes?.length ?? 0} includes</span>
          <div className="flex items-center gap-3">
            <button onClick={onEdit} className="flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--purple)" }}>
              <Pencil className="w-3 h-3" /> Edit
            </button>
            <button onClick={onDelete} className="flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--error-text)" }}>
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Overview ──────────────────────────────────────────────────────────────────

function Overview({ services, bookings, onViewChange, convert }: { services: Service[]; bookings: any[]; onViewChange: (v: ServicesView) => void; convert: (n: number) => string }) {
  const totalEarnings = bookings.filter((b) => b.status === "COMPLETED").reduce((a, b) => a + (b.totalPrice ?? 0), 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>My Services 🛠️</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>Manage your services and track bookings.</p>
        </div>
        <button onClick={() => onViewChange("create")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:scale-105 transition-transform" style={{ background: "linear-gradient(135deg, var(--purple), var(--blue))", boxShadow: "0 4px 16px rgba(123,47,190,0.4)" }}>
          <PlusCircle className="w-4 h-4" /> New Service
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Services" value={services.length} icon={Wrench} color="var(--purple)" />
        <StatCard label="Active" value={services.filter((s) => s.active).length} icon={TrendingUp} color="var(--blue)" />
        <StatCard label="Bookings" value={bookings.length} icon={CalendarCheck} color="var(--green)" />
        <StatCard label="Earnings" value={convert(totalEarnings)} icon={DollarSign} color="var(--yellow, #f59e0b)" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Recent Services</h2>
          <button onClick={() => onViewChange("services")} className="text-sm font-semibold" style={{ color: "var(--blue)" }}>View All →</button>
        </div>
        {services.length === 0 ? (
          <div className="glass p-12 rounded-2xl text-center" style={{ border: "1px solid var(--glass-border)" }}>
            <Wrench className="w-14 h-14 mx-auto mb-3" style={{ color: "var(--text-disabled)" }} />
            <p className="font-semibold mb-4" style={{ color: "var(--text-muted)" }}>No services yet</p>
            <button onClick={() => onViewChange("create")} className="btn-primary px-6 py-2.5 text-sm font-semibold rounded-xl">Add your first service</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.slice(0, 6).map((s) => (
              <ServiceCard key={s.id} service={s} onEdit={() => { onViewChange("services"); }} onDelete={() => {}} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Services List ─────────────────────────────────────────────────────────────

function ServicesList({ services, onAdd, onEdit, onDelete }: { services: Service[]; onAdd: () => void; onEdit: (s: Service) => void; onDelete: (id: string) => void }) {
  const [search, setSearch] = useState("");
  const filtered = services.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>My Services</h1>
        <button onClick={onAdd} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:scale-105 transition-transform" style={{ background: "linear-gradient(135deg, var(--purple), var(--blue))" }}>
          <PlusCircle className="w-4 h-4" /> Add Service
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search services..." className="glass-input w-full pl-9 pr-4 py-2.5 text-sm" />
      </div>

      {filtered.length === 0 ? (
        <div className="glass p-12 rounded-2xl text-center" style={{ border: "1px solid var(--glass-border)" }}>
          <Wrench className="w-14 h-14 mx-auto mb-3" style={{ color: "var(--text-disabled)" }} />
          <p className="font-semibold mb-4" style={{ color: "var(--text-muted)" }}>
            {search ? `No services matching "${search}"` : "No services yet"}
          </p>
          {!search && <button onClick={onAdd} className="btn-primary px-6 py-2.5 text-sm font-semibold rounded-xl">Add your first service</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <ServiceCard key={s.id} service={s} onEdit={() => onEdit(s)} onDelete={() => onDelete(s.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Bookings View ─────────────────────────────────────────────────────────────

function BookingsView({ bookings, convert }: { bookings: any[]; convert: (n: number) => string }) {
  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-600",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>Bookings</h1>
      {bookings.length === 0 ? (
        <div className="glass p-12 rounded-2xl text-center" style={{ border: "1px solid var(--glass-border)" }}>
          <CalendarCheck className="w-14 h-14 mx-auto mb-3" style={{ color: "var(--text-disabled)" }} />
          <p className="font-semibold" style={{ color: "var(--text-muted)" }}>No bookings yet</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden" style={{ border: "1px solid var(--glass-border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--divider)", background: "var(--glass-bg-subtle)" }}>
                {["Booking ID", "Service", "Total", "Status", "Date"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} style={{ borderBottom: "1px solid var(--divider)" }}>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--text-muted)" }}>#{b.id.slice(-8)}</td>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>{b.service?.name ?? "—"}</td>
                  <td className="px-4 py-3 font-semibold" style={{ color: "var(--accent-primary)" }}>{convert(b.totalPrice ?? 0)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusColors[b.status] ?? "bg-gray-100 text-gray-600"}`}>{b.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>{new Date(b.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Earnings View ─────────────────────────────────────────────────────────────

function EarningsView({ bookings, convert }: { bookings: any[]; convert: (n: number) => string }) {
  const completed = bookings.filter((b) => b.status === "COMPLETED");
  const total = completed.reduce((a, b) => a + (b.totalPrice ?? 0), 0);
  const thisMonth = completed
    .filter((b) => new Date(b.createdAt).getMonth() === new Date().getMonth())
    .reduce((a, b) => a + (b.totalPrice ?? 0), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>Earnings</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Earnings" value={convert(total)} icon={DollarSign} color="var(--green)" />
        <StatCard label="This Month" value={convert(thisMonth)} icon={TrendingUp} color="var(--purple)" />
        <StatCard label="Completed Bookings" value={completed.length} icon={CalendarCheck} color="var(--blue)" />
      </div>
      <div className="glass p-6 rounded-2xl" style={{ border: "1px solid var(--glass-border)" }}>
        <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>Recent Payouts</h2>
        {completed.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>No completed bookings yet</p>
        ) : (
          <div className="space-y-3">
            {completed.slice(0, 10).map((b) => (
              <div key={b.id} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid var(--divider)" }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{b.service?.name ?? `Booking #${b.id.slice(-8)}`}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{new Date(b.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="font-bold" style={{ color: "var(--green)" }}>{convert(b.totalPrice ?? 0)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Content ──────────────────────────────────────────────────────────────

export default function ServicesDashPageContent({ view, setView }: { view: ServicesView; setView: (v: ServicesView) => void }) {
  const { data: session } = useSession();
  const { convert } = useCurrency();

  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<Service | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetchData();
  }, [session?.user?.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sRes, bRes] = await Promise.all([
        fetch("/api/services?mine=true"),
        fetch("/api/service-bookings"),
      ]);
      const [sData, bData] = await Promise.all([sRes.json(), bRes.json()]);
      setServices(sData.services ?? []);
      setBookings(bData.bookings ?? []);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this service? This cannot be undone.")) return;
    await fetch(`/api/services/${id}`, { method: "DELETE" });
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  const handleFormSuccess = () => {
    setEditingService(null);
    setView("services");
    fetchData();
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--purple)" }} />
    </div>
  );

  if (view === "create" || view === "edit") {
    return (
      <CreatorServiceForm
        service={editingService ?? undefined}
        onSuccess={handleFormSuccess}
        onCancel={() => { setEditingService(null); setView("services"); }}
      />
    );
  }

  if (view === "services") return (
    <ServicesList
      services={services}
      onAdd={() => { setEditingService(null); setView("create"); }}
      onEdit={(s) => { setEditingService(s); setView("edit"); }}
      onDelete={handleDelete}
    />
  );

  if (view === "bookings") return <BookingsView bookings={bookings} convert={convert} />;
  if (view === "earnings") return <EarningsView bookings={bookings} convert={convert} />;

  return <Overview services={services} bookings={bookings} onViewChange={setView} convert={convert} />;
}
