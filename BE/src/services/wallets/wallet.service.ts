import { BaseService } from "../base.service";
import { Wallet, WalletTransaction } from "@/models";
import type { IWallet, IWalletTransaction } from "@/models";
import mongoose from "mongoose";

export class WalletService extends BaseService<IWallet> {
  constructor() {
    super(Wallet);
  }

  /**
   * Get or create wallet for user
   * Uses findOneAndUpdate with upsert to avoid race conditions
   */
  async getOrCreateWallet(userId: string): Promise<IWallet> {
    const userIdObj = new mongoose.Types.ObjectId(userId);
    
    // Use findOneAndUpdate with upsert to atomically get or create
    const wallet = await Wallet.findOneAndUpdate(
      { userId: userIdObj },
      {
        $setOnInsert: {
          userId: userIdObj,
          balance: 0,
          holdBalance: 0,
          currency: "VND",
          updatedAt: new Date(),
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    if (!wallet) {
      // Fallback: if findOneAndUpdate fails, try to find existing wallet
      const existingWallet = await this.findOne({ userId: userIdObj });
      if (existingWallet) {
        return existingWallet;
      }
      // Last resort: create new wallet (may fail with duplicate key, but that's ok)
      try {
        return await this.create({
          userId: userIdObj,
          balance: 0,
          holdBalance: 0,
          currency: "VND",
          updatedAt: new Date(),
        });
      } catch (error: any) {
        // If duplicate key error, wallet was created by another request, fetch it
        if (error.code === 11000) {
          const foundWallet = await this.findOne({ userId: userIdObj });
          if (foundWallet) {
            return foundWallet;
          }
        }
        throw error;
      }
    }

    return wallet;
  }

  /**
   * Top up wallet (add money)
   */
  async topUp(
    walletId: string,
    amount: number,
    paymentId: string,
    note?: string
  ): Promise<{ wallet: IWallet; transaction: IWalletTransaction }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Update wallet balance
      const wallet = await Wallet.findByIdAndUpdate(
        walletId,
        {
          $inc: { balance: amount },
          $set: { updatedAt: new Date() },
        },
        { new: true, session }
      );

      if (!wallet) {
        throw new Error("Wallet not found");
      }

      // Create transaction record
      const transaction = await WalletTransaction.create(
        [
          {
            walletId: new mongoose.Types.ObjectId(walletId),
            type: "Topup",
            refType: "System",
            refId: new mongoose.Types.ObjectId(paymentId),
            direction: "In",
            amount,
            note: note || `Nạp tiền từ thanh toán #${paymentId}`,
            createdAt: new Date(),
          },
        ],
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      return {
        wallet,
        transaction: transaction[0],
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Get wallet transactions
   */
  async getTransactions(
    walletId: string,
    options: {
      limit?: number;
      skip?: number;
      type?: string;
    } = {}
  ): Promise<IWalletTransaction[]> {
    const { limit = 50, skip = 0, type } = options;

    const filter: any = { walletId: new mongoose.Types.ObjectId(walletId) };
    if (type) {
      filter.type = type;
    }

    return WalletTransaction.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();
  }

  /**
   * Get wallet balance
   */
  async getBalance(walletId: string): Promise<number> {
    const wallet = await Wallet.findById(walletId);
    return wallet?.balance || 0;
  }
}

export const walletService = new WalletService();
