import { BaseService } from "@/services/base.service";
import { Order, OrderItem, Product, Wallet, WalletTransaction, InventoryItem, Shop, User } from "@/models";
import type { IOrder, IOrderItem } from "@/models";
import { ShopService } from "@/services/shops/shop.service";
import { walletService } from "@/services/wallets/wallet.service";
import { AppError } from "@/middleware/errorHandler";
import mongoose from "mongoose";
import { decryptSecret } from "@/utils/helpers";


interface OrderItemInput {
  productId: string;
  quantity: number;
}

interface CreateOrderInput {
  items: OrderItemInput[];
  paymentMethod: "Wallet" | "Momo" | "Vnpay" | "Zalopay";
}

interface CreateOrderResult {
  order: IOrder;
  orderItems: IOrderItem[];
}

export class OrderService extends BaseService<IOrder> {
  constructor() {
    super(Order);
  }

  /**
   * Generate unique order code
   */
  private generateOrderCode(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  }

  /**
   * Create a new order and process payment
   */
  async createOrder(
    customerUserId: string,
    input: CreateOrderInput
  ): Promise<CreateOrderResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Validate products and calculate total
      const productIds = input.items.map((item) => item.productId);
      const products = await Product.find({
        _id: { $in: productIds },
        status: "Approved",
        isDeleted: false,
      }).session(session);

      if (products.length !== productIds.length) {
        throw new AppError("Một hoặc nhiều sản phẩm không hợp lệ hoặc đã ngừng bán", 400);
      }

      // Build product map for quick lookup
      const productMap = new Map(
        products.map((p) => [p._id.toString(), p])
      );

      // Calculate totals and check inventory availability
      let totalAmount = 0;
      const orderItemsData: any[] = [];
      const shopService = new ShopService();

      for (const item of input.items) {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new AppError(`Sản phẩm ${item.productId} không tồn tại`, 400);
        }

        // Check if enough inventory is available (by shop + platform)
        const availableInventory = await InventoryItem.countDocuments({
          shopId: product.shopId,
          platformId: product.platformId,
          status: "Available",
          isDeleted: false,
        }).session(session);

        if (availableInventory < item.quantity) {
          throw new AppError(
            `Sản phẩm "${product.title}" chỉ còn ${availableInventory} tài khoản, không đủ ${item.quantity} yêu cầu`,
            400
          );
        }

        const subtotal = product.price * item.quantity;
        totalAmount += subtotal;

