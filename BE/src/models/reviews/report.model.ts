import mongoose, { Schema, Document } from "mongoose";
import {
  ReportTargetType,
  ReportReason,
  ReportStatus,
  ReportActionType,
} from "@/types";

export interface IReport extends Document {
  reporterUserId: mongoose.Types.ObjectId;
  targetType: ReportTargetType;
  targetId: mongoose.Types.ObjectId;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  // Handling
  handledByUserId?: mongoose.Types.ObjectId | null; // MODERATOR
  actionType?: ReportActionType | null;
  handleNote?: string | null;
  handledAt?: Date | null;
  createdAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    reporterUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetType: {
      type: String,
      required: true,
      enum: ["Product", "Review", "Shop", "User"],
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      enum: ["Fraud", "Spam", "Illegal", "Harassment", "Other"],
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["Open", "InReview", "Resolved", "Rejected"],
      default: "Open",
    },
    // Handling
    handledByUserId: {
      type: Schema.Types.ObjectId,
      ref: "User", // MODERATOR
      default: null,
    },
    actionType: {
      type: String,
      enum: [
        "None",
        "HideProduct",
        "HideReview",
        "SuspendShop",
        "BanUser",
        "RejectReport",
      ],
      default: null,
    },
    handleNote: {
      type: String,
      default: null,
    },
    handledAt: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Indexes
ReportSchema.index({ reporterUserId: 1 });
ReportSchema.index({ targetType: 1, targetId: 1 });
ReportSchema.index({ status: 1 });

export default mongoose.model<IReport>("Report", ReportSchema);
