import mongoose, { Schema, Document } from "mongoose";
import { TicketStatus, ResolutionType } from "@/types";

export interface ISupportTicket extends Document {
  ticketCode: string;
  customerUserId: mongoose.Types.ObjectId;
  orderItemId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  status: TicketStatus;
  resolutionType: ResolutionType;
  refundAmount?: number; // VND
  decidedByUserId?: mongoose.Types.ObjectId | null; // ADMIN/MODERATOR
  decisionNote?: string | null;
  decidedAt?: Date | null;
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
    status: {
      type: String,
      required: true,
      enum: ["Open", "InReview", "NeedMoreInfo", "Resolved", "Closed"],
      default: "Open",
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
  },
  {
    timestamps: true,
  }
);

// Indexes
SupportTicketSchema.index({ ticketCode: 1 });
SupportTicketSchema.index({ customerUserId: 1 });
SupportTicketSchema.index({ orderItemId: 1 });
SupportTicketSchema.index({ status: 1 });

export default mongoose.model<ISupportTicket>(
  "SupportTicket",
  SupportTicketSchema
);
