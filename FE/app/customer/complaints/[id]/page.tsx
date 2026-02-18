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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Plus,
  Trash2,
  Camera,
  Image as ImageIcon,
  Video,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { complaintService } from "@/lib/services/complaint.service";
import { RequireAuth } from "@/components/auth/RequireAuth";
import type { Complaint, ComplaintTimeline, ComplaintEvidence } from "@/types";

// Status config
const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; color: string; description: string }> = {
  InQueue: { label: "Trong hàng đợi", variant: "secondary", color: "text-gray-600", description: "Khiếu nại đang chờ moderator xử lý" },
  Assigned: { label: "Đã tiếp nhận", variant: "default", color: "text-blue-600", description: "Moderator đã tiếp nhận khiếu nại" },
  ModeratorAssigned: { label: "Đã tiếp nhận", variant: "default", color: "text-blue-600", description: "Moderator đã tiếp nhận khiếu nại" },
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
  MissingWrongItems: "Thiếu/Sai sản phẩm",
  AccountNotWorking: "Tài khoản không hoạt động",
  DeliveryIssues: "Vấn đề giao hàng",
  SellerNotResponding: "Người bán không phản hồi",
  RefundDispute: "Tranh chấp tiền",
};

const resolutionLabels: Record<string, string> = {
  None: "Chưa có",
  FullRefund: "Hoàn tiền 100%",
  PartialRefund: "Hoàn tiền một phần",
  Replace: "Đổi sản phẩm",
  Reject: "Từ chối",
};

