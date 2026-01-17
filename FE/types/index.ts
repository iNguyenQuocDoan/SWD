// User roles and authentication types
// Match với roles collection: roleKey = 'CUSTOMER' | 'SELLER' | 'ADMIN' | 'MODERATOR'
export type UserRole =
  | "customer"  // Maps to 'CUSTOMER'
  | "seller"    // Maps to 'SELLER'
  | "moderator" // Maps to 'MODERATOR'
  | "admin";    // Maps to 'ADMIN'

export type TrustLevel =
  | "new"
  | "basic"
  | "trusted"
  | "verified"
  | "blacklisted";

export interface User {
  id: string; // _id from users collection
  roleId: string; // Reference to roles._id (not role string)
  email: string;
  name: string; // fullName in schema
  role: UserRole; // Computed from roleId for frontend convenience
  emailVerified: boolean;
  phoneVerified?: boolean;
  trustLevel: TrustLevel; // Number in schema, mapped to enum
  status: "active" | "locked" | "banned"; // Match schema enum
  createdAt: Date;
  updatedAt: Date;
  avatar?: string; // avatarUrl in schema
  phone?: string;
  lastLoginAt?: Date;
}

export interface Customer extends User {
  role: "customer";
  orderCount: number;
  totalSpent: number;
}

export interface Seller extends User {
  role: "seller";
  shopName: string;
  shopDescription?: string;
  shopLogo?: string;
  pendingBalance: number;
  availableBalance: number;
  paidOutBalance: number;
  isActive: boolean;
}

// Product types - Match với products collection schema
export type ProductStatus =
  | "pending"    // 'Pending' in schema
  | "approved"  // 'Approved' in schema
  | "rejected"  // 'Rejected' in schema
  | "hidden";   // 'Hidden' in schema

export type PlanType = "Personal" | "Family" | "Slot" | "Shared" | "InviteLink";

export interface Product {
  id: string; // _id from products collection
  shopId: string; // Reference to shops._id (not sellerId)
  platformId: string; // Reference to platform_catalogs._id
  platform?: {
    id: string;
    platformName: string;
    logoUrl?: string;
  };
  title: string;
  description: string;
  warrantyPolicy: string; // warrantyPolicy in schema
  howToUse: string; // howToUse in schema
  planType: PlanType; // Enum: 'Personal'|'Family'|'Slot'|'Shared'|'InviteLink'
  durationDays: number; // Number of days
  price: number; // VND
  status: ProductStatus;
  approvedByUserId?: string; // Reference to users._id (MODERATOR)
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean;
  // Computed fields for frontend
  shop?: {
    id: string;
    shopName: string;
    ownerUserId: string;
  };
}

export interface AIVerdict {
  suggestedCategories: string[];
  suggestedTags: string[];
  improvedDescription: string;
  riskScore: number; // 0-100
  reasons: string[];
  flagged: boolean;
}

// Order types - Match với orders và order_items collections
export type OrderStatus =
  | "pending_payment" // 'PendingPayment' in schema
  | "paid"            // 'Paid' in schema
  | "completed"       // 'Completed' in schema
  | "cancelled"       // 'Cancelled' in schema
  | "disputed"        // 'Disputed' in schema
  | "refunded";       // 'Refunded' in schema

export type OrderItemStatus =
  | "waiting_delivery" // 'WaitingDelivery' in schema
  | "delivered"        // 'Delivered' in schema
  | "completed"        // 'Completed' in schema
  | "disputed"         // 'Disputed' in schema
  | "refunded";        // 'Refunded' in schema

export type HoldStatus = "holding" | "released" | "refunded";
export type DeliveryMethod = "Account" | "InviteLink" | "Code" | "QR";
export type PaymentProvider = "Wallet" | "Momo" | "Vnpay" | "Zalopay";

export interface Order {
  id: string; // _id from orders collection
  orderCode: string; // orderCode in schema
  customerUserId: string; // Reference to users._id
  customer?: Customer;
  totalAmount: number; // VND
  feeAmount: number; // VND - phí dịch vụ
  payableAmount: number; // VND - tổng phải trả
  status: OrderStatus;
  paymentProvider?: PaymentProvider;
  providerTxnId?: string; // Transaction ID từ payment provider
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  orderItems: OrderItem[]; // order_items collection
}

export interface OrderItem {
  id: string; // _id from order_items collection
  orderId: string; // Reference to orders._id
  shopId: string; // Reference to shops._id
  productId: string; // Reference to products._id
  inventoryItemId?: string; // Reference to inventory_items._id
  quantity: number;
  unitPrice: number; // VND
  subtotal: number; // VND
  itemStatus: OrderItemStatus;
  safeUntil: Date; // Thời hạn an toàn cho escrow
  
  // Escrow/Hold fields
  holdAmount: number; // VND - số tiền đang hold
  holdStatus: HoldStatus;
  holdAt: Date;
  releaseAt?: Date;
  
