import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, IUser, Role } from "@/models";
import { env } from "@/config/env";
import { AppError } from "@/middleware/errorHandler";

export interface LoginResult {
  user: {
    id: string;
    email: string;
    fullName: string;
    roleKey: string;
  };
  token: string;
  refreshToken: string;
}

export class AuthService {
  async register(
    email: string,
    password: string,
    fullName: string,
    roleKey: string = "CUSTOMER"
  ): Promise<IUser> {
    // Check if user exists
    const existingUser = await User.findOne({ email, isDeleted: false });
    if (existingUser) {
      throw new AppError("Email already exists", 400);
    }

    // Get role
    const role = await Role.findOne({ roleKey, status: "Active" });
    if (!role) {
      throw new AppError("Invalid role", 400);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      roleId: role._id,
      email,
      passwordHash,
      fullName,
      status: "Active",
      emailVerified: false,
      phoneVerified: false,
      trustLevel: 0,
    });

    return user;
  }

  async login(email: string, password: string): Promise<LoginResult> {
    try {
      // Find user
      const user = await User.findOne({ email, isDeleted: false }).populate(
        "roleId"
      );
      if (!user) {
        throw new AppError("Invalid email or password", 401);
      }

      // Check if roleId is populated
      if (!user.roleId || typeof user.roleId === "string") {
        console.error("User roleId not populated:", user._id);
        throw new AppError("User role not found", 500);
      }

      // Check status
      if (user.status !== "Active") {
        throw new AppError("Account is locked or banned", 403);
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new AppError("Invalid email or password", 401);
      }

      // Update last login
      await User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });

      // Generate tokens
      const roleKey = (user.roleId as any).roleKey;
      if (!roleKey) {
        console.error("Role key not found for user:", user._id);
        throw new AppError("User role configuration error", 500);
      }

      const token = this.generateToken(user._id.toString(), user.email, roleKey);
      const refreshToken = this.generateRefreshToken(
        user._id.toString(),
        user.email
      );

      // Log tokens
      console.log("\n========== TOKEN GENERATION ==========");
      console.log(`User: ${user.email} (${user._id})`);
      console.log(`Role: ${roleKey}`);
      console.log(`Access Token: ${token}`);
      console.log(`Refresh Token: ${refreshToken}`);
      console.log("=======================================\n");

      return {
        user: {
          id: user._id.toString(),
          email: user.email,
          fullName: user.fullName,
          roleKey,
        },
        token,
        refreshToken,
      };
    } catch (error) {
      // Log error for debugging
      console.error("Login error:", error);
      
      // Re-throw AppError as-is
      if (error instanceof AppError) {
        throw error;
      }
      
      // Wrap other errors
      throw new AppError(
        error instanceof Error ? error.message : "Login failed",
        500
      );
    }
  }

  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    try {
      const decoded = jwt.verify(
        refreshToken,
        env.jwtRefreshSecret
      ) as { userId: string; email: string };

      const user = await User.findById(decoded.userId).populate("roleId");
      if (!user || user.isDeleted || user.status !== "Active") {
        throw new AppError("Invalid refresh token", 401);
      }

      const roleKey = (user.roleId as any).roleKey;
      const token = this.generateToken(user._id.toString(), user.email, roleKey);

      // Log new access token
      console.log("\n========== TOKEN REFRESH ==========");
      console.log(`User: ${user.email} (${user._id})`);
      console.log(`New Access Token: ${token}`);
      console.log(`Refresh Token (used): ${refreshToken}`);
      console.log("===================================\n");

      return { token };
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Invalid refresh token", 401);
    }
  }

  private generateToken(userId: string, email: string, roleKey: string): string {
    const payload = { userId, email, roleKey };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpire } as any);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    // Find user
    const user = await User.findById(userId);
    if (!user || user.isDeleted) {
      throw new AppError("User not found", 404);
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError("Current password is incorrect", 400);
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await User.findByIdAndUpdate(userId, { passwordHash: newPasswordHash });
  }

  private generateRefreshToken(userId: string, email: string): string {
    const payload = { userId, email };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: env.jwtRefreshExpire } as any);
  }
}
