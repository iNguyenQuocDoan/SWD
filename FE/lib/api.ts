/**
 * API Client for Backend using Axios
 * Handles all API requests with automatic token management
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/lib/auth";

const getApiUrl = (): string => {
  // If NEXT_PUBLIC_API_URL is set, use it (works for both client and server)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Check if we're in browser/client-side
  const isClient = typeof globalThis.window !== "undefined";
  
  if (isClient) {
    // Client-side: use relative URL
    // In local dev: Next.js rewrites will proxy /api/* to http://localhost:3001/api/*
    // In production: Vercel routing will handle /api/* to backend
    return "/api";
  }
  
  // Server-side (SSR/API routes):
  // - If API_URL is set, use it
  if (process.env.API_URL) {
    return process.env.API_URL;
  }

  // In Vercel production, construct URL from VERCEL_URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api`;
  }

  // Local development: server-side needs full URL (can't use relative path)
  // Production: use relative path (same domain)
  const isProduction = process.env.NODE_ENV === "production";
  return isProduction ? "/api" : "http://localhost:3001/api";
};

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface ApiError {
  message: string;
  status?: number;
}

class ApiClient {
  private readonly axiosInstance: AxiosInstance;
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = getApiUrl();
    
    // Create axios instance
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      withCredentials: true, // Important for cookies
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
      },
    });

    // Request interceptor - Add token to headers
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // If sending FormData, let Axios set correct multipart boundary
        if (config.data instanceof FormData && config.headers) {
          delete (config.headers as any)["Content-Type"];
          delete (config.headers as any)["content-type"];
        }
        
        // Disable cache cho tất cả requests, đặc biệt là /auth/me
        if (config.headers) {
          config.headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
          config.headers["Pragma"] = "no-cache";
          
          // Thêm timestamp để bypass cache cho /auth/me
          if (config.url?.includes("/auth/me")) {
            config.params = { ...config.params, _t: Date.now() };
          }
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle errors
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Xử lý đặc biệt cho /auth/me endpoint
        if (typeof globalThis.window !== "undefined" && response.config.url?.includes("/auth/me")) {
          const hasCookie = globalThis.document.cookie.includes("accessToken=");
          const hasLocalStorage = !!globalThis.localStorage?.getItem("accessToken");
          
          // Nếu nhận 304 (Not Modified) - browser đang dùng cache
          // Kiểm tra cookie ngay lập tức vì 304 không có body, chỉ có headers
          if (response.status === 304) {
            if (!hasCookie && !hasLocalStorage) {
              // Cookie đã bị xóa nhưng browser vẫn cache - clear auth state
              this.clearToken();
              useAuthStore.getState().logout();
              
              // Redirect to login if not on public page
              const currentPath = globalThis.window.location.pathname;
              const publicPaths = ["/", "/login", "/register", "/products", "/categories", "/sellers"];
              const isPublicPath = publicPaths.some((path) => currentPath.startsWith(path)) || 
                                   currentPath === "/404" || 
                                   currentPath.startsWith("/_next");
              
              if (!isPublicPath) {
                globalThis.window.location.href = "/login";
              }
              // Reject để không tiếp tục xử lý response 304 này
              return Promise.reject(new Error("Cookie deleted - authentication required"));
            }
            // Nếu có cookie nhưng nhận 304, reject để AuthProvider retry với timestamp mới
            // Điều này đảm bảo luôn có data mới nhất từ server
            return Promise.reject({
              response: {
                status: 304,
                statusText: "Not Modified",
                data: null,
              },
              config: response.config,
              message: "304 Not Modified - retry needed",
              isAxiosError: true,
            });
          }
          
          // Với response 200, kiểm tra cookie
          if (!hasCookie && !hasLocalStorage) {
            // Cookie đã bị xóa - clear auth state
            this.clearToken();
            useAuthStore.getState().logout();
          }
        }
        return response;
      },
      (error: AxiosError<ApiResponse>) => {
        // Only handle 401 errors from actual API calls (not 404 or other errors)
        // Also check if the error is from our API base URL to avoid handling Next.js routing errors
        const isApiCall =
          error.config?.url &&
          (error.config.url.startsWith(this.baseUrl) ||
            error.config.url.startsWith("/api") ||
            error.config.url.includes("/api/"));

        if (error.response?.status === 401 && isApiCall) {
          // Token expired or invalid - clear token và đồng bộ store
          this.clearToken();
          useAuthStore.getState().logout();

          // Only redirect if we're not on a public page or error page
          if (typeof globalThis.window !== "undefined") {
            const currentPath = globalThis.window.location.pathname;
            const publicPaths = [
              "/",
              "/login",
              "/register",
              "/products",
              "/categories",
              "/sellers",
            ];
            const isPublicPath =
              publicPaths.some((path) => currentPath.startsWith(path)) ||
              currentPath === "/404" ||
              currentPath.startsWith("/_next");

            // Don't redirect if on public pages, 404 page, or Next.js internal routes
            if (!isPublicPath) {
              globalThis.window.location.href = "/login";
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get auth token from cookie or localStorage
   */
  private getToken(): string | null {
    if (typeof globalThis.window === "undefined") return null;
    
    // Try to get from cookie first (set by backend)
    const cookies = globalThis.document.cookie.split(";");
    const accessTokenCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("accessToken=")
    );
    
    if (accessTokenCookie) {
      return accessTokenCookie.split("=")[1];
    }
    
    // Fallback to localStorage
    return globalThis.localStorage.getItem("accessToken");
  }

  /**
   * Set token in localStorage (for client-side access)
   */
  setToken(token: string): void {
    if (typeof globalThis.window !== "undefined") {
      globalThis.localStorage.setItem("accessToken", token);
    }
  }

  /**
   * Remove token from localStorage
   */
  clearToken(): void {
    if (typeof globalThis.window !== "undefined") {
      globalThis.localStorage.removeItem("accessToken");
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      // Log request for featured/top products
      if (endpoint.includes("/products/featured") || endpoint.includes("/products/top")) {
        console.log("[API Client] ===== Making request =====");
        console.log("[API Client] Endpoint:", endpoint);
        console.log("[API Client] Base URL:", this.baseUrl);
        console.log("[API Client] Full URL:", `${this.baseUrl}${endpoint}`);
        console.log("[API Client] Config:", config);
      }
      const response = await this.axiosInstance.get<ApiResponse<T>>(endpoint, config);
      
      // Debug log for products endpoints
      if (endpoint.includes("/products")) {
        console.log("[API Client] Products response:", {
          endpoint,
          status: response.status,
          success: response.data?.success,
          hasData: !!response.data?.data,
          dataType: Array.isArray(response.data?.data) ? "array" : typeof response.data?.data,
          dataLength: Array.isArray(response.data?.data) ? response.data.data.length : "N/A",
          firstItem: Array.isArray(response.data?.data) && response.data.data.length > 0 ? {
            id: (response.data.data[0] as any)?._id || (response.data.data[0] as any)?.id,
            title: (response.data.data[0] as any)?.title,
            hasSalesCount: (response.data.data[0] as any)?.salesCount !== undefined,
            salesCount: (response.data.data[0] as any)?.salesCount,
            keys: Object.keys(response.data.data[0] || {}),
          } : null,
          fullResponse: endpoint.includes("/featured") || endpoint.includes("/top") ? response.data : undefined,
        });
      }
      
      return response.data;
    } catch (error) {
      // Log error for featured/top products
      if (endpoint.includes("/products/featured") || endpoint.includes("/products/top")) {
        console.error("[API Client] Error for", endpoint, ":", error);
        console.error("[API Client] Error details:", {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          response: (error as any)?.response?.data,
          status: (error as any)?.response?.status,
        });
      }
      throw this.handleError(error);
    }
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.post<ApiResponse<T>>(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.put<ApiResponse<T>>(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.patch<ApiResponse<T>>(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.delete<ApiResponse<T>>(endpoint, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle axios errors
   */
  private handleError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiResponse>;
      return {
        message: axiosError.response?.data?.message || axiosError.message || "Network error occurred",
        status: axiosError.response?.status || 500,
      };
    }
    return {
      message: "An unexpected error occurred",
      status: 500,
    };
  }
}

export const apiClient = new ApiClient();

// Default export for convenience so services can `import api from "./api"`
export default apiClient;
