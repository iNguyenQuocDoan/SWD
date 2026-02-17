"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  Plus,
  Eye,
  Package,
  RefreshCw,
  FileText,
  Clock,
  CheckCircle,
  Scale,
} from "lucide-react";
import { toast } from "sonner";
import { complaintService } from "@/lib/services/complaint.service";
import { RequireAuth } from "@/components/auth/RequireAuth";
import type { Complaint } from "@/types";

// Status badge config
const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  InQueue: { label: "Trong hàng đợi", variant: "secondary" },
  Assigned: { label: "Đã tiếp nhận", variant: "default" },
  InReview: { label: "Đang xem xét", variant: "default" },
  NeedMoreInfo: { label: "Cần thêm thông tin", variant: "outline" },
  Resolved: { label: "Đã giải quyết", variant: "outline" },
  Appealable: { label: "Có thể kháng cáo", variant: "outline" },
  Closed: { label: "Đã đóng", variant: "secondary" },
  AppealInReview: { label: "Kháng cáo đang xem xét", variant: "destructive" },
};

const categoryLabels: Record<string, string> = {
  ProductQuality: "Chất lượng SP",
  NotAsDescribed: "Không đúng mô tả",
  AccountNotWorking: "TK không hoạt động",
  DeliveryIssue: "Vấn đề giao hàng",
  Fraud: "Lừa đảo",
  Other: "Khác",
};

export default function CustomerComplaintsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch complaints
  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      const result = await complaintService.getMyComplaints({
        status: statusFilter !== "all" ? statusFilter : undefined,
        limit: 50,
      });

      setComplaints(result.tickets);
    } catch (error) {
      console.error("Failed to fetch complaints:", error);
      toast.error("Không thể tải danh sách khiếu nại");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Count by status
  const statusCounts = {
    active: complaints.filter((c) =>
      ["InQueue", "Assigned", "InReview", "NeedMoreInfo"].includes(c.status)
    ).length,
    appealable: complaints.filter((c) => c.status === "Appealable").length,
    closed: complaints.filter((c) => ["Resolved", "Closed"].includes(c.status)).length,
  };

  return (
    <RequireAuth>
      <div className="container py-8 max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Khiếu nại của tôi</h1>
            <p className="text-muted-foreground">
              Theo dõi và quản lý các khiếu nại của bạn
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchComplaints}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Làm mới
            </Button>
            <Button size="sm" asChild>
              <Link href="/customer/tickets/create">
                <Plus className="mr-2 h-4 w-4" />
                Tạo khiếu nại
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-3">
          <Card className="py-4">
            <CardContent className="px-4 pt-4 pb-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statusCounts.active}</p>
                <p className="text-xs text-muted-foreground">Đang xử lý</p>
              </div>
            </CardContent>
          </Card>

          <Card className="py-4">
            <CardContent className="px-4 pt-4 pb-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Scale className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statusCounts.appealable}</p>
                <p className="text-xs text-muted-foreground">Có thể kháng cáo</p>
              </div>
            </CardContent>
          </Card>

          <Card className="py-4">
            <CardContent className="px-4 pt-4 pb-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statusCounts.closed}</p>
                <p className="text-xs text-muted-foreground">Đã xử lý</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <Card className="py-4">
          <CardContent className="px-4 pt-4 pb-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Lọc theo trạng thái:</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="InQueue">Trong hàng đợi</SelectItem>
                  <SelectItem value="InReview">Đang xem xét</SelectItem>
                  <SelectItem value="NeedMoreInfo">Cần thêm thông tin</SelectItem>
                  <SelectItem value="Appealable">Có thể kháng cáo</SelectItem>
                  <SelectItem value="Resolved">Đã giải quyết</SelectItem>
                  <SelectItem value="Closed">Đã đóng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Complaints List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Danh sách khiếu nại
            </CardTitle>
            <CardDescription>
              {complaints.length} khiếu nại
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : complaints.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Chưa có khiếu nại nào</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Bạn chưa tạo khiếu nại nào. Nếu gặp vấn đề với sản phẩm, hãy tạo khiếu nại.
                </p>
                <Button asChild>
                  <Link href="/customer/tickets/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Tạo khiếu nại
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {complaints.map((complaint) => {
                  const status = statusConfig[complaint.status] || {
                    label: complaint.status,
                    variant: "outline" as const,
                  };

                  return (
                    <div
                      key={complaint._id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/customer/complaints/${complaint._id}`)}
                    >
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">
                            {complaint.ticketCode}
                          </span>
                          <Badge variant={status.variant}>
                            {status.label}
                          </Badge>
                          {complaint.status === "Appealable" && (
                            <Badge variant="destructive" className="text-xs">
                              <Scale className="h-3 w-3 mr-1" />
                              Cần kháng cáo
                            </Badge>
                          )}
                        </div>

                        <p className="font-medium truncate">{complaint.title}</p>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          <span className="bg-muted px-2 py-0.5 rounded">
                            {categoryLabels[complaint.category] || complaint.category}
                          </span>
                          <span>
                            Giá trị: {formatPrice(complaint.orderValue)}
                          </span>
                          <span>
                            {formatDate(complaint.createdAt)}
                          </span>
                        </div>

                        {complaint.orderSnapshot && (
                          <p className="text-xs text-muted-foreground truncate">
                            Sản phẩm: {complaint.orderSnapshot.productTitle}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/customer/complaints/${complaint._id}`);
                          }}
                        >
                          <Eye className="mr-1.5 h-3.5 w-3.5" />
                          Chi tiết
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Alert */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="px-4 py-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900">Quy trình xử lý khiếu nại</p>
              <ul className="mt-2 space-y-1 text-blue-800">
                <li>1. Tạo khiếu nại với đầy đủ thông tin và bằng chứng</li>
                <li>2. Moderator sẽ xem xét và đưa ra quyết định</li>
                <li>3. Nếu không đồng ý, bạn có thể kháng cáo trong 72 giờ</li>
                <li>4. Admin sẽ xem xét lại kháng cáo và đưa ra quyết định cuối cùng</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </RequireAuth>
  );
}
