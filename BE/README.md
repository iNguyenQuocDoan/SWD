# Marketplace Backend API

Backend API cho hệ thống Digital Marketplace, được xây dựng với TypeScript, Express và MongoDB theo mô hình MVC với Services Layer.

## Kiến trúc

```
src/
├── config/          # Cấu hình (database, env)
├── models/          # Mongoose models (Data Layer)
├── services/        # Business logic (Service Layer)
├── controllers/    # Request handlers (Controller Layer)
├── routes/          # API routes (Routing Layer)
├── middleware/      # Custom middleware
├── types/           # TypeScript types
├── utils/           # Utility functions
└── index.ts         # Entry point
```

### Mô hình MVC + Services

- **Models**: Mongoose schemas và interfaces
- **Services**: Business logic, data manipulation
- **Controllers**: HTTP request/response handling
- **Routes**: API endpoints mapping

## Cài đặt

```bash
# Cài đặt dependencies (khuyến nghị dùng yarn)
yarn install

# Hoặc
npm install
```

## Cấu hình

1. Copy file `env.example` thành `.env`
2. Điền các thông tin cần thiết:
   - `MONGODB_URI`: Connection string MongoDB
   - `JWT_SECRET`: Secret key cho JWT
   - `JWT_REFRESH_SECRET`: Secret key cho refresh token
   - Các cấu hình khác...

## Chạy ứng dụng

```bash
# Development mode (với hot reload)
yarn dev

# Build
yarn build

# Production mode
yarn start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký user
- `POST /api/auth/register/seller` - Đăng ký seller
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Đăng xuất

### Users
- `GET /api/users/profile` - Lấy profile (auth required)
- `PUT /api/users/profile` - Cập nhật profile (auth required)
- `GET /api/users/:userId` - Lấy thông tin user (auth required)

### Shops
- `GET /api/shops/:shopId` - Lấy thông tin shop (public)
- `POST /api/shops` - Tạo shop (auth required)
- `GET /api/shops/me/my-shop` - Lấy shop của mình (auth required)
- `PUT /api/shops/:shopId` - Cập nhật shop (auth required)

### Products
- `GET /api/products` - Danh sách products (public)
- `GET /api/products/:productId` - Chi tiết product (public)
- `POST /api/products` - Tạo product (auth required)
- `GET /api/products/shop/:shopId` - Products của shop (auth required)

## Database Schema

Hệ thống sử dụng MongoDB với 16 collections theo schema đã định nghĩa.

## Technologies

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB với Mongoose
- **Authentication**: JWT
- **Validation**: Zod
- **Security**: Helmet, CORS, Rate Limiting
- **Architecture**: MVC + Services Layer

## Development

```bash
# Type checking
yarn type-check

# Linting
yarn lint
```

## Cấu trúc Services

Services layer chứa business logic:
- `BaseService`: Base class với CRUD operations
- `AuthService`: Authentication & authorization
- `UserService`: User management
- `ShopService`: Shop management
- `ProductService`: Product management

## Cấu trúc Controllers

Controllers xử lý HTTP requests/responses:
- Validate input (dùng Zod)
- Gọi services
- Format response
- Error handling
