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
    // Check if user already has a shop
    const existingShop = await Shop.findOne({
      ownerUserId,
      isDeleted: false,
    });
    if (existingShop) {
      throw new AppError(MESSAGES.ERROR.SHOP.ALREADY_EXISTS, 400);
    }

    // Verify user exists
    const user = await User.findById(ownerUserId);
    if (!user || user.isDeleted) {
      throw new AppError(MESSAGES.ERROR.USER.NOT_FOUND, 404);
    }

    // Create shop
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
    approvedByUserId: string
  ): Promise<IShop | null> {
    const shop = await this.model.findByIdAndUpdate(
      shopId,
      {
        status: "Active",
        approvedByUserId,
        approvedAt: new Date(),
      },
      { new: true }
    );

    if (!shop) {
      throw new AppError(MESSAGES.ERROR.SHOP.NOT_FOUND, 404);
    }

    return shop;
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
