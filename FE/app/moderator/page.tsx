"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package,
  AlertTriangle,
  CheckCircle,
  FileText,
  Clock,
  Timer,
} from "lucide-react";
import { complaintService } from "@/lib/services/complaint.service";
import type { ComplaintQueueStats } from "@/lib/services/complaint.service";

const defaultStats: ComplaintQueueStats = {
  totalInQueue: 0,
  totalAssigned: 0,
  totalInProgress: 0,
  totalCompletedToday: 0,
  avgWaitTimeMinutes: 0,
  highValueCount: 0,
};

export default function ModeratorDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<ComplaintQueueStats>(defaultStats);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const queueStats = await complaintService.getQueueStats();
      setStats(queueStats);
    } catch (error) {
      console.error("Failed to fetch moderator dashboard stats:", error);
      setStats(defaultStats);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchStats();
  }, []);

  const formatTime = (minutes: number) => {
    if (!minutes || minutes <= 0) return "0 phút";
    if (minutes < 60) return `${Math.round(minutes)} phút`;
    if (minutes < 1440) return `${Math.round(minutes / 60)} giờ`;
    return `${Math.round(minutes / 1440)} ngày`;
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Dashboard Kiểm duyệt
          </h1>
          <p className="text-sm text-muted-foreground">
            Tổng quan dữ liệu kiểm duyệt khiếu nại hiện có
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/moderator/review">
              <Package className="mr-2 h-4 w-4" />
              Duyệt sản phẩm
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/moderator/complaints">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Hàng đợi khiếu nại
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="py-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-4 pt-4">
            <CardTitle className="text-sm font-medium">Trong hàng đợi</CardTitle>
            <Clock className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-orange-600">{stats.totalInQueue}</div>
                <p className="text-xs text-muted-foreground mt-1.5">Đang chờ xử lý</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="py-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-4 pt-4">
            <CardTitle className="text-sm font-medium">Đã gán moderator</CardTitle>
            <FileText className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-blue-600">{stats.totalAssigned}</div>
                <p className="text-xs text-muted-foreground mt-1.5">Ticket đã được nhận</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="py-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-4 pt-4">
            <CardTitle className="text-sm font-medium">Đang xử lý</CardTitle>
            <Timer className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-purple-600">{stats.totalInProgress}</div>
                <p className="text-xs text-muted-foreground mt-1.5">Đang trong tiến trình xử lý</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="py-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-4 pt-4">
            <CardTitle className="text-sm font-medium">Hoàn thành hôm nay</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">{stats.totalCompletedToday}</div>
                <p className="text-xs text-muted-foreground mt-1.5">Đã xử lý xong</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="py-4">
        <CardHeader className="px-4 pt-4 pb-3">
          <CardTitle className="text-base">Tổng quan nhanh</CardTitle>
          <CardDescription className="text-xs">Dựa trên dữ liệu hàng đợi khiếu nại</CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-muted/40 border">
                <p className="text-xs text-muted-foreground">Giá trị cao cần ưu tiên</p>
                <p className="text-xl font-bold text-red-600">{stats.highValueCount}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/40 border">
                <p className="text-xs text-muted-foreground">Thời gian chờ trung bình</p>
                <p className="text-xl font-bold">{formatTime(stats.avgWaitTimeMinutes)}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/40 border">
                <p className="text-xs text-muted-foreground">Tổng ticket đang xử lý</p>
                <p className="text-xl font-bold">{stats.totalAssigned + stats.totalInProgress}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardHeader className="px-4 pt-4 pb-3">
          <CardTitle className="text-base">Thao tác nhanh</CardTitle>
          <CardDescription className="text-xs">Chỉ giữ các chức năng đã có trong hệ thống</CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            <Button variant="outline" className="h-auto py-3" asChild>
              <Link href="/moderator/complaints">Xử lý khiếu nại</Link>
            </Button>
            <Button variant="outline" className="h-auto py-3" asChild>
              <Link href="/moderator/review">Duyệt sản phẩm</Link>
            </Button>
            <Button variant="outline" className="h-auto py-3" asChild>
              <Link href="/moderator/shops">Quản lý shop</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
