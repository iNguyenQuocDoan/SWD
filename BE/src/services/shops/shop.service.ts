import { BaseService } from "@/services/base.service";
import { Shop, IShop, User } from "@/models";
import { AppError } from "@/middleware/errorHandler";
import { MESSAGES } from "@/constants/messages";

export class ShopService extends BaseService<IShop> {
  constructor() {
    super(Shop);
  }

  async createShop(
    ownerUserId: string,
    shopName: string,
    description?: string
  ): Promise<IShop> {
    // Check if user already has a shop (any status)
    const existingShop = await Shop.findOne({ ownerUserId });

    if (existingShop) {
      // If shop is active, pending, or suspended and not deleted - block
      if (!existingShop.isDeleted && ["Pending", "Active", "Suspended"].includes(existingShop.status)) {
        const statusMessage = existingShop.status === "Pending"
          ? "đang chờ duyệt"
          : existingShop.status === "Active"
          ? "đang hoạt động"
          : "đang bị tạm ngưng";
        throw new AppError(
          `Bạn đã có shop ${statusMessage}. Vui lòng kiểm tra trạng thái shop của bạn.`,
          400
        );
      }

      // If shop was rejected (Closed + isDeleted), allow re-registration by updating the old record
      // This avoids duplicate key error on ownerUserId unique index
      const updatedShop = await Shop.findByIdAndUpdate(
        existingShop._id,
        {
          shopName,
          description: description || null,
          status: "Pending",
          isDeleted: false,
          approvedByUserId: null,
          approvedAt: null,
          moderatorNote: null,
        },
        { new: true }
      );

      return updatedShop!;
    }

    // Verify user exists
    const user = await User.findById(ownerUserId);
    if (!user || user.isDeleted) {
      throw new AppError(MESSAGES.ERROR.USER.NOT_FOUND, 404);
    }

    // Create new shop (first time registration)
    const shop = await Shop.create({
      ownerUserId,
      shopName,
      description: description || null,
      status: "Pending",
      ratingAvg: 0,
      totalSales: 0,
    });

    return shop;
  }

  async getShopByOwnerId(ownerUserId: string): Promise<IShop | null> {
    return this.model
      .findOne({ ownerUserId, isDeleted: false })
      .populate("ownerUserId")
      .populate("approvedByUserId");
  }

  async approveShop(
    shopId: string,
    approvedByUserId: string,
    moderatorNote?: string
  ): Promise<IShop | null> {
    const shop = await this.model.findByIdAndUpdate(
      shopId,
      {
        status: "Active",
        approvedByUserId,
        approvedAt: new Date(),
        moderatorNote: moderatorNote || null,
      },
      { new: true }
    );

    if (!shop) {
      throw new AppError(MESSAGES.ERROR.SHOP.NOT_FOUND, 404);
    }

    return shop;
  }

  async rejectShop(
    shopId: string,
    _moderatorUserId: string,
    moderatorNote?: string
  ): Promise<IShop | null> {
    const shop = await this.model.findByIdAndUpdate(
      shopId,
      {
        status: "Closed",
        approvedByUserId: null,
        approvedAt: null,
        moderatorNote: moderatorNote || null,
        isDeleted: true, // Soft delete để user có thể đăng ký lại
      },
      { new: true }
    );

    if (!shop) {
      throw new AppError(MESSAGES.ERROR.SHOP.NOT_FOUND, 404);
    }

    return shop;
  }

  async getPendingShops(): Promise<any[]> {
    try {
      console.log("=== GET PENDING SHOPS SERVICE ===");
      
      const shops = await this.model
        .find({ status: "Pending", isDeleted: false })
        .populate({
          path: "ownerUserId",
          select: "_id email fullName",
          match: { isDeleted: false }, // Only populate if user is not deleted
        })
        .populate({
          path: "approvedByUserId",
          select: "_id email fullName",
        })
        .sort({ createdAt: -1 })
        .lean(); // Use lean() for better performance and to avoid Mongoose document issues

      console.log("Raw shops from DB:", shops.length);
      
      // Filter out shops where ownerUserId is null (user was deleted)
      const validShops = shops.filter((shop: any) => {
        const hasOwner = shop.ownerUserId !== null && shop.ownerUserId !== undefined;
        if (!hasOwner) {
          console.warn("Shop without owner:", shop._id);
        }
        return hasOwner;
      });
      
      console.log("Valid shops after filter:", validShops.length);
      return validShops;
    } catch (error) {
      console.error("Error in getPendingShops service:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      throw error;
    }
  }

  async updateShopStatus(
    shopId: string,
    status: "Active" | "Suspended" | "Closed"
  ): Promise<IShop | null> {
    const shop = await this.model.findByIdAndUpdate(
      shopId,
      { status },
      { new: true }
    );

    if (!shop) {
      throw new AppError(MESSAGES.ERROR.SHOP.NOT_FOUND, 404);
    }

    return shop;
  }

  async updateShopRating(shopId: string, newRating: number): Promise<void> {
    await this.model.findByIdAndUpdate(shopId, {
      $set: { ratingAvg: newRating },
    });
  }

  async incrementSales(shopId: string, amount: number): Promise<void> {
    await this.model.findByIdAndUpdate(shopId, {
      $inc: { totalSales: amount },
    });
  }
}
