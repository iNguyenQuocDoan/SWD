import mongoose from "mongoose";
import {
  SupportTicket,
  OrderItem,
  Order,
  Shop,
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
  EscalationLevel,
  ComplaintEventType,
  ComplaintActorRole,
  IComplaintEvidence,
  ResolutionType,
} from "@/types";
import type {
  CreateComplaintInput,
  AddEvidenceInput,
  SellerResponseInput,
  ProposeResolutionInput,
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
      deliveredAt: orderItem.deliveredAt,
    };

    const buyerTrustLevel = customer?.trustLevel || 50;
    const sellerTrustLevel = seller?.trustLevel || 50;

    // Create ticket - already assigned to moderator
    const ticket = await SupportTicket.create({
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
    });

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
   * Add evidence to complaint
   */
  async addEvidence(
    ticketId: string,
    userId: string,
    input: AddEvidenceInput,
    role: "buyer" | "seller"
  ): Promise<ISupportTicket> {
    const ticket = await SupportTicket.findById(ticketId);

    if (!ticket) {
      throw new AppError("Khiếu nại không tồn tại", 404);
    }

    // Verify ownership
    if (role === "buyer" && ticket.customerUserId.toString() !== userId) {
      throw new AppError("Không có quyền thêm bằng chứng", 403);
    }
    if (role === "seller" && ticket.sellerUserId?.toString() !== userId) {
      throw new AppError("Không có quyền thêm bằng chứng", 403);
    }

    // Check status allows adding evidence
    const allowedStatuses: TicketStatus[] = [
      "AwaitingSeller",
      "SellerResponded",
      "BuyerReviewing",
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

    const updateField =
      role === "buyer" ? "buyerEvidence" : "sellerEvidence";
    await SupportTicket.findByIdAndUpdate(ticketId, {
      $push: { [updateField]: evidence },
    });

    await this.addTimelineEvent(
      ticketId,
      "EvidenceAdded",
      userId,
      role === "buyer" ? "BUYER" : "SELLER",
      `Thêm bằng chứng: ${input.type}`
    );

    return (await SupportTicket.findById(ticketId))!;
  }

  /**
   * Buyer accepts seller's response
   */
  async acceptSellerResponse(
    ticketId: string,
    buyerId: string
  ): Promise<ISupportTicket> {
    const ticket = await SupportTicket.findById(ticketId);

    if (!ticket) {
      throw new AppError("Khiếu nại không tồn tại", 404);
    }

    if (ticket.customerUserId.toString() !== buyerId) {
      throw new AppError("Không có quyền thực hiện", 403);
    }

    if (ticket.status !== "SellerResponded" && ticket.status !== "BuyerReviewing") {
      throw new AppError("Không thể chấp nhận ở trạng thái này", 400);
    }

    // Process based on seller's proposed resolution
    if (ticket.sellerProposedResolution === "FullRefund" || ticket.sellerProposedResolution === "PartialRefund") {
      const orderItem = await OrderItem.findById(ticket.orderItemId);
      const refundAmount = ticket.sellerProposedResolution === "FullRefund"
        ? orderItem?.holdAmount || 0
        : ticket.sellerProposedRefundAmount || 0;

      await disbursementService.processRefund(
        ticket.orderItemId.toString(),
        refundAmount,
        ticketId
      );

      await SupportTicket.findByIdAndUpdate(ticketId, {
        status: "Resolved",
        resolutionType: ticket.sellerProposedResolution,
        refundAmount,
        decidedAt: new Date(),
      });
    } else {
      await SupportTicket.findByIdAndUpdate(ticketId, {
        status: "Resolved",
        resolutionType: ticket.sellerProposedResolution || "None",
        decidedAt: new Date(),
      });
    }

    await this.addTimelineEvent(
      ticketId,
      "BuyerAccepted",
      buyerId,
      "BUYER",
      "Người mua chấp nhận phản hồi của người bán"
    );

    return (await SupportTicket.findById(ticketId))!;
  }

  /**
   * Buyer rejects seller's response and escalates
   */
  async rejectSellerResponse(
    ticketId: string,
    buyerId: string,
    reason: string
  ): Promise<ISupportTicket> {
    const ticket = await SupportTicket.findById(ticketId);

    if (!ticket) {
      throw new AppError("Khiếu nại không tồn tại", 404);
    }

    if (ticket.customerUserId.toString() !== buyerId) {
      throw new AppError("Không có quyền thực hiện", 403);
    }

    if (ticket.status !== "SellerResponded" && ticket.status !== "BuyerReviewing") {
      throw new AppError("Không thể từ chối ở trạng thái này", 400);
    }

    // Find moderator first
    const moderator = await this.findModerator();
    if (!moderator) {
      throw new AppError("Hệ thống chưa có moderator", 500);
    }

    const ticketAge = (Date.now() - ticket.createdAt.getTime()) / (1000 * 60 * 60);
    const isHighValue = ticket.orderValue >= COMPLAINT_CONFIG.HIGH_VALUE_THRESHOLD;

    // Parallel: update ticket, queue, and add timeline events
    await Promise.all([
      // Update ticket with escalation info + moderator assignment
      SupportTicket.findByIdAndUpdate(ticketId, {
        status: "ModeratorAssigned",
        escalationLevel: "Level2_Moderator",
        escalationReason: reason,
        escalatedAt: new Date(),
        escalatedByUserId: new mongoose.Types.ObjectId(buyerId),
        assignedToUserId: moderator._id,
        firstResponseAt: ticket.firstResponseAt || new Date(),
      }),

      // Update/Create queue entry
      ComplaintQueue.findOneAndUpdate(
        { ticketId: ticket._id },
        {
          ticketId: ticket._id,
          queuePriority: ticket.calculatedPriority,
          status: "Assigned",
          addedToQueueAt: new Date(),
          pickedUpAt: new Date(),
          assignedModeratorId: moderator._id,
          orderValue: ticket.orderValue,
          buyerTrustLevel: ticket.buyerTrustLevel,
          sellerTrustLevel: ticket.sellerTrustLevel,
          ticketAge,
          isHighValue,
          isEscalated: true,
          sellerTimeoutOccurred: false,
        },
        { upsert: true, new: true }
      ),

      // Timeline events
      this.addTimelineEvent(
        ticketId,
        "BuyerRejected",
        buyerId,
        "BUYER",
        `Người mua từ chối phản hồi và leo thang: ${reason}`
      ),
      this.addTimelineEvent(
        ticketId,
        "EscalatedToMod",
        buyerId,
        "BUYER",
        "Khiếu nại được leo thang lên Moderator"
      ),
      this.addTimelineEvent(
        ticketId,
        "ModeratorAssigned",
        moderator._id.toString(),
        "SYSTEM",
        `Khiếu nại được tự động gán cho moderator: ${moderator.fullName}`
      ),
    ]);

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

  // ===== Seller Methods =====

  /**
   * Get complaints for seller's shop
   */
  async getShopComplaints(
    sellerId: string,
    options: { limit?: number; skip?: number; status?: string } = {}
  ): Promise<{ tickets: ISupportTicket[]; total: number }> {
    const { limit = 20, skip = 0, status } = options;

    // Get seller's shop
    const shop = await Shop.findOne({ ownerUserId: sellerId });
    if (!shop) {
      throw new AppError("Shop không tồn tại", 404);
    }

    const filter: any = { shopId: shop._id };
    if (status) {
      filter.status = status;
    }

    const [tickets, total] = await Promise.all([
      SupportTicket.find(filter)
        .populate("customerUserId", "fullName email")
        .populate({
          path: "orderItemId",
          populate: [{ path: "productId" }],
        })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip),
      SupportTicket.countDocuments(filter),
    ]);

    return { tickets, total };
  }

  /**
   * Seller responds to complaint
   */
  async submitSellerResponse(
    ticketId: string,
    sellerId: string,
    input: SellerResponseInput
  ): Promise<ISupportTicket> {
    const ticket = await SupportTicket.findById(ticketId);

    if (!ticket) {
      throw new AppError("Khiếu nại không tồn tại", 404);
    }

    if (ticket.sellerUserId?.toString() !== sellerId) {
      throw new AppError("Không có quyền phản hồi khiếu nại này", 403);
    }

    if (ticket.status !== "AwaitingSeller") {
      throw new AppError("Không thể phản hồi ở trạng thái này", 400);
    }

    // Check deadline
    if (ticket.sellerResponseDeadline && new Date() > ticket.sellerResponseDeadline) {
      throw new AppError("Đã quá thời hạn phản hồi", 400);
    }

    // Prepare seller evidence
    const sellerEvidence: IComplaintEvidence[] = (input.evidence || []).map(
      (e) => ({
        uploadedBy: sellerId,
        type: e.type,
        url: e.url,
        description: e.description,
        uploadedAt: new Date(),
      })
    );

    await SupportTicket.findByIdAndUpdate(ticketId, {
      status: "SellerResponded",
      sellerResponse: input.response,
      sellerRespondedAt: new Date(),
      sellerResponseStatus: "Responded",
      $push: { sellerEvidence: { $each: sellerEvidence } },
    });

    await this.addTimelineEvent(
      ticketId,
      "SellerResponded",
      sellerId,
      "SELLER",
      "Người bán đã phản hồi khiếu nại"
    );

    return (await SupportTicket.findById(ticketId))!;
  }

  /**
   * Seller proposes resolution
   */
  async proposeResolution(
    ticketId: string,
    sellerId: string,
    input: ProposeResolutionInput
  ): Promise<ISupportTicket> {
    const ticket = await SupportTicket.findById(ticketId);

    if (!ticket) {
      throw new AppError("Khiếu nại không tồn tại", 404);
    }

    if (ticket.sellerUserId?.toString() !== sellerId) {
      throw new AppError("Không có quyền đề xuất giải pháp", 403);
    }

    const allowedStatuses: TicketStatus[] = ["AwaitingSeller", "SellerResponded"];
    if (!allowedStatuses.includes(ticket.status as TicketStatus)) {
      throw new AppError("Không thể đề xuất ở trạng thái này", 400);
    }

    await SupportTicket.findByIdAndUpdate(ticketId, {
      status: "BuyerReviewing",
      sellerProposedResolution: input.proposedResolution,
      sellerProposedRefundAmount: input.refundAmount || null,
      sellerResponseStatus: "Responded",
      sellerRespondedAt: new Date(),
    });

    await this.addTimelineEvent(
      ticketId,
      "SellerResponded",
      sellerId,
      "SELLER",
      `Người bán đề xuất: ${input.proposedResolution}`,
      { resolution: input.proposedResolution, amount: input.refundAmount }
    );

    return (await SupportTicket.findById(ticketId))!;
  }

  // ===== Moderator Methods =====

  /**
   * Auto-assign complaint to the single moderator (for escalation cases)
   */
  private async addToModeratorQueue(ticketId: string): Promise<void> {
    // Parallel: get ticket and moderator
    const [ticket, moderator] = await Promise.all([
      SupportTicket.findById(ticketId),
      this.findModerator(),
    ]);

    if (!ticket || !moderator) {
      console.error("Ticket or moderator not found");
      return;
    }

    const ticketAge = (Date.now() - ticket.createdAt.getTime()) / (1000 * 60 * 60);
    const isHighValue = ticket.orderValue >= COMPLAINT_CONFIG.HIGH_VALUE_THRESHOLD;

    // Parallel updates
    await Promise.all([
      // Update/Create queue entry
      ComplaintQueue.findOneAndUpdate(
        { ticketId: ticket._id },
        {
          ticketId: ticket._id,
          queuePriority: ticket.calculatedPriority,
          status: "Assigned",
          addedToQueueAt: new Date(),
          pickedUpAt: new Date(),
          assignedModeratorId: moderator._id,
          orderValue: ticket.orderValue,
          buyerTrustLevel: ticket.buyerTrustLevel,
          sellerTrustLevel: ticket.sellerTrustLevel,
          ticketAge,
          isHighValue,
          isEscalated: ticket.escalationLevel !== "Level1_BuyerSeller",
          sellerTimeoutOccurred: ticket.sellerResponseStatus === "Timeout",
        },
        { upsert: true, new: true }
      ),

      // Update ticket
      SupportTicket.findByIdAndUpdate(ticketId, {
        status: "ModeratorAssigned",
        assignedToUserId: moderator._id,
        firstResponseAt: ticket.firstResponseAt || new Date(),
      }),

      // Add timeline
      this.addTimelineEvent(
        ticketId,
        "ModeratorAssigned",
        moderator._id.toString(),
        "SYSTEM",
        `Khiếu nại được tự động gán cho moderator: ${moderator.fullName}`
      ),
    ]);
  }

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

    if (ticket.status !== "ModeratorAssigned" && ticket.status !== "Escalated") {
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
        const orderItem = await OrderItem.findById(originalTicket.orderItemId);
        const refundAmount = input.newResolutionType === "FullRefund"
          ? orderItem?.holdAmount || 0
          : input.newRefundAmount || 0;

        // Process additional refund or adjustment
        // TODO: Handle refund adjustment logic
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

  // ===== Auto-escalation =====

  /**
   * Auto-escalate complaints with seller timeout
   */
  async autoEscalateTimeouts(): Promise<{ escalated: number; failed: number }> {
    const now = new Date();

    // Parallel: get expired tickets and moderator
    const [expiredTickets, moderator] = await Promise.all([
      SupportTicket.find({
        status: "AwaitingSeller",
        sellerResponseStatus: "Pending",
        sellerResponseDeadline: { $lt: now },
      }),
      this.findModerator(),
    ]);

    if (!moderator) {
      console.error("No moderator found for auto-escalation");
      return { escalated: 0, failed: expiredTickets.length };
    }

    let escalated = 0;
    let failed = 0;

    for (const ticket of expiredTickets) {
      try {
        const ticketAge = (Date.now() - ticket.createdAt.getTime()) / (1000 * 60 * 60);
        const isHighValue = ticket.orderValue >= COMPLAINT_CONFIG.HIGH_VALUE_THRESHOLD;

        // Parallel updates for each ticket
        await Promise.all([
          // Update ticket
          SupportTicket.findByIdAndUpdate(ticket._id, {
            status: "ModeratorAssigned",
            sellerResponseStatus: "Timeout",
            escalationLevel: "Level2_Moderator",
            escalationReason: "Người bán không phản hồi trong thời hạn",
            autoEscalatedAt: now,
            assignedToUserId: moderator._id,
            firstResponseAt: ticket.firstResponseAt || new Date(),
          }),

          // Update/Create queue entry
          ComplaintQueue.findOneAndUpdate(
            { ticketId: ticket._id },
            {
              ticketId: ticket._id,
              queuePriority: ticket.calculatedPriority,
              status: "Assigned",
              addedToQueueAt: new Date(),
              pickedUpAt: new Date(),
              assignedModeratorId: moderator._id,
              orderValue: ticket.orderValue,
              buyerTrustLevel: ticket.buyerTrustLevel,
              sellerTrustLevel: ticket.sellerTrustLevel,
              ticketAge,
              isHighValue,
              isEscalated: true,
              sellerTimeoutOccurred: true,
            },
            { upsert: true, new: true }
          ),

          // Timeline events
          this.addTimelineEvent(
            ticket._id.toString(),
            "SellerTimeout",
            "system",
            "SYSTEM",
            "Tự động leo thang do người bán không phản hồi"
          ),
          this.addTimelineEvent(
            ticket._id.toString(),
            "ModeratorAssigned",
            moderator._id.toString(),
            "SYSTEM",
            `Khiếu nại được tự động gán cho moderator: ${moderator.fullName}`
          ),
        ]);

        escalated++;
      } catch (error) {
        failed++;
      }
    }

    return { escalated, failed };
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
    userId?: string
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
    if (query.priority) filter.priority = query.priority;
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
