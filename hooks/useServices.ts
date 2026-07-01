"use client";

// hooks/useServices.ts

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
  categoryId: string;
  // Relation — populated when API does include: { category: true }
  category?: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  };
  seller?: {
    id: string;
    name: string | null;
    image: string | null;
    store: {
      id: string;
      slug: string | null;
      businessName: string;
      businessType: string | null;
      image: string | null;
      location: string | null;
      quarter: string | null;
      openingHours: string | null;
      description: string | null;
      phone: string | null;
      whatsapp: string | null;
      active: boolean;
    } | null;
  } | null;
  group: string;
  featured: boolean;
  active: boolean;
  rating: number;
  reviews: number;
  badge: string | null;
  includes: string[];
  availability: string | null;
  options: ServiceOption[];
  _count?: { bookings: number };
}

interface UseServicesOptions {
  categoryId?: string; // filter by category ID
  category?: string; // filter by category name (legacy / convenience)
  group?: string;
  featured?: boolean;
  search?: string;
}

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

export function useServices(options: UseServicesOptions = {}) {
  const params = new URLSearchParams();
  if (options.categoryId) params.append("categoryId", options.categoryId);
  if (options.category) params.append("category", options.category);
  if (options.group) params.append("group", options.group);
  if (options.featured !== undefined)
    params.append("featured", String(options.featured));
  if (options.search) params.append("search", options.search);

  const key = `/api/services?${params.toString()}`;

  const { data, error, isLoading, mutate } = useSWR<{
    services: Service[];
    count: number;
  }>(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  });

  return {
    services: data?.services ?? [],
    total: data?.count ?? 0,
    loading: isLoading,
    error: error?.message ?? null,
    mutate,
  };
}

export function useService(id: string) {
  const { data, error, isLoading, mutate } = useSWR<{ service: Service }>(
    id ? `/api/services/${id}` : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60_000 },
  );

  return {
    service: data?.service ?? null,
    loading: isLoading,
    error: error?.message ?? null,
    mutate,
  };
}
