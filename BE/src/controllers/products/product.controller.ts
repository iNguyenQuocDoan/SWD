import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "@/middleware/auth";
import { ProductService } from "@/services/products/product.service";
import { ShopService } from "@/services/shops/shop.service";
import { createProductSchema, updateProductSchema } from "@/validators/products/product.schema";
import { AppError } from "@/middleware/errorHandler";
import { MESSAGES } from "@/constants/messages";

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  createProduct = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const validatedData = createProductSchema.parse(req.body);

      const product = await this.productService.createProduct(
        validatedData,
        userId
      );

      res.status(201).json({
        success: true,
        message: MESSAGES.SUCCESS.PRODUCT_CREATED,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  getProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const {
        platformId,
        planType,
        minPrice,
        maxPrice,
        page = "1",
        limit = "20",
      } = req.query;

      const filter: any = {};
      if (platformId) filter.platformId = platformId as string;
      if (planType) filter.planType = planType;
      if (minPrice) filter.minPrice = Number(minPrice);
      if (maxPrice) filter.maxPrice = Number(maxPrice);

      const products = await this.productService.getApprovedProducts(filter);

      const pageNum = Number.parseInt(page as string, 10);
      const limitNum = Number.parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      const paginatedProducts = products.slice(skip, skip + limitNum);

      res.status(200).json({
        success: true,
        data: paginatedProducts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: products.length,
          totalPages: Math.ceil(products.length / limitNum),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getProductById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const productId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
      const product = await this.productService.findById(productId);

      if (!product || product.isDeleted || product.status !== "Approved") {
        throw new AppError(MESSAGES.ERROR.PRODUCT.NOT_FOUND, 404);
      }

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  getMyProducts = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { shopId } = req.params;

      // Verify shop ownership
      const shopService = new ShopService();
      const shop = await shopService.getShopByOwnerId(userId);

      if (!shop || shop._id.toString() !== shopId) {
        throw new AppError(MESSAGES.ERROR.SHOP.ACCESS_DENIED, 403);
      }

      const products = await this.productService.getProductsByShop(shopId);

      res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  };

  updateProduct = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const productId = Array.isArray(req.params.productId)
        ? req.params.productId[0]
        : req.params.productId;
      const validatedData = updateProductSchema.parse(req.body);

      const product = await this.productService.updateProduct(
        productId,
        userId,
        validatedData
      );

      res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteProduct = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const productId = Array.isArray(req.params.productId)
        ? req.params.productId[0]
        : req.params.productId;

      await this.productService.deleteProduct(productId, userId);

      res.status(200).json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getMyProductById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const productId = Array.isArray(req.params.productId)
        ? req.params.productId[0]
        : req.params.productId;

      const product = await this.productService.getProductByIdForSeller(
        productId,
        userId
      );

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  // Moderator endpoints
  getPendingProducts = async (
    _req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const products = await this.productService.getPendingProducts();

      res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  };

  approveProduct = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const moderatorUserId = req.user!.id;
      const productId = Array.isArray(req.params.productId)
        ? req.params.productId[0]
        : req.params.productId;

      const product = await this.productService.approveProduct(
        productId,
        moderatorUserId
      );

      res.status(200).json({
        success: true,
        message: "Product approved successfully",
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  rejectProduct = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const moderatorUserId = req.user!.id;
      const productId = Array.isArray(req.params.productId)
        ? req.params.productId[0]
        : req.params.productId;

      const product = await this.productService.rejectProduct(
        productId,
        moderatorUserId
      );

      res.status(200).json({
        success: true,
        message: "Product rejected successfully",
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };
}
