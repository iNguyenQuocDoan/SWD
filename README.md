# Digital Marketplace Platform

Nền tảng mua bán sản phẩm số — license key, subscription streaming, phần mềm — với hệ thống đa vai trò, thanh toán escrow, chat thời gian thực và xác minh người bán (eKYC).

## Tổng quan kiến trúc

```
SWD2/
├── BE/    # REST API + WebSocket server (Express 5 / TypeScript / MongoDB)
└── FE/    # Web application (Next.js 16 / React 19)
```

| Layer       | Công nghệ                                         |
|-------------|---------------------------------------------------|
| Frontend    | Next.js 16, React 19, Tailwind CSS 4              |
| Backend     | Node.js, Express 5, TypeScript                    |
| Database    | MongoDB (Mongoose 9)                              |
| Realtime    | Socket.io 4                                       |
| Auth        | JWT (cookie) + NextAuth 5                         |
| File Storage| Cloudinary                                        |
| Payment     | VNPay + Ví nội bộ (Wallet)                        |
| eKYC        | VNPT IDG                                          |
| State (FE)  | Zustand 5                                         |

## Vai trò người dùng

| Vai trò    | Quyền hạn                                                              |
|------------|------------------------------------------------------------------------|
| Customer   | Xem & mua sản phẩm, quản lý giỏ hàng/ví, đánh giá, tạo ticket hỗ trợ |
| Seller     | Tạo shop, đăng sản phẩm, quản lý kho hàng & đơn bán                   |
| Moderator  | Duyệt/từ chối shop & sản phẩm, kiểm duyệt đánh giá                    |
| Admin      | Quản lý vai trò, phân quyền, vận hành toàn hệ thống                   |

## Tính năng chính

- **Mua bán sản phẩm số** — Sản phẩm theo plan (Personal, Family, Slot, Shared, InviteLink) với thời hạn sử dụng
- **Quy trình duyệt shop & sản phẩm** — Shop và sản phẩm mới phải qua Moderator phê duyệt trước khi hoạt động
- **eKYC người bán** — Xác minh danh tính qua VNPT IDG (OCR CMND/CCCD + đối chiếu khuôn mặt)
- **Thanh toán Escrow** — Tiền giữ lại 72 giờ sau khi giao hàng, scheduler tự động giải phóng cho người bán
- **Ví nội bộ** — Nạp tiền qua VNPay, mua sắm và nhận thanh toán qua ví
- **Chat thời gian thực** — Nhắn tin người mua–người bán qua Socket.io
- **Hệ thống hỗ trợ** — Ticket, conversation và message với phân công staff
- **Đánh giá & kiểm duyệt** — Review sản phẩm có hình ảnh, người bán có thể reply, moderator ẩn/hiện
- **Quản lý kho** — Theo dõi số lượng tồn kho theo từng sản phẩm/plan
- **RBAC chi tiết** — Phân quyền theo resource, áp dụng cho từng endpoint

## Bắt đầu nhanh

### Yêu cầu

- Node.js >= 18
- MongoDB (local hoặc Atlas)
- Tài khoản Cloudinary
- Tài khoản VNPay sandbox (để test thanh toán)
- API Key VNPT IDG (để test eKYC)

### Chạy local

```bash
# Backend
cd BE
cp .env.example .env   # điền đầy đủ biến môi trường
yarn install
yarn dev               # http://localhost:3001

# Frontend (terminal mới)
cd FE
cp .env.example .env.local
yarn install
yarn dev               # http://localhost:3000
```

API Docs (Swagger): http://localhost:3001/swagger

## Tài liệu chi tiết

- [Backend README](BE/README.md) — Routes, models, env vars, business logic
- [Frontend README](FE/README.md) — Pages, components, hooks, env vars
