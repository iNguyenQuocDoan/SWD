import { Response, NextFunction } from "express";
import { AuthRequest } from "@/middleware/auth";
import { orderService } from "@/services/orders/order.service";
import { AppError } from "@/middleware/errorHandler";
import { z } from "zod";

// Validation schemas
const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Product ID is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
      })
    )
    .min(1, "At least one item is required"),
  paymentMethod: z.enum(["Wallet", "Momo", "Vnpay", "Zalopay"]).default("Wallet"),
});

export class OrderController {
  /**
   * Create a new order
   * POST /orders
   */
  createOrder = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;

      // Validate input
      const validatedData = createOrderSchema.parse(req.body);

      // Create order
      const result = await orderService.createOrder(userId, {
        items: validatedData.items,
        paymentMethod: validatedData.paymentMethod,
      });

      res.status(201).json({
        success: true,
        message: "Đặt hàng thành công",
        data: {
          order: {
            _id: result.order._id,
            orderCode: result.order.orderCode,
            totalAmount: result.order.totalAmount,
            feeAmount: result.order.feeAmount,
            payableAmount: result.order.payableAmount,
            status: result.order.status,
            paymentProvider: result.order.paymentProvider,
            paidAt: result.order.paidAt,
            createdAt: result.order.createdAt,
          },
          items: result.orderItems.map((item) => ({
            _id: item._id,
            productId: item.productId,
            shopId: item.shopId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
            itemStatus: item.itemStatus,
          })),
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return next(new AppError(error.errors[0].message, 400));
      }
      next(error);
    }
  };

  /**
   * Get order by ID
   * GET /orders/:orderId
   */
  getOrderById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { orderId } = req.params;
      const orderIdStr = Array.isArray(orderId) ? orderId[0] : orderId;
      const userId = req.user!.id;

      const result = await orderService.getOrderById(orderIdStr);

      if (!result) {
        throw new AppError("Đơn hàng không tồn tại", 404);
      }

      // Check ownership
      if (result.order.customerUserId.toString() !== userId) {
        throw new AppError("Bạn không có quyền xem đơn hàng này", 403);
      }

      res.status(200).json({
        success: true,
        data: {
          order: result.order,
          items: result.items,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get order by order code
   * GET /orders/code/:orderCode
   */
  getOrderByCode = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { orderCode } = req.params;
      const orderCodeStr = Array.isArray(orderCode) ? orderCode[0] : orderCode;
      const userId = req.user!.id;

      const result = await orderService.getOrderByCode(orderCodeStr);

      if (!result) {
        throw new AppError("Đơn hàng không tồn tại", 404);
      }

      // Check ownership - handle both populated and non-populated customerUserId
      const orderCustomerId = result.order.customerUserId?._id?.toString() || result.order.customerUserId?.toString();

      if (orderCustomerId !== userId) {
        throw new AppError("Bạn không có quyền xem đơn hàng này", 403);
      }

      res.status(200).json({
        success: true,
        data: {
          order: result.order,
          items: result.items,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get my orders
   * GET /orders
   */
  getMyOrders = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { limit, skip, status } = req.query;

      const orders = await orderService.getOrdersByCustomer(userId, {
        limit: limit ? parseInt(limit as string) : undefined,
        skip: skip ? parseInt(skip as string) : undefined,
        status: status as string | undefined,
      });

      res.status(200).json({
        success: true,
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const orderController = new OrderController();
