"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequireAuth } from "@/components/auth/RequireAuth";
import {
  ShoppingCart,
  Package,
  Wallet,
  MessageSquare,
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye,
  FileText,
} from "lucide-react";

// Mock data
const mockStats = {
  totalOrders: 24,
  activeOrders: 3,
  totalSpent: 2450000,
  walletBalance: 500000,
  pendingTickets: 2,
  reviewsGiven: 8,
};

const mockRecentOrders = [
  {
    id: "ORD-001",
    product: "Netflix Premium - Gói gia đình 3 tháng",
    amount: 299000,
    status: "paid",
    date: "2026-01-07",
    shop: "Shop ABC",
  },
  {
    id: "ORD-002",
    product: "Spotify Premium - 1 năm",
    amount: 49980,
    status: "completed",
    date: "2026-01-05",
    shop: "Shop XYZ",
  },
  {
    id: "ORD-003",
    product: "Disney+ Premium - 1 năm",
    amount: 599000,
    status: "pending_payment",
    date: "2026-01-07",
    shop: "Shop DEF",
  },
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <RequireAuth requiredRole="customer">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16 space-y-8 md:space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              Dashboard Khách hàng
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Quản lý đơn hàng, ví tiền và hỗ trợ của bạn
            </p>
          </div>
          <Button size="lg" className="h-12 md:h-14 text-base md:text-lg" asChild>
            <Link href="/products">
              <Plus className="mr-2 h-5 w-5" />
              Mua sắm
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base md:text-lg font-medium">
                Tổng đơn hàng
              </CardTitle>
              <Package className="h-6 w-6 md:h-7 md:w-7 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl md:text-4xl font-bold">
                {mockStats.totalOrders}
              </div>
              <p className="text-sm md:text-base text-muted-foreground mt-2">
                {mockStats.activeOrders} đang xử lý
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base md:text-lg font-medium">
                Tổng chi tiêu
              </CardTitle>
              <TrendingUp className="h-6 w-6 md:h-7 md:w-7 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl md:text-4xl font-bold text-green-600">
                {formatPrice(mockStats.totalSpent)}
              </div>
              <p className="text-sm md:text-base text-muted-foreground mt-2">
                Tất cả thời gian
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base md:text-lg font-medium">
                Số dư ví
              </CardTitle>
              <Wallet className="h-6 w-6 md:h-7 md:w-7 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl md:text-4xl font-bold text-blue-600">
                {formatPrice(mockStats.walletBalance)}
              </div>
              <p className="text-sm md:text-base text-muted-foreground mt-2">
                <Link
                  href="/customer/wallet"
                  className="text-primary hover:underline"
                >
                  Nạp tiền
                </Link>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base md:text-lg font-medium">
                Ticket hỗ trợ
              </CardTitle>
              <MessageSquare className="h-6 w-6 md:h-7 md:w-7 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl md:text-4xl font-bold text-orange-600">
                {mockStats.pendingTickets}
              </div>
              <p className="text-sm md:text-base text-muted-foreground mt-2">
                <Link
                  href="/customer/tickets"
                  className="text-primary hover:underline"
                >
                  Xem tất cả
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Thao tác nhanh</CardTitle>
            <CardDescription>Các chức năng thường dùng</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto py-6 flex-col" asChild>
                <Link href="/customer/cart">
                  <ShoppingCart className="h-6 w-6 mb-2" />
                  <span>Giỏ hàng</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-6 flex-col" asChild>
                <Link href="/customer/orders">
                  <Package className="h-6 w-6 mb-2" />
                  <span>Đơn hàng</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-6 flex-col" asChild>
                <Link href="/customer/wallet">
                  <Wallet className="h-6 w-6 mb-2" />
                  <span>Ví tiền</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-6 flex-col" asChild>
                <Link href="/customer/tickets/create">
                  <FileText className="h-6 w-6 mb-2" />
                  <span>Tạo ticket</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
            <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
            <TabsTrigger value="tickets">Hỗ trợ</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Đơn hàng gần đây</CardTitle>
                    <CardDescription>5 đơn hàng mới nhất của bạn</CardDescription>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href="/customer/orders">Xem tất cả</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{order.product}</p>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <span className="text-sm text-muted-foreground">
                            {order.id}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {order.date}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {order.shop}
                          </span>
                          <Badge
                            variant={
                              order.status === "completed"
                                ? "default"
                                : order.status === "paid"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {order.status === "completed"
                              ? "Hoàn tất"
                              : order.status === "paid"
                              ? "Đã thanh toán"
                              : "Chờ thanh toán"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-bold text-lg">
                          {formatPrice(order.amount)}
                        </p>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/customer/orders/${order.id}`}>
                            Xem chi tiết
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Wallet Summary */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Ví tiền</CardTitle>
                    <CardDescription>Số dư và giao dịch gần đây</CardDescription>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href="/customer/wallet">Xem chi tiết</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Số dư khả dụng</p>
                      <p className="text-2xl font-bold">
                        {formatPrice(mockStats.walletBalance)}
                      </p>
                    </div>
                    <Button asChild>
                      <Link href="/customer/wallet">Nạp tiền</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Tất cả đơn hàng</CardTitle>
                    <CardDescription>Lịch sử mua hàng của bạn</CardDescription>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href="/customer/orders">Xem tất cả</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{order.product}</p>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <span className="text-sm text-muted-foreground">
                            {order.id}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {order.date}
                          </span>
                          <Badge
                            variant={
                              order.status === "completed"
                                ? "default"
                                : order.status === "paid"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {order.status === "completed"
                              ? "Hoàn tất"
                              : order.status === "paid"
                              ? "Đã thanh toán"
                              : "Chờ thanh toán"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-bold text-lg">
                          {formatPrice(order.amount)}
                        </p>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/customer/orders/${order.id}`}>
                            Xem chi tiết
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Đánh giá của tôi</CardTitle>
                    <CardDescription>
                      {mockStats.reviewsGiven} đánh giá đã đăng
                    </CardDescription>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href="/customer/reviews">Xem tất cả</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Bạn chưa có đánh giá nào. Hãy đánh giá sản phẩm sau khi nhận
                    hàng!
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tickets Tab */}
          <TabsContent value="tickets">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Ticket hỗ trợ</CardTitle>
                    <CardDescription>
                      {mockStats.pendingTickets} ticket đang mở
                    </CardDescription>
                  </div>
                  <Button asChild>
                    <Link href="/customer/tickets/create">
                      <Plus className="mr-2 h-4 w-4" />
                      Tạo ticket mới
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Bạn chưa có ticket nào. Tạo ticket khi cần hỗ trợ!
                  </p>
                  <Button asChild>
                    <Link href="/customer/tickets/create">Tạo ticket mới</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RequireAuth>
  );
}
