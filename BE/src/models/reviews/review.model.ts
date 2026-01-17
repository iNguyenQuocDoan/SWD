import mongoose, { Schema, Document } from "mongoose";
import { ReviewStatus } from "@/types";

export interface IReview extends Document {
  orderItemId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  shopId: mongoose.Types.ObjectId;
  rating: number; // 1-5
  comment: string;
  status: ReviewStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    orderItemId: {
      type: Schema.Types.ObjectId,
      ref: "OrderItem",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shopId: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["Visible", "Hidden"],
      default: "Visible",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ReviewSchema.index({ orderItemId: 1 });
ReviewSchema.index({ userId: 1 });
ReviewSchema.index({ shopId: 1 });
ReviewSchema.index({ status: 1 });

export default mongoose.model<IReview>("Review", ReviewSchema);
