"use client";
import useSWR from "swr";

export interface ServiceOption {
  id: string;
  name: string;
  description: string;
  pricingType: "MONTHLY" | "ONE_TIME" | "PER_SESSION";
  amount: number;
  yearlyAmount: number | null;
  label: string | null;
  duration: string | null;
  popular: boolean;
  active: boolean;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  images: string[];
  category: string;
  group: string;
  featured: boolean;
  active: boolean;
  rating: number;
  reviews: number;
  badge: string | null;
  includes: string[];
  availability: string | null;
  options: ServiceOption[];
  _count?: {
    bookings: number;
  };
}

interface UseServicesOptions {
  category?: string;
  group?: string;
  featured?: boolean;
  search?: string;
}

// Shared fetcher
const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

// Hook for multiple services
export function useServices(options: UseServicesOptions = {}) {
  const params = new URLSearchParams();
  if (options.category) params.append("category", options.category);
  if (options.group) params.append("group", options.group);
  if (options.featured !== undefined)
    params.append("featured", String(options.featured));
  if (options.search) params.append("search", options.search);

  const key = `/api/services?${params.toString()}`;

  const { data, error, isLoading, mutate } = useSWR<{ services: Service[] }>(
    key,
    fetcher,
    {
      revalidateOnFocus: false, // don't refetch when tab regains focus
      dedupingInterval: 60_000, // cache for 60 seconds
    },
  );

  return {
    services: data?.services ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    mutate, // call mutate() to manually refresh
  };
}

// Hook for single service
export function useService(id: string) {
  const { data, error, isLoading, mutate } = useSWR<{ service: Service }>(
    id ? `/api/services/${id}` : null, // null key = don't fetch
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60_000,
    },
  );

  return {
    service: data?.service ?? null,
    loading: isLoading,
    error: error?.message ?? null,
    mutate,
  };
}
