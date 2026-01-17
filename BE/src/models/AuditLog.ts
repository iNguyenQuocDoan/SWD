import mongoose, { Schema, Document } from "mongoose";
import {
  AuditActorRoleKey,
  AuditEntityType,
  AuditSeverity,
} from "@/types";

export interface IAuditLog extends Document {
  actorUserId: mongoose.Types.ObjectId;
  actorRoleKey: AuditActorRoleKey;
  action: string;
  entityType: AuditEntityType;
  entityId?: mongoose.Types.ObjectId | null;
  before?: Record<string, any> | null;
  after?: Record<string, any> | null;
  metadata?: Record<string, any> | null;
  severity: AuditSeverity;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actorUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    actorRoleKey: {
      type: String,
      required: true,
      enum: ["CUSTOMER", "SELLER", "ADMIN", "MODERATOR", "SYSTEM"],
    },
    action: {
      type: String,
      required: true,
    },
    entityType: {
      type: String,
      required: true,
      enum: [
        "User",
        "Shop",
        "Product",
        "Order",
        "OrderItem",
        "Ticket",
        "Review",
        "Report",
        "Wallet",
        "InventoryItem",
        "Conversation",
        "Message",
        "System",
      ],
    },
    entityId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    before: {
      type: Schema.Types.Mixed,
      default: null,
    },
    after: {
      type: Schema.Types.Mixed,
      default: null,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: null,
    },
    severity: {
      type: String,
      required: true,
      enum: ["Info", "Warn", "Critical"],
      default: "Info",
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
AuditLogSchema.index({ actorUserId: 1 });
AuditLogSchema.index({ entityType: 1, entityId: 1 });
AuditLogSchema.index({ severity: 1 });
AuditLogSchema.index({ createdAt: -1 });

export default mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
