import mongoose, { Schema, Document } from "mongoose";
import { TicketStatus, ResolutionType, TicketType, TicketPriority } from "@/types";

export interface ISupportTicket extends Document {
  ticketCode: string;
  customerUserId: mongoose.Types.ObjectId;
  orderItemId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  type: TicketType; // Complaint, Dispute, General
  priority: TicketPriority; // Low, Medium, High, Urgent
  status: TicketStatus;
  assignedToUserId?: mongoose.Types.ObjectId | null; // Staff assigned to handle
  resolutionType: ResolutionType;
  refundAmount?: number; // VND
  decidedByUserId?: mongoose.Types.ObjectId | null; // ADMIN/MODERATOR who decided
  decisionNote?: string | null;
  decidedAt?: Date | null;
  escalatedAt?: Date | null; // When ticket was escalated
  escalatedByUserId?: mongoose.Types.ObjectId | null; // Who escalated
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema = new Schema<ISupportTicket>(
  {
    ticketCode: {
      type: String,
      required: true,
      unique: true,
    },
    customerUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItemId: {
      type: Schema.Types.ObjectId,
      ref: "OrderItem",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["Complaint", "Dispute", "General"],
      default: "General",
    },
    priority: {
      type: String,
      required: true,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },
    status: {
      type: String,
      required: true,
      enum: ["Open", "InReview", "NeedMoreInfo", "Resolved", "Closed"],
      default: "Open",
    },
    assignedToUserId: {
      type: Schema.Types.ObjectId,
      ref: "User", // Staff assigned to handle
      default: null,
    },
    resolutionType: {
      type: String,
      required: true,
      enum: ["None", "FullRefund", "PartialRefund", "Replace", "Reject"],
      default: "None",
    },
    refundAmount: {
      type: Number,
      min: 0,
    },
    decidedByUserId: {
      type: Schema.Types.ObjectId,
      ref: "User", // ADMIN/MODERATOR
      default: null,
    },
    decisionNote: {
      type: String,
      default: null,
    },
    decidedAt: {
      type: Date,
      default: null,
    },
    escalatedAt: {
      type: Date,
      default: null,
    },
    escalatedByUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
// Note: ticketCode index is automatically created by unique: true
SupportTicketSchema.index({ customerUserId: 1 });
SupportTicketSchema.index({ orderItemId: 1 });
SupportTicketSchema.index({ status: 1 });
SupportTicketSchema.index({ priority: 1 });
SupportTicketSchema.index({ type: 1 });
SupportTicketSchema.index({ assignedToUserId: 1 });
SupportTicketSchema.index({ status: 1, priority: -1 }); // For staff queue

export default mongoose.model<ISupportTicket>(
  "SupportTicket",
  SupportTicketSchema
);