const EVIDENCE_TYPES = [
  { value: "Image", label: "Hình ảnh", icon: ImageIcon },
  { value: "Video", label: "Video", icon: Video },
  { value: "Screenshot", label: "Ảnh chụp màn hình", icon: Camera },
  { value: "Document", label: "Tài liệu", icon: FileText },
] as const;

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

  // Evidence state
  const [isEvidenceDialogOpen, setIsEvidenceDialogOpen] = useState(false);
  const [isSubmittingEvidence, setIsSubmittingEvidence] = useState(false);
  const [newEvidence, setNewEvidence] = useState<{ type: string; url: string; description: string }[]>([]);

  // Appeal dialog state
  const [isAppealDialogOpen, setIsAppealDialogOpen] = useState(false);
  const [isSubmittingAppeal, setIsSubmittingAppeal] = useState(false);
  const [appealReason, setAppealReason] = useState("");
  const [appealEvidence, setAppealEvidence] = useState<{ type: string; url: string; description: string }[]>([]);

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

  // Add evidence
  const handleAddEvidence = async () => {
    if (newEvidence.length === 0) return;
    
    const hasEmptyUrl = newEvidence.some(e => !e.url.trim());
    if (hasEmptyUrl) {
      toast.error("Vui lòng nhập đầy đủ URL bằng chứng");
      return;
    }

    setIsSubmittingEvidence(true);
    try {
      // Backend chỉ chấp nhận từng object đơn lẻ, nên FE sẽ lặp để gửi
      const promises = newEvidence.map(e => 
        complaintService.addEvidence(complaintId, {
          type: e.type as any,
          url: e.url,
          description: e.description
        })
      );
      
      await Promise.all(promises);
      
      toast.success("Đã thêm bằng chứng thành công");
      setIsEvidenceDialogOpen(false);
      setNewEvidence([]);
      fetchComplaint();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể thêm bằng chứng";
      toast.error(message);
    } finally {
      setIsSubmittingEvidence(false);
    }
  };

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
        additionalEvidence: appealEvidence.length > 0 ? appealEvidence.map(e => ({
          type: e.type as any,
          url: e.url,
          description: e.description
        })) : undefined
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

  // Check if appeal is still possible
  const canAppeal = complaint?.status === "Appealable" && complaint?.appealDeadline
    && new Date(complaint.appealDeadline) > new Date();

  // Allowed to add evidence
  const canAddEvidence = ["InQueue", "Assigned", "ModeratorAssigned", "InReview", "NeedMoreInfo"].includes(complaint?.status || "");

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
            <Button variant="ghost" size="icon" asChild className="rounded-full">
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

          <div className="flex gap-2">
            {canAddEvidence && (
              <Dialog open={isEvidenceDialogOpen} onOpenChange={setIsEvidenceDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Bổ sung bằng chứng
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Bổ sung bằng chứng</DialogTitle>
                    <DialogDescription>
                      Cung cấp thêm hình ảnh hoặc tài liệu để làm rõ khiếu nại của bạn.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2 max-h-[400px] overflow-y-auto pr-2">
                    {newEvidence.map((e, index) => (
                      <div key={index} className="p-3 border rounded-lg space-y-3 relative group">
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                          onClick={() => setNewEvidence(newEvidence.filter((_, i) => i !== index))}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold">Loại</Label>
                            <Select 
                              value={e.type} 
                              onValueChange={(v) => {
                                const updated = [...newEvidence];
                                updated[index].type = v;
                                setNewEvidence(updated);
                              }}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {EVIDENCE_TYPES.map(t => (
                                  <SelectItem key={t.value} value={t.value} className="text-xs">
                                    <div className="flex items-center gap-2"><t.icon className="h-3 w-3" />{t.label}</div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold">URL</Label>
                            <Input 
                              className="h-8 text-xs" 
                              placeholder="Link ảnh/video..." 
                              value={e.url}
                              onChange={(ev) => {
                                const updated = [...newEvidence];
                                updated[index].url = ev.target.value;
                                setNewEvidence(updated);
                              }}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase font-bold">Mô tả (tuỳ chọn)</Label>
                          <Input 
                            className="h-8 text-xs" 
                            placeholder="Mô tả ngắn gọn bằng chứng này..." 
                            value={e.description}
                            onChange={(ev) => {
                              const updated = [...newEvidence];
                              updated[index].description = ev.target.value;
                              setNewEvidence(updated);
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    <Button 
                      type="button" 
                      variant="ghost" 
                      className="w-full border-dashed border-2 py-6 h-auto"
                      onClick={() => setNewEvidence([...newEvidence, { type: "Screenshot", url: "", description: "" }])}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Thêm dòng bằng chứng
                    </Button>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEvidenceDialogOpen(false)}>Hủy</Button>
                    <Button onClick={handleAddEvidence} disabled={isSubmittingEvidence || newEvidence.length === 0}>
                      {isSubmittingEvidence ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Gửi bằng chứng
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

          {canAppeal && (
            <Dialog open={isAppealDialogOpen} onOpenChange={setIsAppealDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Scale className="mr-2 h-4 w-4" />
                  Kháng cáo
                </Button>
              </DialogTrigger>
                <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Nộp kháng cáo</DialogTitle>
                  <DialogDescription>
                      Nếu không đồng ý với quyết định, bạn có thể nộp kháng cáo.
                      Admin sẽ trực tiếp xem xét lại trường hợp này.
                  </DialogDescription>
                </DialogHeader>
                  <div className="space-y-4 py-2">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Hạn chót: {formatDate(complaint.appealDeadline!)}</AlertTitle>
                  </Alert>
                    <div className="space-y-2">
                      <Label>Lý do kháng cáo *</Label>
                    <Textarea
                      value={appealReason}
                      onChange={(e) => setAppealReason(e.target.value)}
                        placeholder="Nhập lý do chi tiết vì sao bạn không đồng ý với quyết định của Moderator..."
                      rows={5}
                    />
                      <p className="text-[10px] text-muted-foreground uppercase">{appealReason.length}/20 ký tự tối thiểu</p>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <Label className="text-sm font-bold">Bằng chứng bổ sung (nếu có)</Label>
                      <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1">
                        {appealEvidence.map((e, index) => (
                          <div key={index} className="flex gap-2 items-end border p-2 rounded-lg relative">
                            <Button 
                              variant="ghost" size="icon" className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-background border"
                              onClick={() => setAppealEvidence(appealEvidence.filter((_, i) => i !== index))}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                            <div className="flex-1 space-y-1">
                              <Input 
                                className="h-7 text-[10px]" 
                                placeholder="URL bằng chứng..." 
                                value={e.url}
                                onChange={(ev) => {
                                  const updated = [...appealEvidence];
                                  updated[index].url = ev.target.value;
                                  setAppealEvidence(updated);
                                }}
                              />
                            </div>
                          </div>
                        ))}
                        <Button 
                          type="button" variant="outline" size="sm" className="w-full h-8 text-[10px] border-dashed"
                          onClick={() => setAppealEvidence([...appealEvidence, { type: "Screenshot", url: "", description: "" }])}
                        >
                          <Plus className="mr-1 h-3 w-3" /> Thêm bằng chứng
                        </Button>
                      </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAppealDialogOpen(false)}>Hủy</Button>
                  <Button
                    variant="destructive"
                    onClick={handleFileAppeal}
                    disabled={isSubmittingAppeal || appealReason.length < 20}
                  >
                      {isSubmittingAppeal ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Xác nhận kháng cáo
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          </div>
        </div>

        {/* Status Alert */}
        <Alert variant={complaint.status === "NeedMoreInfo" ? "destructive" : "default"}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Trạng thái: {status.label}</AlertTitle>
          <AlertDescription>{status.description}</AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Chi tiết khiếu nại
                </CardTitle>
              </CardHeader>
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
                      <h4 className="font-medium mb-2 flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Bằng chứng đã gửi ({complaint.buyerEvidence.length})</h4>
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

            {complaint.decision && (
              <Card className={complaint.decision.resolution === "Reject" ? "border-red-200" : "border-green-200"}>
                <CardHeader><CardTitle className="flex items-center gap-2"><Gavel className="h-5 w-5" /> Quyết định xử lý</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    {complaint.decision.resolution === "Reject" ? (
                      <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center"><AlertTriangle className="h-6 w-6 text-red-600" /></div>
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center"><CheckCircle className="h-6 w-6 text-green-600" /></div>
                    )}
                    <div>
                      <h4 className="font-semibold text-lg">{resolutionLabels[complaint.decision.resolution]}</h4>
                      {complaint.decision.refundAmount && <p className="text-sm text-muted-foreground">Số tiền hoàn: {formatPrice(complaint.decision.refundAmount)}</p>}
                    </div>
                  </div>
                  <Separator />
                  <div><h4 className="font-medium mb-2">Lý do từ Moderator</h4><p className="text-sm text-muted-foreground">{complaint.decision.reason}</p></div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Quyết định lúc: {formatDate(complaint.decision.decidedAt)}</div>
                </CardContent>
              </Card>
            )}

            {complaint.appealInfo && (
              <Card className="border-purple-200">
                <CardHeader><CardTitle className="flex items-center gap-2"><Scale className="h-5 w-5" /> Thông tin kháng cáo</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div><h4 className="font-medium mb-2">Lý do của bạn</h4><p className="text-sm text-muted-foreground">{complaint.appealInfo.appealReason}</p></div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Nộp lúc: {formatDate(complaint.appealInfo.appealedAt)}</div>
                  {complaint.appealInfo.appealDecision && (
                      <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Kết quả</h4>
                      <Badge variant={complaint.appealInfo.appealDecision === "Upheld" ? "default" : "destructive"}>
                        {complaint.appealInfo.appealDecision === "Upheld" ? "Giữ nguyên" : "Đảo ngược"}
                        </Badge>
                      {complaint.appealInfo.appealNote && <p className="text-sm text-muted-foreground mt-2">{complaint.appealInfo.appealNote}</p>}
                      </div>
                  )}
                </CardContent>
              </Card>
            )}

            {complaint.orderSnapshot && (
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" /> Thông tin sản phẩm</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    {complaint.orderSnapshot.productThumbnail && <img src={complaint.orderSnapshot.productThumbnail} alt={complaint.orderSnapshot.productTitle} className="w-20 h-20 object-cover rounded-lg" />}
                    <div className="flex-1 space-y-2">
                      <h4 className="font-medium">{complaint.orderSnapshot.productTitle}</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="text-muted-foreground">Số lượng:</span> {complaint.orderSnapshot.quantity || 1}</div>
                        <div><span className="text-muted-foreground">Đơn giá:</span> {formatPrice(complaint.orderSnapshot.unitPrice)}</div>
                        <div><span className="text-muted-foreground">Tổng tiền:</span> <span className="font-medium">{formatPrice(complaint.orderSnapshot.totalAmount)}</span></div>
                        <div><span className="text-muted-foreground">Ngày đặt:</span> {formatDate((complaint.orderSnapshot as any).orderedAt || (complaint.orderSnapshot as any).paidAt)}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" /> Tiến trình xử lý</CardTitle></CardHeader>
              <CardContent>
                {timeline.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Chưa có hoạt động nào</p>
                ) : (
                  <div className="space-y-4">
                    {timeline.map((event, idx) => (
                      <div key={event._id} className="flex gap-3">
                        <div className="flex flex-col items-center"><div className="h-2 w-2 rounded-full bg-primary" />{idx < timeline.length - 1 && <div className="w-0.5 h-full bg-border" />}</div>
                        <div className="flex-1 pb-4"><p className="text-sm">{event.description}</p><span className="text-xs text-muted-foreground">{formatDate(event.createdAt)}</span></div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
