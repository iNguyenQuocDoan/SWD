import mongoose, { Schema, Document } from "mongoose";
import { SecretType, InventoryStatus } from "@/types";

export interface IInventoryItem extends Document {
  productId: mongoose.Types.ObjectId;
  secretType: SecretType;
  secretValue: string;
  status: InventoryStatus;
  reservedAt?: Date | null;
  deliveredAt?: Date | null;
  createdAt: Date;
  isDeleted: boolean;
}

const InventoryItemSchema = new Schema<IInventoryItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    secretType: {
      type: String,
      required: true,
      enum: ["Account", "InviteLink", "Code", "QR"],
    },
    secretValue: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["Available", "Reserved", "Delivered", "Revoked"],
      default: "Available",
    },
    reservedAt: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: false,
  }
);

// Indexes
InventoryItemSchema.index({ productId: 1 });
InventoryItemSchema.index({ status: 1 });
InventoryItemSchema.index({ isDeleted: 1 });

export default mongoose.model<IInventoryItem>(
  "InventoryItem",
  InventoryItemSchema
);
