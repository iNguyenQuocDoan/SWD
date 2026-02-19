import { Response, NextFunction } from "express";
import { AuthRequest } from "@/middleware/auth";
import { sellerReportService } from "@/services/reports/seller-report.service";
import { DateRangeQuery } from "@/types/report.types";

export class SellerReportController {
  // Helper to parse date range from query params
  private parseDateRange(query: any): DateRangeQuery {
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    const startDate = query.startDate
      ? new Date(query.startDate)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // Default 30 days
    const granularity = (query.granularity as "day" | "week" | "month") || "day";

    return { startDate, endDate, granularity };
  }

  // ============ SELLER DASHBOARD ============

  getDashboard = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }
      const data = await sellerReportService.getSellerDashboard(req.user.id);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      if (error.message === "Shop not found for this user") {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  };

  // ============ SELLER REVENUE ============

  getRevenueOverview = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }
      const dateRange = this.parseDateRange(req.query);
      const data = await sellerReportService.getSellerRevenueOverview(req.user.id, dateRange);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      if (error.message === "Shop not found for this user") {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  };

  getRevenueTrends = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }
      const dateRange = this.parseDateRange(req.query);
      const data = await sellerReportService.getSellerRevenueTrends(req.user.id, dateRange);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      if (error.message === "Shop not found for this user") {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  };

  // ============ SELLER ORDERS ============

  getOrderOverview = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }
      const dateRange = this.parseDateRange(req.query);
      const data = await sellerReportService.getSellerOrderOverview(req.user.id, dateRange);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      if (error.message === "Shop not found for this user") {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  };

  getOrdersByStatus = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }
      const dateRange = this.parseDateRange(req.query);
      const data = await sellerReportService.getSellerOrderOverview(req.user.id, dateRange);
      // Return only byStatus from the overview
      res.status(200).json({
        success: true,
        data: {
          period: data.period,
          shopId: data.shopId,
          byStatus: data.byStatus,
          total: data.totalOrders,
        },
      });
    } catch (error: any) {
      if (error.message === "Shop not found for this user") {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  };

  getOrderTrends = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }
      const dateRange = this.parseDateRange(req.query);
      const data = await sellerReportService.getSellerOrderTrends(req.user.id, dateRange);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      if (error.message === "Shop not found for this user") {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  };
}

export const sellerReportController = new SellerReportController();
