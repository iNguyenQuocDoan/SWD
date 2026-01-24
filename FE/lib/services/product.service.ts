/**
 * Product Service
 * Handles product CRUD operations for sellers and product listing for customers
 */

import { apiClient } from "../api";

export interface Platform {
  _id: string;
  platformName: string;
  logoUrl?: string;
  status: "Active" | "Hidden";
}

export interface ProductShop {
  _id: string;
  shopName: string;
  ratingAvg: number;
}

export interface Product {
  _id: string;
  shopId: string | ProductShop;
  platformId: string | Platform;
  title: string;
  description: string;
  warrantyPolicy: string;
  howToUse: string;
  planType: "Personal" | "Family" | "Slot" | "Shared" | "InviteLink";
  durationDays: number;
  price: number;
  status: "Pending" | "Approved" | "Rejected" | "Hidden";
  approvedByUserId?: string | null;
  approvedAt?: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  shopId: string;
  platformId: string;
  title: string;
  description: string;
  warrantyPolicy: string;
  howToUse: string;
  planType: "Personal" | "Family" | "Slot" | "Shared" | "InviteLink";
  durationDays: number;
  price: number;
}

export interface UpdateProductRequest {
  title?: string;
  description?: string;
  warrantyPolicy?: string;
  howToUse?: string;
  planType?: "Personal" | "Family" | "Slot" | "Shared" | "InviteLink";
  durationDays?: number;
  price?: number;
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductFilter {
  platformId?: string;
  planType?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

class ProductService {
  /**
   * Get public products (approved only)
   */
  async getProducts(filter: ProductFilter = {}): Promise<ProductsResponse> {
    const params = new URLSearchParams();

    if (filter.platformId) params.append("platformId", filter.platformId);
    if (filter.planType) params.append("planType", filter.planType);
    if (filter.minPrice !== undefined)
      params.append("minPrice", filter.minPrice.toString());
    if (filter.maxPrice !== undefined)
      params.append("maxPrice", filter.maxPrice.toString());
    if (filter.page) params.append("page", filter.page.toString());
    if (filter.limit) params.append("limit", filter.limit.toString());

    const queryString = params.toString();
    const url = queryString ? `/products?${queryString}` : "/products";

    const response = await apiClient.get<Product[]>(url);

    if (response.success && response.data) {
      // API returns array directly with pagination in response
      return {
        products: response.data,
        pagination: (response as any).pagination || {
          page: filter.page || 1,
          limit: filter.limit || 20,
          total: response.data.length,
          totalPages: 1,
        },
      };
    }

    throw new Error(response.message || "Failed to get products");
  }

  /**
   * Get product by ID (public)
   */
  async getProductById(productId: string): Promise<Product> {
    const response = await apiClient.get<Product>(`/products/${productId}`);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to get product");
  }

  // Seller methods

  /**
   * Create a new product (Seller only)
   */
  async createProduct(data: CreateProductRequest): Promise<Product> {
    const response = await apiClient.post<Product>("/products", data);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to create product");
  }

  /**
   * Get my products by shop ID (Seller only)
   */
  async getMyProducts(shopId: string): Promise<Product[]> {
    const response = await apiClient.get<Product[]>(`/products/shop/${shopId}`);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to get my products");
  }

  /**
   * Get my product by ID (Seller only)
   */
  async getMyProductById(productId: string): Promise<Product> {
    const response = await apiClient.get<Product>(`/products/me/${productId}`);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to get product");
  }

  /**
   * Update product (Seller only)
   */
  async updateProduct(
    productId: string,
    data: UpdateProductRequest
  ): Promise<Product> {
    const response = await apiClient.put<Product>(`/products/${productId}`, data);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to update product");
  }

  /**
   * Delete product (Seller only)
   */
  async deleteProduct(productId: string): Promise<void> {
    const response = await apiClient.delete(`/products/${productId}`);

    if (!response.success) {
      throw new Error(response.message || "Failed to delete product");
    }
  }

  // Moderator methods

  /**
   * Get pending products (Moderator only)
   */
  async getPendingProducts(): Promise<Product[]> {
    const response = await apiClient.get<Product[]>("/products/applications/pending");

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to get pending products");
  }

  /**
   * Approve product (Moderator only)
   */
  async approveProduct(productId: string): Promise<Product> {
    const response = await apiClient.patch<Product>(
      `/products/${productId}/approve`
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to approve product");
  }

  /**
   * Reject product (Moderator only)
   */
  async rejectProduct(productId: string): Promise<Product> {
    const response = await apiClient.patch<Product>(
      `/products/${productId}/reject`
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to reject product");
  }
}

export const productService = new ProductService();
