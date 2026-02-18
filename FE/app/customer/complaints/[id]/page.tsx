"use client";

import { useState, useEffect, use } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Package,
  Clock,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  FileText,
  Loader2,
  Gavel,
  Scale,
  Image as ImageIcon,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { complaintService } from "@/lib/services/complaint.service";
import { RequireAuth } from "@/components/auth/RequireAuth";
import type { Complaint, ComplaintTimeline } from "@/types";

// Status config
const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; color: string; description: string }> = {
  InQueue: { label: "Trong hàng đợi", variant: "secondary", color: "text-gray-600", description: "Khiếu nại đang chờ moderator xử lý" },
  Assigned: { label: "Đã tiếp nhận", variant: "default", color: "text-blue-600", description: "Moderator đã tiếp nhận khiếu nại" },
  InReview: { label: "Đang xem xét", variant: "default", color: "text-blue-600", description: "Moderator đang xem xét khiếu nại" },
  NeedMoreInfo: { label: "Cần thêm thông tin", variant: "outline", color: "text-orange-600", description: "Vui lòng cung cấp thêm thông tin" },
  Resolved: { label: "Đã giải quyết", variant: "outline", color: "text-green-600", description: "Khiếu nại đã được giải quyết" },
  Appealable: { label: "Có thể kháng cáo", variant: "outline", color: "text-purple-600", description: "Bạn có thể kháng cáo trong 72 giờ" },
  Closed: { label: "Đã đóng", variant: "secondary", color: "text-gray-600", description: "Khiếu nại đã kết thúc" },
  AppealInReview: { label: "Đang xem xét kháng cáo", variant: "destructive", color: "text-red-600", description: "Kháng cáo đang được xem xét" },
};

const categoryLabels: Record<string, string> = {
  ProductQuality: "Chất lượng sản phẩm",
  NotAsDescribed: "Không đúng mô tả",
  AccountNotWorking: "Tài khoản không hoạt động",
  DeliveryIssue: "Vấn đề giao hàng",
  Fraud: "Lừa đảo",
  Other: "Khác",
};

const resolutionLabels: Record<string, string> = {
  None: "Chưa có",
  FullRefund: "Hoàn tiền 100%",
  PartialRefund: "Hoàn tiền một phần",
  Replace: "Đổi sản phẩm",
  Reject: "Từ chối",
};

