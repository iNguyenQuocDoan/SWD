import { Router } from "express";
import { ProductController } from "@/controllers/products/product.controller";
import { authenticate, checkPermission } from "@/middleware";
import { wrapRequestHandler } from "@/utils/handlers";
import { PERMISSIONS } from "@/constants/permissions";

const router = Router();
const productController = new ProductController();

// Public routes (Guest can access)
router.get("/", wrapRequestHandler(productController.getProducts));
router.get("/:productId", wrapRequestHandler(productController.getProductById));

// Protected routes (require authentication)
router.use(authenticate);

// Seller routes - Create and manage products
router.post(
  "/",
  checkPermission(PERMISSIONS.PRODUCT_CREATE),
  wrapRequestHandler(productController.createProduct)
);

router.get(
  "/shop/:shopId",
  checkPermission(PERMISSIONS.PRODUCT_VIEW_OWN),
  wrapRequestHandler(productController.getMyProducts)
);

export default router;
