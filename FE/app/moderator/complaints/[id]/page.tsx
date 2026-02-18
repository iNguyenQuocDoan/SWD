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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  User,
  Package,
  Clock,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  FileText,
  Loader2,
  Gavel,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { complaintService } from "@/lib/services/complaint.service";
import type { Complaint, ComplaintTimeline, ComplaintResolution } from "@/types";

// Status config
const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; color: string }> = {
  InQueue: { label: "Trong hàng đợi", variant: "secondary", color: "text-gray-600" },
  Assigned: { label: "Đã nhận", variant: "default", color: "text-blue-600" },
  ModeratorAssigned: { label: "Đã nhận", variant: "default", color: "text-blue-600" },
  InReview: { label: "Đang xem xét", variant: "default", color: "text-blue-600" },
  NeedMoreInfo: { label: "Cần thêm thông tin", variant: "outline", color: "text-orange-600" },
  Resolved: { label: "Đã giải quyết", variant: "outline", color: "text-green-600" },
  Appealable: { label: "Có thể kháng cáo", variant: "outline", color: "text-purple-600" },
  Closed: { label: "Đã đóng", variant: "secondary", color: "text-gray-600" },
  AppealInReview: { label: "Kháng cáo đang xem xét", variant: "destructive", color: "text-red-600" },
};

const categoryLabels: Record<string, string> = {
  ProductQuality: "Chất lượng sản phẩm",
  NotAsDescribed: "Không đúng mô tả",
  MissingWrongItems: "Thiếu/Sai sản phẩm",
  AccountNotWorking: "Tài khoản không hoạt động",
  DeliveryIssues: "Vấn đề giao hàng",
  SellerNotResponding: "Người bán không phản hồi",
  RefundDispute: "Tranh chấp hoàn tiền",
};

const resolutionLabels: Record<string, string> = {
  None: "Chưa có",
  FullRefund: "Hoàn tiền 100%",
  PartialRefund: "Hoàn tiền một phần",
  Replace: "Đổi sản phẩm",
  Reject: "Từ chối",
};

