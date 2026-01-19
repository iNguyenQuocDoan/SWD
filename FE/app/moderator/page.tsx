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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16 space-y-8 md:space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              Dashboard Kiểm duyệt
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Quản lý kiểm duyệt nội dung và xử lý báo cáo
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="lg" asChild>
              <Link href="/moderator/review">
                <Package className="mr-2 h-5 w-5" />
                Duyệt sản phẩm
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base md:text-lg font-medium">
                Sản phẩm chờ duyệt
              </CardTitle>
              <Clock className="h-6 w-6 md:h-7 md:w-7 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl md:text-4xl font-bold text-orange-600">
                {mockStats.pendingProducts}
              </div>
              <p className="text-sm md:text-base text-muted-foreground mt-2">
                <Link
                  href="/moderator/review"
                  className="text-primary hover:underline"
                >
                  Xem hàng đợi
                </Link>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base md:text-lg font-medium">
                Đã duyệt hôm nay
              </CardTitle>
              <CheckCircle className="h-6 w-6 md:h-7 md:w-7 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl md:text-4xl font-bold text-green-600">
                {mockStats.approvedToday}
              </div>
              <p className="text-sm md:text-base text-muted-foreground mt-2">
                Sản phẩm đã phê duyệt
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base md:text-lg font-medium">
                Báo cáo chờ xử lý
              </CardTitle>
              <AlertTriangle className="h-6 w-6 md:h-7 md:w-7 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl md:text-4xl font-bold text-red-600">
                {mockStats.pendingReports}
              </div>
              <p className="text-sm md:text-base text-muted-foreground mt-2">
                Cần xem xét
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base md:text-lg font-medium">
                Đánh giá chờ duyệt
              </CardTitle>
              <MessageSquare className="h-6 w-6 md:h-7 md:w-7 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl md:text-4xl font-bold">
                {mockStats.pendingReviews}
              </div>
              <p className="text-sm md:text-base text-muted-foreground mt-2">
                Review cần kiểm tra
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Thao tác nhanh</CardTitle>
            <CardDescription>Các chức năng kiểm duyệt</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto py-6 flex-col" asChild>
                <Link href="/moderator/review">
                  <Package className="h-6 w-6 mb-2" />
                  <span>Duyệt sản phẩm</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-6 flex-col" asChild>
                <Link href="/moderator/reports">
                  <AlertTriangle className="h-6 w-6 mb-2" />
                  <span>Xử lý báo cáo</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-6 flex-col" asChild>
                <Link href="/moderator/reviews">
                  <MessageSquare className="h-6 w-6 mb-2" />
                  <span>Kiểm duyệt review</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-6 flex-col" asChild>
                <Link href="/moderator/shops">
                  <Shield className="h-6 w-6 mb-2" />
                  <span>Quản lý shop</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="reports">Báo cáo</TabsTrigger>
            <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
            <TabsTrigger value="actions">Hành động</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Pending Reports */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Báo cáo gần đây</CardTitle>
                    <CardDescription>
                      {mockStats.pendingReports} báo cáo cần xử lý
                    </CardDescription>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href="/moderator/reports">Xem tất cả</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPendingReports.map((report) => (
                    <div
                      key={report.id}
                      className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{report.target}</p>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <Badge variant="outline">{report.type}</Badge>
                          <Badge variant="destructive">{report.reason}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {report.id}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {report.date}
                          </span>
                          <Badge
                            variant={
                              report.status === "open"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {report.status === "open"
                              ? "Mở"
                              : "Đang xem xét"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/moderator/reports/${report.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
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
            <Card>
              <CardHeader>
                <CardTitle>Hoạt động hôm nay</CardTitle>
                <CardDescription>Thống kê công việc đã thực hiện</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">
                      {mockStats.approvedToday}
                    </p>
                    <p className="text-sm text-muted-foreground">Đã duyệt</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-red-600">
                      {mockStats.rejectedToday}
                    </p>
                    <p className="text-sm text-muted-foreground">Đã từ chối</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">
                      {mockStats.pendingReports}
                    </p>
                    <p className="text-sm text-muted-foreground">Báo cáo xử lý</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <Ban className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-orange-600">
                      {mockStats.suspendedShops}
                    </p>
                    <p className="text-sm text-muted-foreground">Shop đã khóa</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Tất cả báo cáo</CardTitle>
                    <CardDescription>Quản lý và xử lý báo cáo</CardDescription>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href="/moderator/reports">Xem tất cả</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPendingReports.map((report) => (
                    <div
                      key={report.id}
                      className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{report.target}</p>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <Badge variant="outline">{report.type}</Badge>
                          <Badge variant="destructive">{report.reason}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {report.id}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
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
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Kiểm duyệt đánh giá</CardTitle>
                    <CardDescription>
                      {mockStats.pendingReviews} đánh giá cần kiểm tra
                    </CardDescription>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href="/moderator/reviews">Xem tất cả</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Không có đánh giá nào cần kiểm duyệt.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions">
            <Card>
              <CardHeader>
                <CardTitle>Hành động gần đây</CardTitle>
                <CardDescription>Lịch sử các hành động kiểm duyệt</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
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
