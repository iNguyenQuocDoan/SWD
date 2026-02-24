import mongoose from "mongoose";
import {
  SupportTicket,
  OrderItem,
  Order,
  User,
  ComplaintTimeline,
  ComplaintQueue,
} from "@/models";
import type { ISupportTicket } from "@/models";
import { disbursementService } from "@/services/disbursement/disbursement.service";
import { AppError } from "@/middleware/errorHandler";
import {
  COMPLAINT_CONFIG,
  TicketStatus,
  ComplaintEventType,
  ComplaintActorRole,
  IComplaintEvidence,
} from "@/types";
import type {
  CreateComplaintInput,
  AddEvidenceInput,
  MakeDecisionInput,
  FileAppealInput,
  AppealDecisionInput,
  GetComplaintsQuery,
} from "@/validators/complaints/complaint.schema";

const COMPLAINT_WINDOW_HOURS = 72;

export class ComplaintService {
  // ===== Helper Methods =====

  private generateTicketCode(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `TKT-${timestamp}-${random}`;
  }

  /**
   * Calculate priority score for a complaint
   */
  calculatePriority(ticket: ISupportTicket): number {
    const weights = COMPLAINT_CONFIG.PRIORITY_WEIGHTS;
    const highValueThreshold = COMPLAINT_CONFIG.HIGH_VALUE_THRESHOLD;

    // Normalize values
    const orderValueScore = Math.min(ticket.orderValue / highValueThreshold, 1);
    const buyerTrustScore = ticket.buyerTrustLevel / 100;
    const sellerTrustScore = (100 - ticket.sellerTrustLevel) / 100; // Lower trust = higher priority
    const ticketAgeHours =
      (Date.now() - ticket.createdAt.getTime()) / (1000 * 60 * 60);
    const ticketAgeScore = Math.min(ticketAgeHours / 72, 1); // Max at 72 hours
    const isHighValue = ticket.orderValue >= highValueThreshold ? 1 : 0;

    const priority =
      orderValueScore * weights.orderValue +
      buyerTrustScore * weights.buyerTrust +
      sellerTrustScore * weights.sellerTrust +
      ticketAgeScore * weights.ticketAge +
      isHighValue * weights.isHighValue;

    return Math.round(priority * 100);
  }

  /**
   * Add timeline event
   */
  async addTimelineEvent(
    ticketId: string,
    eventType: ComplaintEventType,
    actorUserId: string,
    actorRole: ComplaintActorRole,
    description: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await ComplaintTimeline.create({
      ticketId: new mongoose.Types.ObjectId(ticketId),
      eventType,
      actorUserId: new mongoose.Types.ObjectId(actorUserId),
      actorRole,
      description,
      metadata,
    });
  }

  // ===== Buyer Methods =====

  /**
   * Find the single moderator in the system (cached query)
   */
  private async findModerator(): Promise<any> {
    const moderator = await User.findOne({
      roleId: { $exists: true },
    }).populate({
      path: "roleId",
      match: { roleKey: "MODERATOR" },
    });

    // If roleId is null after populate with match, the user is not a moderator
    if (!moderator?.roleId) {
      // Fallback: find any user with MODERATOR role
      const allModerators = await User.find({
        roleId: { $exists: true },
      }).populate("roleId");

      return allModerators.find((u) => (u.roleId as any)?.roleKey === "MODERATOR");
    }

    return moderator;
  }

