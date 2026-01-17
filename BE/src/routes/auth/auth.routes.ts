import { Router } from "express";
import { AuthController } from "@/controllers/auth/auth.controller";
import { authLimiter } from "@/middleware/rateLimiter";
import { wrapRequestHandler } from "@/utils/handlers";

const router = Router();
const authController = new AuthController();

router.post("/register", authLimiter, wrapRequestHandler(authController.register));
router.post("/register/seller", authLimiter, wrapRequestHandler(authController.registerSeller));
router.post("/login", authLimiter, wrapRequestHandler(authController.login));
router.post("/refresh", wrapRequestHandler(authController.refreshToken));
router.post("/logout", wrapRequestHandler(authController.logout));

export default router;