        orderItemsData.push({
          productId: product._id,
          shopId: product.shopId,
          platformId: product.platformId,
          quantity: item.quantity,
          unitPrice: product.price,
          subtotal,
        });
      }

      // Calculate fee (2%)
      const feeAmount = Math.round(totalAmount * 0.02);
      const payableAmount = totalAmount + feeAmount;

      // 2. Check wallet balance (if paying with wallet)
      if (input.paymentMethod === "Wallet") {
        const wallet = await walletService.getOrCreateWallet(customerUserId);

        if (wallet.balance < payableAmount) {
          throw new AppError(
            `Số dư ví không đủ. Cần ${payableAmount.toLocaleString("vi-VN")} VND, hiện có ${wallet.balance.toLocaleString("vi-VN")} VND`,
            400
          );
        }
      }

      // 3. Create Order
      const orderCode = this.generateOrderCode();
      const [order] = await Order.create(
        [
          {
            orderCode,
            customerUserId: new mongoose.Types.ObjectId(customerUserId),
            totalAmount,
            feeAmount,
            payableAmount,
            status: input.paymentMethod === "Wallet" ? "Paid" : "PendingPayment",
            paymentProvider: input.paymentMethod,
            paidAt: input.paymentMethod === "Wallet" ? new Date() : null,
          },
        ],
        { session, ordered: true }
      );

      // 4. Create OrderItems and handle inventory
      // If payment is Wallet (immediate), deliver keys right away
      // Otherwise, reserve inventory and wait for payment
      const isImmediatePayment = input.paymentMethod === "Wallet";
      const now = new Date();
      const safeUntil = new Date();
      safeUntil.setDate(safeUntil.getDate() + 7); // 7 days warranty period

      const orderItemsToCreate = [];
      const inventoryUpdates = [];

      for (const item of orderItemsData) {
        // Get available inventory items by shop + platform
        const inventoryItems = await InventoryItem.find({
          shopId: item.shopId,
          platformId: item.platformId,
          status: "Available",
          isDeleted: false,
        })
          .limit(item.quantity)
          .session(session);

        if (inventoryItems.length < item.quantity) {
          throw new AppError(
            `Không đủ tài khoản trong kho. Cần ${item.quantity}, còn ${inventoryItems.length}`,
            400
          );
        }

        // Create one OrderItem per inventory item (for quantity > 1)
        for (let i = 0; i < item.quantity; i++) {
          const inventory = inventoryItems[i];

          orderItemsToCreate.push({
            orderId: order._id,
            shopId: item.shopId,
            productId: item.productId,
            quantity: 1,
            unitPrice: item.unitPrice,
            subtotal: item.unitPrice,
            // If paid immediately, deliver right away; otherwise wait for payment
            itemStatus: isImmediatePayment ? "Delivered" : "WaitingDelivery",
            deliveredAt: isImmediatePayment ? now : null,
            safeUntil,
            holdAmount: item.unitPrice,
            holdStatus: "Holding",
            holdAt: now,
            inventoryItemId: inventory._id, // Link to inventory
          });

          // If delivered immediately (wallet payment), increase shop total sales counter per item
          if (isImmediatePayment) {
            shopService
              .incrementSales(item.shopId.toString(), 1)
              .catch(() => undefined);
          }

          // Update inventory status based on payment
          inventoryUpdates.push({
            updateOne: {
              filter: { _id: inventory._id },
              update: {
                $set: isImmediatePayment
                  ? {
                      status: "Delivered" as const,
                      reservedAt: now,
                      deliveredAt: now,
                    }
                  : {
                      status: "Reserved" as const,
                      reservedAt: now,
                    },
              },
            },
          });
        }
      }

      // Bulk update inventory items to Reserved
      if (inventoryUpdates.length > 0) {
        await InventoryItem.bulkWrite(inventoryUpdates, { session });
      }

      // Create all order items
      const orderItems = await OrderItem.create(orderItemsToCreate, { session, ordered: true });

      // 5. Process payment (if paying with wallet)
      if (input.paymentMethod === "Wallet") {
        const wallet = await walletService.getOrCreateWallet(customerUserId);

        // Move money from balance to holdBalance (escrow)
        // This ensures money is held until delivery is confirmed
        await Wallet.findByIdAndUpdate(
          wallet._id,
          {
            $inc: { 
              balance: -payableAmount,
              holdBalance: payableAmount 
            },
            $set: { updatedAt: new Date() },
          },
          { session }
        );

        // Create wallet transaction for the hold
        await WalletTransaction.create(
          [
            {
              walletId: wallet._id,
              type: "Hold",
              refType: "Order",
              refId: order._id,
              direction: "Out",
              amount: payableAmount,
              note: `Tạm giữ tiền cho đơn hàng #${orderCode} (Escrow)`,
              createdAt: new Date(),
            },
          ],
          { session, ordered: true }
        );
      }

      await session.commitTransaction();
      session.endSession();

      return {
        order,
        orderItems,
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Get order items for a seller (by shop owner userId)
   * Includes customer info, product info and delivered credential (decrypted)
   */
  async getOrderItemsBySeller(
    sellerUserId: string,
    options: {
      limit?: number;
      skip?: number;
      status?: string;
    } = {}
  ): Promise<{
    items: any[];
    total: number;
  }> {
    // Find shop owned by this user
    const shop = await Shop.findOne({
      ownerUserId: new mongoose.Types.ObjectId(sellerUserId),
      isDeleted: false,
    });

    if (!shop) {
      return { items: [], total: 0 };
    }

    const { limit = 50, skip = 0, status } = options;

    const filter: any = {
      shopId: shop._id,
    };

    if (status) {
      filter.itemStatus = status;
    }

    const query = OrderItem.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "orderId",
        populate: {
          path: "customerUserId",
          model: User,
          select: "_id email fullName",
        },
      })
      .populate("productId")
      .populate("inventoryItemId");

    const [items, total] = await Promise.all([
      query.exec(),
      OrderItem.countDocuments(filter),
    ]);

    const mappedItems = items.map((item) => {
      const order = item.orderId as any;
      const customer = order?.customerUserId as any;
      const product = item.productId as any;
      const inventory = item.inventoryItemId as any;

      let credential: string | null = null;
      if (inventory?.secretValue) {
        try {
          credential = decryptSecret(inventory.secretValue as string);
        } catch {
          credential = null;
        }
      }

      const mapped = {
        id: item._id.toString(),
        orderCode: order?.orderCode,
        orderCreatedAt: order?.createdAt,
        customer: customer
          ? {
              id: customer._id?.toString(),
              email: customer.email,
              fullName: customer.fullName,
            }
          : null,
        product: product
          ? {
              id: product._id?.toString(),
              title: product.title,
              planType: product.planType,
              durationDays: product.durationDays,
              thumbnailUrl: product.thumbnailUrl,
            }
          : null,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
        itemStatus: item.itemStatus,
        holdStatus: item.holdStatus,
        holdAmount: item.holdAmount,
        deliveredAt: item.deliveredAt,
        createdAt: item.createdAt,
        credential,
      };
      return mapped;
    });

    return {
      items: mappedItems,
      total,
    };
  }

  /**
   * Get order by ID with items
   */
  async getOrderById(orderId: string): Promise<{
    order: IOrder;
    items: IOrderItem[];
  } | null> {
    const order = await Order.findById(orderId).populate("customerUserId");
    if (!order) {
      return null;
    }

    const items = await OrderItem.find({ orderId })
      .populate("productId")
      .populate("shopId");

    return { order, items };
  }

  /**
   * Get order by order code
   */
  async getOrderByCode(orderCode: string): Promise<{
    order: IOrder;
    items: IOrderItem[];
  } | null> {
    const order = await Order.findOne({ orderCode }).populate("customerUserId");
    if (!order) {
      return null;
    }

    const items = await OrderItem.find({ orderId: order._id })
      .populate("productId")
      .populate("shopId")
      .populate("inventoryItemId"); // Include credentials from inventory

    // Decrypt inventory secrets before returning to FE
    items.forEach((item) => {
      const inventory = item.inventoryItemId as any;

      if (item.inventoryItemId && inventory?.secretValue) {
        const encrypted = inventory.secretValue as string;
        const decrypted = decryptSecret(encrypted);
        inventory.secretValue = decrypted;
      }
    });

    return { order, items };
  }

  /**
   * Get orders by customer
   */
  async getOrdersByCustomer(
    customerUserId: string,
    options: {
      limit?: number;
      skip?: number;
      status?: string;
    } = {}
  ): Promise<IOrder[]> {
    const { limit = 20, skip = 0, status } = options;

    const filter: any = {
      customerUserId: new mongoose.Types.ObjectId(customerUserId),
    };

    if (status) {
      filter.status = status;
    }

    return Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();
  }
}

export const orderService = new OrderService();
