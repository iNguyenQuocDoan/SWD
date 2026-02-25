import { Order, OrderItem, SupportTicket, ModeratorStats } from "@/models";
import {
  DateRangeQuery,
  RevenueOverviewResponse,
  PlatformFeeResponse,
  RevenueTrendResponse,
  OrderOverviewResponse,
  OrderStatusResponse,
  OrderTrendResponse,
  PaymentMethodResponse,
  ComplaintOverviewResponse,
  ComplaintTrendResponse,
  ResolutionStatsResponse,
  SLAComplianceResponse,
  ModeratorPerformanceResponse,
  AdminDashboardResponse,
} from "@/types/report.types";

const PLATFORM_FEE_RATE = 0.05; // 5%
const ESCROW_PERIOD_HOURS = 72;
const FIRST_RESPONSE_SLA_HOURS = 4;
const RESOLUTION_SLA_HOURS = 48;

export class ReportService {
  // ============ HELPER METHODS ============

  private getDateGroupKey(granularity: "day" | "week" | "month", dateField: string = "$paidAt") {
    switch (granularity) {
      case "day":
        return {
          year: { $year: dateField },
          month: { $month: dateField },
          day: { $dayOfMonth: dateField },
        };
      case "week":
        return {
          year: { $isoWeekYear: dateField },
          week: { $isoWeek: dateField },
        };
      case "month":
        return {
          year: { $year: dateField },
          month: { $month: dateField },
        };
    }
  }

