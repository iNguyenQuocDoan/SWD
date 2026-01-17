import mongoose, { Schema, Document } from "mongoose";
import { RoleKey, RoleStatus } from "@/types";

export interface IRole extends Document {
  roleKey: RoleKey;
  roleName: string;
  description?: string | null;
  status: RoleStatus;
  createdAt: Date;
}

const RoleSchema = new Schema<IRole>(
  {
    roleKey: {
      type: String,
      required: true,
      unique: true,
      enum: ["CUSTOMER", "SELLER", "ADMIN", "MODERATOR"],
    },
    roleName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      required: true,
      enum: ["Active", "Hidden"],
      default: "Active",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // Only createdAt, no updatedAt
  }
);

export default mongoose.model<IRole>("Role", RoleSchema);
