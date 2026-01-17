import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "@/config/env";
import { User } from "@/models";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    roleId: string;
    roleKey: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({ success: false, message: "No token provided" });
      return;
    }

    const decoded = jwt.verify(token, env.jwtSecret) as {
      userId: string;
      email: string;
    };

    const user = await User.findById(decoded.userId)
      .populate("roleId")
      .select("-passwordHash");

    if (!user || user.isDeleted || user.status !== "Active") {
      res.status(401).json({ success: false, message: "User not found or inactive" });
      return;
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      roleId: user.roleId.toString(),
      roleKey: (user.roleId as any).roleKey,
    };

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    if (!allowedRoles.includes(req.user.roleKey)) {
      res.status(403).json({ 
        success: false, 
        message: "Forbidden - Insufficient permissions" 
      });
      return;
    }

    next();
  };
};
