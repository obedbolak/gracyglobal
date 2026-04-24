// hooks/useCategories.ts

"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  image?: string | null;
  color: string | null;
  sortOrder: number;
  active: boolean;
}

export type CategoryType = "product" | "course" | "service";

const ENDPOINTS: Record<CategoryType, string> = {
  product: "/api/admin/categories",
  course: "/api/admin/course-categories",
  service: "/api/admin/service-categories",
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCategories(type: CategoryType): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(ENDPOINTS[type]);
      if (!res.ok) throw new Error(`Failed to fetch ${type} categories`);
      const data = await res.json();
      // All three APIs return { categories: [...] }
      setCategories(data.categories ?? []);
    } catch (e: any) {
      setError(e.message);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetch_();
  }, [fetch_]);

  return { categories, loading, error, refetch: fetch_ };
}
