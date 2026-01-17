import mongoose, { Schema, Document } from "mongoose";
import { MessageType, AttachmentType } from "@/types";

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  senderUserId: mongoose.Types.ObjectId;
  messageType: MessageType;
  body?: string | null;
  attachmentUrl?: string | null;
  attachmentType: AttachmentType;
  sentAt: Date;
  readAt?: Date | null;
  isDeleted: boolean;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    senderUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messageType: {
      type: String,
      required: true,
      enum: ["Text", "System", "Attachment"],
    },
    body: {
      type: String,
      default: null,
    },
    attachmentUrl: {
      type: String,
      default: null,
    },
    attachmentType: {
      type: String,
      required: true,
      enum: ["Image", "File", "None"],
      default: "None",
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    readAt: {
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
MessageSchema.index({ conversationId: 1 });
MessageSchema.index({ senderUserId: 1 });
MessageSchema.index({ sentAt: -1 });
MessageSchema.index({ isDeleted: 1 });

export default mongoose.model<IMessage>("Message", MessageSchema);
