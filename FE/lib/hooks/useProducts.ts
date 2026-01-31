/**
 * Hook to fetch products from API
 */

import { useState, useEffect, useCallback } from "react";
import { productService, ProductResponse, ProductFilter } from "@/lib/services/product.service";

export interface UseProductsOptions {
  initialFilter?: ProductFilter;
  autoFetch?: boolean;
}

export function useProducts(options: UseProductsOptions = {}) {
  const { initialFilter, autoFetch = true } = options;

  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ProductFilter>(initialFilter || {});

  const fetchProducts = useCallback(async (newFilter?: ProductFilter) => {
    try {
      setLoading(true);
      setError(null);
      const filterToUse = newFilter || filter;
      const response = await productService.getProducts(filterToUse);
      if (response.success && response.data) {
        setProducts(response.data);
      } else {
        setProducts([]);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load products";
      setError(errorMessage);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (autoFetch) {
      fetchProducts();
    }
  }, [autoFetch, fetchProducts]);

  const updateFilter = useCallback((newFilter: ProductFilter) => {
    setFilter(newFilter);
    fetchProducts(newFilter);
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    filter,
    setFilter: updateFilter,
    refetch: fetchProducts,
  };
}

export function useFeaturedProducts(limit: number = 6) {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("[useFeaturedProducts] Hook initialized with limit:", limit);
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("[useFeaturedProducts] Fetching featured products with limit:", limit);
        const response = await productService.getFeaturedProducts(limit);
        console.log("[useFeaturedProducts] API response:", {
          success: response.success,
          hasData: !!response.data,
          dataLength: Array.isArray(response.data) ? response.data.length : "N/A",
          data: response.data,
        });
        if (response.success && response.data) {
          console.log("[useFeaturedProducts] Setting products:", {
            count: response.data.length,
            firstProduct: response.data[0] ? {
              id: response.data[0]._id || response.data[0].id,
              title: response.data[0].title,
            } : null,
          });
          setProducts(response.data);
          console.log("[useFeaturedProducts] Products set successfully:", response.data.length);
        } else {
          console.warn("[useFeaturedProducts] No data in response:", {
            success: response.success,
            hasData: !!response.data,
            response: response,
          });
          setProducts([]);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load products";
        console.error("[useFeaturedProducts] Error:", errorMessage, err);
        setError(errorMessage);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, [limit]);

  return { products, loading, error };
}

export function useTopProducts(limit: number = 5) {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("[useTopProducts] Hook initialized with limit:", limit);
    const fetchTop = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("[useTopProducts] Fetching top products with limit:", limit);
        const response = await productService.getTopProducts(limit);
        console.log("[useTopProducts] API response:", {
          success: response.success,
          hasData: !!response.data,
          dataLength: Array.isArray(response.data) ? response.data.length : "N/A",
          data: response.data,
        });
        if (response.success && response.data) {
          console.log("[useTopProducts] Setting products:", {
            count: response.data.length,
            firstProduct: response.data[0] ? {
              id: response.data[0]._id || response.data[0].id,
              title: response.data[0].title,
            } : null,
          });
          setProducts(response.data);
          console.log("[useTopProducts] Products set successfully:", response.data.length);
        } else {
          console.warn("[useTopProducts] No data in response:", {
            success: response.success,
            hasData: !!response.data,
            response: response,
          });
          setProducts([]);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load products";
        console.error("[useTopProducts] Error:", errorMessage, err);
        setError(errorMessage);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTop();
  }, [limit]);

  return { products, loading, error };
}