  // Delivery evidence
  deliveryMethod?: DeliveryMethod;
  deliveryContentMasked?: string; // Nội dung đã mask
  evidenceNote?: string;
  deliveredAt?: Date;
  
  createdAt: Date;
  // Computed fields for frontend
  product?: Product;
  shop?: {
    id: string;
    shopName: string;
  };
}

// Inventory Items - Match với inventory_items collection
export type SecretType = "Account" | "InviteLink" | "Code" | "QR";
export type InventoryStatus = "available" | "reserved" | "delivered" | "revoked";

export interface InventoryItem {
  id: string; // _id from inventory_items collection
  productId: string; // Reference to products._id
  secretType: SecretType;
  secretValue: string; // Giá trị thực tế (account, code, link, QR)
  status: InventoryStatus;
  reservedAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  isDeleted?: boolean;
}

// Wallet types - Match với wallets và wallet_txns collections
export type WalletTxnType = "Topup" | "Purchase" | "Hold" | "Release" | "Refund" | "Adjustment";
export type WalletTxnRefType = "Order" | "OrderItem" | "Ticket" | "System";
export type WalletTxnDirection = "In" | "Out";

export interface Wallet {
  id: string; // _id from wallets collection
  userId: string; // Reference to users._id
  balance: number; // VND - số dư hiện tại
  holdBalance: number; // VND - số tiền đang hold
  currency: string; // Default 'VND'
  updatedAt: Date;
}

export interface WalletTransaction {
  id: string; // _id from wallet_txns collection
  walletId: string; // Reference to wallets._id
  type: WalletTxnType;
  refType?: WalletTxnRefType; // Reference type
  refId?: string; // Reference ID (Order, OrderItem, Ticket, System)
  direction: WalletTxnDirection;
  amount: number; // VND
  note?: string;
  createdAt: Date;
}

// Payout types
export type PayoutStatus = "pending" | "processing" | "paid" | "failed";

export interface PayoutBatch {
  id: string;
  createdBy: string;
  createdAt: Date;
  processedAt?: Date;
  status: PayoutStatus;
  totalAmount: number;
  payouts: Payout[];
}

export interface Payout {
  id: string;
  batchId: string;
  sellerId: string;
  seller?: Seller;
  amount: number;
  status: PayoutStatus;
  createdAt: Date;
  paidAt?: Date;
  paymentMethod: string;
  reference?: string;
}

// Ticket/Support types - Match với support_tickets collection
export type TicketStatus =
  | "open"          // 'Open' in schema
  | "in_review"     // 'InReview' in schema
  | "need_more_info" // 'NeedMoreInfo' in schema
  | "resolved"      // 'Resolved' in schema
  | "closed";       // 'Closed' in schema

export type ResolutionType =
  | "none"          // 'None' in schema
  | "full_refund"   // 'FullRefund' in schema
  | "partial_refund" // 'PartialRefund' in schema
  | "replace"       // 'Replace' in schema
  | "reject";       // 'Reject' in schema

export interface SupportTicket {
  id: string; // _id from support_tickets collection
  ticketCode: string; // ticketCode in schema
  customerUserId: string; // Reference to users._id
  customer?: Customer;
  orderItemId: string; // Reference to order_items._id (not subOrderId)
  orderItem?: OrderItem;
  title: string;
  content: string; // description in schema
  status: TicketStatus;
  resolutionType: ResolutionType;
  refundAmount?: number; // VND - số tiền hoàn lại
  decidedByUserId?: string; // Reference to users._id (ADMIN/MODERATOR)
  decisionNote?: string;
  decidedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Reviews - Match với reviews collection
export interface Review {
  id: string; // _id from reviews collection
  orderItemId: string; // Reference to order_items._id
  userId: string; // Reference to users._id
  shopId: string; // Reference to shops._id
  rating: number; // 1-5
  comment: string;
  status: "visible" | "hidden"; // 'Visible' | 'Hidden' in schema
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  shop?: {
    id: string;
    shopName: string;
  };
}

// Risk/Fraud types
export type AlertType =
  | "high_value_order"
  | "high_key_failure_rate"
  | "suspicious_pattern"
  | "multiple_refunds";
export type AlertSeverity = "info" | "warning" | "critical";

export interface FraudAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  sellerId?: string;
  seller?: Seller;
  customerId?: string;
  customer?: Customer;
  orderId?: string;
  description: string;
  metadata: Record<string, any>;
  createdAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  action?: "hold_order" | "freeze_payout" | "suspend_account" | "none";
}

// Statistics types
export interface SellerStats {
  totalSales: number;
  pendingAmount: number;
  availableAmount: number;
  paidOutAmount: number;
  activeProducts: number;
  pendingProducts: number;
  orderCount: number;
}

export interface ModeratorStats {
  pendingReviews: number;
  approvedToday: number;
  rejectedToday: number;
}

export interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activeTickets: number;
  criticalAlerts: number;
}
