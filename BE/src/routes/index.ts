import { Router } from "express";
import authRoutes from "./auth/auth.routes";
import permissionRoutes from "./auth/permission.routes";
import roleRoutes from "./roles/role.routes";
import userRoutes from "./users/user.routes";
import shopRoutes from "./shops/shop.routes";
import productRoutes from "./products/product.routes";
import uploadRoutes from "./uploads/upload.routes";
import paymentRoutes from "./payments/payment.routes";
import reviewRoutes from "./reviews/review.routes";
import orderRoutes from "./orders/order.routes";
import inventoryRoutes from "./inventory/inventory.routes";
import complaintRoutes from "./complaints/complaint.routes";
import ekycRoutes from "./ekyc/ekyc.routes";
import statsRoutes from "./stats/stats.routes";
import supportRoutes from "./support";
import disbursementRoutes from "./disbursement/disbursement.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/permissions", permissionRoutes);
router.use("/roles", roleRoutes);
router.use("/users", userRoutes);
router.use("/shops", shopRoutes);
router.use("/products", productRoutes);
router.use("/uploads", uploadRoutes);
router.use("/payments", paymentRoutes);
router.use("/reviews", reviewRoutes);
router.use("/orders", orderRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/complaints", complaintRoutes);
router.use("/ekyc", ekycRoutes);
router.use("/stats", statsRoutes);
router.use("/support", supportRoutes);
router.use("/disbursement", disbursementRoutes);

export default router;
