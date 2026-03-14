# Backend — Digital Marketplace API

REST API và WebSocket server xây dựng trên Express 5 + TypeScript, sử dụng MongoDB.

## Tech Stack

| Thành phần   | Công nghệ                                      |
|--------------|------------------------------------------------|
| Framework    | Express 5.2.1                                  |
| Runtime      | Node.js + TypeScript 5.7.2                     |
| Database     | MongoDB + Mongoose 9.1.4                       |
| Realtime     | Socket.io 4.8.3                                |
| Auth         | JWT (jsonwebtoken 9.0.2) + bcryptjs 2.4.3      |
| Validation   | Zod 3.24.1 + express-validator 7.2.0           |
| File Upload  | Multer 2.0.2 + Cloudinary 2.9.0                |
| Payment      | VNPay (vnpay SDK)                              |
| eKYC         | VNPT IDG API                                   |
| Security     | Helmet 8.1.0, CORS, express-rate-limit 7.4.1   |
| Docs         | Swagger UI Express 5.0.1                       |

## Scripts

```bash
yarn dev          # tsx watch — phát triển
yarn dev:nodemon  # nodemon watch — phát triển (thay thế)
yarn build        # tsc + tsc-alias → dist/
yarn start        # node dist/index.js — production
yarn lint         # ESLint
yarn type-check   # TypeScript check (no emit)
```

## Biến môi trường

Tạo file `.env` ở thư mục `BE/` với các biến sau:

```env
# === BẮT BUỘC ===

MONGODB_URI=mongodb+srv://...

JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

VNPAY_TMN_CODE=
VNPAY_SECRET_KEY=

EKYC_ACCESS_TOKEN=
EKYC_TOKEN_ID=
EKYC_TOKEN_KEY=

# === TÙY CHỌN (có giá trị mặc định) ===

PORT=3001
NODE_ENV=development

JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

CORS_ORIGIN=http://localhost:3000
BACKEND_URL=http://localhost:3001

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=${BACKEND_URL}/api/payments/vnpay/return
VNPAY_IPN_URL=

EKYC_BASE_URL=https://api.idg.vnpt.vn
EKYC_MAC_ADDRESS=TEST1
```

## Cấu trúc thư mục

```
src/
├── index.ts                  # Entry point — Express, Socket.io, DB, Scheduler
├── config/
│   ├── database.ts           # MongoDB connection (có caching)
│   ├── env.ts                # Validate env vars bằng Zod
│   ├── socket.ts             # Socket.io khởi tạo
│   └── cloudinary.ts         # Cloudinary config
├── routes/                   # Định nghĩa route (map sang services)
│   ├── auth/
│   ├── users/
│   ├── shops/
│   ├── products/
│   ├── orders/
│   ├── payments/
│   ├── reviews/
│   ├── inventory/
│   ├── uploads/
│   ├── support/
│   ├── ekyc/
│   ├── complaints/
│   ├── stats/
│   ├── roles/
│   └── permissions/
├── services/                 # Business logic
├── models/                   # Mongoose schemas
├── middleware/
│   ├── auth.ts               # authenticate, authorize
│   ├── permission.ts         # checkPermission, checkAllPermissions
│   ├── errorHandler.ts       # AppError + global error handler
│   └── rateLimiter.ts        # apiLimiter, authLimiter
└── utils/
    └── helpers.ts
```

## API Routes

Server chạy trên port `3001`. Swagger docs tại `/swagger` (chỉ khi không phải serverless).

### Auth — `/api/auth`

| Method | Path | Mô tả | Auth |
|--------|------|--------|------|
| POST | `/register` | Đăng ký tài khoản customer | Public |
| POST | `/register/seller` | Đăng ký tài khoản seller | Public |
| POST | `/login` | Đăng nhập | Public |
| POST | `/refresh` | Refresh token | Public |
| POST | `/logout` | Đăng xuất | Public |
| GET | `/me` | Thông tin người dùng hiện tại | JWT |
| PUT | `/change-password` | Đổi mật khẩu | JWT |

### Users — `/api/users`

| Method | Path | Permission |
|--------|------|------------|
| GET | `/profile` | PROFILE_VIEW |
| PUT | `/profile` | PROFILE_UPDATE |
| GET | `/profile/stats` | PROFILE_VIEW |
| GET | `/:userId` | USER_VIEW |

### Shops — `/api/shops`

| Method | Path | Mô tả | Auth |
|--------|------|--------|------|
| POST | `/` | Tạo shop mới | SHOP_CREATE |
| GET | `/me/my-shop` | Xem shop của mình | SHOP_VIEW_OWN |
| GET | `/me/stats` | Thống kê shop | SHOP_ANALYTICS_VIEW |
| PUT | `/:shopId` | Cập nhật shop | SHOP_UPDATE |
| GET | `/:shopId` | Xem shop bất kỳ | Public |
| GET | `/applications/pending` | Danh sách shop chờ duyệt | SELLER_VIEW_APPLICATIONS |
| PATCH | `/:shopId/approve` | Duyệt shop | SELLER_APPROVE |
| PATCH | `/:shopId/reject` | Từ chối shop | SELLER_REJECT |

