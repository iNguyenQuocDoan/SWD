/**
 * API Client for Backend using Axios
 * Handles all API requests with automatic token management
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

const getApiUrl = (): string => {
  // In browser/client: use relative URL or env variable
  if (typeof globalThis.window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL || "/api";
  }
  
  // In server: use full URL
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
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
      },
    });

    // Request interceptor - Add token to headers
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
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
          // Token expired or invalid - clear token
          this.clearToken();
          
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
      const response = await this.axiosInstance.get<ApiResponse<T>>(endpoint, config);
      return response.data;
    } catch (error) {
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
