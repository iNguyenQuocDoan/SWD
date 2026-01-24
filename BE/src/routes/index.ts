import { Router } from "express";
import authRoutes from "./auth/auth.routes";
import permissionRoutes from "./auth/permission.routes";
import roleRoutes from "./roles/role.routes";
import userRoutes from "./users/user.routes";
import shopRoutes from "./shops/shop.routes";
import productRoutes from "./products/product.routes";
import paymentRoutes from "./payments/payment.routes";
import reviewRoutes from "./reviews/review.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/permissions", permissionRoutes);
router.use("/roles", roleRoutes);
router.use("/users", userRoutes);
router.use("/shops", shopRoutes);
router.use("/products", productRoutes);
router.use("/payments", paymentRoutes);
router.use("/reviews", reviewRoutes);

export default router;
