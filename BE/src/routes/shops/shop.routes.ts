import { Router } from "express";
import { ShopController } from "@/controllers/shops/shop.controller";
import { authenticate } from "@/middleware/auth";
import { wrapRequestHandler } from "@/utils/handlers";

const router = Router();
const shopController = new ShopController();

// Public routes
router.get("/:shopId", wrapRequestHandler(shopController.getShopById));

// Protected routes (require authentication)
router.use(authenticate);

router.post("/", wrapRequestHandler(shopController.createShop));
router.get("/me/my-shop", wrapRequestHandler(shopController.getMyShop));
router.put("/:shopId", wrapRequestHandler(shopController.updateShop));

export default router;
