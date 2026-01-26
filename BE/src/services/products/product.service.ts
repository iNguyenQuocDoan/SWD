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

    if (shop.status !== "Active") {
      throw new AppError("Shop is not approved yet", 403);
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
    moderatorUserId: string,
    reason: string
  ): Promise<IProduct | null> {
    const product = await this.model.findByIdAndUpdate(
      productId,
      {
        status: "Rejected",
        approvedByUserId: moderatorUserId,
        approvedAt: new Date(),
        rejectionReason: reason,
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

  async updateProduct(
    productId: string,
    sellerUserId: string,
    data: Partial<CreateProductData>
  ): Promise<IProduct | null> {
    // Find the product
    const product = await this.model.findById(productId);
    if (!product || product.isDeleted) {
      throw new AppError(MESSAGES.ERROR.PRODUCT.NOT_FOUND, 404);
    }

    // Verify shop ownership
    const shop = await Shop.findOne({
      _id: product.shopId,
      ownerUserId: sellerUserId,
      isDeleted: false,
    });
    if (!shop) {
      throw new AppError(MESSAGES.ERROR.PRODUCT.SHOP_NOT_FOUND_OR_ACCESS_DENIED, 403);
    }

    if (shop.status !== "Active") {
      throw new AppError("Shop is not approved yet", 403);
    }

    // If platform is being changed, verify new platform exists
    if (data.platformId && data.platformId !== product.platformId.toString()) {
      const platform = await PlatformCatalog.findById(data.platformId);
      if (!platform || platform.status !== "Active") {
        throw new AppError(MESSAGES.ERROR.PRODUCT.PLATFORM_NOT_FOUND, 404);
      }
    }

    // Update product - set status back to Pending if significant changes
    const updateData: any = { ...data };
    if (data.title || data.description || data.price || data.platformId) {
      updateData.status = "Pending";
      updateData.approvedByUserId = null;
      updateData.approvedAt = null;
    }

    const updatedProduct = await this.model.findByIdAndUpdate(
      productId,
      updateData,
      { new: true }
    ).populate("platformId");

    return updatedProduct;
  }

  async deleteProduct(
    productId: string,
    sellerUserId: string
  ): Promise<boolean> {
    // Find the product
    const product = await this.model.findById(productId);
    if (!product || product.isDeleted) {
      throw new AppError(MESSAGES.ERROR.PRODUCT.NOT_FOUND, 404);
    }

    // Verify shop ownership
    const shop = await Shop.findOne({
      _id: product.shopId,
      ownerUserId: sellerUserId,
      isDeleted: false,
    });
    if (!shop) {
      throw new AppError(MESSAGES.ERROR.PRODUCT.SHOP_NOT_FOUND_OR_ACCESS_DENIED, 403);
    }

    // Soft delete the product
    await this.model.findByIdAndUpdate(productId, { isDeleted: true });

    return true;
  }

  async getPendingProducts(): Promise<IProduct[]> {
    return this.model
      .find({ status: "Pending", isDeleted: false })
      .populate("platformId")
      .populate("shopId")
      .sort({ createdAt: -1 });
  }

  async getProductByIdForSeller(
    productId: string,
    sellerUserId: string
  ): Promise<IProduct | null> {
    const product = await this.model
      .findById(productId)
      .populate("platformId")
      .populate("shopId");

    if (!product || product.isDeleted) {
      throw new AppError(MESSAGES.ERROR.PRODUCT.NOT_FOUND, 404);
    }

    // Verify shop ownership
    const shop = await Shop.findOne({
      _id: product.shopId,
      ownerUserId: sellerUserId,
      isDeleted: false,
    });
    if (!shop) {
      throw new AppError(MESSAGES.ERROR.PRODUCT.SHOP_NOT_FOUND_OR_ACCESS_DENIED, 403);
    }

    return product;
  }
}
