import { Router } from "express";
import { complaintController } from "@/controllers/complaints/complaint.controller";
import { schedulerService } from "@/services/scheduler/scheduler.service";
import { authenticate, checkPermission } from "@/middleware";
import { wrapRequestHandler } from "@/utils/handlers";
import { PERMISSIONS } from "@/constants/permissions";
import { AuthRequest } from "@/middleware/auth";

const router = Router();

// All routes require authentication
router.use(authenticate);

// ===== Static routes first (before parameterized routes) =====

// Admin: Manually trigger disbursement processing
router.post(
  "/admin/trigger-disbursement",
  checkPermission(PERMISSIONS.ORDER_MANAGE),
  wrapRequestHandler(async (_req: AuthRequest, res) => {
    const result = await schedulerService.triggerDisbursement();
    res.status(200).json({
      success: true,
      message: "Disbursement triggered",
      data: result,
    });
  })
);

// Admin: Get scheduler status
router.get(
  "/admin/scheduler-status",
  checkPermission(PERMISSIONS.SYSTEM_MONITOR),
  wrapRequestHandler(async (_req: AuthRequest, res) => {
    const status = schedulerService.getStatus();
    res.status(200).json({
      success: true,
      data: status,
    });
  })
);

// Get my complaints (customer)
router.get(
  "/me",
  checkPermission(PERMISSIONS.TICKET_VIEW),
  wrapRequestHandler(complaintController.getMyComplaints)
);

// Check if can file complaint for an order item
router.get(
  "/check/:orderItemId",
  checkPermission(PERMISSIONS.TICKET_VIEW),
  wrapRequestHandler(complaintController.checkCanFileComplaint)
);

// ===== Root routes =====

// Create complaint (customer)
router.post(
  "/",
  checkPermission(PERMISSIONS.TICKET_CREATE),
  wrapRequestHandler(complaintController.createComplaint)
);

// Get all complaints (admin/moderator)
router.get(
  "/",
  checkPermission(PERMISSIONS.REFUND_VIEW_ALL),
  wrapRequestHandler(complaintController.getAllComplaints)
);

// ===== Parameterized routes last =====

// Get complaint by ID (customer can view own, admin/mod can view all)
router.get(
  "/:id",
  checkPermission(PERMISSIONS.TICKET_VIEW),
  wrapRequestHandler(complaintController.getComplaintById)
);

// Resolve complaint (admin/moderator)
router.put(
  "/:id/resolve",
  checkPermission(PERMISSIONS.REFUND_APPROVE),
  wrapRequestHandler(complaintController.resolveComplaint)
);

// Update ticket status (admin/moderator)
router.put(
  "/:id/status",
  checkPermission(PERMISSIONS.REFUND_APPROVE),
  wrapRequestHandler(complaintController.updateTicketStatus)
);

export default router;
