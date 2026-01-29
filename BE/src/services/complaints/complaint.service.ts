import mongoose from "mongoose";
import { SupportTicket, OrderItem, Order } from "@/models";
import type { ISupportTicket } from "@/models";
import { disbursementService } from "@/services/disbursement/disbursement.service";
import { AppError } from "@/middleware/errorHandler";

const COMPLAINT_WINDOW_HOURS = 72; // 3 days to file complaint

export interface CreateComplaintInput {
  orderItemId: string;
  title: string;
  content: string;
}

export interface ResolveComplaintInput {
  resolutionType: "FullRefund" | "PartialRefund" | "Replace" | "Reject";
  decisionNote: string;
  refundAmount?: number;
}

export class ComplaintService {
  /**
   * Generate unique ticket code
   */
  private generateTicketCode(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `TKT-${timestamp}-${random}`;
  }

  /**
   * Create a complaint/ticket for an order item
   * Customer can only create within 72h of purchase
   */
  async createComplaint(
    customerId: string,
    input: CreateComplaintInput
  ): Promise<ISupportTicket> {
    // Validate order item exists and belongs to customer
    const orderItem = await OrderItem.findById(input.orderItemId).populate(
      "orderId"
    );

    if (!orderItem) {
      throw new AppError("Đơn hàng không tồn tại", 404);
    }

    const order = orderItem.orderId as any;
    if (order.customerUserId.toString() !== customerId) {
      throw new AppError("Bạn không có quyền khiếu nại đơn hàng này", 403);
    }

    // Check if order is paid
    if (order.status !== "Paid" && order.status !== "Disputed") {
      throw new AppError("Chỉ có thể khiếu nại đơn hàng đã thanh toán", 400);
    }

    // Check if within complaint window (72h)
    const holdAt = new Date(orderItem.holdAt);
    const now = new Date();
    const hoursPassed = (now.getTime() - holdAt.getTime()) / (1000 * 60 * 60);

    if (hoursPassed > COMPLAINT_WINDOW_HOURS) {
      throw new AppError(
        `Đã quá thời hạn khiếu nại (${COMPLAINT_WINDOW_HOURS} giờ). Đơn hàng đã được hoàn tất.`,
        400
      );
    }

    // Check if already has open complaint for this order item
    const existingTicket = await SupportTicket.findOne({
      orderItemId: input.orderItemId,
      status: { $in: ["Open", "InReview", "NeedMoreInfo"] },
    });

    if (existingTicket) {
      throw new AppError(
        `Đã có khiếu nại đang xử lý cho đơn hàng này (Mã: ${existingTicket.ticketCode})`,
        400
      );
    }

    // Check if escrow is still holding
    if (orderItem.holdStatus !== "Holding") {
      throw new AppError(
        `Không thể khiếu nại: Đơn hàng đã được xử lý (${orderItem.holdStatus})`,
        400
      );
    }

    // Create ticket
    const ticket = await SupportTicket.create({
      ticketCode: this.generateTicketCode(),
      customerUserId: new mongoose.Types.ObjectId(customerId),
      orderItemId: new mongoose.Types.ObjectId(input.orderItemId),
      title: input.title,
      content: input.content,
      status: "Open",
      resolutionType: "None",
    });

    // Update order item and order status to Disputed
    await OrderItem.findByIdAndUpdate(input.orderItemId, {
      $set: { itemStatus: "Disputed" },
    });

    await Order.findByIdAndUpdate(order._id, {
      $set: { status: "Disputed" },
    });

    return ticket;
  }

