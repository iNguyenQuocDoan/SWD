import { Router } from "express";
import { platformCatalogController } from "@/controllers/products/platform-catalog.controller";
import { authenticate, checkPermission } from "@/middleware";
import { wrapRequestHandler } from "@/utils/handlers";
import { PERMISSIONS } from "@/constants/permissions";

const router = Router();

// Public routes
router.get("/", wrapRequestHandler(platformCatalogController.getAll));
router.get("/:id", wrapRequestHandler(platformCatalogController.getById));

// Protected routes (Admin only)
router.use(authenticate);

// Create platform catalog
router.post(
  "/",
  checkPermission(PERMISSIONS.PLATFORM_CATALOG_MANAGE),
  wrapRequestHandler(platformCatalogController.create)
);

// Update platform catalog
router.put(
  "/:id",
  checkPermission(PERMISSIONS.PLATFORM_CATALOG_MANAGE),
  wrapRequestHandler(platformCatalogController.update)
);

// Delete platform catalog
router.delete(
  "/:id",
  checkPermission(PERMISSIONS.PLATFORM_CATALOG_MANAGE),
  wrapRequestHandler(platformCatalogController.delete)
);

export default router;
