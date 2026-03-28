// hooks/useCounselors.ts
"use client";

import { useState, useEffect } from "react";

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

export function useCounselors(options: UseCounselorsOptions = {}) {
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCounselors() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (options.specialty) params.append("specialty", options.specialty);
        if (options.available !== undefined)
          params.append("available", String(options.available));
        if (options.minPrice)
          params.append("minPrice", String(options.minPrice));
        if (options.maxPrice)
          params.append("maxPrice", String(options.maxPrice));
        if (options.search) params.append("search", options.search);

        const response = await fetch(`/api/counselors?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Failed to fetch counselors");
        }

        const data = await response.json();
        setCounselors(data.counselors || []);
      } catch (err: any) {
        console.error("Error fetching counselors:", err);
        setError(err.message || "Failed to load counselors");
      } finally {
        setLoading(false);
      }
    }

    fetchCounselors();
  }, [
    options.specialty,
    options.available,
    options.minPrice,
    options.maxPrice,
    options.search,
  ]);

  return { counselors, loading, error };
}

// Hook for single counselor
export function useCounselor(id: string) {
  const [counselor, setCounselor] = useState<Counselor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchCounselor() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/counselors/${id}`);

        if (!response.ok) {
          throw new Error("Counselor not found");
        }

        const data = await response.json();
        setCounselor(data.counselor);
      } catch (err: any) {
        console.error("Error fetching counselor:", err);
        setError(err.message || "Failed to load counselor");
      } finally {
        setLoading(false);
      }
    }

    fetchCounselor();
  }, [id]);

  return { counselor, loading, error };
}
