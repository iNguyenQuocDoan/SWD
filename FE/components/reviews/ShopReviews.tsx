"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { ReviewList } from "./ReviewList";
import { reviewService } from "@/lib/services/review.service";
import { useShopReviews, SocketReviewPayload } from "@/lib/hooks/useSocket";
import type { Review, RatingStats } from "@/lib/services/review.service";

interface ShopReviewsProps {
  shopId: string;
  className?: string;
}

export function ShopReviews({ shopId, className }: ShopReviewsProps) {
  // State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch reviews
  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const [reviewsResponse, statsResponse] = await Promise.all([
        reviewService.getReviewsByShop(shopId, page, 10),
        reviewService.getShopRatingStats(shopId),
      ]);

      setReviews(reviewsResponse.reviews);
      setTotalPages(reviewsResponse.totalPages);
      setStats(statsResponse);
    } catch {
      toast.error("Không thể tải đánh giá");
    } finally {
      setIsLoading(false);
    }
  }, [shopId, page]);

  // Initial fetch
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Real-time updates via WebSocket
  useShopReviews(
    shopId,
    // On review created
    useCallback(
      (payload: SocketReviewPayload) => {
        if (payload.shopId === shopId) {
          fetchReviews();
        }
      },
      [shopId, fetchReviews]
    ),
    // On review updated
    useCallback(
      (payload: SocketReviewPayload) => {
        if (payload.shopId === shopId) {
          setReviews((prev) =>
            prev.map((r) =>
              r._id === payload.reviewId
                ? {
                    ...r,
                    rating: payload.rating ?? r.rating,
                    comment: payload.comment ?? r.comment,
                    images: payload.images ?? r.images,
                  }
                : r
            )
          );
          // Update stats if provided
          if (payload.shopRatingAvg !== undefined && stats) {
            setStats({
              ...stats,
              averageRating: payload.shopRatingAvg,
            });
          }
        }
      },
      [shopId, stats]
    ),
    // On review deleted
    useCallback(
      (payload: SocketReviewPayload) => {
        if (payload.shopId === shopId) {
          setReviews((prev) => prev.filter((r) => r._id !== payload.reviewId));
          fetchReviews();
        }
      },
      [shopId, fetchReviews]
    )
  );

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className={className}>
      <ReviewList
        reviews={reviews}
        stats={stats || undefined}
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        isLoading={isLoading}
      />
    </div>
  );
}
