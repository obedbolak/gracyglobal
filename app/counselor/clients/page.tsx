"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Loader2,
  User,
  Mail,
  Calendar,
  Search,
  Users as UsersIcon,
} from "lucide-react";

interface Client {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  sessionsCount: number;
  lastSession: string | null;
}

export default function CounselorClientsPage() {
  const { status } = useSession();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (status === "authenticated") fetchClients();
  }, [status]);

  const fetchClients = async () => {
    try {
      const meRes = await fetch("/api/counselors?me=true");
      const meJson = await meRes.json();
      if (!meJson.success) throw new Error("Failed to get profile");

      const counselorId = meJson.data.id;

      const res = await fetch(`/api/counselors/${counselorId}?include=clients`);
      const json = await res.json();
      if (json.success) setClients(json.data);
    } catch (err) {
      console.error("Failed to load clients:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = clients.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()),
  );

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
          Clients
        </h1>
        <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
          All clients who have booked sessions with you.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
          style={{ color: "var(--text-muted)" }}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clients..."
          className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm"
        />
      </div>

      {/* Client list */}
      {filtered.length === 0 ? (
        <div
          className="p-12 rounded-2xl text-center"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <UsersIcon
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: "var(--text-disabled)" }}
          />
          <p
            className="text-lg font-semibold mb-1"
            style={{ color: "var(--text-muted)" }}
          >
            {search ? "No clients match your search" : "No clients yet"}
          </p>
          <p className="text-sm" style={{ color: "var(--text-disabled)" }}>
            Clients will appear here after they book sessions with you.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((client) => (
            <div
              key={client.id}
              className="p-5 rounded-2xl transition-all hover:scale-[1.01]"
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                {client.image ? (
                  <img
                    src={client.image}
                    alt={client.name || "Client"}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: "var(--glass-bg-subtle)" }}
                  >
                    <User
                      className="w-6 h-6"
                      style={{ color: "var(--text-muted)" }}
                    />
                  </div>
                )}
                <div>
                  <p
                    className="font-bold text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {client.name || "Unknown"}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {client.email}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div
                  className="p-3 rounded-xl"
                  style={{ background: "var(--glass-bg-subtle)" }}
                >
                  <p
                    className="text-[10px] font-medium mb-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Sessions
                  </p>
                  <p
                    className="text-sm font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {client.sessionsCount}
                  </p>
                </div>
                <div
                  className="p-3 rounded-xl"
                  style={{ background: "var(--glass-bg-subtle)" }}
                >
                  <p
                    className="text-[10px] font-medium mb-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Last Session
                  </p>
                  <p
                    className="text-xs font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {client.lastSession
                      ? new Date(client.lastSession).toLocaleDateString(
                          "en-GB",
                          { day: "numeric", month: "short" },
                        )
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
