/**
 * Order Service
 * Handles order operations for customers
 * NOTE: Backend APIs need to be implemented
 */

import { apiClient, type ApiResponse } from "../api";
import type { Order } from "@/types";

export interface OrderFilter {
  status?: string;
  page?: number;
  limit?: number;
  sort?: "createdAt" | "totalAmount";
}

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CustomerStats {
  totalOrders: number;
  activeOrders: number;
  totalSpent: number;
  pendingTickets: number;
  reviewsGiven: number;
}

class OrderService {
  /**
   * Get customer's orders
   * NOTE: Backend API needs to be implemented - GET /api/orders
   */
  async getMyOrders(filter: OrderFilter = {}): Promise<OrdersResponse> {
    const params = new URLSearchParams();
    
    if (filter.status) params.append("status", filter.status);
    if (filter.page) params.append("page", filter.page.toString());
    if (filter.limit) params.append("limit", filter.limit.toString());
    if (filter.sort) params.append("sort", filter.sort);

    const queryString = params.toString();
    const url = `/orders${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get<Order[]>(url);

    if (response.success && response.data) {
      const responseWithPagination = response as ApiResponse<Order[]> & {
        pagination?: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      };
      
      return {
        orders: response.data,
        pagination: responseWithPagination.pagination || {
          page: filter.page || 1,
          limit: filter.limit || 20,
          total: response.data.length,
          totalPages: 1,
        },
      };
    }

    throw new Error(response.message || "Failed to get orders");
  }

  /**
   * Get order by ID
   * NOTE: Backend API needs to be implemented - GET /api/orders/:orderId
   */
  async getOrderById(orderId: string): Promise<Order> {
    const response = await apiClient.get<Order>(`/orders/${orderId}`);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to get order");
  }

  /**
   * Create order from cart
   * NOTE: Backend API needs to be implemented - POST /api/orders
   */
  async createOrder(data: {
    items: Array<{ productId: string; quantity: number }>;
    paymentMethod: string;
  }): Promise<Order> {
    const response = await apiClient.post<Order>("/orders", data);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to create order");
  }

  /**
   * Get customer statistics
   * NOTE: Backend API needs to be implemented - GET /api/users/stats
   */
  async getCustomerStats(): Promise<CustomerStats> {
    const response = await apiClient.get<CustomerStats>("/users/stats");

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to get customer stats");
  }

  /**
   * Cancel order
   * NOTE: Backend API needs to be implemented - POST /api/orders/:orderId/cancel
   */
  async cancelOrder(orderId: string): Promise<void> {
    const response = await apiClient.post(`/orders/${orderId}/cancel`, {});

    if (!response.success) {
      throw new Error(response.message || "Failed to cancel order");
    }
  }

  /**
   * Confirm order item delivery
   * NOTE: Backend API needs to be implemented - POST /api/orders/items/:itemId/confirm
   */
  async confirmDelivery(orderItemId: string, confirmed: boolean): Promise<void> {
    const response = await apiClient.post(`/orders/items/${orderItemId}/confirm`, {
      confirmed,
    });

    if (!response.success) {
      throw new Error(response.message || "Failed to confirm delivery");
    }
  }
}

export const orderService = new OrderService();
