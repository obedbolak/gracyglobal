"use client";

import useSWR from "swr";
import { useEffect, useState } from "react";

export interface Results {
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
  counselors: { id: string; name: string | null; image: string | null }[];
}

const EMPTY: Results = {
  products: [],
  services: [],
  courses: [],
  jobs: [],
  communities: [],
  counselors: [],
};

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

export function useSearch(query: string, opts?: { debounceMs?: number }) {
  const debounceMs = opts?.debounceMs ?? 300;
  const [debounced, setDebounced] = useState(query);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), debounceMs);
    return () => clearTimeout(t);
  }, [query, debounceMs]);

  const key = debounced.trim()
    ? `/api/search?q=${encodeURIComponent(debounced.trim())}`
    : null;

  const { data, error, isLoading, mutate } = useSWR<Results>(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  });

  return {
    data: data ?? EMPTY,
    loading: isLoading,
    error: error?.message ?? null,
    mutate,
  };
}

export default useSearch;
