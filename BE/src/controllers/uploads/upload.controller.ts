import { Response } from "express";
import path from "node:path";
import { AuthRequest } from "@/middleware/auth";

export class UploadController {
  uploadSingle = async (req: AuthRequest, res: Response): Promise<void> => {
    const file = req.file;

    if (!file) {
      res.status(400).json({
        success: false,
        message: "File is required",
      });
      return;
    }

    // Normalize to URL path (always forward slashes)
    const relativePath = path.posix.join("uploads", file.filename);
    const publicUrl = `/uploads/${file.filename}`;

    res.status(201).json({
      success: true,
      data: {
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        path: relativePath,
        url: publicUrl,
      },
    });
  };
}