  /**
   * Create a new complaint with category system
   */
  async createComplaint(
    customerId: string,
    input: CreateComplaintInput
  ): Promise<ISupportTicket> {
    // Validate order item exists and belongs to customer
    const orderItem = await OrderItem.findById(input.orderItemId)
      .populate("orderId")
      .populate("shopId")
      .populate("productId");

    if (!orderItem) {
      throw new AppError("Đơn hàng không tồn tại", 404);
    }

    const order = orderItem.orderId as any;
    const shop = orderItem.shopId as any;

    if (order.customerUserId.toString() !== customerId) {
      throw new AppError("Bạn không có quyền khiếu nại đơn hàng này", 403);
    }

    if (order.status !== "Paid" && order.status !== "Disputed") {
      throw new AppError("Chỉ có thể khiếu nại đơn hàng đã thanh toán", 400);
    }

    // Check complaint window
    const holdAt = new Date(orderItem.holdAt);
    const now = new Date();
    const hoursPassed = (now.getTime() - holdAt.getTime()) / (1000 * 60 * 60);

    if (hoursPassed > COMPLAINT_WINDOW_HOURS) {
      throw new AppError(
        `Đã quá thời hạn khiếu nại (${COMPLAINT_WINDOW_HOURS} giờ)`,
        400
      );
    }

    // Parallel queries: check existing ticket, get users, find moderator
    const [existingTicket, customer, seller, moderator] = await Promise.all([
      SupportTicket.findOne({
        orderItemId: input.orderItemId,
        status: { $nin: ["Resolved", "Closed"] },
      }),
      User.findById(customerId),
      User.findById(shop.ownerUserId),
      this.findModerator(),
    ]);

    if (existingTicket) {
      throw new AppError(
        `Đã có khiếu nại đang xử lý (Mã: ${existingTicket.ticketCode})`,
        400
      );
    }

    if (!moderator) {
      throw new AppError("Hệ thống chưa có moderator, vui lòng liên hệ admin", 500);
    }

    // Prepare evidence array
    const buyerEvidence: IComplaintEvidence[] = (input.evidence || []).map(
      (e) => ({
        uploadedBy: customerId,
        type: e.type,
        url: e.url,
        description: e.description,
        uploadedAt: new Date(),
      })
    );

    // Create order snapshot
    const product = orderItem.productId as any;
    const orderValue = orderItem.subtotal || orderItem.unitPrice * orderItem.quantity;
    const orderSnapshot = {
      orderId: order._id,
      orderCode: order.orderCode,
      totalAmount: orderValue,
      paidAt: order.paidAt || new Date(),
      productTitle: product?.title || "N/A",
      productThumbnail: product?.thumbnailUrl || null,
      deliveryContent: "***", // Masked
      deliveredAt: orderItem.deliveredAt || undefined,
    };

    const buyerTrustLevel = customer?.trustLevel || 50;
    const sellerTrustLevel = seller?.trustLevel || 50;

    // Create ticket - already assigned to moderator
    const ticket = (await SupportTicket.create({
      ticketCode: this.generateTicketCode(),
      customerUserId: new mongoose.Types.ObjectId(customerId),
      orderItemId: new mongoose.Types.ObjectId(input.orderItemId),
      title: input.title,
      content: input.content,
      type: "Complaint",
      category: input.category,
      subcategory: input.subcategory || null,
      status: "ModeratorAssigned",
      resolutionType: "None",

      // Shop info
      shopId: shop._id,
      sellerUserId: shop.ownerUserId,

      // Auto-assign to moderator
      assignedToUserId: moderator._id,
      firstResponseAt: new Date(),

      // Evidence
      buyerEvidence,
      orderSnapshot,

      // Escalation - starts at Moderator level
      escalationLevel: "Level2_Moderator",

      // Priority calculation
      orderValue,
      buyerTrustLevel,
      sellerTrustLevel,
    })) as ISupportTicket & { _id: mongoose.Types.ObjectId };

    // Calculate priority
    const calculatedPriority = this.calculatePriority(ticket);
    const isHighValue = orderValue >= COMPLAINT_CONFIG.HIGH_VALUE_THRESHOLD;

    // Parallel updates: priority, order status, queue, timeline
    await Promise.all([
      // Update ticket priority
      SupportTicket.findByIdAndUpdate(ticket._id, { calculatedPriority }),

      // Update order item and order status
      OrderItem.findByIdAndUpdate(input.orderItemId, { itemStatus: "Disputed" }),
      Order.findByIdAndUpdate(order._id, { status: "Disputed" }),

      // Add to ComplaintQueue (for tracking/stats)
      ComplaintQueue.create({
        ticketId: ticket._id,
        queuePriority: calculatedPriority,
        status: "Assigned",
        addedToQueueAt: new Date(),
        pickedUpAt: new Date(),
        assignedModeratorId: moderator._id,
        orderValue,
        buyerTrustLevel,
        sellerTrustLevel,
        ticketAge: 0,
        isHighValue,
        isEscalated: false,
        sellerTimeoutOccurred: false,
      }),

      // Add timeline events
      this.addTimelineEvent(
        ticket._id.toString(),
        "Created",
        customerId,
        "BUYER",
        `Khiếu nại được tạo: ${input.category}`,
        { category: input.category, subcategory: input.subcategory }
      ),
      this.addTimelineEvent(
        ticket._id.toString(),
        "ModeratorAssigned",
        moderator._id.toString(),
        "SYSTEM",
        `Khiếu nại được tự động gán cho moderator: ${moderator.fullName}`
      ),
    ]);

    // TODO: Notify moderator via socket

    return ticket;
  }