### Products — `/api/products`

| Method | Path | Mô tả | Auth |
|--------|------|--------|------|
| GET | `/` | Danh sách sản phẩm | Public |
| GET | `/featured` | Sản phẩm nổi bật | Public |
| GET | `/top` | Top sản phẩm | Public |
| GET | `/:productId` | Chi tiết sản phẩm | Public |
| POST | `/` | Tạo sản phẩm | PRODUCT_CREATE |
| GET | `/shop/:shopId` | Sản phẩm theo shop | PRODUCT_VIEW_OWN |
| GET | `/me/:productId` | Sản phẩm của mình | PRODUCT_VIEW_OWN |
| PUT | `/:productId` | Cập nhật sản phẩm | PRODUCT_UPDATE |
| DELETE | `/:productId` | Xóa sản phẩm | PRODUCT_DELETE |

### Orders — `/api/orders`

| Method | Path | Mô tả |
|--------|------|--------|
| POST | `/` | Tạo đơn hàng |
| GET | `/` | Đơn hàng của customer |
| GET | `/seller/items` | Đơn bán của seller |
| GET | `/code/:orderCode` | Tìm theo mã đơn |
| GET | `/:orderId` | Chi tiết đơn hàng |
| POST | `/items/:itemId/confirm` | Xác nhận đã nhận hàng |

### Payments — `/api/payments`

| Method | Path | Mô tả | Auth |
|--------|------|--------|------|
| POST | `/topup` | Nạp tiền qua VNPay | JWT |
| GET | `/vnpay/return` | Callback VNPay return | Public |
| POST | `/vnpay/ipn` | Callback VNPay IPN | Public |
| GET | `/wallets/balance` | Số dư ví | JWT |
| GET | `/wallets/transactions` | Lịch sử giao dịch ví | JWT |
| GET | `/` | Lịch sử thanh toán | JWT |
| GET | `/:transactionRef` | Chi tiết giao dịch | JWT |

### Reviews — `/api/reviews`

| Method | Path | Mô tả | Auth |
|--------|------|--------|------|
| GET | `/product/:productId` | Đánh giá theo sản phẩm | Public |
| GET | `/product/:productId/stats` | Thống kê đánh giá | Public |
| GET | `/shop/:shopId` | Đánh giá theo shop | Public |
| GET | `/shop/:shopId/stats` | Thống kê đánh giá shop | Public |
| GET | `/:reviewId` | Chi tiết đánh giá | Public |
| POST | `/` | Tạo đánh giá | REVIEW_CREATE |
| GET | `/me/my-reviews` | Đánh giá của mình | REVIEW_VIEW |
| PUT | `/:reviewId` | Cập nhật đánh giá | REVIEW_UPDATE |
| DELETE | `/:reviewId` | Xóa đánh giá | REVIEW_DELETE |
| POST | `/:reviewId/reply` | Người bán reply | REVIEW_REPLY |
| GET | `/moderation/all` | Tất cả đánh giá (mod) | REVIEW_MODERATE |
| PATCH | `/:reviewId/hide` | Ẩn đánh giá | REVIEW_HIDE |
| PATCH | `/:reviewId/unhide` | Hiện đánh giá | REVIEW_HIDE |

### Inventory — `/api/inventory`

| Method | Path | Mô tả | Auth |
|--------|------|--------|------|
| GET | `/product/:productId/count` | Số lượng tồn kho | Public |
| GET | `/` | Danh sách kho | INVENTORY_VIEW |
| GET | `/stats` | Thống kê kho | INVENTORY_VIEW |
| POST | `/` | Thêm 1 item | INVENTORY_ADD |
| POST | `/bulk` | Thêm nhiều items | INVENTORY_ADD |
| PUT | `/:itemId` | Cập nhật item | INVENTORY_UPDATE |
| DELETE | `/:itemId` | Xóa item | INVENTORY_DELETE |

### Support — `/api/support`

**Conversations** (`/api/support/conversations`):

| Method | Path | Permission |
|--------|------|------------|
| POST | `/` | CONVERSATION_CREATE |
| GET | `/` | CONVERSATION_VIEW |
| GET | `/unread-count` | CONVERSATION_VIEW |
| GET | `/:id` | CONVERSATION_VIEW |
| POST | `/:id/read` | CONVERSATION_VIEW |
| PATCH | `/:id/status` | CONVERSATION_MESSAGE |
| POST | `/:id/assign` | TICKET_ASSIGN |

**Messages** (`/api/support/messages`):

| Method | Path | Permission |
|--------|------|------------|
| POST | `/` | CONVERSATION_MESSAGE |
| GET | `/:conversationId` | CONVERSATION_VIEW |
| GET | `/search` | CONVERSATION_VIEW |
| POST | `/read` | CONVERSATION_VIEW |
| DELETE | `/:id` | CONVERSATION_MESSAGE |

