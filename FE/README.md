# Frontend — Digital Marketplace

Web application xây dựng trên Next.js 16 App Router với hệ thống đa vai trò, chat thời gian thực và luồng mua sắm sản phẩm số.

## Tech Stack

| Thành phần    | Công nghệ                              |
|---------------|----------------------------------------|
| Framework     | Next.js 16.1.1, React 19.2.3           |
| Styling       | Tailwind CSS 4.1.18                    |
| UI Components | Radix UI + custom Shadcn-style         |
| State         | Zustand 5.0.9                          |
| Forms         | React Hook Form 7.70.0 + Zod 4.3.5    |
| HTTP Client   | Axios 1.13.2                           |
| Realtime      | Socket.io-client 4.8.3                 |
| Auth          | NextAuth 5.0.0-beta.30 + JWT cookie    |
| Animations    | Framer Motion 12.29.2                  |
| Icons         | Lucide React 0.562.0                   |
| Date utils    | date-fns 4.1.0                         |
| Toasts        | Sonner 2.0.7                           |
| Carousel      | Embla Carousel 8.6.0                   |
| Theme         | next-themes 0.4.6                      |

## Scripts

```bash
yarn dev     # Next.js dev server — http://localhost:3000
yarn build   # Production build
yarn start   # Chạy production build
yarn lint    # ESLint
```

## Biến môi trường