  /**
   * Add evidence to complaint (buyer only)
   */
  async addEvidence(
    ticketId: string,
    userId: string,
    input: AddEvidenceInput
  ): Promise<ISupportTicket> {
    const ticket = await SupportTicket.findById(ticketId);

    if (!ticket) {
      throw new AppError("Khiếu nại không tồn tại", 404);
    }

    // Verify buyer ownership
    if (ticket.customerUserId.toString() !== userId) {
      throw new AppError("Không có quyền thêm bằng chứng", 403);
    }

    // Check status allows adding evidence
    const allowedStatuses: TicketStatus[] = [
      "ModeratorAssigned",
      "InReview",
      "NeedMoreInfo",
    ];
    if (!allowedStatuses.includes(ticket.status as TicketStatus)) {
      throw new AppError("Không thể thêm bằng chứng ở trạng thái này", 400);
    }

    const evidence: IComplaintEvidence = {
      uploadedBy: userId,
      type: input.type,
      url: input.url,
      description: input.description,
      uploadedAt: new Date(),
    };

    await SupportTicket.findByIdAndUpdate(ticketId, {
      $push: { buyerEvidence: evidence },
    });

    await this.addTimelineEvent(
      ticketId,
      "EvidenceAdded",
      userId,
      "BUYER",
      `Thêm bằng chứng: ${input.type}`
    );

    return (await SupportTicket.findById(ticketId))!;
  }

  /**
   * File an appeal
   */
  async fileAppeal(
    ticketId: string,
    appellantId: string,
    input: FileAppealInput
  ): Promise<ISupportTicket> {
    const ticket = await SupportTicket.findById(ticketId);

    if (!ticket) {
      throw new AppError("Khiếu nại không tồn tại", 404);
    }

    // Check if appellant is buyer or seller
    const isBuyer = ticket.customerUserId.toString() === appellantId;
    const isSeller = ticket.sellerUserId?.toString() === appellantId;

    if (!isBuyer && !isSeller) {
      throw new AppError("Không có quyền kháng cáo", 403);
    }

    if (ticket.status !== "Appealable" && ticket.status !== "DecisionMade") {
      throw new AppError("Không thể kháng cáo ở trạng thái này", 400);
    }

    // Check appeal deadline
    if (ticket.appealDeadline && new Date() > ticket.appealDeadline) {
      throw new AppError("Đã quá thời hạn kháng cáo", 400);
    }

    // Check if already appealed
    if (ticket.appealTicketId) {
      throw new AppError("Khiếu nại này đã được kháng cáo", 400);
    }

    // Create appeal ticket
    const appealTicket = await SupportTicket.create({
      ticketCode: this.generateTicketCode(),
      customerUserId: ticket.customerUserId,
      orderItemId: ticket.orderItemId,
      title: `[Kháng cáo] ${ticket.title}`,
      content: input.reason,
      type: "Appeal",
      category: ticket.category,
      status: "AppealReview",
      isAppeal: true,
      originalTicketId: ticket._id,
      escalationLevel: "Level3_SeniorMod",
      shopId: ticket.shopId,
      sellerUserId: ticket.sellerUserId,
      orderValue: ticket.orderValue,
      buyerTrustLevel: ticket.buyerTrustLevel,
      sellerTrustLevel: ticket.sellerTrustLevel,
      buyerEvidence: input.additionalEvidence?.map((e) => ({
        uploadedBy: appellantId,
        type: e.type,
        url: e.url,
        description: e.description,
        uploadedAt: new Date(),
      })) || [],
    });

    // Update original ticket
    await SupportTicket.findByIdAndUpdate(ticketId, {
      status: "AppealFiled",
      appealTicketId: appealTicket._id,
    });

    await this.addTimelineEvent(
      ticketId,
      "AppealFiled",
      appellantId,
      isBuyer ? "BUYER" : "SELLER",
      `Kháng cáo được nộp: ${input.reason.substring(0, 100)}...`
    );

    return appealTicket;
  }

  // ===== Moderator Methods =====

