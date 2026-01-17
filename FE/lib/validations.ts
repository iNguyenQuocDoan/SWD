import { z } from "zod";

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

// Customer registration schema (simple user registration)
export const registerSchema = z
  .object({
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string(),
    name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

// Seller registration schema (minimal - chỉ tên shop bắt buộc)
// Dùng khi chưa đăng nhập - tạo user + shop cùng lúc (dùng chung email)
export const registerSellerSchema = z
  .object({
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string(),
    name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
    shopName: z.string().min(2, "Tên shop phải có ít nhất 2 ký tự").max(50),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

// Create shop schema (chỉ cần tên shop - dùng khi đã đăng nhập)
export const createShopSchema = z.object({
  shopName: z.string().min(2, "Tên shop phải có ít nhất 2 ký tự").max(50),
});

export const verifyEmailSchema = z.object({
  code: z.string().length(6, "Mã xác thực phải có 6 ký tự"),
});

// Product schemas
export const createProductSchema = z.object({
  title: z
    .string()
    .min(5, "Tiêu đề phải có ít nhất 5 ký tự")
    .max(200, "Tiêu đề không được quá 200 ký tự"),
  description: z.string().min(20, "Mô tả phải có ít nhất 20 ký tự"),
  price: z.number().min(0, "Giá phải lớn hơn 0"),
  category: z.string().min(1, "Vui lòng chọn danh mục"),
  tags: z
    .array(z.string())
    .min(1, "Vui lòng thêm ít nhất 1 tag")
    .max(10, "Tối đa 10 tags"),
  deliveryType: z.enum(["license_key", "subscription", "digital_file"]),
  stockCount: z.number().min(0).optional(),
  images: z.array(z.string().url()).min(1, "Vui lòng thêm ít nhất 1 hình ảnh"),
});

export const updateProductSchema = createProductSchema.partial();

export const aiAssistSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
});

// Order schemas
export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().min(1),
      })
    )
    .min(1, "Giỏ hàng trống"),
  paymentMethod: z.string(),
});

export const confirmDeliverySchema = z.object({
  subOrderId: z.string(),
  confirmed: z.boolean(),
});

// Ticket schemas
export const createTicketSchema = z.object({
  subOrderId: z.string().optional(),
  category: z.enum([
    "invalid_key",
    "activation_fail",
    "refund_request",
    "technical",
    "other",
  ]),
  subject: z.string().min(5, "Tiêu đề phải có ít nhất 5 ký tự").max(200),
  description: z.string().min(20, "Mô tả phải có ít nhất 20 ký tự"),
});

export const replyTicketSchema = z.object({
  ticketId: z.string(),
  message: z.string().min(1, "Tin nhắn không được để trống"),
  isInternal: z.boolean().optional(),
});

// Moderation schemas
export const moderateProductSchema = z.object({
  productId: z.string(),
  action: z.enum(["approve", "reject"]),
  notes: z.string().optional(),
});

// Shop/Seller schemas
export const updateShopSchema = z.object({
  shopName: z.string().min(3, "Tên shop phải có ít nhất 3 ký tự").max(100),
  shopDescription: z
    .string()
    .max(500, "Mô tả không được quá 500 ký tự")
    .optional(),
  shopLogo: z.string().url().optional(),
});

// Search/Filter schemas
export const searchProductSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  tags: z.array(z.string()).optional(),
  sortBy: z.enum(["newest", "price_low", "price_high", "popular"]).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

// Type exports for use in components
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RegisterSellerInput = z.infer<typeof registerSellerSchema>;
export type CreateShopInput = z.infer<typeof createShopSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type AIAssistInput = z.infer<typeof aiAssistSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type ReplyTicketInput = z.infer<typeof replyTicketSchema>;
export type ModerateProductInput = z.infer<typeof moderateProductSchema>;
export type UpdateShopInput = z.infer<typeof updateShopSchema>;
export type SearchProductInput = z.infer<typeof searchProductSchema>;
