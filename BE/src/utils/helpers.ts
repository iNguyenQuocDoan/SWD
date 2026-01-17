import crypto from "crypto";

/**
 * Generate unique order code
 */
export const generateOrderCode = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

/**
 * Generate unique ticket code
 */
export const generateTicketCode = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `TKT-${timestamp}-${random}`;
};

/**
 * Mask sensitive information (for delivery content)
 */
export const maskSecret = (secret: string, type: string): string => {
  if (type === "Account") {
    // Mask email: user@example.com -> u***@example.com
    const [local, domain] = secret.split("@");
    if (local && domain) {
      return `${local[0]}***@${domain}`;
    }
  }
  if (type === "Code" || type === "QR") {
    // Show first 4 and last 4 characters
    if (secret.length > 8) {
      return `${secret.substring(0, 4)}***${secret.substring(secret.length - 4)}`;
    }
  }
  // For InviteLink, show domain only
  if (type === "InviteLink") {
    try {
      const url = new URL(secret);
      return `${url.origin}/***`;
    } catch {
      return "***";
    }
  }
  return "***";
};

/**
 * Calculate safe until date (default 7 days from now)
 */
export const calculateSafeUntil = (days: number = 7): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

/**
 * Format currency (VND)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};
