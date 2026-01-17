import { Router } from "express";
import { UserController } from "@/controllers/users/user.controller";
import { authenticate } from "@/middleware/auth";
import { wrapRequestHandler } from "@/utils/handlers";

const router = Router();
const userController = new UserController();

// All routes require authentication
router.use(authenticate);

router.get("/profile", wrapRequestHandler(userController.getProfile));
router.put("/profile", wrapRequestHandler(userController.updateProfile));
router.get("/:userId", wrapRequestHandler(userController.getUserById));

export default router;