  /**
   * Assign complaint to moderator
   */
  async assignToModerator(
    ticketId: string,
    moderatorId: string
  ): Promise<ISupportTicket> {
    const ticket = await SupportTicket.findById(ticketId);

    if (!ticket) {
      throw new AppError("Khiếu nại không tồn tại", 404);
    }

    if (ticket.status !== "ModeratorAssigned" && ticket.status !== "InReview") {
      throw new AppError("Khiếu nại không thể gán lại", 400);
    }

    await SupportTicket.findByIdAndUpdate(ticketId, {
      status: "ModeratorAssigned",
      assignedToUserId: new mongoose.Types.ObjectId(moderatorId),
      firstResponseAt: ticket.firstResponseAt || new Date(),
    });

    await ComplaintQueue.findOneAndUpdate(
      { ticketId },
      {
        status: "Assigned",
        assignedModeratorId: new mongoose.Types.ObjectId(moderatorId),
        pickedUpAt: new Date(),
      }
    );

    await this.addTimelineEvent(
      ticketId,
      "ModeratorAssigned",
      moderatorId,
      "MODERATOR",
      "Moderator đã nhận xử lý khiếu nại"
    );

    return (await SupportTicket.findById(ticketId))!;
  }

  /**
   * Add internal note
   */
  async addInternalNote(
    ticketId: string,
    moderatorId: string,
    content: string
  ): Promise<ISupportTicket> {
    const ticket = await SupportTicket.findById(ticketId);

    if (!ticket) {
      throw new AppError("Khiếu nại không tồn tại", 404);
    }

    await SupportTicket.findByIdAndUpdate(ticketId, {
      $push: {
        internalNotes: {
          authorUserId: new mongoose.Types.ObjectId(moderatorId),
          content,
          createdAt: new Date(),
        },
      },
    });

    await this.addTimelineEvent(
      ticketId,
      "InternalNoteAdded",
      moderatorId,
      "MODERATOR",
      "Thêm ghi chú nội bộ"
    );

    return (await SupportTicket.findById(ticketId))!;
  }

  /**
   * Request more information
   */
  async requestMoreInfo(
    ticketId: string,
    moderatorId: string,
    targetParty: "buyer" | "seller" | "both",
    questions: string[]
  ): Promise<ISupportTicket> {
    const ticket = await SupportTicket.findById(ticketId);

    if (!ticket) {
      throw new AppError("Khiếu nại không tồn tại", 404);
    }

    await SupportTicket.findByIdAndUpdate(ticketId, {
      status: "NeedMoreInfo",
    });

    await this.addTimelineEvent(
      ticketId,
      "InfoRequested",
      moderatorId,
      "MODERATOR",
      `Yêu cầu thông tin từ ${targetParty}: ${questions.join(", ")}`,
      { targetParty, questions }
    );

    // TODO: Send notification to parties

    return (await SupportTicket.findById(ticketId))!;
  }

  /**
   * Make decision on complaint
   */
  async makeDecision(
    ticketId: string,
    moderatorId: string,
    input: MakeDecisionInput
  ): Promise<ISupportTicket> {
    const ticket = await SupportTicket.findById(ticketId).populate("orderItemId");

    if (!ticket) {
      throw new AppError("Khiếu nại không tồn tại", 404);
    }

    const orderItem = ticket.orderItemId as any;

    // Process refund if applicable
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

      await disbursementService.processRefund(
        orderItem._id.toString(),
        refundAmount,
        ticketId
      );

      await SupportTicket.findByIdAndUpdate(ticketId, {
        refundAmount,
      });
    }

    // Set appeal deadline
    const appealDeadline = new Date(
      Date.now() + COMPLAINT_CONFIG.APPEAL_WINDOW_HOURS * 60 * 60 * 1000
    );

    // Update ticket
    await SupportTicket.findByIdAndUpdate(ticketId, {
      status: "Appealable",
      resolutionType: input.resolutionType,
      decisionNote: input.decisionNote,
      decisionTemplate: input.templateId || null,
      decidedByUserId: new mongoose.Types.ObjectId(moderatorId),
      decidedAt: new Date(),
      appealDeadline,
      sellerPenalty: input.sellerPenalty || null,
    });

    // Update queue status
    await ComplaintQueue.findOneAndUpdate(
      { ticketId },
      { status: "Completed", completedAt: new Date() }
    );

    await this.addTimelineEvent(
      ticketId,
      "DecisionMade",
      moderatorId,
      "MODERATOR",
      `Quyết định: ${input.resolutionType} - ${input.decisionNote}`,
      { resolutionType: input.resolutionType, penalty: input.sellerPenalty }
    );

    // TODO: Notify parties

