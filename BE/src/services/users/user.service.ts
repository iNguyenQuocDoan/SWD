import { BaseService } from "@/services/base.service";
import { User, IUser } from "@/models";
import { AppError } from "@/middleware/errorHandler";
import { MESSAGES } from "@/constants/messages";

export class UserService extends BaseService<IUser> {
  constructor() {
    super(User);
  }

  async getUserById(userId: string): Promise<IUser | null> {
    return this.model
      .findById(userId)
      .populate("roleId")
      .select("-passwordHash");
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return this.model
      .findOne({ email, isDeleted: false })
      .populate("roleId")
      .select("-passwordHash");
  }

  async updateUserProfile(
    userId: string,
    data: { fullName?: string; phone?: string; avatarUrl?: string }
  ): Promise<IUser | null> {
    return this.model
      .findByIdAndUpdate(userId, data, { new: true })
      .populate("roleId")
      .select("-passwordHash");
  }

  async verifyEmail(userId: string): Promise<IUser | null> {
    return this.model
      .findByIdAndUpdate(userId, { emailVerified: true }, { new: true })
      .populate("roleId")
      .select("-passwordHash");
  }

  async updateTrustLevel(
    userId: string,
    trustLevel: number
  ): Promise<IUser | null> {
    if (trustLevel < 0 || trustLevel > 100) {
      throw new AppError(MESSAGES.ERROR.USER.TRUST_LEVEL_INVALID, 400);
    }

    return this.model
      .findByIdAndUpdate(userId, { trustLevel }, { new: true })
      .populate("roleId")
      .select("-passwordHash");
  }
}
