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
import {
  Shield,
  Package,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Ban,
  FileText,
  TrendingUp,
  Clock,
} from "lucide-react";

// Mock data
const mockStats = {
  pendingProducts: 15,
  approvedToday: 24,
  rejectedToday: 3,
  pendingReports: 8,
  pendingReviews: 12,
  pendingComments: 5,
  suspendedShops: 2,
  restrictedUsers: 1,
};

const mockPendingReports = [
  {
    id: "RPT-001",
    type: "Product",
    reason: "Fraud",
    target: "Netflix Premium - Gói gia đình",
    reporter: "user123",
    date: "2026-01-07",
    status: "open",
  },
  {
    id: "RPT-002",
    type: "Review",
    reason: "Spam",
    target: "Review #456",
    reporter: "user456",
    date: "2026-01-06",
    status: "in_review",
  },
];

export default function ModeratorDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Dashboard Kiểm duyệt
            </h1>
            <p className="text-sm text-muted-foreground">
              Quản lý kiểm duyệt nội dung và xử lý báo cáo
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/moderator/review">
                <Package className="mr-2 h-4 w-4" />
                Duyệt sản phẩm
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="py-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-4 pt-4">
              <CardTitle className="text-sm font-medium">
                Sản phẩm chờ duyệt
              </CardTitle>
              <Clock className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold text-orange-600">
                {mockStats.pendingProducts}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                <Link
                  href="/moderator/review"
                  className="text-primary hover:underline"
                >
                  Xem hàng đợi
                </Link>
              </p>
            </CardContent>
          </Card>

          <Card className="py-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-4 pt-4">
              <CardTitle className="text-sm font-medium">
                Đã duyệt hôm nay
              </CardTitle>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold text-green-600">
                {mockStats.approvedToday}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Sản phẩm đã phê duyệt
              </p>
            </CardContent>
          </Card>

          <Card className="py-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-4 pt-4">
              <CardTitle className="text-sm font-medium">
                Báo cáo chờ xử lý
              </CardTitle>
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold text-red-600">
                {mockStats.pendingReports}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Cần xem xét
              </p>
            </CardContent>
          </Card>

          <Card className="py-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-4 pt-4">
              <CardTitle className="text-sm font-medium">
                Đánh giá chờ duyệt
              </CardTitle>
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold">
                {mockStats.pendingReviews}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Review cần kiểm tra
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="py-4">
          <CardHeader className="px-4 pt-4 pb-3">
            <CardTitle className="text-base">Thao tác nhanh</CardTitle>
            <CardDescription className="text-xs">Các chức năng kiểm duyệt</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              <Button variant="outline" className="h-auto py-3 flex-col gap-1.5" asChild>
                <Link href="/moderator/review">
                  <Package className="h-4 w-4" />
                  <span className="text-xs">Duyệt sản phẩm</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex-col gap-1.5" asChild>
                <Link href="/moderator/reports">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-xs">Xử lý báo cáo</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex-col gap-1.5" asChild>
                <Link href="/moderator/reviews">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-xs">Kiểm duyệt review</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex-col gap-1.5" asChild>
                <Link href="/moderator/shops">
                  <Shield className="h-4 w-4" />
                  <span className="text-xs">Quản lý shop</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 h-9">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Tổng quan</TabsTrigger>
            <TabsTrigger value="reports" className="text-xs sm:text-sm">Báo cáo</TabsTrigger>
            <TabsTrigger value="reviews" className="text-xs sm:text-sm">Đánh giá</TabsTrigger>
            <TabsTrigger value="actions" className="text-xs sm:text-sm">Hành động</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Pending Reports */}
            <Card className="py-4">
              <CardHeader className="px-4 pt-4 pb-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">Báo cáo gần đây</CardTitle>
                    <CardDescription className="text-xs">
                      {mockStats.pendingReports} báo cáo cần xử lý
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/moderator/reports">Xem tất cả</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="space-y-2">
                  {mockPendingReports.map((report) => (
                    <div
                      key={report.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{report.target}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <Badge variant="outline" className="text-xs">{report.type}</Badge>
                          <Badge variant="destructive" className="text-xs">{report.reason}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {report.id}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {report.date}
                          </span>
                          <Badge
                            variant={
                              report.status === "open"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {report.status === "open"
                              ? "Mở"
                              : "Đang xem xét"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                          <Link href={`/moderator/reports/${report.id}`}>
                            <Eye className="mr-1.5 h-3.5 w-3.5" />
                            Xem chi tiết
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Today's Activity */}
            <Card className="py-4">
              <CardHeader className="px-4 pt-4 pb-3">
                <CardTitle className="text-base">Hoạt động hôm nay</CardTitle>
                <CardDescription className="text-xs">Thống kê công việc đã thực hiện</CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1.5" />
                    <p className="text-xl font-bold text-green-600">
                      {mockStats.approvedToday}
                    </p>
                    <p className="text-xs text-muted-foreground">Đã duyệt</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <XCircle className="h-6 w-6 text-red-600 mx-auto mb-1.5" />
                    <p className="text-xl font-bold text-red-600">
                      {mockStats.rejectedToday}
                    </p>
                    <p className="text-xs text-muted-foreground">Đã từ chối</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600 mx-auto mb-1.5" />
                    <p className="text-xl font-bold text-blue-600">
                      {mockStats.pendingReports}
                    </p>
                    <p className="text-xs text-muted-foreground">Báo cáo xử lý</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <Ban className="h-6 w-6 text-orange-600 mx-auto mb-1.5" />
                    <p className="text-xl font-bold text-orange-600">
                      {mockStats.suspendedShops}
                    </p>
                    <p className="text-xs text-muted-foreground">Shop đã khóa</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card className="py-4">
              <CardHeader className="px-4 pt-4 pb-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">Tất cả báo cáo</CardTitle>
                    <CardDescription className="text-xs">Quản lý và xử lý báo cáo</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/moderator/reports">Xem tất cả</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="space-y-2">
                  {mockPendingReports.map((report) => (
                    <div
                      key={report.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{report.target}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <Badge variant="outline" className="text-xs">{report.type}</Badge>
                          <Badge variant="destructive" className="text-xs">{report.reason}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {report.id}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                          <Link href={`/moderator/reports/${report.id}`}>
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
            <Card className="py-4">
              <CardHeader className="px-4 pt-4 pb-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">Kiểm duyệt đánh giá</CardTitle>
                    <CardDescription className="text-xs">
                      {mockStats.pendingReviews} đánh giá cần kiểm tra
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/moderator/reviews">Xem tất cả</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-center py-8">
                  <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Không có đánh giá nào cần kiểm duyệt.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions">
            <Card className="py-4">
              <CardHeader className="px-4 pt-4 pb-3">
                <CardTitle className="text-base">Hành động gần đây</CardTitle>
                <CardDescription className="text-xs">Lịch sử các hành động kiểm duyệt</CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-center py-8">
                  <TrendingUp className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Chưa có hành động nào được ghi nhận.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
}