**Tickets** (`/api/support/tickets`):

| Method | Path | Permission |
|--------|------|------------|
| POST | `/` | TICKET_CREATE |
| GET | `/` | TICKET_VIEW |
| GET | `/stats` | TICKET_VIEW |
| GET | `/:id` | TICKET_VIEW |
| PATCH | `/:id` | TICKET_UPDATE |
| POST | `/:id/assign` | TICKET_ASSIGN |
| POST | `/:id/escalate` | TICKET_ESCALATE |

### Complaints — `/api/complaints`

| Method | Path | Permission |
|--------|------|------------|
| POST | `/` | TICKET_CREATE |
| GET | `/me` | TICKET_VIEW |
| GET | `/check/:orderItemId` | TICKET_VIEW |
| GET | `/:id` | REFUND_VIEW_ALL |
| GET | `/` | REFUND_VIEW_ALL |
| PUT | `/:id/resolve` | REFUND_APPROVE |
| PUT | `/:id/status` | REFUND_APPROVE |
| POST | `/admin/trigger-disbursement` | ORDER_MANAGE |
| GET | `/admin/scheduler-status` | SYSTEM_MONITOR |

### eKYC — `/api/ekyc` (JWT required)

| Method | Path | Mô tả |
|--------|------|--------|
| POST | `/upload` | Upload ảnh CMND/CCCD/Selfie |
| POST | `/process` | Xử lý KYC |
| GET | `/session` | Xem trạng thái KYC |
| POST | `/session/reset` | Reset phiên KYC |

### Khác

| Route | Mô tả |
|-------|--------|
| GET `/api/stats` | Thống kê tổng quan (Public) |
| POST `/api/uploads/image` | Upload ảnh lên Cloudinary (JWT, multipart, 5MB) |
| GET `/api/roles` | Danh sách vai trò |
| GET `/api/permissions` | Quản lý phân quyền |
| GET `/health` | Health check |

## Models

| Model | Mô tả |
|-------|--------|
| `User` | Tài khoản người dùng (email, passwordHash, role, status, trustLevel) |
| `Role` | Vai trò (roleKey, roleName, permissions[]) |
| `Shop` | Shop người bán (status: Pending/Active/Suspended/Closed, ratingAvg, responseRate) |
| `Product` | Sản phẩm số (planType, durationDays, price VND, status: Pending/Approved/Rejected/Hidden) |
| `PlatformCatalog` | Danh mục nền tảng (Netflix, Spotify, ...) |
| `InventoryItem` | Item kho (secretType: Account/InviteLink/Code/QR, secretValue, status) |
| `Order` | Đơn hàng (orderCode, totalAmount, status: PendingPayment/Paid/Completed/...) |
| `OrderItem` | Chi tiết đơn (holdAmount, holdStatus: Holding/Released/Refunded, safeUntil) |
| `Wallet` | Ví (balance, holdBalance, currency: VND) |
| `WalletTransaction` | Giao dịch ví (type: Topup/Purchase/Hold/Release/Refund, direction: In/Out) |
| `Payment` | Thanh toán VNPay (transactionRef, vnpTxnRef, status) |
| `Review` | Đánh giá (rating 1-5, comment, images[], status: Visible/Hidden, sellerReply) |
| `Report` | Báo cáo vi phạm (targetType: Product/Review/Shop/User) |
| `SupportTicket` | Ticket hỗ trợ (priority: Low/Medium/High/Urgent, status: Open/InReview/.../Closed) |
| `Conversation` | Cuộc trò chuyện (type: OrderItem/Shop/Support) |
| `Message` | Tin nhắn (messageType: Text/System/Attachment, attachments[], isInternal) |
| `KycSession` | Phiên eKYC (status: PENDING/VERIFIED/RETRY_REQUIRED, vendor: VNPT_IDG) |
| `AuditLog` | Audit trail (action, entityType, before/after, severity: Info/Warn/Critical) |

## Business Logic quan trọng

**Escrow Payments:**
Khi đơn hàng được thanh toán, tiền được giữ (hold) trong ví của hệ thống. Sau 72 giờ kể từ khi giao hàng (field `safeUntil`), scheduler tự động chạy và giải phóng tiền vào ví người bán. Người mua có thể mở khiếu nại trong thời gian này để tạm dừng giải phóng.

**Quy trình duyệt shop:**
`Pending` → Moderator duyệt → `Active` hoặc `Suspended`

**Quy trình duyệt sản phẩm:**
`Pending` → Moderator duyệt → `Approved` hoặc `Rejected`

**eKYC:**
Người bán upload ảnh mặt trước/sau CMND và ảnh selfie. Hệ thống gọi VNPT IDG API để OCR và đối chiếu khuôn mặt. Sau khi `VERIFIED` mới được kích hoạt shop.

**RBAC:**
Mỗi endpoint được bảo vệ bằng `checkPermission(PERMISSION_KEY)`. Permission được gán cho Role và lưu trong database, có thể thay đổi động qua Admin.
