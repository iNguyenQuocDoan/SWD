import { Router } from "express";
import { ProductController } from "@/controllers/products/product.controller";
import { authenticate } from "@/middleware/auth";
import { wrapRequestHandler } from "@/utils/handlers";

const router = Router();
const productController = new ProductController();

// Public routes
router.get("/", wrapRequestHandler(productController.getProducts));
router.get("/:productId", wrapRequestHandler(productController.getProductById));

// Protected routes (require authentication)
router.use(authenticate);

router.post("/", wrapRequestHandler(productController.createProduct));
router.get("/shop/:shopId", wrapRequestHandler(productController.getMyProducts));

export default router;
