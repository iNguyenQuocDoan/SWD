/**
 * Review Service
 * Handles review CRUD operations and shop ratings
 */

import { apiClient } from "../api";

export interface Review {
  _id: string;
  orderItemId: string | { _id: string; productId: string };
  userId: string | { _id: string; fullName: string; avatarUrl?: string };
  shopId: string | { _id: string; shopName: string };
  rating: number;
  comment: string;
  status: "Visible" | "Hidden";
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  orderItemId: string;
  shopId: string;
  rating: number;
  comment: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ShopRatingStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

class ReviewService {
  /**
   * Create a new review
   */
  async createReview(data: CreateReviewRequest): Promise<Review> {
    const response = await apiClient.post<Review>("/reviews", data);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to create review");
  }

  /**
   * Get reviews by shop ID
   */
  async getReviewsByShop(
    shopId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ReviewsResponse> {
    const response = await apiClient.get<ReviewsResponse>(
      `/reviews/shop/${shopId}?page=${page}&limit=${limit}`
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to get reviews");
  }

  /**
   * Get my reviews
   */
  async getMyReviews(): Promise<Review[]> {
    const response = await apiClient.get<Review[]>("/reviews/me/my-reviews");

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to get my reviews");
  }

  /**
   * Get review by ID
   */
  async getReviewById(reviewId: string): Promise<Review> {
    const response = await apiClient.get<Review>(`/reviews/${reviewId}`);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to get review");
  }

  /**
   * Update my review
   */
  async updateReview(reviewId: string, data: UpdateReviewRequest): Promise<Review> {
    const response = await apiClient.put<Review>(`/reviews/${reviewId}`, data);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to update review");
  }

  /**
   * Delete my review
   */
  async deleteReview(reviewId: string): Promise<void> {
    const response = await apiClient.delete(`/reviews/${reviewId}`);

    if (!response.success) {
      throw new Error(response.message || "Failed to delete review");
    }
  }

  /**
   * Get shop rating statistics
   */
  async getShopRatingStats(shopId: string): Promise<ShopRatingStats> {
    const response = await apiClient.get<ShopRatingStats>(
      `/reviews/shop/${shopId}/stats`
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to get rating stats");
  }

  // Moderator methods

  /**
   * Get all reviews for moderation (Moderator only)
   */
  async getAllReviewsForModeration(
    page: number = 1,
    limit: number = 20,
    status?: "Visible" | "Hidden"
  ): Promise<ReviewsResponse> {
    let url = `/reviews/moderation/all?page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }

    const response = await apiClient.get<ReviewsResponse>(url);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to get reviews for moderation");
  }

  /**
   * Hide review (Moderator only)
   */
  async hideReview(reviewId: string): Promise<Review> {
    const response = await apiClient.patch<Review>(`/reviews/${reviewId}/hide`);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to hide review");
  }

  /**
   * Unhide review (Moderator only)
   */
  async unhideReview(reviewId: string): Promise<Review> {
    const response = await apiClient.patch<Review>(`/reviews/${reviewId}/unhide`);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to unhide review");
  }
}

export const reviewService = new ReviewService();
