/**
 * Shop Service
 * Handles shop creation, management, and seller application status
 */

import { apiClient } from "../api";

export interface Shop {
  _id: string;
  ownerUserId: string;
  shopName: string;
  description?: string | null;
  status: "Pending" | "Active" | "Suspended" | "Closed";
  approvedByUserId?: string | null;
  approvedAt?: string | null;
  moderatorNote?: string | null;
  ratingAvg: number;
  totalSales: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShopRequest {
  shopName: string;
  description?: string;
}

export interface ApproveShopRequest {
  moderatorNote?: string;
}

export interface RejectShopRequest {
  moderatorNote?: string;
}

export interface ShopStats {
  availableBalance: number;
  holdBalance: number;
  escrowAmount: number;
  paidOutAmount: number;
  totalOrders: number;
  weeklyOrders: number;
  avgRating: number;
  totalReviews: number;
  totalProducts: number;
  approvedProducts: number;
  pendingProducts: number;
  inventory: {
    total: number;
    available: number;
    reserved: number;
    delivered: number;
  };
  totalSales: number;
}

class ShopService {
  /**
   * Create new shop (seller application)
   */
  async createShop(data: CreateShopRequest): Promise<Shop> {
    const response = await apiClient.post<Shop>("/shops", data);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || "Failed to create shop");
  }

