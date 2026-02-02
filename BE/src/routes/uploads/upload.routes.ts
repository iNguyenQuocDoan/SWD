import { Router } from "express";
import multer from "multer";
import { authenticate, checkPermission } from "@/middleware";
import { PERMISSIONS } from "@/constants/permissions";
import { wrapRequestHandler } from "@/utils/handlers";
import { UploadController } from "@/controllers/uploads/upload.controller";

const router = Router();
const uploadController = new UploadController();

// Use memory storage for Cloudinary uploads
const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    cb(new Error("Only image files are allowed"));
    return;
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Upload single image
router.post(
  "/image",
  authenticate,
  checkPermission(PERMISSIONS.PRODUCT_CREATE),
  upload.single("file"),
  wrapRequestHandler(uploadController.uploadSingle)
);

export default router;
