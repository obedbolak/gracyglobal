"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Video, Calendar, Users } from "lucide-react";

interface LiveSession {
  id: string;
  title: string;
  scheduledAt: string;
  duration: number;
  maxParticipants: number;
  _count?: { participants: number };
}

export default function TeacherLiveSessionsPage() {
  const { data: session, status } = useSession();
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") fetchSessions();
  }, [status]);

  const fetchSessions = async () => {
    try {
      const res = await fetch(`/api/live-sessions?teacherId=${session?.user?.id}`);
      const json = await res.json();
      if (json.sessions) setSessions(json.sessions);
    } catch (err) {
      console.error("Failed to load sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--purple)" }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold" style={{ color: "var(--text-primary)" }}>
        Live Sessions
      </h1>

      {sessions.length === 0 ? (
        <div
          className="p-12 rounded-2xl text-center"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <Video className="w-12 h-12 mx-auto mb-3" style={{ color: "var(--text-disabled)" }} />
          <p className="text-lg font-semibold" style={{ color: "var(--text-muted)" }}>
            No live sessions yet
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="p-6 rounded-xl"
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
              }}
            >
              <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                {session.title}
              </h3>
              <div className="flex items-center gap-4 text-sm" style={{ color: "var(--text-muted)" }}>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(session.scheduledAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {session._count?.participants || 0} / {session.maxParticipants}
                </span>
                <span>{session.duration} min</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
