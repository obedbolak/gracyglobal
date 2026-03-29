"use client";
import useSWR from "swr";

export interface Counselor {
  id: string;
  bio: string | null;
  specialty: string;
  rating: number;
  reviews: number;
  pricePerHour: number;
  available: boolean;
  verified: boolean;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    country: string | null;
  };
  _count?: {
    bookings: number;
  };
}

interface UseCounselorsOptions {
  specialty?: string;
  available?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

// Hook for multiple counselors
export function useCounselors(options: UseCounselorsOptions = {}) {
  const params = new URLSearchParams();
  if (options.specialty) params.append("specialty", options.specialty);
  if (options.available !== undefined)
    params.append("available", String(options.available));
  if (options.minPrice) params.append("minPrice", String(options.minPrice));
  if (options.maxPrice) params.append("maxPrice", String(options.maxPrice));
  if (options.search) params.append("search", options.search);

  const key = `/api/counselors?${params.toString()}`;

  const { data, error, isLoading, mutate } = useSWR<{
    counselors: Counselor[];
  }>(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  });

  return {
    counselors: data?.counselors ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    mutate,
  };
}

// Hook for single counselor
export function useCounselor(id: string) {
  const { data, error, isLoading, mutate } = useSWR<{ counselor: Counselor }>(
    id ? `/api/counselors/${id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60_000,
    },
  );

  return {
    counselor: data?.counselor ?? null,
    loading: isLoading,
    error: error?.message ?? null,
    mutate,
  };
}
