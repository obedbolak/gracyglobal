"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Search } from "lucide-react";

interface Results {
  products: { id: string; name: string; images: string[]; price: number }[];
  services: { id: string; name: string; images: string[] }[];
  courses: {
    id: string;
    title: string;
    thumbnail: string | null;
    price: number;
    isFree: boolean;
  }[];
  jobs: {
    id: string;
    title: string;
    company: string;
    location: string | null;
  }[];
  communities: {
    id: string;
    name: string;
    slug: string;
    image: string | null;
  }[];
  counselors: {
    id: string;
    user: { id: string; name: string | null; image: string | null };
  }[];
}

const EMPTY: Results = {
  products: [],
  services: [],
  courses: [],
  jobs: [],
  communities: [],
  counselors: [],
};

function SearchResults() {
  const q = useSearchParams().get("q") ?? "";
  const [data, setData] = useState<Results>(EMPTY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q.trim()) return;
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((r) => (r.ok ? r.json() : EMPTY))
      .then(setData)
      .catch(() => setData(EMPTY))
      .finally(() => setLoading(false));
  }, [q]);

  const total =
    data.products.length +
    data.services.length +
    data.courses.length +
    data.jobs.length +
    data.communities.length;

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 min-h-screen">
      <h1
        className="text-xl font-bold mb-1 mt-14 "
        style={{ color: "var(--text-primary)" }}
      >
        Search results for “{q}”
      </h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2
            className="h-6 w-6 animate-spin"
            style={{ color: "var(--text-muted)" }}
          />
        </div>
      ) : total === 0 ? (
        <div
          className="flex flex-col items-center gap-3 py-20"
          style={{ color: "var(--text-muted)" }}
        >
          <Search className="h-8 w-8" />
          <p className="text-sm">No results found.</p>
        </div>
      ) : (
        <div className="space-y-8 mt-6">
          <Group
            title="Counselors"
            items={data.counselors.map((c) => ({
              key: c.id,
              href: `/counselors/${c.id}/book`,
              title: c.user?.name ?? "Counselor",
              image: c.user?.image ?? null,
            }))}
          />
          <Group
            title="Communities"
            items={data.communities.map((c) => ({
              key: c.id,
              href: `/community?slug=${c.slug}`,
              title: c.name,
              image: c.image,
            }))}
          />
          <Group
            title="Products"
            items={data.products.map((p) => ({
              key: p.id,
              href: `/marketplace/${p.id}`,
              title: p.name,
              image: p.images?.[0] ?? null,
              sub: `${p.price.toLocaleString()} XAF`,
            }))}
          />
          <Group
            title="Services"
            items={data.services.map((s) => ({
              key: s.id,
              href: `/services/${s.id}`,
              title: s.name,
              image: s.images?.[0] ?? null,
            }))}
          />
          <Group
            title="Courses"
            items={data.courses.map((c) => ({
              key: c.id,
              href: `/learn/${c.id}`,
              title: c.title,
              image: c.thumbnail,
              sub: c.isFree ? "Free" : `${c.price.toLocaleString()} XAF`,
            }))}
          />
          <Group
            title="Jobs"
            items={data.jobs.map((j) => ({
              key: j.id,
              href: `/jobs/${j.id}`,
              title: j.title,
              image: null,
              sub: [j.company, j.location].filter(Boolean).join(" · "),
            }))}
          />
        </div>
      )}
    </main>
  );
}

function Group({
  title,
  items,
}: {
  title: string;
  items: {
    key: string;
    href: string;
    title: string;
    image: string | null;
    sub?: string;
  }[];
}) {
  if (items.length === 0) return null;
  return (
    <section>
      <h2
        className="text-xs font-bold uppercase tracking-widest mb-3"
        style={{ color: "var(--text-muted)" }}
      >
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((it) => (
          <Link
            key={it.key}
            href={it.href}
            className="flex items-center gap-3 rounded-xl p-3 transition-all hover:scale-[1.01]"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
            }}
          >
            {it.image ? (
              <img
                src={it.image}
                alt=""
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-lg flex-shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, var(--purple), var(--scarlet))",
                }}
              />
            )}
            <div className="min-w-0">
              <p
                className="text-sm font-semibold truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {it.title}
              </p>
              {it.sub && (
                <p
                  className="text-xs truncate"
                  style={{ color: "var(--text-muted)" }}
                >
                  {it.sub}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchResults />
    </Suspense>
  );
}