export default function CustomerComplaintDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const router = useRouter();
  const { id: complaintId } = use(params);

  const [isLoading, setIsLoading] = useState(true);
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [timeline, setTimeline] = useState<ComplaintTimeline[]>([]);

  // Appeal dialog state
  const [isAppealDialogOpen, setIsAppealDialogOpen] = useState(false);
  const [isSubmittingAppeal, setIsSubmittingAppeal] = useState(false);
  const [appealReason, setAppealReason] = useState("");

  // Fetch complaint data
  const fetchComplaint = async () => {
    setIsLoading(true);
    try {
      const [complaintResult, timelineResult] = await Promise.all([
        complaintService.getComplaintById(complaintId),
        complaintService.getComplaintTimeline(complaintId),
      ]);

      setComplaint(complaintResult);
      setTimeline(timelineResult);
    } catch (error) {
      console.error("Failed to fetch complaint:", error);
      toast.error("Không thể tải thông tin khiếu nại");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [complaintId]);

  // File appeal
  const handleFileAppeal = async () => {
    if (!appealReason.trim() || appealReason.length < 20) {
      toast.error("Lý do kháng cáo phải có ít nhất 20 ký tự");
      return;
    }

    setIsSubmittingAppeal(true);
    try {
      await complaintService.fileAppeal(complaintId, {
        reason: appealReason,
      });
      toast.success("Đã nộp kháng cáo thành công");
      setIsAppealDialogOpen(false);
      fetchComplaint();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể nộp kháng cáo";
      toast.error(message);
    } finally {
      setIsSubmittingAppeal(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString("vi-VN");
  };

  // Check if appeal is still possible
  const canAppeal = complaint?.status === "Appealable" && complaint?.appealDeadline
    && new Date(complaint.appealDeadline) > new Date();

  if (isLoading) {
    return (
      <RequireAuth>
        <div className="container py-8 max-w-4xl">
          <div className="space-y-6">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </RequireAuth>
    );
  }

  if (!complaint) {
    return (
      <RequireAuth>
        <div className="container py-8 max-w-4xl">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <AlertTriangle className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Không tìm thấy khiếu nại</h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-4">
                Khiếu nại này không tồn tại hoặc bạn không có quyền xem.
              </p>
              <Button onClick={() => router.push("/customer/complaints")} variant="default">
                Quay lại danh sách
              </Button>
            </CardContent>
          </Card>
        </div>
      </RequireAuth>
    );
  }

  const status = statusConfig[complaint.status] || { label: complaint.status, variant: "outline" as const, color: "text-gray-600", description: "" };

  return (
    <RequireAuth>
      <div className="container py-8 max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/customer/complaints">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold">
                  {complaint.ticketCode}
                </h1>
                <Badge variant={status.variant} className={status.color}>
                  {status.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Tạo lúc: {formatDate(complaint.createdAt)}
              </p>
            </div>
          </div>

          {canAppeal && (
            <Dialog open={isAppealDialogOpen} onOpenChange={setIsAppealDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Scale className="mr-2 h-4 w-4" />
                  Kháng cáo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nộp kháng cáo</DialogTitle>
                  <DialogDescription>
                    Bạn có thể kháng cáo quyết định trong vòng 72 giờ.
                    Kháng cáo sẽ được Admin xem xét lại.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Lưu ý</AlertTitle>
                    <AlertDescription>
                      Hạn kháng cáo: {formatDate(complaint.appealDeadline!)}
                    </AlertDescription>
                  </Alert>
                  <div>
                    <Textarea
                      value={appealReason}
                      onChange={(e) => setAppealReason(e.target.value)}
                      placeholder="Nhập lý do bạn muốn kháng cáo quyết định này (ít nhất 20 ký tự)..."
                      rows={5}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {appealReason.length}/20 ký tự tối thiểu
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAppealDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleFileAppeal}
                    disabled={isSubmittingAppeal || appealReason.length < 20}
                  >
                    {isSubmittingAppeal ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang gửi...
                      </>
                    ) : (
                      "Nộp kháng cáo"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Status Alert */}
        <Alert variant={complaint.status === "NeedMoreInfo" ? "destructive" : "default"}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Trạng thái: {status.label}</AlertTitle>
          <AlertDescription>{status.description}</AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Complaint Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Chi tiết khiếu nại
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{complaint.title}</h3>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge variant="outline">
                      {categoryLabels[complaint.category] || complaint.category}
                    </Badge>
                    {complaint.subcategory && (
                      <Badge variant="secondary">{complaint.subcategory}</Badge>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Nội dung</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {complaint.content}
                  </p>
                </div>

                {/* Evidence */}
                {complaint.buyerEvidence && complaint.buyerEvidence.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Bằng chứng đã gửi ({complaint.buyerEvidence.length})
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {complaint.buyerEvidence.map((evidence, idx) => (
                          <a
                            key={idx}
                            href={evidence.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block border rounded-lg p-2 hover:bg-muted/50 transition-colors"
                          >
                            <div className="text-xs font-medium">{evidence.type}</div>
                            {evidence.description && (
                              <div className="text-xs text-muted-foreground truncate">
                                {evidence.description}
                              </div>
                            )}
                          </a>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Decision Info */}
            {complaint.decision && (
              <Card className={complaint.decision.resolution === "Reject" ? "border-red-200" : "border-green-200"}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gavel className="h-5 w-5" />
                    Quyết định của Moderator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    {complaint.decision.resolution === "Reject" ? (
                      <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-lg">
                        {resolutionLabels[complaint.decision.resolution]}
                      </h4>
                      {complaint.decision.refundAmount && (
                        <p className="text-sm text-muted-foreground">
                          Số tiền hoàn: {formatPrice(complaint.decision.refundAmount)}
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Lý do</h4>
                    <p className="text-sm text-muted-foreground">
                      {complaint.decision.reason}
                    </p>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Quyết định lúc: {formatDate(complaint.decision.decidedAt)}
                  </div>

                  {canAppeal && (
                    <Alert>
                      <Scale className="h-4 w-4" />
                      <AlertTitle>Bạn có thể kháng cáo</AlertTitle>
                      <AlertDescription>
                        Nếu không đồng ý với quyết định, bạn có thể nộp kháng cáo
                        trước {formatDate(complaint.appealDeadline!)}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Appeal Info */}
            {complaint.appealInfo && (
              <Card className="border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="h-5 w-5" />
                    Thông tin kháng cáo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Lý do kháng cáo</h4>
                    <p className="text-sm text-muted-foreground">
                      {complaint.appealInfo.appealReason}
                    </p>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Nộp lúc: {formatDate(complaint.appealInfo.appealedAt)}
                  </div>

                  {complaint.appealInfo.appealDecision && (
                    <>
                      <Separator />
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Kết quả kháng cáo</h4>
                        <Badge
                          variant={complaint.appealInfo.appealDecision === "Upheld" ? "default" : "destructive"}
                        >
                          {complaint.appealInfo.appealDecision === "Upheld"
                            ? "Giữ nguyên quyết định"
                            : "Đảo ngược quyết định"}
                        </Badge>
                        {complaint.appealInfo.appealNote && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {complaint.appealInfo.appealNote}
                          </p>
                        )}
                        <div className="text-xs text-muted-foreground mt-2">
                          Xử lý lúc: {formatDate(complaint.appealInfo.appealResolvedAt!)}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Order Snapshot */}
            {complaint.orderSnapshot && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Thông tin sản phẩm
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    {complaint.orderSnapshot.productThumbnail && (
                      <img
                        src={complaint.orderSnapshot.productThumbnail}
                        alt={complaint.orderSnapshot.productTitle}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1 space-y-2">
                      <h4 className="font-medium">{complaint.orderSnapshot.productTitle}</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Số lượng:</span>{" "}
                          {complaint.orderSnapshot.quantity}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Đơn giá:</span>{" "}
                          {formatPrice(complaint.orderSnapshot.unitPrice)}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tổng tiền:</span>{" "}
                          <span className="font-medium">{formatPrice(complaint.orderSnapshot.totalAmount)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Ngày đặt:</span>{" "}
                          {formatDate(complaint.orderSnapshot.orderedAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Tiến trình xử lý
                </CardTitle>
              </CardHeader>
              <CardContent>
                {timeline.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Chưa có hoạt động nào
                  </p>
                ) : (
                  <div className="space-y-4">
                    {timeline.map((event, idx) => (
                      <div key={event._id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          {idx < timeline.length - 1 && (
                            <div className="w-0.5 h-full bg-border" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="text-sm">{event.description}</p>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(event.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cần hỗ trợ?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Nếu bạn có thắc mắc về khiếu nại, vui lòng liên hệ hỗ trợ.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/customer/tickets/create">
                    Liên hệ hỗ trợ
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
