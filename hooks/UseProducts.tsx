// hooks/useProducts.ts
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import type { PaginatedResponse, ApiResponse } from "@/lib/api";
import type { Product, ProductCategory, CategoryGroup } from "@/data/products";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductFilters {
  category?: ProductCategory | "All";
  group?: CategoryGroup | "All";
  featured?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "featured" | "price-asc" | "price-desc" | "newest" | "rating";
  page?: number;
  limit?: number;
}

// Shape returned by GET /api/products
type ProductsPage = PaginatedResponse<Product>;

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

  if (filters.category && filters.category !== "All")
    params.set("category", filters.category);
  if (filters.group && filters.group !== "All")
    params.set("group", filters.group);
  if (filters.featured !== undefined)
    params.set("featured", String(filters.featured));
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.minPrice !== undefined)
    params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined)
    params.set("maxPrice", String(filters.maxPrice));
  if (filters.sort && filters.sort !== "featured")
    params.set("sort", filters.sort);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  const qs = params.toString();
  return `/api/products${qs ? `?${qs}` : ""}`;
}

// ─── useProducts — paginated list with caching ────────────────────────────────
//
// Usage:
//   const { products, total, totalPages, isLoading, error, mutate } =
//     useProducts({ category: "Skincare", sort: "rating", page: 1 });

export function useProducts(filters: ProductFilters = {}) {
  const url = buildProductsUrl(filters);

  const { data, error, isLoading, isValidating, mutate } = useSWR<ProductsPage>(
    url,
    fetcher,
    {
      // Keep stale data visible while revalidating (no content flash)
      keepPreviousData: true,
      // Revalidate when window is refocused
      revalidateOnFocus: false,
      // Dedupe rapid identical requests within 5 s
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
//
// Usage:
//   const { product, isLoading, error } = useProduct("some-id");

export function useProduct(id: string | null | undefined) {
  const { data, error, isLoading, mutate } = useSWR<{ product: Product }>(
    id ? `/api/products/${id}` : null, // null = don't fetch
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30_000, // single product changes rarely
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
//
// Usage:
//   const { products, loadMore, hasMore, isLoading } =
//     useInfiniteProducts({ search: "shea" }, 12);

export function useInfiniteProducts(
  filters: Omit<ProductFilters, "page"> = {},
  limit = 12,
) {
  const getKey = (pageIndex: number, previousData: ProductsPage | null) => {
    // Stop fetching when we've reached the last page
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

// ─── useFeaturedProducts — shorthand for featured only ───────────────────────
//
// Usage:
//   const { products, isLoading } = useFeaturedProducts(6);

export function useFeaturedProducts(limit = 6) {
  return useProducts({ featured: true, limit });
}

// ─── useProductsByGroup — shorthand filtered by group ────────────────────────
//
// Usage:
//   const { products } = useProductsByGroup("Beauty & Personal Care");

export function useProductsByGroup(group: CategoryGroup, limit = 12) {
  return useProducts({ group, limit });
}