  /**
   * Get complaints by customer
   */
  async getMyComplaints(
    customerId: string,
    options: { limit?: number; skip?: number; status?: string } = {}
  ): Promise<ISupportTicket[]> {
    const { limit = 20, skip = 0, status } = options;

    const filter: any = {
      customerUserId: new mongoose.Types.ObjectId(customerId),
    };

    if (status) {
      filter.status = status;
    }

    return SupportTicket.find(filter)
      .populate({
        path: "orderItemId",
        populate: [{ path: "productId" }, { path: "shopId" }],
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();
  }

  /**
   * Get complaint by ID
   */
  async getComplaintById(
    ticketId: string,
    userId?: string
  ): Promise<ISupportTicket | null> {
    const ticket = await SupportTicket.findById(ticketId)
      .populate("customerUserId")
      .populate({
        path: "orderItemId",
        populate: [{ path: "productId" }, { path: "shopId" }, { path: "orderId" }],
      });

    if (!ticket) {
      return null;
    }

    // If userId provided, check ownership (for customers)
    if (userId && ticket.customerUserId._id.toString() !== userId) {
      throw new AppError("Không có quyền xem khiếu nại này", 403);
    }

    return ticket;
  }

  /**
   * Get all complaints (for admin/moderator)
   */
  async getAllComplaints(
    options: { limit?: number; skip?: number; status?: string } = {}
  ): Promise<{ tickets: ISupportTicket[]; total: number }> {
    const { limit = 20, skip = 0, status } = options;

    const filter: any = {};
    if (status) {
      filter.status = status;
    }

    const [tickets, total] = await Promise.all([
      SupportTicket.find(filter)
        .populate("customerUserId")
        .populate({
          path: "orderItemId",
          populate: [{ path: "productId" }, { path: "shopId" }],
        })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .exec(),
      SupportTicket.countDocuments(filter),
    ]);

    return { tickets, total };
  }

  /**
   * Resolve complaint (admin/moderator)
   */
  async resolveComplaint(
    ticketId: string,
    resolvedByUserId: string,
    input: ResolveComplaintInput
  ): Promise<ISupportTicket> {
    const ticket = await SupportTicket.findById(ticketId).populate("orderItemId");

    if (!ticket) {
      throw new AppError("Khiếu nại không tồn tại", 404);
    }

    if (ticket.status === "Resolved" || ticket.status === "Closed") {
      throw new AppError("Khiếu nại đã được xử lý", 400);
    }

    const orderItem = ticket.orderItemId as any;

    // Process based on resolution type
    if (
      input.resolutionType === "FullRefund" ||
      input.resolutionType === "PartialRefund"
    ) {
      const refundAmount =
        input.resolutionType === "FullRefund"
          ? orderItem.holdAmount
          : input.refundAmount || 0;

      if (refundAmount <= 0) {
        throw new AppError("Số tiền hoàn trả phải lớn hơn 0", 400);
      }

      if (refundAmount > orderItem.holdAmount) {
        throw new AppError(
          `Số tiền hoàn trả không thể lớn hơn ${orderItem.holdAmount} VND`,
          400
        );
      }

      // Process refund
      await disbursementService.processRefund(
        orderItem._id.toString(),
        refundAmount,
        ticketId
      );

      // Update ticket
      await SupportTicket.findByIdAndUpdate(ticketId, {
        $set: {
          status: "Resolved",
          resolutionType: input.resolutionType,
          refundAmount,
          decisionNote: input.decisionNote,
          decidedByUserId: new mongoose.Types.ObjectId(resolvedByUserId),
          decidedAt: new Date(),
        },
      });
    } else if (input.resolutionType === "Reject") {
      // Reject complaint - no refund, proceed with normal disbursement
      await SupportTicket.findByIdAndUpdate(ticketId, {
        $set: {
          status: "Resolved",
          resolutionType: "Reject",
          decisionNote: input.decisionNote,
          decidedByUserId: new mongoose.Types.ObjectId(resolvedByUserId),
          decidedAt: new Date(),
        },
      });

      // Update order item status back to normal (will be processed by disbursement cron)
      await OrderItem.findByIdAndUpdate(orderItem._id, {
        $set: { itemStatus: "Delivered" },
      });
    } else if (input.resolutionType === "Replace") {
      // Replace - seller needs to provide new account
      // For now, just mark as resolved, actual replacement handling TBD
      await SupportTicket.findByIdAndUpdate(ticketId, {
        $set: {
          status: "Resolved",
          resolutionType: "Replace",
          decisionNote: input.decisionNote,
          decidedByUserId: new mongoose.Types.ObjectId(resolvedByUserId),
          decidedAt: new Date(),
        },
      });
    }

    return (await SupportTicket.findById(ticketId))!;
  }

  /**
   * Update ticket status (admin/moderator)
   */
  async updateTicketStatus(
    ticketId: string,
    status: "InReview" | "NeedMoreInfo"
  ): Promise<ISupportTicket> {
    const ticket = await SupportTicket.findById(ticketId);

    if (!ticket) {
      throw new AppError("Khiếu nại không tồn tại", 404);
    }

    if (ticket.status === "Resolved" || ticket.status === "Closed") {
      throw new AppError("Không thể cập nhật khiếu nại đã xử lý", 400);
    }

    await SupportTicket.findByIdAndUpdate(ticketId, {
      $set: { status },
    });

    return (await SupportTicket.findById(ticketId))!;
  }

  /**
   * Check if order item can be complained about
   */
  async canFileComplaint(orderItemId: string): Promise<{
    canFile: boolean;
    reason?: string;
    hoursRemaining?: number;
  }> {
    const orderItem = await OrderItem.findById(orderItemId);

    if (!orderItem) {
      return { canFile: false, reason: "Đơn hàng không tồn tại" };
    }

    if (orderItem.holdStatus !== "Holding") {
      return {
        canFile: false,
        reason: `Đơn hàng đã được xử lý (${orderItem.holdStatus})`,
      };
    }

    const holdAt = new Date(orderItem.holdAt);
    const now = new Date();
    const hoursPassed = (now.getTime() - holdAt.getTime()) / (1000 * 60 * 60);
    const hoursRemaining = Math.max(0, COMPLAINT_WINDOW_HOURS - hoursPassed);

    if (hoursPassed > COMPLAINT_WINDOW_HOURS) {
      return { canFile: false, reason: "Đã quá thời hạn khiếu nại", hoursRemaining: 0 };
    }

    // Check for existing open complaint
    const existingTicket = await SupportTicket.findOne({
      orderItemId,
      status: { $in: ["Open", "InReview", "NeedMoreInfo"] },
    });

    if (existingTicket) {
      return {
        canFile: false,
        reason: `Đã có khiếu nại đang xử lý (Mã: ${existingTicket.ticketCode})`,
      };
    }

    return { canFile: true, hoursRemaining };
  }
}

export const complaintService = new ComplaintService();