Tạo file `.env.local` ở thư mục `FE/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

> Trong development, Next.js tự động rewrite `/api/*` sang `NEXT_PUBLIC_API_URL`. Trong production không cần rewrite (xử lý ở infrastructure).

## Cấu trúc thư mục

```
app/
├── layout.tsx                         # Root layout — providers, fonts
├── page.tsx                           # Trang chủ
├── (auth)/                            # Layout auth (không có header/footer)
│   ├── login/
│   ├── register/
│   ├── forgot-password/
│   ├── reset-password/
│   └── verify-email/
├── (guest)/                           # Layout public
│   ├── products/
│   │   └── [id]/
│   ├── categories/
│   ├── sellers/
│   ├── shops/
│   │   └── [id]/
│   │       └── reviews/
├── customer/                          # Dashboard người mua
│   ├── cart/
│   ├── orders/
│   │   └── [id]/
│   ├── profile/
│   │   └── change-password/
│   ├── wallet/
│   │   └── return/                    # VNPay callback
│   ├── tickets/
│   │   └── create/
│   ├── become-seller/
│   │   └── ekyc/
│   └── seller-application-status/
├── seller/                            # Dashboard người bán
│   ├── shop/
│   │   └── edit/
│   ├── products/
│   │   └── create/
│   ├── inventory/
│   ├── orders/
│   └── register/
├── admin/                             # Admin panel
│   └── permissions/
├── moderator/                         # Công cụ moderator
│   ├── shops/
│   └── review/
└── checkout/

components/
├── animations/      # AnimatedCounter, FadeIn, StaggerContainer, StaggerItem
├── auth/            # AuthProvider, RequireAuth, RequirePermission, RoleRedirect
├── chat/            # ChatBox, ChatProvider, ChatWithShopButton,
│                    # ConversationList, MessageInput, MessageList, MessageNotification
├── ekyc/            # EkycInline
├── home/            # HeroSection, FeaturedProducts, TopProducts,
│                    # CategoryFilter, CTASection, FeaturesRow,
│                    # ProductCard, AnimatedBackground
├── layout/          # Header, Footer, ConditionalLayout,
│                    # AdminHeader, ModeratorHeader, CustomerMenuStats
├── providers/       # ThemeProvider
├── reviews/         # ProductReviews, ShopReviews, ReviewCard, ReviewList,
│                    # ReviewForm, ReviewStats, RatingStars,
│                    # WriteReviewButton, ImageUpload
├── seller/          # SellerHome
└── ui/              # Button, Card, Dialog, Badge, Avatar, Input, Select,
                     # Tabs, Table, Skeleton, Form, Label, Textarea,
                     # DropdownMenu, AlertDialog, Separator, Sonner,
                     # ThemeToggle, OptimizedImage

lib/
├── services/        # API calls (xem bảng bên dưới)
├── hooks/           # Custom hooks (xem bảng bên dưới)
├── stores/          # Zustand stores
└── auth.ts          # useAuthStore (Zustand)
```

## Services (`lib/services/`)

| File | API endpoints gọi |
|------|-------------------|
| `auth.service.ts` | POST /auth/login, /register, /register/seller, /verify-email, /resend-verification, /forgot-password, /reset-password; GET /auth/me; PUT /auth/change-password; POST /auth/refresh, /logout |
| `product.service.ts` | GET /products, /products/featured, /products/top, /products/:id, /products/shop/:shopId, /products/me/:id; POST /products; PUT /products/:id; DELETE /products/:id |
| `shop.service.ts` | POST /shops; GET /shops/me/my-shop, /shops/me/stats, /shops/:id, /shops/applications/pending; PUT /shops/:id; PATCH /shops/:id/approve, /shops/:id/reject |
| `order.service.ts` | POST /orders; GET /orders, /orders/:id, /orders/code/:code, /orders/seller/items; POST /orders/items/:id/confirm, /orders/:id/cancel; GET /users/stats |
| `payment.service.ts` | POST /payments/topup; GET /payments, /payments/:ref, /payments/wallets/balance, /payments/wallets/transactions |
| `inventory.service.ts` | GET /inventory, /inventory/stats, /inventory/product/:id/count; POST /inventory, /inventory/bulk; PUT /inventory/:id; DELETE /inventory/:id |
| `review.service.ts` | GET /reviews/product/:id, /reviews/product/:id/stats, /reviews/shop/:id, /reviews/shop/:id/stats, /reviews/shop/:id/unreplied-count, /reviews/me/my-reviews, /reviews/:id, /reviews/moderation/all; POST /reviews, /reviews/:id/reply; PUT /reviews/:id; DELETE /reviews/:id; PATCH /reviews/:id/hide, /reviews/:id/unhide |
| `chat.service.ts` | Conversations, messages, tickets — full CRUD + assign, escalate, read |
| `ticket.service.ts` | POST /tickets; GET /tickets, /tickets/:id; POST /tickets/:id/reply, /tickets/:id/close |
| `ekyc.service.ts` | POST /ekyc/upload, /ekyc/process, /ekyc/session/reset; GET /ekyc/session |
| `upload.service.ts` | POST /uploads/image |
| `permission.service.ts` | GET /permissions, /permissions/by-resource, /permissions/role/:id, /permissions/me; POST /permissions/assign; DELETE /permissions/revoke; PUT /permissions/role/:id |
| `stats.service.ts` | GET /stats |

## Hooks (`lib/hooks/`)

| Hook | Chức năng |
|------|-----------|
| `useChat.ts` | Quản lý conversations, messages, tickets, unread count |
| `useSocket.ts` | Kết nối Socket.io, xử lý events chat/review/typing |
| `useProducts.ts` | Fetch sản phẩm (useProducts, useFeaturedProducts, useTopProducts) |
| `useShop.ts` | Fetch và quản lý state của shop |
| `usePermissions.ts` | Kiểm tra quyền của người dùng hiện tại |

## State Management (`lib/stores/` + `lib/auth.ts`)

| Store | State quản lý |
|-------|---------------|
| `useAuthStore` | User info, accessToken, trạng thái đăng nhập, login/logout actions |
| `useChatStore` | Conversations list, messages, unread count, chat box visibility, loading states |

## Routing & Bảo vệ route

Middleware `middleware.ts` chặn truy cập dựa trên cookie `accessToken`:

| Route prefix | Yêu cầu |
|-------------|---------|
| `/customer/*` | Đã đăng nhập |
| `/seller/*` | Đã đăng nhập |
| `/admin/*` | Đã đăng nhập |
| `/moderator/*` | Đã đăng nhập |
| `/checkout/*` | Đã đăng nhập |
| `/login`, `/register` | Chưa đăng nhập (nếu đã đăng nhập → redirect `/`) |

Phân quyền chi tiết theo role được xử lý ở component `RequirePermission` dựa trên permission từ API.

## Providers (Root Layout)

Thứ tự wrap trong `app/layout.tsx`:

```
ThemeProvider
  └── AuthProvider
        └── RoleRedirect
              └── ConditionalLayout
                    └── {children}
                          └── Toaster (Sonner)
                                └── ChatProvider
```

- **ThemeProvider** — Dark/light mode
- **AuthProvider** — Đồng bộ session NextAuth với useAuthStore
- **RoleRedirect** — Redirect về đúng dashboard theo role
- **ConditionalLayout** — Render Header/Footer/Sidebar phù hợp với route và role
- **ChatProvider** — Khởi tạo socket connection và chat state

## Next.js Config

- **Image domains**: Cloudinary, Unsplash, placeholder services
- **Image formats**: AVIF, WebP
- **Compression**: Bật
- **Bundle optimization**: Tree-shaking cho lucide-react, date-fns, framer-motion, socket.io-client, Radix UI
- **API Rewrite** (dev only): `/api/*` → `NEXT_PUBLIC_API_URL`
