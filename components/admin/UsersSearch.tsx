"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
};

export default function UsersSearch({
  defaultValue = "",
}: {
  defaultValue?: string;
}) {
  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timer = useRef<number | null>(null);
  const abort = useRef<AbortController | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);
    if (!query) {
      setResults([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    timer.current = window.setTimeout(async () => {
      if (abort.current) abort.current.abort();
      abort.current = new AbortController();
      try {
        const res = await fetch(
          `/api/users?search=${encodeURIComponent(query)}`,
          { signal: abort.current.signal },
        );
        const data = await res.json();
        setResults(data.users || []);
        setOpen(true);
      } catch (e) {
        if ((e as any).name !== "AbortError") console.error(e);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (timer.current) window.clearTimeout(timer.current);
      if (abort.current) abort.current.abort();
    };
  }, [query]);

  function handleSelect(userId: string) {
    setOpen(false);
    router.push(`/admin/users/${userId}`);
  }

  return (
    <div
      className="relative"
      onBlur={() => setTimeout(() => setOpen(false), 150)}
    >
      <input
        name="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search users..."
        className="glass-input w-full pl-10 pr-4 py-2.5"
        onFocus={() => {
          if (results.length) setOpen(true);
        }}
      />

      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]">
          Loading...
        </div>
      )}

      {open && results.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 mt-2 bg-white shadow-lg rounded-md max-h-60 overflow-auto">
          {results.map((u) => (
            <li
              key={u.id}
              className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
              onClick={() => handleSelect(u.id)}
            >
              {u.image ? (
                <img
                  src={u.image}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[var(--purple-faint)] flex items-center justify-center text-sm">
                  {u.name?.charAt(0) || u.email.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="text-sm font-medium">{u.name || "No name"}</div>
                <div className="text-xs text-[var(--text-muted)]">
                  {u.email}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
