import { Response, NextFunction } from "express";
import { complaintService } from "@/services/complaints/complaint.service";
import { AppError } from "@/middleware/errorHandler";
import { AuthRequest } from "@/middleware/auth";

export class ComplaintController {
  /**
   * Create a new complaint
   * POST /api/complaints
   */
  createComplaint = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("Unauthorized", 401);
      }

      const { orderItemId, title, content } = req.body;

      if (!orderItemId || !title || !content) {
        throw new AppError("Vui lòng điền đầy đủ thông tin", 400);
      }

      const ticket = await complaintService.createComplaint(userId, {
        orderItemId,
        title,
        content,
      });

      res.status(201).json({
        success: true,
        message: "Tạo khiếu nại thành công",
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get my complaints
   * GET /api/complaints/me
   */
  getMyComplaints = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("Unauthorized", 401);
      }

      const { limit = 20, skip = 0, status } = req.query;

      const tickets = await complaintService.getMyComplaints(userId, {
        limit: Number(limit),
        skip: Number(skip),
        status: status as string,
      });

      res.status(200).json({
        success: true,
        data: tickets,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get complaint by ID
   * GET /api/complaints/:id
   */
  getComplaintById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      // If user is admin/moderator, they can view any complaint
      const isAdmin = req.user?.roleKey === "ADMIN" || req.user?.roleKey === "MODERATOR";

      const ticketId = Array.isArray(id) ? id[0] : id;
      const ticket = await complaintService.getComplaintById(
        ticketId,
        isAdmin ? undefined : userId
      );

      if (!ticket) {
        throw new AppError("Khiếu nại không tồn tại", 404);
      }

      res.status(200).json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all complaints (admin/moderator)
   * GET /api/complaints
   */
  getAllComplaints = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { limit = 20, skip = 0, status } = req.query;

      const { tickets, total } = await complaintService.getAllComplaints({
        limit: Number(limit),
        skip: Number(skip),
        status: status as string,
      });

      res.status(200).json({
        success: true,
        data: tickets,
        pagination: {
          total,
          limit: Number(limit),
          skip: Number(skip),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Resolve complaint (admin/moderator)
   * PUT /api/complaints/:id/resolve
   */
  resolveComplaint = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("Unauthorized", 401);
      }

      const { id } = req.params;
      const ticketId = Array.isArray(id) ? id[0] : id;
      const { resolutionType, decisionNote, refundAmount } = req.body;

      if (!resolutionType || !decisionNote) {
        throw new AppError("Vui lòng điền đầy đủ thông tin xử lý", 400);
      }

      const ticket = await complaintService.resolveComplaint(ticketId, userId, {
        resolutionType,
        decisionNote,
        refundAmount,
      });

      res.status(200).json({
        success: true,
        message: "Đã xử lý khiếu nại thành công",
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update ticket status (admin/moderator)
   * PUT /api/complaints/:id/status
   */
  updateTicketStatus = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const ticketId = Array.isArray(id) ? id[0] : id;
      const { status } = req.body;

      if (!status || !["InReview", "NeedMoreInfo"].includes(status)) {
        throw new AppError("Trạng thái không hợp lệ", 400);
      }

      const ticket = await complaintService.updateTicketStatus(ticketId, status);

      res.status(200).json({
        success: true,
        message: "Cập nhật trạng thái thành công",
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Check if can file complaint for an order item
   * GET /api/complaints/check/:orderItemId
   */
  checkCanFileComplaint = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { orderItemId } = req.params;
      const itemId = Array.isArray(orderItemId) ? orderItemId[0] : orderItemId;

      const result = await complaintService.canFileComplaint(itemId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const complaintController = new ComplaintController();
