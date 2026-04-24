// hooks/UseProducts.tsx
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import type { PaginatedResponse, ApiResponse } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductFilters {
  category?: string | { id: string; name: string } | null; // ✅ Allow both string and object
  group?: string;
  featured?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "featured" | "price-asc" | "price-desc" | "newest" | "rating";
  page?: number;
  limit?: number;
}

export interface ProductItem {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  categoryId: string;
  category?: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  };
  group: string;
  stock: number;
  featured: boolean;
  active: boolean;
  rating: number;
  reviews: number;
  badge: string | null;
  benefits: string[];
  ingredients: string[];
  sellerId: string | null;
  createdAt: string;
}

type ProductsPage = PaginatedResponse<ProductItem>;

// ─── Fetcher ──────────────────────────────────────────────────────────────────

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? `Request failed: ${res.status}`);
  }
  const json: ApiResponse<T> = await res.json();
  if (!json.success || json.data === undefined) {
    throw new Error(json.error ?? "Unexpected API response");
  }
  return json.data;
}

// ─── URL builder ─────────────────────────────────────────────────────────────

function buildProductsUrl(filters: ProductFilters): string {
  const params = new URLSearchParams();

  // ✅ Handle category as string or object
  const categoryValue = (() => {
    if (!filters.category) return null;
    if (typeof filters.category === "string") return filters.category.trim();
    if (typeof filters.category === "object" && filters.category.name) {
      return filters.category.name.trim();
    }
    return null;
  })();

  if (categoryValue) params.set("category", categoryValue);

  // ✅ Safe string handling
  if (
    filters.group &&
    typeof filters.group === "string" &&
    filters.group.trim()
  ) {
    params.set("group", filters.group.trim());
  }

  if (filters.featured !== undefined) {
    params.set("featured", String(filters.featured));
  }

  if (
    filters.search &&
    typeof filters.search === "string" &&
    filters.search.trim()
  ) {
    params.set("search", filters.search.trim());
  }

  if (filters.minPrice !== undefined) {
    params.set("minPrice", String(filters.minPrice));
  }

  if (filters.maxPrice !== undefined) {
    params.set("maxPrice", String(filters.maxPrice));
  }

  if (filters.sort && filters.sort !== "featured") {
    params.set("sort", filters.sort);
  }

  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  const qs = params.toString();
  return `/api/products${qs ? `?${qs}` : ""}`;
}

// ─── useProducts — paginated list with caching ────────────────────────────────

export function useProducts(filters: ProductFilters = {}) {
  const url = buildProductsUrl(filters);

  const { data, error, isLoading, isValidating, mutate } = useSWR<ProductsPage>(
    url,
    fetcher,
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
      dedupingInterval: 5_000,
    },
  );

  return {
    products: data?.items ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    limit: data?.limit ?? 12,
    isLoading,
    isValidating,
    error: error as Error | undefined,
    mutate,
  };
}

// ─── useProduct — single product ──────────────────────────────────────────────

export function useProduct(id: string | null | undefined) {
  const { data, error, isLoading, mutate } = useSWR<{ product: ProductItem }>(
    id ? `/api/products/${id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30_000,
    },
  );

  return {
    product: data?.product ?? null,
    isLoading,
    error: error as Error | undefined,
    mutate,
  };
}

// ─── useInfiniteProducts — infinite scroll list ───────────────────────────────

export function useInfiniteProducts(
  filters: Omit<ProductFilters, "page"> = {},
  limit = 12,
) {
  const getKey = (pageIndex: number, previousData: ProductsPage | null) => {
    if (previousData && pageIndex + 1 > previousData.totalPages) return null;
    return buildProductsUrl({ ...filters, page: pageIndex + 1, limit });
  };

  const { data, error, isLoading, isValidating, size, setSize, mutate } =
    useSWRInfinite<ProductsPage>(getKey, fetcher, {
      revalidateFirstPage: false,
      keepPreviousData: true,
      dedupingInterval: 5_000,
    });

  const pages = data ?? [];
  const products = pages.flatMap((p) => p.items);
  const total = pages[0]?.total ?? 0;
  const totalPages = pages[0]?.totalPages ?? 1;
  const hasMore = size < totalPages;

  return {
    products,
    total,
    hasMore,
    isLoading,
    isLoadingMore: isValidating && size > 1,
    loadMore: () => setSize((s) => s + 1),
    mutate,
    error: error as Error | undefined,
  };
}

// ─── useFeaturedProducts ──────────────────────────────────────────────────────

export function useFeaturedProducts(limit = 6) {
  return useProducts({ featured: true, limit });
}

// ─── useProductsByCategory ────────────────────────────────────────────────────

export function useProductsByCategory(categoryName: string, limit = 12) {
  return useProducts({ category: categoryName, limit });
}

// ✅ Add helper for when you have a category object
export function useProductsByCategoryObject(
  categoryObj: { id: string; name: string } | null,
  limit = 12,
) {
  return useProducts({ category: categoryObj, limit });
}
