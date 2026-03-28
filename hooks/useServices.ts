// hooks/useServices.ts
"use client";

import { useState, useEffect } from "react";

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

export function useServices(options: UseServicesOptions = {}) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchServices() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (options.category) params.append("category", options.category);
        if (options.group) params.append("group", options.group);
        if (options.featured !== undefined)
          params.append("featured", String(options.featured));
        if (options.search) params.append("search", options.search);

        const response = await fetch(`/api/services?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Failed to fetch services");
        }

        const data = await response.json();
        setServices(data.services || []);
      } catch (err: any) {
        console.error("Error fetching services:", err);
        setError(err.message || "Failed to load services");
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, [options.category, options.group, options.featured, options.search]);

  return { services, loading, error };
}

// Hook for single service
export function useService(id: string) {
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchService() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/services/${id}`);

        if (!response.ok) {
          throw new Error("Service not found");
        }

        const data = await response.json();
        setService(data.service);
      } catch (err: any) {
        console.error("Error fetching service:", err);
        setError(err.message || "Failed to load service");
      } finally {
        setLoading(false);
      }
    }

    fetchService();
  }, [id]);

  return { service, loading, error };
}