export default function ModeratorComplaintDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const router = useRouter();
  const { id: complaintId } = use(params);

  const [isLoading, setIsLoading] = useState(true);
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [timeline, setTimeline] = useState<ComplaintTimeline[]>([]);
  const [canViewTimeline, setCanViewTimeline] = useState(true);

  // Decision dialog state
  const [isDecisionDialogOpen, setIsDecisionDialogOpen] = useState(false);
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);
  const [decisionResolution, setDecisionResolution] = useState<ComplaintResolution>("Reject");
  const [decisionReason, setDecisionReason] = useState("");
  const [refundAmount, setRefundAmount] = useState<number>(0);

  // Internal note state
  const [internalNote, setInternalNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Request info state
  const [isRequestInfoDialogOpen, setIsRequestInfoDialogOpen] = useState(false);
  const [requestInfoTarget, setRequestInfoTarget] = useState<"buyer" | "seller" | "both">("buyer");
  const [requestInfoQuestions, setRequestInfoQuestions] = useState("");
  const [isRequestingInfo, setIsRequestingInfo] = useState(false);

  // Fetch complaint data
  const fetchComplaint = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch data from queue API first to get populated ticket data
      const queueResult = await complaintService.getQueue({ limit: 100 });
      const item = queueResult.items.find(
        (i: any) => (typeof i.ticketId === "string" ? i.ticketId : i.ticketId._id) === complaintId
      );

      let ticketData: Complaint | null = null;

      if (item && typeof item.ticketId === "object") {
        ticketData = { ...(item.ticketId as Complaint) };
        // Gộp thông tin moderator từ queue item nếu có
        if (item.assignedModeratorId && typeof item.assignedModeratorId === "object") {
          (ticketData as any).assignedToUserId = item.assignedModeratorId;
        }
      } else {
        try {
          ticketData = await complaintService.getComplaintById(complaintId);
        } catch (e: any) {
          console.warn("Direct access failed");
        }
      }

      if (ticketData) {
        setComplaint(ticketData);
        setRefundAmount(ticketData.orderValue || 0);
      }

      // 2. Fetch Timeline separately
      try {
        const timelineResult = await complaintService.getComplaintTimeline(complaintId);
        setTimeline(timelineResult);
        setCanViewTimeline(true);
      } catch (e: any) {
        if (e.status === 403) {
          setCanViewTimeline(false);
        }
      }
    } catch (error) {
      console.error("Failed to fetch complaint info:", error);
      toast.error("Không thể tải thông tin khiếu nại");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [complaintId]);

  // Assign to self
  const handleAssignToSelf = async () => {
    try {
      await complaintService.assignToModerator(complaintId);
      toast.success("Đã nhận xử lý khiếu nại");
      fetchComplaint();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể nhận khiếu nại";
      toast.error(message);
    }
  };

  // Add internal note
  const handleAddInternalNote = async () => {
    if (!internalNote.trim()) return;

    setIsAddingNote(true);
    try {
      await complaintService.addInternalNote(complaintId, internalNote);
      toast.success("Đã thêm ghi chú");
      setInternalNote("");
      fetchComplaint();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể thêm ghi chú";
      toast.error(message);
    } finally {
      setIsAddingNote(false);
    }
  };

  // Request more info
  const handleRequestInfo = async () => {
    if (!requestInfoQuestions.trim()) return;

    setIsRequestingInfo(true);
    try {
      await complaintService.requestMoreInfo(complaintId, {
        targetParty: requestInfoTarget,
        questions: requestInfoQuestions.split("\n").filter((q) => q.trim()),
      });
      toast.success("Đã gửi yêu cầu bổ sung thông tin");
      setRequestInfoQuestions("");
      setIsRequestInfoDialogOpen(false);
      fetchComplaint();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể yêu cầu thông tin";
      toast.error(message);
    } finally {
      setIsRequestingInfo(false);
    }
  };

  // Make decision
  const handleMakeDecision = async () => {
    if (!decisionReason.trim() || decisionReason.length < 20) {
      toast.error("Lý do quyết định phải có ít nhất 20 ký tự");
      return;
    }

    setIsSubmittingDecision(true);
    try {
      await complaintService.makeDecision(complaintId, {
        resolutionType: decisionResolution,
        decisionNote: decisionReason,
        refundAmount: ["FullRefund", "PartialRefund"].includes(decisionResolution) ? refundAmount : undefined,
      });
      toast.success("Đã đưa ra quyết định xử lý");
      setIsDecisionDialogOpen(false);
      fetchComplaint();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể đưa ra quyết định";
      toast.error(message);
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  const formatPrice = (price: any) => {
    const val = Number(price) || 0;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);
  };

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return isNaN(d.getTime()) ? "N/A" : d.toLocaleString("vi-VN");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <AlertTriangle className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Không tìm thấy khiếu nại</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
              Khiếu nại này không tồn tại hoặc bạn không có quyền xem.
            </p>
            <Button onClick={() => router.push("/moderator/complaints")} variant="default">
              Quay lại hàng đợi
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = statusConfig[complaint.status] || { label: complaint.status, variant: "outline" as const, color: "text-gray-600" };
  // Hiển thị nút action khi ticket đã được nhận xử lý
  const canMakeDecision = ["Assigned", "ModeratorAssigned", "InReview", "NeedMoreInfo"].includes(complaint.status);
  const canAssign = complaint.status === "InQueue";

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/moderator/complaints">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold">{complaint.ticketCode}</h1>
              <Badge variant={status.variant} className={status.color}>{status.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Tạo lúc: {formatDate(complaint.createdAt)}</p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {canAssign && (
            <Button onClick={handleAssignToSelf}>
              <CheckCircle className="mr-2 h-4 w-4" /> Nhận xử lý
            </Button>
          )}

          {canMakeDecision && (
            <>
              <Dialog open={isRequestInfoDialogOpen} onOpenChange={setIsRequestInfoDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <MessageSquare className="mr-2 h-4 w-4" /> Yêu cầu thông tin
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Yêu cầu thêm thông tin</DialogTitle>
                    <DialogDescription>Chọn đối tượng và nhập câu hỏi cần làm rõ</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label>Đối tượng nhận yêu cầu:</Label>
                      <Select value={requestInfoTarget} onValueChange={(v: any) => setRequestInfoTarget(v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="buyer">Người mua (Buyer)</SelectItem>
                          <SelectItem value="seller">Người bán (Seller)</SelectItem>
                          <SelectItem value="both">Cả hai bên (Both)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Danh sách câu hỏi (mỗi câu một dòng):</Label>
                    <Textarea
                      value={requestInfoQuestions}
                      onChange={(e) => setRequestInfoQuestions(e.target.value)}
                        placeholder="Vui lòng cung cấp screenshot lỗi..."
                      rows={5}
                    />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsRequestInfoDialogOpen(false)}>Hủy</Button>
                    <Button onClick={handleRequestInfo} disabled={isRequestingInfo}>
                      {isRequestingInfo ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Gửi yêu cầu
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isDecisionDialogOpen} onOpenChange={setIsDecisionDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Gavel className="mr-2 h-4 w-4" /> Đưa quyết định
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Đưa ra quyết định xử lý</DialogTitle>
                    <DialogDescription>Hành động này sẽ thay đổi trạng thái khiếu nại vĩnh viễn</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label>Hình thức xử lý:</Label>
                      <Select value={decisionResolution} onValueChange={(v) => setDecisionResolution(v as ComplaintResolution)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FullRefund">Hoàn tiền 100%</SelectItem>
                          <SelectItem value="PartialRefund">Hoàn tiền một phần</SelectItem>
                          <SelectItem value="Replace">Đổi sản phẩm</SelectItem>
                          <SelectItem value="Reject">Từ chối khiếu nại</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {["FullRefund", "PartialRefund"].includes(decisionResolution) && (
                      <div className="space-y-2">
                        <Label>Số tiền hoàn (VND):</Label>
                        <Input type="number" value={refundAmount} onChange={(e) => setRefundAmount(Number(e.target.value))} max={complaint.orderValue} />
                        <p className="text-[10px] text-muted-foreground uppercase">Tối đa: {formatPrice(complaint.orderValue)}</p>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Lý do quyết định *</Label>
                      <Textarea
                        value={decisionReason}
                        onChange={(e) => setDecisionReason(e.target.value)}
                        placeholder="Mô tả chi tiết căn cứ cho quyết định này (tối thiểu 20 ký tự)..."
                        rows={4}
                        className={decisionReason.length > 0 && decisionReason.length < 20 ? "border-red-500" : ""}
                      />
                      <div className="flex justify-between items-center text-[10px] uppercase font-bold">
                        <span className={decisionReason.length < 20 ? "text-red-500" : "text-green-600"}>
                          {decisionReason.length < 20 ? "Cần thêm ít nhất " + (20 - decisionReason.length) + " ký tự" : "Đã đủ độ dài"}
                        </span>
                        <span>{decisionReason.length} ký tự</span>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDecisionDialogOpen(false)}>
                      Hủy
                    </Button>
                    <Button 
                      onClick={handleMakeDecision} 
                      disabled={isSubmittingDecision || decisionReason.length < 20}
                    >
                      {isSubmittingDecision ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Xác nhận xử lý
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><FileText className="h-5 w-5" /> Thông tin khiếu nại</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{complaint.title}</h3>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge variant="outline">{categoryLabels[complaint.category] || complaint.category}</Badge>
                  {complaint.subcategory && <Badge variant="secondary">{complaint.subcategory}</Badge>}
                </div>
              </div>
              <Separator />
              <div><h4 className="font-medium mb-2">Nội dung</h4><p className="text-sm text-muted-foreground whitespace-pre-wrap">{complaint.content}</p></div>
              {complaint.buyerEvidence && complaint.buyerEvidence.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Bằng chứng từ người mua ({complaint.buyerEvidence.length})</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {complaint.buyerEvidence.map((evidence, idx) => (
                        <a key={idx} href={evidence.url} target="_blank" rel="noopener noreferrer" className="block border rounded-lg p-2 hover:bg-muted/50 transition-colors">
                          <div className="text-xs font-medium">{evidence.type}</div>
                          {evidence.description && <div className="text-xs text-muted-foreground truncate">{evidence.description}</div>}
                        </a>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {complaint.orderSnapshot && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Package className="h-5 w-5" /> Thông tin đơn hàng</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  {complaint.orderSnapshot.productThumbnail && <img src={complaint.orderSnapshot.productThumbnail} alt={complaint.orderSnapshot.productTitle} className="w-20 h-20 object-cover rounded-lg" />}
                  <div className="flex-1 space-y-2">
                    <h4 className="font-medium">{complaint.orderSnapshot.productTitle}</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-muted-foreground">Số lượng:</span> {complaint.orderSnapshot.quantity || "N/A"}</div>
                      <div><span className="text-muted-foreground">Đơn giá:</span> {formatPrice(complaint.orderSnapshot.unitPrice)}</div>
                      <div><span className="text-muted-foreground">Tổng tiền:</span> <span className="font-medium">{formatPrice(complaint.orderSnapshot.totalAmount)}</span></div>
                      <div><span className="text-muted-foreground">Ngày đặt:</span> {formatDate((complaint.orderSnapshot as any).orderedAt || (complaint.orderSnapshot as any).paidAt)}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><MessageSquare className="h-5 w-5" /> Ghi chú nội bộ</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Textarea value={internalNote} onChange={(e) => setInternalNote(e.target.value)} placeholder="Thêm ghi chú..." rows={2} className="flex-1" />
                <Button onClick={handleAddInternalNote} disabled={isAddingNote || !internalNote.trim()} className="self-end">{isAddingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : "Thêm"}</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><User className="h-5 w-5" /> Các bên liên quan</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Người mua</h4>
                <p className="font-medium">{(complaint.customerUserId as any)?.fullName || "N/A"}</p>
                <p className="text-sm text-muted-foreground">{(complaint.customerUserId as any)?.email}</p>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Shop</h4>
                <p className="font-medium">
                  {typeof complaint.shopId === "object" && (complaint.shopId as any)?.shopName
                    ? (complaint.shopId as any).shopName
                    : (complaint.orderItemId as any)?.shopId?.name || (complaint.orderItemId as any)?.shopId?.shopName || "N/A"}
                </p>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Người xử lý</h4>
                <p className="font-medium">
                  {typeof complaint.assignedToUserId === "object"
                    ? (complaint.assignedToUserId as any).fullName
                    : (complaint as any).assignedModeratorId?.fullName || "Chưa có"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Clock className="h-5 w-5" /> Thông tin trạng thái</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Trạng thái:</span><Badge variant={status.variant}>{status.label}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Cấp độ:</span><span>{complaint.escalationLevel}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Giá trị đơn:</span><span className="font-medium">{formatPrice(complaint.orderValue)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Vi phạm SLA:</span><span>{complaint.slaBreached ? "Có" : "Không"}</span></div>
              {complaint.appealDeadline && <div className="flex justify-between"><span className="text-muted-foreground">Hạn kháng cáo:</span><span>{formatDate(complaint.appealDeadline)}</span></div>}
            </CardContent>
          </Card>

          {canViewTimeline && timeline.length > 0 && (
          <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Clock className="h-5 w-5" /> Lịch sử hoạt động</CardTitle></CardHeader>
            <CardContent>
                <div className="space-y-4">
                  {timeline.slice(0, 10).map((event, idx) => (
                    <div key={event._id} className="flex gap-3">
                      <div className="flex flex-col items-center"><div className="h-2 w-2 rounded-full bg-primary" />{idx < timeline.length - 1 && <div className="w-0.5 h-full bg-border" />}</div>
                      <div className="flex-1 pb-4"><p className="text-sm font-medium">{event.description}</p><div className="flex items-center gap-2 mt-1"><Badge variant="outline" className="text-xs">{event.actorRole}</Badge><span className="text-xs text-muted-foreground">{formatDate(event.createdAt)}</span></div></div>
                    </div>
                  ))}
                </div>
            </CardContent>
          </Card>
          )}
        </div>
      </div>
    </div>
  );
}