  /**
   * Get current user's shop
   */
  async getMyShop(): Promise<Shop | null> {
    try {
      const response = await apiClient.get<Shop>("/shops/me/my-shop");
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return null;
    } catch (error: any) {
      // Return null if shop not found (user hasn't created shop yet)
      if (error?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get shop by ID
   */
  async getShopById(shopId: string): Promise<Shop> {
    const response = await apiClient.get<Shop>(`/shops/${shopId}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || "Failed to get shop");
  }

  /**
   * Update shop
   */
  async updateShop(shopId: string, data: Partial<CreateShopRequest>): Promise<Shop> {
    const response = await apiClient.put<Shop>(`/shops/${shopId}`, data);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || "Failed to update shop");
  }

  /**
   * Get pending shop applications (Moderator only)
   */
  async getPendingShops(): Promise<Shop[]> {
    try {
      const response = await apiClient.get<Shop[]>("/shops/applications/pending");
      
      if (response.success && response.data) {
        return response.data;
      }
      
      // If no data but success is true, return empty array
      if (response.success && !response.data) {
        return [];
      }
      
      // If response is not successful, log and return empty array
      console.warn("getPendingShops: Response not successful", {
        success: response.success,
        message: response.message,
        data: response.data,
      });
      
      return [];
    } catch (error: unknown) {
      // Safely log error information
      const logError = (label: string, value: unknown) => {
        try {
          console.error(`${label}:`, value);
        } catch (e) {
          console.error(`${label}: [Cannot log]`);
        }
      };

      logError("=== getPendingShops ERROR ===", "");
      logError("Raw error", error);
      logError("Error type", typeof error);
      
      try {
        logError("Error constructor", (error as any)?.constructor?.name);
      } catch (e) {
        // Ignore
      }
      
      try {
        logError("Error string", String(error));
      } catch (e) {
        // Ignore
      }
      
      // Try to stringify the error
      try {
        logError("Error JSON", JSON.stringify(error, null, 2));
      } catch (e) {
        logError("Cannot stringify error", e);
      }

      // Build error details safely
      const errorDetails: any = {};
      
      try {
        errorDetails.errorType = typeof error;
        if (error && typeof error === "object") {
          errorDetails.errorConstructor = (error as any)?.constructor?.name;
        }
        errorDetails.errorString = String(error);
      } catch (e) {
        errorDetails.initialError = String(e);
      }

      // Check if it's an ApiError (from apiClient.handleError)
      if (error && typeof error === "object") {
        const errorObj = error as any;
        
        try {
          // Check for ApiError structure (has message and status)
          if ("message" in errorObj && "status" in errorObj) {
            errorDetails.isApiError = true;
            errorDetails.message = errorObj.message;
            errorDetails.status = errorObj.status;
          }

          // Check if it's an Error instance
          if (error instanceof Error) {
            errorDetails.isErrorInstance = true;
            errorDetails.message = error.message;
            errorDetails.stack = error.stack;
            errorDetails.name = error.name;
          }

          // Check if it's an Axios error
          if ("isAxiosError" in errorObj) {
            errorDetails.isAxiosError = true;
            errorDetails.status = errorObj.response?.status;
            errorDetails.statusText = errorObj.response?.statusText;
            errorDetails.responseData = errorObj.response?.data;
            errorDetails.requestUrl = errorObj.config?.url;
            errorDetails.requestMethod = errorObj.config?.method;
          }

          // Try to extract properties safely
          try {
            const keys = Object.keys(errorObj);
            const ownKeys = Object.getOwnPropertyNames(errorObj);
            errorDetails.enumerableKeys = keys;
            errorDetails.ownPropertyNames = ownKeys;
            
            // Extract property values safely
            const allKeys = [...new Set([...keys, ...ownKeys])];
            allKeys.forEach((key) => {
              try {
                const value = errorObj[key];
                if (value === null || value === undefined) {
                  errorDetails[key] = value;
                } else if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
                  errorDetails[key] = value;
                } else if (Array.isArray(value)) {
                  errorDetails[key] = `[Array: ${value.length} items]`;
                } else if (typeof value === "object") {
                  errorDetails[key] = `[Object: ${value.constructor?.name || "Unknown"}]`;
                }
              } catch (e) {
                errorDetails[`${key}_error`] = "Cannot access";
              }
            });
          } catch (e) {
            errorDetails.propertyExtractionError = String(e);
          }
        } catch (e) {
          errorDetails.processingError = String(e);
        }
      }

      logError("getPendingShops error details", errorDetails);
      logError("=== END ERROR ===", "");
      
      // Extract error message safely
      let errorMessage = "Failed to get pending shops";
      
      try {
        if (error && typeof error === "object") {
          const errorObj = error as any;
          if (typeof errorObj.message === "string") {
            errorMessage = errorObj.message;
          } else if (error instanceof Error) {
            errorMessage = error.message;
          } else if (errorObj.status) {
            errorMessage = `Request failed with status ${errorObj.status}: ${errorObj.message || "Unknown error"}`;
          }
        } else if (error instanceof Error) {
          errorMessage = error.message;
        } else if (error) {
          errorMessage = String(error);
        }
      } catch (e) {
        // Use default message
      }
      
      // Instead of throwing, log and return empty array to prevent UI crash
      console.error("getPendingShops: Returning empty array due to error:", errorMessage);
      return [];
    }
  }

  /**
   * Approve shop (Moderator only)
   */
  async approveShop(shopId: string, data?: ApproveShopRequest): Promise<Shop> {
    const response = await apiClient.patch<Shop>(`/shops/${shopId}/approve`, data || {});
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || "Failed to approve shop");
  }

  /**
   * Reject shop (Moderator only)
   */
  async rejectShop(shopId: string, data?: RejectShopRequest): Promise<Shop> {
    const response = await apiClient.patch<Shop>(`/shops/${shopId}/reject`, data || {});

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to reject shop");
  }

  /**
   * Get seller dashboard stats
   */
  async getMyShopStats(): Promise<ShopStats | null> {
    try {
      const response = await apiClient.get<ShopStats>("/shops/me/stats");

      if (response.success && response.data) {
        return response.data;
      }

      return null;
    } catch (error: any) {
      // Return null if shop not found
      if (error?.status === 404) {
        return null;
      }
      console.error("Failed to get shop stats:", error);
      return null;
    }
  }
}

export const shopService = new ShopService();