    return (await SupportTicket.findById(ticketId))!;
  }

  /**
   * Resolve appeal (Admin/Senior Mod)
   */
  async resolveAppeal(
    appealTicketId: string,
    reviewerId: string,
    input: AppealDecisionInput
  ): Promise<ISupportTicket> {
    const appealTicket = await SupportTicket.findById(appealTicketId);

    if (!appealTicket) {
      throw new AppError("Kháng cáo không tồn tại", 404);
    }

    if (!appealTicket.isAppeal) {
      throw new AppError("Đây không phải là kháng cáo", 400);
    }

    const originalTicket = await SupportTicket.findById(appealTicket.originalTicketId);

    if (input.decision === "Overturned" && originalTicket) {
      // Reverse the original decision
      if (input.newResolutionType === "FullRefund" || input.newResolutionType === "PartialRefund") {
        // TODO: Handle refund adjustment logic
        // Should calculate refund based on:
        // - FullRefund: orderItem.holdAmount
        // - PartialRefund: input.newRefundAmount
        // Then call disbursementService.processRefund()
      }

      await SupportTicket.findByIdAndUpdate(originalTicket._id, {
        resolutionType: input.newResolutionType || originalTicket.resolutionType,
        refundAmount: input.newRefundAmount || originalTicket.refundAmount,
      });
    }

    await SupportTicket.findByIdAndUpdate(appealTicketId, {
      status: "Closed",
      resolutionType: input.decision === "Upheld" ? "Reject" : (input.newResolutionType || "None"),
      decisionNote: input.reason,
      decidedByUserId: new mongoose.Types.ObjectId(reviewerId),
      decidedAt: new Date(),
    });

    // Close original ticket
    if (originalTicket) {
      await SupportTicket.findByIdAndUpdate(originalTicket._id, {
        status: "Closed",
      });
    }

    await this.addTimelineEvent(
      appealTicketId,
      "AppealResolved",
      reviewerId,
      "SENIOR_MOD",
      `Kháng cáo ${input.decision}: ${input.reason}`
    );

    return (await SupportTicket.findById(appealTicketId))!;
  }

  // ===== Query Methods =====

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

  async getComplaintById(
    ticketId: string,
    _userId?: string
  ): Promise<ISupportTicket | null> {
    const ticket = await SupportTicket.findById(ticketId)
      .populate("customerUserId", "fullName email")
      .populate("sellerUserId", "fullName email")
      .populate("assignedToUserId", "fullName email")
      .populate({
        path: "orderItemId",
        populate: [{ path: "productId" }, { path: "shopId" }, { path: "orderId" }],
      });

    return ticket;
  }

  async getAllComplaints(
    query: GetComplaintsQuery
  ): Promise<{ tickets: ISupportTicket[]; total: number }> {
    const filter: any = {};

    if (query.status) filter.status = query.status;
    if (query.category) filter.category = query.category;
    if (query.priority) {
      // Map priority enum to calculatedPriority ranges (0-100)
      const priorityRanges: Record<string, { $gte: number; $lte: number }> = {
        Low: { $gte: 0, $lte: 25 },
        Medium: { $gte: 26, $lte: 50 },
        High: { $gte: 51, $lte: 75 },
        Urgent: { $gte: 76, $lte: 100 },
      };
      filter.calculatedPriority = priorityRanges[query.priority];
    }
    if (query.escalationLevel) filter.escalationLevel = query.escalationLevel;
    if (query.assignedToUserId) {
      filter.assignedToUserId = new mongoose.Types.ObjectId(query.assignedToUserId);
    }
    if (query.isHighValue) {
      filter.orderValue = { $gte: COMPLAINT_CONFIG.HIGH_VALUE_THRESHOLD };
    }

    const sortObj: any = {};
    sortObj[query.sortBy] = query.sortOrder === "asc" ? 1 : -1;

    const [tickets, total] = await Promise.all([
      SupportTicket.find(filter)
        .populate("customerUserId", "fullName email")
        .populate("sellerUserId", "fullName email")
        .populate("assignedToUserId", "fullName email")
        .populate({
          path: "orderItemId",
          populate: [{ path: "productId" }, { path: "shopId" }],
        })
        .sort(sortObj)
        .limit(query.limit)
        .skip(query.skip),
      SupportTicket.countDocuments(filter),
    ]);

    return { tickets, total };
  }

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

    const existingTicket = await SupportTicket.findOne({
      orderItemId,
      status: { $nin: ["Resolved", "Closed"] },
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
