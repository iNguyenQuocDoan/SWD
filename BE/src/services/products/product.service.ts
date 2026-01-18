import { BaseService } from "@/services/base.service";
import { Product, IProduct, Shop, PlatformCatalog } from "@/models";
import { AppError } from "@/middleware/errorHandler";
import { PlanType } from "@/types";
import { MESSAGES } from "@/constants/messages";

export interface CreateProductData {
  shopId: string;
  platformId: string;
  title: string;
  description: string;
  warrantyPolicy: string;
  howToUse: string;
  planType: PlanType;
  durationDays: number;
  price: number;
}

export class ProductService extends BaseService<IProduct> {
  constructor() {
    super(Product);
  }

  async createProduct(data: CreateProductData, sellerUserId: string): Promise<IProduct> {
    // Verify shop exists and belongs to user
    const shop = await Shop.findOne({
      _id: data.shopId,
      ownerUserId: sellerUserId,
      isDeleted: false,
    });
    if (!shop) {
      throw new AppError(MESSAGES.ERROR.PRODUCT.SHOP_NOT_FOUND_OR_ACCESS_DENIED, 404);
    }

    // Verify platform exists
    const platform = await PlatformCatalog.findById(data.platformId);
    if (!platform || platform.status !== "Active") {
      throw new AppError(MESSAGES.ERROR.PRODUCT.PLATFORM_NOT_FOUND, 404);
    }

    // Create product
    const product = await Product.create({
      ...data,
      status: "Pending",
    });

    return product;
  }

  async approveProduct(
    productId: string,
    moderatorUserId: string
  ): Promise<IProduct | null> {
    const product = await this.model.findByIdAndUpdate(
      productId,
      {
        status: "Approved",
        approvedByUserId: moderatorUserId,
        approvedAt: new Date(),
      },
      { new: true }
    );

    if (!product) {
      throw new AppError(MESSAGES.ERROR.PRODUCT.NOT_FOUND, 404);
    }

    return product;
  }

  async rejectProduct(
    productId: string,
    moderatorUserId: string
  ): Promise<IProduct | null> {
    const product = await this.model.findByIdAndUpdate(
      productId,
      {
        status: "Rejected",
        approvedByUserId: moderatorUserId,
        approvedAt: new Date(),
      },
      { new: true }
    );

    if (!product) {
      throw new AppError(MESSAGES.ERROR.PRODUCT.NOT_FOUND, 404);
    }

    return product;
  }

  async getProductsByShop(shopId: string): Promise<IProduct[]> {
    return this.model
      .find({ shopId, isDeleted: false })
      .populate("platformId")
      .sort({ createdAt: -1 });
  }

  async getProductsByPlatform(platformId: string): Promise<IProduct[]> {
    return this.model
      .find({
        platformId,
        status: "Approved",
        isDeleted: false,
      })
      .populate("shopId")
      .sort({ createdAt: -1 });
  }

  async getApprovedProducts(filter: {
    platformId?: string;
    planType?: PlanType;
    minPrice?: number;
    maxPrice?: number;
  } = {}): Promise<IProduct[]> {
    const query: any = {
      status: "Approved",
      isDeleted: false,
    };

    if (filter.platformId) {
      query.platformId = filter.platformId;
    }
    if (filter.planType) {
      query.planType = filter.planType;
    }
    if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
      query.price = {};
      if (filter.minPrice !== undefined) {
        query.price.$gte = filter.minPrice;
      }
      if (filter.maxPrice !== undefined) {
        query.price.$lte = filter.maxPrice;
      }
    }

    return this.model.find(query).populate("platformId").populate("shopId");
  }
}