  private getStartOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private getStartOfMonth(date: Date): Date {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // ============ REVENUE REPORTS ============

  async getRevenueOverview(dateRange: DateRangeQuery): Promise<RevenueOverviewResponse> {
    const { startDate, endDate } = dateRange;

    const [releasedStats, holdingStats, refundedStats, revenueStats] = await Promise.all([
      // Released (seller received)
      OrderItem.aggregate([
        {
          $match: {
            holdStatus: "Released",
            releaseAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$holdAmount" },
          },
        },
      ]),
      // Currently holding
      OrderItem.aggregate([
        { $match: { holdStatus: "Holding" } },
        {
          $group: {
            _id: null,
            total: { $sum: "$holdAmount" },
          },
        },
      ]),
      // Refunded
      OrderItem.aggregate([
        {
          $match: {
            holdStatus: "Refunded",
            releaseAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$holdAmount" },
          },
        },
      ]),
      // Total revenue from paid orders
      Order.aggregate([
        {
          $match: {
            status: { $in: ["Paid", "Completed"] },
            paidAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$payableAmount" },
          },
        },
      ]),
    ]);

    const totalReleased = releasedStats[0]?.total || 0;
    const platformFeeCollected = Math.round(totalReleased * PLATFORM_FEE_RATE);
    const sellerPayouts = totalReleased - platformFeeCollected;

    return {
      period: { startDate, endDate },
      totalRevenue: revenueStats[0]?.total || 0,
      platformFeeCollected,
      sellerPayouts,
      pendingInEscrow: holdingStats[0]?.total || 0,
      refundedAmount: refundedStats[0]?.total || 0,
    };
  }

  async getPlatformFeeReport(dateRange: DateRangeQuery): Promise<PlatformFeeResponse> {
    const { startDate, endDate, granularity = "day" } = dateRange;

    const result = await OrderItem.aggregate([
      {
        $match: {
          holdStatus: "Released",
          releaseAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: this.getDateGroupKey(granularity, "$releaseAt"),
          totalReleased: { $sum: "$holdAmount" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          date: "$_id",
          totalReleased: 1,
          platformFee: { $round: [{ $multiply: ["$totalReleased", PLATFORM_FEE_RATE] }, 0] },
          sellerReceived: { $round: [{ $multiply: ["$totalReleased", 1 - PLATFORM_FEE_RATE] }, 0] },
          transactionCount: "$count",
        },
      },
      { $sort: { "date.year": 1, "date.month": 1, "date.day": 1 } },
    ]);

    const totals = result.reduce(
      (acc, item) => ({
        totalReleased: acc.totalReleased + item.totalReleased,
        platformFee: acc.platformFee + item.platformFee,
        transactionCount: acc.transactionCount + item.transactionCount,
      }),
      { totalReleased: 0, platformFee: 0, transactionCount: 0 }
    );

    return {
      period: { startDate, endDate },
      breakdown: result,
      totals,
    };
  }

  async getRevenueTrends(dateRange: DateRangeQuery): Promise<RevenueTrendResponse> {
    const { startDate, endDate, granularity = "day" } = dateRange;

    const result = await Order.aggregate([
      {
        $match: {
          status: { $in: ["Paid", "Completed"] },
          paidAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: this.getDateGroupKey(granularity),
          totalRevenue: { $sum: "$payableAmount" },
          totalFees: { $sum: "$feeAmount" },
          orderCount: { $sum: 1 },
          averageOrderValue: { $avg: "$payableAmount" },
        },
      },
      {
        $project: {
          date: "$_id",
          totalRevenue: 1,
          totalFees: 1,
          orderCount: 1,
          averageOrderValue: { $round: ["$averageOrderValue", 0] },
        },
      },
      { $sort: { "date.year": 1, "date.month": 1, "date.day": 1 } },
    ]);

    const summary = {
      totalRevenue: result.reduce((sum, r) => sum + r.totalRevenue, 0),
      totalOrders: result.reduce((sum, r) => sum + r.orderCount, 0),
      avgOrderValue:
        result.length > 0
          ? Math.round(result.reduce((sum, r) => sum + r.averageOrderValue, 0) / result.length)
          : 0,
    };

    return {
      period: { startDate, endDate },
      granularity,
      data: result,
      summary,
    };
  }

  // ============ ORDER REPORTS ============

  async getOrderOverview(dateRange: DateRangeQuery): Promise<OrderOverviewResponse> {
    const { startDate, endDate } = dateRange;

    const result = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalAmount: { $sum: "$payableAmount" },
          averageOrderValue: { $avg: "$payableAmount" },
        },
      },
    ]);

    return {
      period: { startDate, endDate },
      totalOrders: result[0]?.totalOrders || 0,
      totalAmount: result[0]?.totalAmount || 0,
      averageOrderValue: Math.round(result[0]?.averageOrderValue || 0),
    };
  }

  async getOrdersByStatus(dateRange: DateRangeQuery): Promise<OrderStatusResponse> {
    const { startDate, endDate } = dateRange;

    const result = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$payableAmount" },
        },
      },
    ]);

    const total = result.reduce((sum, r) => sum + r.count, 0);
    const statusMap: Record<string, { count: number; totalAmount: number }> = {
      PendingPayment: { count: 0, totalAmount: 0 },
      Paid: { count: 0, totalAmount: 0 },
      Completed: { count: 0, totalAmount: 0 },
      Cancelled: { count: 0, totalAmount: 0 },
      Disputed: { count: 0, totalAmount: 0 },
      Refunded: { count: 0, totalAmount: 0 },
    };

    result.forEach((r) => {
      statusMap[r._id] = { count: r.count, totalAmount: r.totalAmount };
    });

    const byStatus = Object.entries(statusMap).map(([status, data]) => ({
      status,
      ...data,
      percentage: total > 0 ? Math.round((data.count / total) * 100 * 100) / 100 : 0,
    }));

    return {
      period: { startDate, endDate },
      byStatus,
      total,
    };
  }

  async getOrderTrends(dateRange: DateRangeQuery): Promise<OrderTrendResponse> {
    const { startDate, endDate, granularity = "day" } = dateRange;

    const result = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: this.getDateGroupKey(granularity, "$createdAt"),
          orderCount: { $sum: 1 },
          totalAmount: { $sum: "$payableAmount" },
          averageOrderValue: { $avg: "$payableAmount" },
        },
      },
      {
        $project: {
          date: "$_id",
          orderCount: 1,
          totalAmount: 1,
          averageOrderValue: { $round: ["$averageOrderValue", 0] },
        },
      },
      { $sort: { "date.year": 1, "date.month": 1, "date.day": 1 } },
    ]);

    return {
      period: { startDate, endDate },
      granularity,
      data: result,
    };
  }

  async getPaymentMethodDistribution(dateRange: DateRangeQuery): Promise<PaymentMethodResponse> {
    const { startDate, endDate } = dateRange;

    const result = await Order.aggregate([
      {
        $match: {
          status: { $in: ["Paid", "Completed"] },
          paidAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$paymentProvider",
          count: { $sum: 1 },
          totalAmount: { $sum: "$payableAmount" },
        },
      },
      {
        $project: {
          provider: { $ifNull: ["$_id", "Unknown"] },
          count: 1,
          totalAmount: 1,
          _id: 0,
        },
      },
    ]);

    const total = result.reduce((sum, r) => sum + r.count, 0);

    return {
      period: { startDate, endDate },
      distribution: result.map((r) => ({
        ...r,
        percentage: total > 0 ? Math.round((r.count / total) * 100 * 100) / 100 : 0,
      })),
      total,
    };
  }

  // ============ COMPLAINT REPORTS ============

  async getComplaintOverview(dateRange: DateRangeQuery): Promise<ComplaintOverviewResponse> {
    const { startDate, endDate } = dateRange;

    const result = await SupportTicket.aggregate([
      {
        $match: {
          type: { $in: ["Complaint", "Dispute"] },
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $facet: {
          total: [{ $count: "count" }],
          byStatus: [
            { $group: { _id: "$status", count: { $sum: 1 } } },
          ],
          byCategory: [
            { $group: { _id: "$category", count: { $sum: 1 } } },
          ],
          avgResolutionTime: [
            {
              $match: {
                decidedAt: { $exists: true, $ne: null },
              },
            },
            {
              $project: {
                resolutionTimeMinutes: {
                  $divide: [{ $subtract: ["$decidedAt", "$createdAt"] }, 60000],
                },
              },
            },
            {
              $group: {
                _id: null,
                avgMinutes: { $avg: "$resolutionTimeMinutes" },
              },
            },
          ],
          openCount: [
            {
              $match: {
                status: { $in: ["ModeratorAssigned", "InReview", "NeedMoreInfo"] },
              },
            },
            { $count: "count" },
          ],
          resolvedCount: [
            {
              $match: {
                status: { $in: ["Resolved", "Closed"] },
              },
            },
            { $count: "count" },
          ],
        },
      },
    ]);

    const data = result[0];
    const totalComplaints = data.total[0]?.count || 0;

    return {
      period: { startDate, endDate },
      totalComplaints,
      openComplaints: data.openCount[0]?.count || 0,
      resolvedComplaints: data.resolvedCount[0]?.count || 0,
      avgResolutionTimeMinutes: Math.round(data.avgResolutionTime[0]?.avgMinutes || 0),
      byStatus: data.byStatus.map((s: any) => ({
        status: s._id || "Unknown",
        count: s.count,
        percentage: totalComplaints > 0 ? Math.round((s.count / totalComplaints) * 100 * 100) / 100 : 0,
      })),
      byCategory: data.byCategory.map((c: any) => ({
        category: c._id || "Uncategorized",
        count: c.count,
        percentage: totalComplaints > 0 ? Math.round((c.count / totalComplaints) * 100 * 100) / 100 : 0,
      })),
    };
  }

  async getComplaintTrends(dateRange: DateRangeQuery): Promise<ComplaintTrendResponse> {
    const { startDate, endDate, granularity = "day" } = dateRange;

    const result = await SupportTicket.aggregate([
      {
        $match: {
          type: { $in: ["Complaint", "Dispute"] },
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $facet: {
          created: [
            {
              $group: {
                _id: this.getDateGroupKey(granularity, "$createdAt"),
                count: { $sum: 1 },
              },
            },
          ],
          resolved: [
            {
              $match: {
                decidedAt: { $gte: startDate, $lte: endDate },
              },
            },
            {
              $group: {
                _id: this.getDateGroupKey(granularity, "$decidedAt"),
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    const createdMap = new Map(result[0].created.map((c: any) => [JSON.stringify(c._id), c.count]));
    const resolvedMap = new Map(result[0].resolved.map((r: any) => [JSON.stringify(r._id), r.count]));

    const allDates = new Set<string>([...createdMap.keys(), ...resolvedMap.keys()]);
    const data = Array.from(allDates)
      .map((dateKey: string) => ({
        date: JSON.parse(dateKey),
        newComplaints: createdMap.get(dateKey) || 0,
        resolvedComplaints: resolvedMap.get(dateKey) || 0,
      }))
      .sort((a, b) => {
        if (a.date.year !== b.date.year) return a.date.year - b.date.year;
        if (a.date.month !== b.date.month) return a.date.month - b.date.month;
        return (a.date.day || 0) - (b.date.day || 0);
      });

    return {
      period: { startDate, endDate },
      granularity,
      data,
    };
  }

  async getResolutionStats(dateRange: DateRangeQuery): Promise<ResolutionStatsResponse> {
    const { startDate, endDate } = dateRange;

    const result = await SupportTicket.aggregate([
      {
        $match: {
          type: { $in: ["Complaint", "Dispute"] },
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $facet: {
          byResolution: [
            {
              $match: { status: { $in: ["Resolved", "Closed"] } },
            },
            {
              $group: {
                _id: "$resolutionType",
                count: { $sum: 1 },
                totalRefundAmount: { $sum: { $ifNull: ["$refundAmount", 0] } },
              },
            },
          ],
          avgResolutionTime: [
            {
              $match: {
                decidedAt: { $exists: true, $ne: null },
              },
            },
            {
              $project: {
                resolutionTimeMinutes: {
                  $divide: [{ $subtract: ["$decidedAt", "$createdAt"] }, 60000],
                },
              },
            },
            {
              $group: {
                _id: null,
                avgMinutes: { $avg: "$resolutionTimeMinutes" },
                minMinutes: { $min: "$resolutionTimeMinutes" },
                maxMinutes: { $max: "$resolutionTimeMinutes" },
              },
            },
          ],
          categoryBreakdown: [
            {
              $group: {
                _id: "$category",
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    const data = result[0];

    return {
      period: { startDate, endDate },
      resolutionBreakdown: data.byResolution.map((r: any) => ({
        type: r._id || "None",
        count: r.count,
        totalRefundAmount: r.totalRefundAmount,
      })),
      resolutionTime: data.avgResolutionTime[0] || {
        avgMinutes: 0,
        minMinutes: 0,
        maxMinutes: 0,
      },
      categoryBreakdown: data.categoryBreakdown.map((c: any) => ({
        category: c._id || "Uncategorized",
        count: c.count,
      })),
    };
  }

  async getSLACompliance(dateRange: DateRangeQuery): Promise<SLAComplianceResponse> {
    const { startDate, endDate } = dateRange;

    const result = await SupportTicket.aggregate([
      {
        $match: {
          type: { $in: ["Complaint", "Dispute"] },
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $project: {
          slaBreached: 1,
          firstResponseTime: {
            $cond: {
              if: { $and: [{ $ne: ["$firstResponseAt", null] }, { $ne: ["$createdAt", null] }] },
              then: {
                $divide: [{ $subtract: ["$firstResponseAt", "$createdAt"] }, 3600000],
              },
              else: null,
            },
          },
          resolutionTime: {
            $cond: {
              if: { $and: [{ $ne: ["$decidedAt", null] }, { $ne: ["$createdAt", null] }] },
              then: {
                $divide: [{ $subtract: ["$decidedAt", "$createdAt"] }, 3600000],
              },
              else: null,
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          totalTickets: { $sum: 1 },
          slaBreachedCount: { $sum: { $cond: ["$slaBreached", 1, 0] } },
          avgFirstResponseHours: { $avg: "$firstResponseTime" },
          avgResolutionHours: { $avg: "$resolutionTime" },
          withinFirstResponseSLA: {
            $sum: {
              $cond: [
                { $and: [{ $ne: ["$firstResponseTime", null] }, { $lte: ["$firstResponseTime", FIRST_RESPONSE_SLA_HOURS] }] },
                1,
                0,
              ],
            },
          },
          withinResolutionSLA: {
            $sum: {
              $cond: [
                { $and: [{ $ne: ["$resolutionTime", null] }, { $lte: ["$resolutionTime", RESOLUTION_SLA_HOURS] }] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const stats = result[0] || {
      totalTickets: 0,
      slaBreachedCount: 0,
      avgFirstResponseHours: 0,
      avgResolutionHours: 0,
      withinFirstResponseSLA: 0,
      withinResolutionSLA: 0,
    };

    return {
      period: { startDate, endDate },
      slaTargets: {
        firstResponseHours: FIRST_RESPONSE_SLA_HOURS,
        resolutionHours: RESOLUTION_SLA_HOURS,
      },
      metrics: {
        totalTickets: stats.totalTickets,
        slaBreachedCount: stats.slaBreachedCount,
        slaComplianceRate:
          stats.totalTickets > 0
            ? Math.round((1 - stats.slaBreachedCount / stats.totalTickets) * 100 * 100) / 100
            : 100,
        avgFirstResponseHours: Math.round((stats.avgFirstResponseHours || 0) * 100) / 100,
        avgResolutionHours: Math.round((stats.avgResolutionHours || 0) * 100) / 100,
        firstResponseSLARate:
          stats.totalTickets > 0
            ? Math.round((stats.withinFirstResponseSLA / stats.totalTickets) * 100 * 100) / 100
            : 100,
        resolutionSLARate:
          stats.totalTickets > 0
            ? Math.round((stats.withinResolutionSLA / stats.totalTickets) * 100 * 100) / 100
            : 100,
      },
    };
  }

  async getModeratorPerformance(dateRange: DateRangeQuery): Promise<ModeratorPerformanceResponse> {
    const { startDate, endDate } = dateRange;

    const result = await ModeratorStats.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$moderatorUserId",
          totalAssigned: { $sum: "$ticketsAssigned" },
          totalResolved: { $sum: "$ticketsResolved" },
          totalEscalated: { $sum: "$ticketsEscalated" },
          avgResolutionTime: { $avg: "$avgResolutionTimeMinutes" },
          avgFirstResponseTime: { $avg: "$avgFirstResponseTimeMinutes" },
          fullRefunds: { $sum: "$fullRefunds" },
          partialRefunds: { $sum: "$partialRefunds" },
          rejections: { $sum: "$rejections" },
          slaBreaches: { $sum: "$slaBreaches" },
          appealsReceived: { $sum: "$appealsReceived" },
          appealsOverturned: { $sum: "$appealsOverturned" },
          avgSatisfactionScore: { $avg: "$customerSatisfactionScore" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "moderator",
        },
      },
      { $unwind: "$moderator" },
      {
        $project: {
          moderatorId: "$_id",
          moderatorName: "$moderator.fullName",
          moderatorEmail: "$moderator.email",
          totalAssigned: 1,
          totalResolved: 1,
          totalEscalated: 1,
          resolutionRate: {
            $cond: [
              { $gt: ["$totalAssigned", 0] },
              { $round: [{ $multiply: [{ $divide: ["$totalResolved", "$totalAssigned"] }, 100] }, 2] },
              0,
            ],
          },
          avgResolutionTimeMinutes: { $round: ["$avgResolutionTime", 0] },
          avgFirstResponseTimeMinutes: { $round: ["$avgFirstResponseTime", 0] },
          fullRefunds: 1,
          partialRefunds: 1,
          rejections: 1,
          slaBreaches: 1,
          slaComplianceRate: {
            $cond: [
              { $gt: ["$totalResolved", 0] },
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: [{ $subtract: ["$totalResolved", "$slaBreaches"] }, "$totalResolved"] },
                      100,
                    ],
                  },
                  2,
                ],
              },
              100,
            ],
          },
          appealOverturnRate: {
            $cond: [
              { $gt: ["$appealsReceived", 0] },
              { $round: [{ $multiply: [{ $divide: ["$appealsOverturned", "$appealsReceived"] }, 100] }, 2] },
              0,
            ],
          },
          avgSatisfactionScore: { $round: ["$avgSatisfactionScore", 2] },
        },
      },
      { $sort: { totalResolved: -1 } },
    ]);

    return {
      period: { startDate, endDate },
      moderators: result,
      summary: {
        totalModerators: result.length,
        totalTicketsAssigned: result.reduce((sum, m) => sum + m.totalAssigned, 0),
        totalTicketsResolved: result.reduce((sum, m) => sum + m.totalResolved, 0),
        avgResolutionRate:
          result.length > 0
            ? Math.round((result.reduce((sum, m) => sum + m.resolutionRate, 0) / result.length) * 100) / 100
            : 0,
      },
    };
  }

  // ============ DASHBOARD ============

  async getDashboardSummary(): Promise<AdminDashboardResponse> {
    const now = new Date();
    const startOfToday = this.getStartOfDay(now);
    const startOfWeek = this.getStartOfWeek(now);
    const startOfMonth = this.getStartOfMonth(now);
    const cutoffTime = new Date(now.getTime() - ESCROW_PERIOD_HOURS * 60 * 60 * 1000);

    const [
      todayRevenue,
      weekRevenue,
      monthRevenue,
      todayPlatformFee,
      todayOrders,
      pendingOrders,
      disputedOrders,
      openTickets,
      urgentTickets,
      slaBreachedToday,
      avgResolution,
      escrowStats,
    ] = await Promise.all([
      // Today revenue
      Order.aggregate([
        { $match: { status: { $in: ["Paid", "Completed"] }, paidAt: { $gte: startOfToday } } },
        { $group: { _id: null, total: { $sum: "$payableAmount" } } },
      ]),
      // Week revenue
      Order.aggregate([
        { $match: { status: { $in: ["Paid", "Completed"] }, paidAt: { $gte: startOfWeek } } },
        { $group: { _id: null, total: { $sum: "$payableAmount" } } },
      ]),
      // Month revenue
      Order.aggregate([
        { $match: { status: { $in: ["Paid", "Completed"] }, paidAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$payableAmount" } } },
      ]),
      // Today platform fee (from released items)
      OrderItem.aggregate([
        { $match: { holdStatus: "Released", releaseAt: { $gte: startOfToday } } },
        { $group: { _id: null, total: { $sum: "$holdAmount" } } },
      ]),
      // Today orders
      Order.countDocuments({ createdAt: { $gte: startOfToday } }),
      // Pending orders
      Order.countDocuments({ status: "PendingPayment" }),
      // Disputed orders
      Order.countDocuments({ status: "Disputed" }),
      // Open tickets
      SupportTicket.countDocuments({
        type: { $in: ["Complaint", "Dispute"] },
        status: { $in: ["ModeratorAssigned", "InReview", "NeedMoreInfo"] },
      }),
      // Urgent tickets
      SupportTicket.countDocuments({
        type: { $in: ["Complaint", "Dispute"] },
        priority: "Urgent",
        status: { $nin: ["Resolved", "Closed"] },
      }),
      // SLA breached today
      SupportTicket.countDocuments({
        type: { $in: ["Complaint", "Dispute"] },
        slaBreached: true,
        updatedAt: { $gte: startOfToday },
      }),
      // Average resolution hours
      SupportTicket.aggregate([
        {
          $match: {
            type: { $in: ["Complaint", "Dispute"] },
            decidedAt: { $exists: true, $ne: null },
          },
        },
        {
          $project: {
            resolutionHours: { $divide: [{ $subtract: ["$decidedAt", "$createdAt"] }, 3600000] },
          },
        },
        { $group: { _id: null, avg: { $avg: "$resolutionHours" } } },
      ]),
      // Escrow stats
      OrderItem.aggregate([
        { $match: { holdStatus: "Holding" } },
        {
          $facet: {
            total: [{ $group: { _id: null, amount: { $sum: "$holdAmount" }, count: { $sum: 1 } } }],
            ready: [{ $match: { holdAt: { $lte: cutoffTime } } }, { $count: "count" }],
          },
        },
      ]),
    ]);

    // Count complaints on holding items
    const holdingItemIds = await OrderItem.find({ holdStatus: "Holding" }).select("_id");
    const withComplaints = await SupportTicket.countDocuments({
      orderItemId: { $in: holdingItemIds.map((i) => i._id) },
      status: { $in: ["ModeratorAssigned", "InReview", "NeedMoreInfo"] },
    });

    const todayPlatformFeeAmount = Math.round((todayPlatformFee[0]?.total || 0) * PLATFORM_FEE_RATE);

    return {
      snapshot: { timestamp: now },
      revenue: {
        todayRevenue: todayRevenue[0]?.total || 0,
        weekRevenue: weekRevenue[0]?.total || 0,
        monthRevenue: monthRevenue[0]?.total || 0,
        platformFeeToday: todayPlatformFeeAmount,
      },
      orders: {
        todayOrders,
        pendingOrders,
        disputedOrders,
      },
      complaints: {
        openTickets,
        urgentTickets,
        avgResolutionHours: Math.round((avgResolution[0]?.avg || 0) * 100) / 100,
        slaBreachedToday,
      },
      escrow: {
        totalHolding: escrowStats[0]?.total[0]?.amount || 0,
        readyForDisbursement: escrowStats[0]?.ready[0]?.count || 0,
        withComplaints,
      },
    };
  }
}

export const reportService = new ReportService();
