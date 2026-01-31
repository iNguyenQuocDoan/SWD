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

// TODO: Replace with API data from backend
const stats = {
  totalUsers: 0,
  totalOrders: 0,
  totalRevenue: 0,
  activeTickets: 0,
  criticalAlerts: 0,
  pendingSellerApplications: 0,
  activeProducts: 0,
  totalShops: 0,
};

// TODO: Fetch from API - GET /api/users?sort=createdAt&limit=5
const recentUsers: Array<{
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}> = [];

// TODO: Fetch from API - GET /api/shops/applications/pending
const pendingApplications: Array<{
  id: string;
  sellerName: string;
  email: string;
  submittedAt: string;
  status: string;
}> = [];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Dashboard Quản trị
            </h1>
            <p className="text-sm text-muted-foreground">
              Quản lý toàn bộ hệ thống
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/settings">
                <Settings className="mr-2 h-4 w-4" />
                Cấu hình
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="py-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-4 pt-4">
              <CardTitle className="text-sm font-medium">
                Tổng người dùng
              </CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold">
                {stats.totalUsers.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                <Link
                  href="/admin/users"
                  className="text-primary hover:underline"
                >
                  Quản lý người dùng
                </Link>
              </p>
            </CardContent>
          </Card>

          <Card className="py-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-4 pt-4">
              <CardTitle className="text-sm font-medium">
                Tổng đơn hàng
              </CardTitle>
              <ShoppingBag className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold">
                {stats.totalOrders.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                <Link
                  href="/admin/orders"
                  className="text-primary hover:underline"
                >
                  Xem tất cả
                </Link>
              </p>
            </CardContent>
          </Card>

          <Card className="py-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-4 pt-4">
              <CardTitle className="text-sm font-medium">
                Tổng doanh thu
              </CardTitle>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold text-green-600">
                {formatPrice(stats.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Tất cả thời gian
              </p>
            </CardContent>
          </Card>

          <Card className="py-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-4 pt-4">
              <CardTitle className="text-sm font-medium">
                Cảnh báo
              </CardTitle>
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold text-red-600">
                {stats.criticalAlerts}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Cần xử lý ngay
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="py-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-4 pt-4">
              <CardTitle className="text-sm font-medium">
                Ticket hỗ trợ
              </CardTitle>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold text-orange-600">
                {stats.activeTickets}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Đang mở
              </p>
            </CardContent>
          </Card>

          <Card className="py-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-4 pt-4">
              <CardTitle className="text-sm font-medium">
                Đơn seller chờ duyệt
              </CardTitle>
              <UserCheck className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold text-blue-600">
                {stats.pendingSellerApplications}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                <Link
                  href="/admin/sellers"
                  className="text-primary hover:underline"
                >
                  Xem danh sách
                </Link>
              </p>
            </CardContent>
          </Card>

          <Card className="py-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-4 pt-4">
              <CardTitle className="text-sm font-medium">
                Sản phẩm active
              </CardTitle>
              <Package className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold">
                {stats.activeProducts}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Đang bán
              </p>
            </CardContent>
          </Card>

          <Card className="py-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-4 pt-4">
              <CardTitle className="text-sm font-medium">
                Tổng shop
              </CardTitle>
              <Shield className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold">
                {stats.totalShops}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Shop hoạt động
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="py-4">
          <CardHeader className="px-4 pt-4 pb-3">
            <CardTitle className="text-base">Thao tác nhanh</CardTitle>
            <CardDescription className="text-xs">Các chức năng quản trị</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
              <Button variant="outline" className="h-auto py-3 flex-col gap-1.5" asChild>
                <Link href="/admin/users">
                  <Users className="h-4 w-4" />
                  <span className="text-xs">Người dùng</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex-col gap-1.5" asChild>
                <Link href="/admin/sellers">
                  <UserCheck className="h-4 w-4" />
                  <span className="text-xs">Duyệt Seller</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex-col gap-1.5" asChild>
                <Link href="/admin/orders">
                  <ShoppingBag className="h-4 w-4" />
                  <span className="text-xs">Đơn hàng</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex-col gap-1.5" asChild>
                <Link href="/admin/categories">
                  <Package className="h-4 w-4" />
                  <span className="text-xs">Danh mục</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex-col gap-1.5" asChild>
                <Link href="/admin/permissions">
                  <Shield className="h-4 w-4" />
                  <span className="text-xs">Phân quyền</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex-col gap-1.5" asChild>
                <Link href="/admin/settings">
                  <Cog className="h-4 w-4" />
                  <span className="text-xs">Cấu hình</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 h-9">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Tổng quan</TabsTrigger>
            <TabsTrigger value="users" className="text-xs sm:text-sm">Người dùng</TabsTrigger>
            <TabsTrigger value="applications" className="text-xs sm:text-sm">Đơn đăng ký</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm">Phân tích</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Pending Applications */}
            <Card className="py-4">
              <CardHeader className="px-4 pt-4 pb-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">Đơn đăng ký Seller chờ duyệt</CardTitle>
                    <CardDescription className="text-xs">
                      {stats.pendingSellerApplications} đơn cần xử lý
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/sellers">Xem tất cả</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="space-y-2">
                  {pendingApplications.map((app) => (
                    <div
                      key={app.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{app.sellerName}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-xs text-muted-foreground truncate">
                            {app.email}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {app.submittedAt}
                          </span>
                          <Badge variant="secondary" className="text-xs">Chờ duyệt</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button variant="outline" size="sm" className="h-8 text-xs">
                          <Ban className="mr-1.5 h-3.5 w-3.5" />
                          Từ chối
                        </Button>
                        <Button size="sm" className="h-8 text-xs">
                          <UserCheck className="mr-1.5 h-3.5 w-3.5" />
                          Duyệt
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Users */}
            <Card className="py-4">
              <CardHeader className="px-4 pt-4 pb-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">Người dùng mới</CardTitle>
                    <CardDescription className="text-xs">5 người dùng đăng ký gần đây</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/users">Xem tất cả</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="space-y-2">
                  {recentUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{user.name}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </span>
                          <Badge variant="outline" className="text-xs">{user.role}</Badge>
                          <Badge
                            variant={
                              user.status === "active" ? "default" : "secondary"
                            }
                            className="text-xs"
                          >
                            {user.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
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
            <Card className="py-4">
              <CardHeader className="px-4 pt-4 pb-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">Quản lý người dùng</CardTitle>
                    <CardDescription className="text-xs">
                      {stats.totalUsers} người dùng trong hệ thống
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/users">Xem tất cả</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="space-y-2">
                  {recentUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{user.name}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </span>
                          <Badge variant="outline" className="text-xs">{user.role}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
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
            <Card className="py-4">
              <CardHeader className="px-4 pt-4 pb-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">Đơn đăng ký Seller</CardTitle>
                    <CardDescription className="text-xs">
                      {stats.pendingSellerApplications} đơn chờ duyệt
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/sellers">Xem tất cả</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="space-y-2">
                  {pendingApplications.map((app) => (
                    <div
                      key={app.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{app.sellerName}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-xs text-muted-foreground truncate">
                            {app.email}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {app.submittedAt}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button variant="outline" size="sm" className="h-8 text-xs">
                          Từ chối
                        </Button>
                        <Button size="sm" className="h-8 text-xs">Duyệt</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card className="py-4">
              <CardHeader className="px-4 pt-4 pb-3">
                <CardTitle className="text-base">Phân tích hệ thống</CardTitle>
                <CardDescription className="text-xs">Thống kê và báo cáo</CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-center py-8">
                  <BarChart3 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
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
