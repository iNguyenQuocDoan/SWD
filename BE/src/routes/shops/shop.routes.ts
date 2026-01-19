import { Router } from "express";
import { ShopController } from "@/controllers/shops/shop.controller";
import { authenticate, checkPermission } from "@/middleware";
import { wrapRequestHandler } from "@/utils/handlers";
import { PERMISSIONS } from "@/constants/permissions";

const router = Router();
const shopController = new ShopController();

// Public routes (Guest can access)
router.get("/:shopId", wrapRequestHandler(shopController.getShopById));

// Protected routes (require authentication)
router.use(authenticate);

// Seller routes - Create and manage shop
router.post(
  "/",
  checkPermission(PERMISSIONS.SHOP_CREATE),
  wrapRequestHandler(shopController.createShop)
);

router.get(
  "/me/my-shop",
  checkPermission(PERMISSIONS.SHOP_VIEW_OWN),
  wrapRequestHandler(shopController.getMyShop)
);

router.put(
  "/:shopId",
  checkPermission(PERMISSIONS.SHOP_UPDATE),
  wrapRequestHandler(shopController.updateShop)
);

export default router;
