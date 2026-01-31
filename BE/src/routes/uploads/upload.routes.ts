import { Router } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { authenticate, checkPermission } from "@/middleware";
import { PERMISSIONS } from "@/constants/permissions";
import { wrapRequestHandler } from "@/utils/handlers";
import { UploadController } from "@/controllers/uploads/upload.controller";

const router = Router();
const uploadController = new UploadController();

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const safeExt = ext && ext.length <= 10 ? ext : "";
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${safeExt}`);
  },
});

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

