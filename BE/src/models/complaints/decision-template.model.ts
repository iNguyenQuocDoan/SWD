import mongoose, { Schema, Document } from "mongoose";
import { ComplaintCategory, ResolutionType } from "@/types";

export interface IDecisionTemplate extends Document {
  name: string;
  category: ComplaintCategory;
  resolutionType: ResolutionType;
  templateContent: string;
  templateContentVi?: string; // Vietnamese version
  usageCount: number;
  isActive: boolean;
  createdByUserId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DecisionTemplateSchema = new Schema<IDecisionTemplate>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "ProductQuality",
        "NotAsDescribed",
        "MissingWrongItems",
        "DeliveryIssues",
        "AccountNotWorking",
        "SellerNotResponding",
        "RefundDispute",
      ],
    },
    resolutionType: {
      type: String,
      required: true,
      enum: ["None", "FullRefund", "PartialRefund", "Replace", "Reject"],
    },
    templateContent: {
      type: String,
      required: true,
    },
    templateContentVi: {
      type: String,
      default: null,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdByUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
DecisionTemplateSchema.index({ category: 1, resolutionType: 1 });
DecisionTemplateSchema.index({ isActive: 1 });
DecisionTemplateSchema.index({ name: "text", templateContent: "text" });

export default mongoose.model<IDecisionTemplate>(
  "DecisionTemplate",
  DecisionTemplateSchema
);
