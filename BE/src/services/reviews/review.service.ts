import { BaseService } from "@/services/base.service";
import { Review, IReview, Shop, OrderItem } from "@/models";
import { AppError } from "@/middleware/errorHandler";

export class ReviewService extends BaseService<IReview> {
  constructor() {
    super(Review);
  }

  /**
   * Create a new review for an order item
   */
  async createReview(
    userId: string,
    orderItemId: string,
    shopId: string,
    rating: number,
    comment: string
  ): Promise<IReview> {
    // Check if user already reviewed this order item
    const existingReview = await Review.findOne({
      userId,
      orderItemId,
    });
    if (existingReview) {
      throw new AppError("You have already reviewed this order item", 400);
    }

    // Verify order item exists and belongs to user
    const orderItem = await OrderItem.findById(orderItemId).populate("orderId");
    if (!orderItem) {
      throw new AppError("Order item not found", 404);
    }

    // Create review
    const review = await Review.create({
      orderItemId,
      userId,
      shopId,
      rating,
      comment,
      status: "Visible",
    });

    // Update shop rating
    await this.updateShopRating(shopId);

    return review;
  }

  /**
   * Get reviews by shop ID with pagination
   */
  async getReviewsByShop(
    shopId: string,
    options: {
      page?: number;
      limit?: number;
      status?: "Visible" | "Hidden";
    } = {}
  ): Promise<{ reviews: IReview[]; total: number; page: number; totalPages: number }> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const filter: any = { shopId };
    if (options.status) {
      filter.status = options.status;
    } else {
      // By default, only show visible reviews
      filter.status = "Visible";
    }

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate("userId", "fullName avatarUrl")
        .populate("orderItemId", "productId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments(filter),
    ]);

    return {
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get reviews by user ID
   */
  async getReviewsByUser(userId: string): Promise<IReview[]> {
    return Review.find({ userId })
      .populate("shopId", "shopName")
      .populate("orderItemId", "productId")
      .sort({ createdAt: -1 });
  }

  /**
   * Get review by ID
   */
  async getReviewById(reviewId: string): Promise<IReview | null> {
    return Review.findById(reviewId)
      .populate("userId", "fullName avatarUrl")
      .populate("shopId", "shopName")
      .populate("orderItemId", "productId");
  }

  /**
   * Update review (only by owner)
   */
  async updateReview(
    reviewId: string,
    userId: string,
    data: { rating?: number; comment?: string }
  ): Promise<IReview | null> {
    const review = await Review.findOne({ _id: reviewId, userId });
    if (!review) {
      throw new AppError("Review not found or access denied", 404);
    }

    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      { ...data },
      { new: true }
    );

    if (data.rating && review.shopId) {
      await this.updateShopRating(review.shopId.toString());
    }

    return updatedReview;
  }

  /**
   * Delete review (only by owner)
   */
  async deleteReview(reviewId: string, userId: string): Promise<boolean> {
    const review = await Review.findOne({ _id: reviewId, userId });
    if (!review) {
      throw new AppError("Review not found or access denied", 404);
    }

    await Review.findByIdAndDelete(reviewId);

    // Update shop rating
    if (review.shopId) {
      await this.updateShopRating(review.shopId.toString());
    }

    return true;
  }

  /**
   * Hide review (moderator action)
   */
  async hideReview(reviewId: string): Promise<IReview | null> {
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { status: "Hidden" },
      { new: true }
    );

    if (!review) {
      throw new AppError("Review not found", 404);
    }

    // Update shop rating (excluding hidden review)
    if (review.shopId) {
      await this.updateShopRating(review.shopId.toString());
    }

    return review;
  }

  /**
   * Unhide review (moderator action)
   */
  async unhideReview(reviewId: string): Promise<IReview | null> {
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { status: "Visible" },
      { new: true }
    );

    if (!review) {
      throw new AppError("Review not found", 404);
    }

    // Update shop rating
    if (review.shopId) {
      await this.updateShopRating(review.shopId.toString());
    }

    return review;
  }

  /**
   * Get all reviews for moderation (moderator only)
   */
  async getAllReviewsForModeration(
    options: {
      page?: number;
      limit?: number;
      status?: "Visible" | "Hidden";
    } = {}
  ): Promise<{ reviews: IReview[]; total: number; page: number; totalPages: number }> {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (options.status) {
      filter.status = options.status;
    }

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate("userId", "fullName email avatarUrl")
        .populate("shopId", "shopName")
        .populate("orderItemId", "productId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments(filter),
    ]);

    return {
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get shop rating statistics
   */
  async getShopRatingStats(shopId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
  }> {
    const reviews = await Review.find({ shopId, status: "Visible" });

    const ratingDistribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    let totalRating = 0;
    reviews.forEach((review) => {
      totalRating += review.rating;
      ratingDistribution[review.rating]++;
    });

    const averageRating =
      reviews.length > 0 ? Math.round((totalRating / reviews.length) * 10) / 10 : 0;

    return {
      averageRating,
      totalReviews: reviews.length,
      ratingDistribution,
    };
  }

  /**
   * Update shop's average rating
   */
  private async updateShopRating(shopId: string): Promise<void> {
    const stats = await this.getShopRatingStats(shopId);
    await Shop.findByIdAndUpdate(shopId, {
      ratingAvg: stats.averageRating,
    });
  }
}
