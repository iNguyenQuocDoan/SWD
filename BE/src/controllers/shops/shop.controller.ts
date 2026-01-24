import { Response, NextFunction } from "express";
import { AuthRequest } from "@/middleware/auth";
import { ShopService } from "@/services/shops/shop.service";
import { createShopSchema, updateShopSchema } from "@/validators/shops/shop.schema";
import { AppError } from "@/middleware/errorHandler";
import { MESSAGES } from "@/constants/messages";

export class ShopController {
  private shopService: ShopService;

  constructor() {
    this.shopService = new ShopService();
  }

  createShop = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      console.log("=== CREATE SHOP REQUEST ===");
      console.log("User:", req.user);
      console.log("Body:", req.body);

      const userId = req.user!.id;
      const validatedData = createShopSchema.parse(req.body);
      console.log("Validated data:", validatedData);

      const shop = await this.shopService.createShop(
        userId,
        validatedData.shopName,
        validatedData.description || undefined
      );
      console.log("Shop created successfully:", shop._id);

      res.status(201).json({
        success: true,
        message: MESSAGES.SUCCESS.SHOP_CREATED,
        data: shop,
      });
    } catch (error) {
      console.error("=== CREATE SHOP ERROR ===", error);
      next(error);
    }
  };

  getMyShop = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const shop = await this.shopService.getShopByOwnerId(userId);

      if (!shop) {
        throw new AppError(MESSAGES.ERROR.SHOP.NOT_FOUND, 404);
      }

      res.status(200).json({
        success: true,
        data: shop,
      });
    } catch (error) {
      next(error);
    }
  };

  getShopById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const shopId = Array.isArray(req.params.shopId) ? req.params.shopId[0] : req.params.shopId;
      const shop = await this.shopService.findById(shopId);

      if (!shop || shop.isDeleted) {
        throw new AppError(MESSAGES.ERROR.SHOP.NOT_FOUND, 404);
      }

      res.status(200).json({
        success: true,
        data: shop,
      });
    } catch (error) {
      next(error);
    }
  };

  updateShop = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const shopId = Array.isArray(req.params.shopId) ? req.params.shopId[0] : req.params.shopId;
      const validatedData = updateShopSchema.parse(req.body);

      // Verify ownership
      const shop = await this.shopService.getShopByOwnerId(userId);
      if (!shop || shop._id.toString() !== shopId) {
        throw new AppError(MESSAGES.ERROR.SHOP.ACCESS_DENIED, 403);
      }

      const updatedShop = await this.shopService.updateById(shopId, validatedData);

      if (!updatedShop) {
        throw new AppError(MESSAGES.ERROR.SHOP.NOT_FOUND, 404);
      }

      res.status(200).json({
        success: true,
        message: MESSAGES.SUCCESS.SHOP_UPDATED,
        data: updatedShop,
      });
    } catch (error) {
      next(error);
    }
  };

  // Moderator endpoints
  getPendingShops = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      console.log("=== GET PENDING SHOPS REQUEST ===");
      console.log("User:", req.user?.id, req.user?.email);
      
      const shops = await this.shopService.getPendingShops();
      console.log("Shops found:", shops.length);

      // Transform shops to ensure proper format for frontend
      // Handle both Mongoose documents and plain objects (from lean())
      const transformedShops = shops.map((shop: any) => {
        try {
          const ownerId = shop.ownerUserId
            ? (typeof shop.ownerUserId === "object" && shop.ownerUserId !== null
                ? shop.ownerUserId._id?.toString() || shop.ownerUserId.toString()
                : shop.ownerUserId.toString())
            : "";

          const approvedById = shop.approvedByUserId
            ? (typeof shop.approvedByUserId === "object" && shop.approvedByUserId !== null
                ? shop.approvedByUserId._id?.toString() || shop.approvedByUserId.toString()
                : shop.approvedByUserId.toString())
            : null;

          return {
            _id: shop._id?.toString() || shop._id,
            ownerUserId: ownerId,
            shopName: shop.shopName || "",
            description: shop.description || null,
            status: shop.status || "Pending",
            approvedByUserId: approvedById,
            approvedAt: shop.approvedAt
              ? (shop.approvedAt instanceof Date
                  ? shop.approvedAt.toISOString()
                  : new Date(shop.approvedAt).toISOString())
              : null,
            moderatorNote: shop.moderatorNote || null,
            ratingAvg: shop.ratingAvg || 0,
            totalSales: shop.totalSales || 0,
            createdAt: shop.createdAt instanceof Date
              ? shop.createdAt.toISOString()
              : new Date(shop.createdAt).toISOString(),
            updatedAt: shop.updatedAt instanceof Date
              ? shop.updatedAt.toISOString()
              : new Date(shop.updatedAt).toISOString(),
          };
        } catch (transformError) {
          console.error("Error transforming shop:", shop._id, transformError);
          // Return a safe default object
          return {
            _id: shop._id?.toString() || "",
            ownerUserId: "",
            shopName: shop.shopName || "Unknown",
            description: null,
            status: shop.status || "Pending",
            approvedByUserId: null,
            approvedAt: null,
            moderatorNote: null,
            ratingAvg: 0,
            totalSales: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }
      });

      console.log("Transformed shops:", transformedShops.length);
      res.status(200).json({
        success: true,
        data: transformedShops,
      });
    } catch (error) {
      console.error("Error in getPendingShops controller:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      next(error);
    }
  };

  approveShop = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const moderatorUserId = req.user!.id;
      const shopId = Array.isArray(req.params.shopId) ? req.params.shopId[0] : req.params.shopId;
      const { moderatorNote } = req.body;

      const shop = await this.shopService.approveShop(
        shopId,
        moderatorUserId,
        moderatorNote
      );

      res.status(200).json({
        success: true,
        message: MESSAGES.SUCCESS.SHOP_APPROVED,
        data: shop,
      });
    } catch (error) {
      next(error);
    }
  };

  rejectShop = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const moderatorUserId = req.user!.id;
      const shopId = Array.isArray(req.params.shopId) ? req.params.shopId[0] : req.params.shopId;
      const { moderatorNote } = req.body;

      const shop = await this.shopService.rejectShop(
        shopId,
        moderatorUserId,
        moderatorNote
      );

      res.status(200).json({
        success: true,
        message: MESSAGES.SUCCESS.SHOP_REJECTED,
        data: shop,
      });
    } catch (error) {
      next(error);
    }
  };
}
