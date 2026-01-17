import { Response, NextFunction } from "express";
import { AuthRequest } from "@/middleware/auth";
import { ShopService } from "@/services/shops/shop.service";
import { createShopSchema, updateShopSchema } from "@/validators/shops/shop.schema";
import { AppError } from "@/middleware/errorHandler";

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
      const userId = req.user!.id;
      const validatedData = createShopSchema.parse(req.body);

      const shop = await this.shopService.createShop(
        userId,
        validatedData.shopName,
        validatedData.description || undefined
      );

      res.status(201).json({
        success: true,
        message: "Shop created successfully",
        data: shop,
      });
    } catch (error) {
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
        throw new AppError("Shop not found", 404);
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
        throw new AppError("Shop not found", 404);
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
        throw new AppError("Access denied", 403);
      }

      const updatedShop = await this.shopService.updateById(shopId, validatedData);

      if (!updatedShop) {
        throw new AppError("Shop not found", 404);
      }

      res.status(200).json({
        success: true,
        message: "Shop updated successfully",
        data: updatedShop,
      });
    } catch (error) {
      next(error);
    }
  };
}
