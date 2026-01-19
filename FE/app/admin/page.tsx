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
  Users,
  Package,
  DollarSign,
  AlertTriangle,
  Settings,
  Shield,
  TrendingUp,
  FileText,
  BarChart3,
  Cog,
  UserCheck,
  Ban,
  ShoppingBag,
  Wallet,
} from "lucide-react";

// Mock data
const mockStats = {
  totalUsers: 1250,
  totalOrders: 3456,
  totalRevenue: 125000000,
  activeTickets: 23,
  criticalAlerts: 5,
  pendingSellerApplications: 8,
  activeProducts: 456,
  totalShops: 89,
};

const mockRecentUsers = [
  {
    id: "USR-001",
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    role: "customer",
    status: "active",
    createdAt: "2026-01-07",
  },
  {
    id: "USR-002",
    name: "Trần Thị B",
    email: "tranthib@example.com",
    role: "seller",
    status: "active",
    createdAt: "2026-01-06",
  },
];

const mockPendingApplications = [
  {
    id: "APP-001",
    sellerName: "Shop ABC",
    email: "shopabc@example.com",
    submittedAt: "2026-01-07",
    status: "pending",
  },
  {
    id: "APP-002",
    sellerName: "Shop XYZ",
    email: "shopxyz@example.com",
    submittedAt: "2026-01-06",
    status: "pending",
  },
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16 space-y-8 md:space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              Dashboard Quản trị
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Quản lý toàn bộ hệ thống
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="lg" asChild>
              <Link href="/admin/settings">
                <Settings className="mr-2 h-5 w-5" />
                Cấu hình
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base md:text-lg font-medium">
                Tổng người dùng
              </CardTitle>
              <Users className="h-6 w-6 md:h-7 md:w-7 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl md:text-4xl font-bold">
                {mockStats.totalUsers.toLocaleString()}
              </div>
              <p className="text-sm md:text-base text-muted-foreground mt-2">
                <Link
                  href="/admin/users"
                  className="text-primary hover:underline"
                >
                  Quản lý người dùng
                </Link>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base md:text-lg font-medium">
                Tổng đơn hàng
              </CardTitle>
              <ShoppingBag className="h-6 w-6 md:h-7 md:w-7 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl md:text-4xl font-bold">
                {mockStats.totalOrders.toLocaleString()}
              </div>
              <p className="text-sm md:text-base text-muted-foreground mt-2">
                <Link
                  href="/admin/orders"
                  className="text-primary hover:underline"
                >
                  Xem tất cả
                </Link>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base md:text-lg font-medium">
                Tổng doanh thu
              </CardTitle>
              <DollarSign className="h-6 w-6 md:h-7 md:w-7 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl md:text-4xl font-bold text-green-600">
                {formatPrice(mockStats.totalRevenue)}
              </div>
              <p className="text-sm md:text-base text-muted-foreground mt-2">
                Tất cả thời gian
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base md:text-lg font-medium">
                Cảnh báo
              </CardTitle>
              <AlertTriangle className="h-6 w-6 md:h-7 md:w-7 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl md:text-4xl font-bold text-red-600">
                {mockStats.criticalAlerts}
              </div>
              <p className="text-sm md:text-base text-muted-foreground mt-2">
                Cần xử lý ngay
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base md:text-lg font-medium">
                Ticket hỗ trợ
              </CardTitle>
              <FileText className="h-6 w-6 md:h-7 md:w-7 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl md:text-4xl font-bold text-orange-600">
                {mockStats.activeTickets}
              </div>
              <p className="text-sm md:text-base text-muted-foreground mt-2">
                Đang mở
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base md:text-lg font-medium">
                Đơn seller chờ duyệt
              </CardTitle>
              <UserCheck className="h-6 w-6 md:h-7 md:w-7 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl md:text-4xl font-bold text-blue-600">
                {mockStats.pendingSellerApplications}
              </div>
              <p className="text-sm md:text-base text-muted-foreground mt-2">
                <Link
                  href="/admin/sellers"
                  className="text-primary hover:underline"
                >
                  Xem danh sách
                </Link>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base md:text-lg font-medium">
                Sản phẩm active
              </CardTitle>
              <Package className="h-6 w-6 md:h-7 md:w-7 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl md:text-4xl font-bold">
                {mockStats.activeProducts}
              </div>
              <p className="text-sm md:text-base text-muted-foreground mt-2">
                Đang bán
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base md:text-lg font-medium">
                Tổng shop
              </CardTitle>
              <Shield className="h-6 w-6 md:h-7 md:w-7 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl md:text-4xl font-bold">
                {mockStats.totalShops}
              </div>
              <p className="text-sm md:text-base text-muted-foreground mt-2">
                Shop hoạt động
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Thao tác nhanh</CardTitle>
            <CardDescription>Các chức năng quản trị</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Button variant="outline" className="h-auto py-6 flex-col" asChild>
                <Link href="/admin/users">
                  <Users className="h-6 w-6 mb-2" />
                  <span>Người dùng</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-6 flex-col" asChild>
                <Link href="/admin/sellers">
                  <UserCheck className="h-6 w-6 mb-2" />
                  <span>Duyệt Seller</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-6 flex-col" asChild>
                <Link href="/admin/orders">
                  <ShoppingBag className="h-6 w-6 mb-2" />
                  <span>Đơn hàng</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-6 flex-col" asChild>
                <Link href="/admin/categories">
                  <Package className="h-6 w-6 mb-2" />
                  <span>Danh mục</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-6 flex-col" asChild>
                <Link href="/admin/permissions">
                  <Shield className="h-6 w-6 mb-2" />
                  <span>Phân quyền</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-6 flex-col" asChild>
                <Link href="/admin/settings">
                  <Cog className="h-6 w-6 mb-2" />
                  <span>Cấu hình</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="users">Người dùng</TabsTrigger>
            <TabsTrigger value="applications">Đơn đăng ký</TabsTrigger>
            <TabsTrigger value="analytics">Phân tích</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Pending Applications */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Đơn đăng ký Seller chờ duyệt</CardTitle>
                    <CardDescription>
                      {mockStats.pendingSellerApplications} đơn cần xử lý
                    </CardDescription>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href="/admin/sellers">Xem tất cả</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPendingApplications.map((app) => (
                    <div
                      key={app.id}
                      className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{app.sellerName}</p>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <span className="text-sm text-muted-foreground">
                            {app.email}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {app.submittedAt}
                          </span>
                          <Badge variant="secondary">Chờ duyệt</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Ban className="mr-2 h-4 w-4" />
                          Từ chối
                        </Button>
                        <Button size="sm">
                          <UserCheck className="mr-2 h-4 w-4" />
                          Duyệt
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Users */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Người dùng mới</CardTitle>
                    <CardDescription>5 người dùng đăng ký gần đây</CardDescription>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href="/admin/users">Xem tất cả</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{user.name}</p>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <span className="text-sm text-muted-foreground">
                            {user.email}
                          </span>
                          <Badge variant="outline">{user.role}</Badge>
                          <Badge
                            variant={
                              user.status === "active" ? "default" : "secondary"
                            }
                          >
                            {user.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/users/${user.id}`}>
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

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Quản lý người dùng</CardTitle>
                    <CardDescription>
                      {mockStats.totalUsers} người dùng trong hệ thống
                    </CardDescription>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href="/admin/users">Xem tất cả</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{user.name}</p>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <span className="text-sm text-muted-foreground">
                            {user.email}
                          </span>
                          <Badge variant="outline">{user.role}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/users/${user.id}`}>
                            Quản lý
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Đơn đăng ký Seller</CardTitle>
                    <CardDescription>
                      {mockStats.pendingSellerApplications} đơn chờ duyệt
                    </CardDescription>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href="/admin/sellers">Xem tất cả</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPendingApplications.map((app) => (
                    <div
                      key={app.id}
                      className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{app.sellerName}</p>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <span className="text-sm text-muted-foreground">
                            {app.email}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {app.submittedAt}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          Từ chối
                        </Button>
                        <Button size="sm">Duyệt</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Phân tích hệ thống</CardTitle>
                <CardDescription>Thống kê và báo cáo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Tính năng phân tích đang được phát triển.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
}
