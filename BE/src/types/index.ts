// Role Types
export type RoleKey = "CUSTOMER" | "SELLER" | "ADMIN" | "MODERATOR";
export type RoleStatus = "Active" | "Hidden";

// User Types
export type UserStatus = "Active" | "Locked" | "Banned";
// TrustLevel is a number (0-100), no need for type alias

// Shop Types
export type ShopStatus = "Pending" | "Active" | "Suspended" | "Closed";
export type PayoutMethod = "Bank" | "Momo" | "Vnpay" | "Zalopay";

// Product Types
export type ProductStatus = "Pending" | "Approved" | "Rejected" | "Hidden";
export type PlanType = "Personal" | "Family" | "Slot" | "Shared" | "InviteLink";

// Inventory Types
export type SecretType = "Account" | "InviteLink" | "Code" | "QR";
export type InventoryStatus = "Available" | "Reserved" | "Delivered" | "Revoked";

// Order Types
export type OrderStatus =
  | "PendingPayment"
  | "Paid"
  | "Completed"
  | "Cancelled"
  | "Disputed"
  | "Refunded";

export type OrderItemStatus =
  | "WaitingDelivery"
  | "Delivered"
  | "Completed"
  | "Disputed"
  | "Refunded";

export type HoldStatus = "Holding" | "Released" | "Refunded";
export type DeliveryMethod = "Account" | "InviteLink" | "Code" | "QR";
export type PaymentProvider = "Wallet" | "Momo" | "Vnpay" | "Zalopay";

// Wallet Types
export type WalletTxnType =
  | "Topup"
  | "Purchase"
  | "Hold"
  | "Release"
  | "Refund"
  | "Adjustment";

export type WalletTxnRefType = "Order" | "OrderItem" | "Ticket" | "System";
export type WalletTxnDirection = "In" | "Out";

// Support Ticket Types
export type TicketStatus =
  | "Open"
  | "InReview"
  | "NeedMoreInfo"
  | "Resolved"
  | "Closed";

export type ResolutionType =
  | "None"
  | "FullRefund"
  | "PartialRefund"
  | "Replace"
  | "Reject";

// Review Types
export type ReviewStatus = "Visible" | "Hidden";

// Report Types
export type ReportTargetType = "Product" | "Review" | "Shop" | "User";
export type ReportReason =
  | "Fraud"
  | "Spam"
  | "Illegal"
  | "Harassment"
  | "Other";

export type ReportStatus = "Open" | "InReview" | "Resolved" | "Rejected";
export type ReportActionType =
  | "None"
  | "HideProduct"
  | "HideReview"
  | "SuspendShop"
  | "BanUser"
  | "RejectReport";

// Conversation Types
export type ConversationType = "OrderItem" | "Shop" | "Support";
export type ConversationStatus = "Open" | "Closed" | "Blocked";

// Message Types
export type MessageType = "Text" | "System" | "Attachment";
export type AttachmentType = "Image" | "File" | "None";

// Audit Log Types
export type AuditActorRoleKey =
  | "CUSTOMER"
  | "SELLER"
  | "ADMIN"
  | "MODERATOR"
  | "SYSTEM";

export type AuditEntityType =
  | "User"
  | "Shop"
  | "Product"
  | "Order"
  | "OrderItem"
  | "Ticket"
  | "Review"
  | "Report"
  | "Wallet"
  | "InventoryItem"
  | "Conversation"
  | "Message"
  | "System";

export type AuditSeverity = "Info" | "Warn" | "Critical";

// Platform Catalog Types
export type PlatformStatus = "Active" | "Hidden";
