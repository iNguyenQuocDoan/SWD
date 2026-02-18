"use client";

import { useState, useEffect, Suspense } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { createComplaintSchema, type CreateComplaintInput } from "@/lib/validations";
import { complaintService } from "@/lib/services/complaint.service";
import { orderService } from "@/lib/services/order.service";

import { RequireAuth } from "@/components/auth/RequireAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import {
  AlertCircle,
  ArrowLeft,
  Camera,
  CheckCircle,
  FileText,
  Image as ImageIcon,
  Loader2,
  Package,
  Plus,
  Trash2,
  Video,
} from "lucide-react";
import { toast } from "sonner";

interface OrderItemOption {
  id: string;
  orderId: string;
  orderCode: string;
  productTitle: string;
  shopName: string;
  amount: number;
  status: string;
  createdAt: string;
}

const CATEGORY_OPTIONS = [
  { value: "ProductQuality", label: "Chất lượng sản phẩm", description: "Sản phẩm lỗi, hỏng" },
  { value: "NotAsDescribed", label: "Không đúng mô tả", description: "Khác hình ảnh, thông số" },
  { value: "MissingWrongItems", label: "Thiếu/Sai hàng", description: "Thiếu món hoặc sai loại" },
  { value: "AccountNotWorking", label: "TK không hoạt động", description: "Sai pass, hết hạn" },
  { value: "DeliveryIssues", label: "Vấn đề giao hàng", description: "Chưa nhận, giao thiếu" },
  { value: "SellerNotResponding", label: "Shop không phản hồi", description: "Không hỗ trợ sau mua" },
  { value: "RefundDispute", label: "Tranh chấp hoàn tiền", description: "Từ chối/Tranh chấp hoàn" },
] as const;

const SUBCATEGORY_OPTIONS: Record<string, { value: string; label: string }[]> = {
  ProductQuality: [
    { value: "ItemDefective", label: "Sản phẩm bị lỗi" },
    { value: "ItemDamaged", label: "Sản phẩm bị hư hỏng" },
  ],
  NotAsDescribed: [
    { value: "DifferentFromPhoto", label: "Khác với hình ảnh" },
    { value: "DifferentSpecifications", label: "Khác thông số/Thiếu tính năng" },
  ],
  MissingWrongItems: [
    { value: "MissingItems", label: "Thiếu sản phẩm" },
    { value: "WrongItems", label: "Sai sản phẩm" },
  ],
  AccountNotWorking: [
    { value: "CredentialsInvalid", label: "Thông tin đăng nhập sai" },
    { value: "AccountAlreadyUsed", label: "Tài khoản đã được sử dụng" },
    { value: "AccountExpired", label: "Tài khoản đã hết hạn" },
  ],
  DeliveryIssues: [
    { value: "NeverDelivered", label: "Chưa nhận được" },
    { value: "PartialDelivery", label: "Chỉ nhận một phần" },
  ],
  SellerNotResponding: [{ value: "NoResponse48h", label: "Không phản hồi sau 48h" }],
  RefundDispute: [
    { value: "RefuseRefund", label: "Người bán từ chối hoàn" },
    { value: "PartialRefundDispute", label: "Tranh chấp mức hoàn" },
  ],
};

const EVIDENCE_TYPES = [
  { value: "Image", label: "Hình ảnh", icon: ImageIcon },
  { value: "Video", label: "Video", icon: Video },
  { value: "Screenshot", label: "Ảnh chụp", icon: Camera },
  { value: "Document", label: "Tài liệu", icon: FileText },
] as const;

function CreateComplaintContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderItemIdParam = searchParams.get("order");

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [orderItems, setOrderItems] = useState<OrderItemOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [canFileComplaint, setCanFileComplaint] = useState<boolean | null>(null);
  const [cannotFileReason, setCannotFileReason] = useState<string>("");

  const form = useForm<CreateComplaintInput>({
    resolver: zodResolver(createComplaintSchema),
    defaultValues: {
      orderItemId: orderItemIdParam || "",
      title: "",
      content: "",
      category: undefined,
      subcategory: undefined,
      evidence: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "evidence",
  });

  useEffect(() => {
    const fetchOrderItems = async () => {
      setIsLoadingOrders(true);
      try {
        const result = await orderService.getMyOrders({ limit: 50 });

        const items: OrderItemOption[] = [];
        for (const order of result.orders) {
          try {
            const orderDetail = await orderService.getOrderByCode(order.orderCode);
            for (const item of orderDetail.items) {
              if (["Delivered", "Completed"].includes(item.itemStatus)) {
                items.push({
                  id: item._id,
                  orderId: order._id,
                  orderCode: order.orderCode,
                  productTitle: item.productId?.title || "Sản phẩm",
                  shopName: item.shopId?.name || "Shop",
                  amount: item.subtotal,
                  status: item.itemStatus,
                  createdAt: item.createdAt,
                });
              }
            }
          } catch {
            // ignore
          }
        }

        setOrderItems(items);

        if (orderItemIdParam) {
          try {
            const checkResult = await complaintService.checkCanFileComplaint(orderItemIdParam);
            setCanFileComplaint(checkResult.canFile);
            if (!checkResult.canFile) {
              setCannotFileReason(checkResult.reason || "Không thể tạo khiếu nại cho sản phẩm này");
            }
          } catch {
            setCanFileComplaint(true);
          }
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        toast.error("Không thể tải danh sách đơn hàng");
      } finally {
        setIsLoadingOrders(false);
      }
    };

    fetchOrderItems();
  }, [orderItemIdParam]);

  const handleOrderItemChange = async (orderItemId: string) => {
    form.setValue("orderItemId", orderItemId);
    try {
      const checkResult = await complaintService.checkCanFileComplaint(orderItemId);
      setCanFileComplaint(checkResult.canFile);
      setCannotFileReason(checkResult.canFile ? "" : checkResult.reason || "Không thể tạo khiếu nại");
    } catch {
      setCanFileComplaint(true);
      setCannotFileReason("");
    }
  };

  const onSubmit = async (data: CreateComplaintInput) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const complaint = await complaintService.createComplaint(data);
      toast.success("Khiếu nại đã được tạo thành công!");
      router.replace(`/customer/complaints/${complaint._id}`);
    } catch (error: any) {
      if (error?.message?.includes("Đã có khiếu nại đang xử lý")) {
        toast.info(error.message);

        const match = String(error.message).match(/\(Mã:\s*(TKT-[A-Z0-9-]+)\)/i);
        const ticketCode = match?.[1];

        if (ticketCode) {
          try {
            const myComplaints = await complaintService.getMyComplaints({ limit: 100 });
            const found = myComplaints.tickets.find((t) => t.ticketCode === ticketCode);
            if (found?._id) {
              router.replace(`/customer/complaints/${found._id}`);
              return;
            }
          } catch {
            // ignore
          }
        }

        router.replace("/customer/complaints");
      } else {
        toast.error(error?.message || "Không thể tạo khiếu nại");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

  return (
    <RequireAuth>
      <div className="container py-8 max-w-5xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
              <Link href="/customer/orders">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
            <h1 className="text-4xl font-bold tracking-tight">Tạo khiếu nại</h1>
            <p className="text-muted-foreground mt-1">Gửi yêu cầu giải quyết tranh chấp đơn hàng</p>
            </div>
          </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(180px,auto)]">
              <div className="md:col-span-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Alert className="bg-blue-50/50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-700 dark:text-blue-400">Quy trình</AlertTitle>
                    <AlertDescription className="text-blue-600/80 dark:text-blue-400/80">
                      Sau khi tạo, Moderator sẽ xem xét trong 24-48h. Bạn có 72h để kháng cáo sau quyết định.
            </AlertDescription>
          </Alert>

          {canFileComplaint === false && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Hạn chế</AlertTitle>
              <AlertDescription>{cannotFileReason}</AlertDescription>
            </Alert>
          )}
                </div>
              </div>

              <Card className="md:col-span-5 overflow-hidden border-2 transition-all hover:border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Package className="h-5 w-5 text-primary" />
                    Sản phẩm khiếu nại
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingOrders ? (
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ) : (
                    <FormField
                      control={form.control}
                      name="orderItemId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Sản phẩm *</FormLabel>
                          <Select onValueChange={handleOrderItemChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12">
                                <SelectValue placeholder="Chọn sản phẩm cần hỗ trợ" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {orderItems.map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                  <div className="flex flex-col text-left py-1">
                                    <span className="font-semibold text-sm line-clamp-1">{item.productTitle}</span>
                                    <span className="text-[10px] opacity-70 uppercase tracking-wider">
                                      {item.orderCode} • {formatPrice(item.amount)} • {item.shopName}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>

              <Card className="md:col-span-7 border-2 transition-all hover:border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Phân loại vấn đề</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Loại chính *</FormLabel>
                        <Select
                          onValueChange={(v) => {
                            field.onChange(v);
                            setSelectedCategory(v);
                            form.setValue("subcategory", undefined);
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn nhóm lỗi" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CATEGORY_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                <div className="text-left">
                                  <p className="font-medium">{opt.label}</p>
                                  <p className="text-[10px] opacity-60">{opt.description}</p>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                    <FormField
                      control={form.control}
                      name="subcategory"
                      render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Chi tiết *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!selectedCategory}>
                            <FormControl>
                              <SelectTrigger>
                              <SelectValue placeholder="Chọn chi tiết" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {(SUBCATEGORY_OPTIONS[selectedCategory] || []).map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </CardContent>
              </Card>

              <Card className="md:col-span-8 border-2 transition-all hover:border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Chi tiết sự việc</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Tiêu đề *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ví dụ: Tài khoản bị đổi mật khẩu sau 2h..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Mô tả chi tiết *</FormLabel>
                        <FormControl>
                          <Textarea
                            className="min-h-[140px] resize-none"
                            placeholder="Mô tả rõ vấn đề, thời điểm xảy ra và những gì bạn đã thử..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card className="md:col-span-4 border-2 border-dashed bg-muted/30 transition-all hover:bg-muted/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold uppercase text-muted-foreground flex justify-between items-center">
                    Bằng chứng ({fields.length}/10)
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => append({ type: "Screenshot", url: "", description: "" })}
                      disabled={fields.length >= 10}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                  {fields.length === 0 ? (
                    <div className="text-center py-8 opacity-40 italic text-xs">Chưa có bằng chứng nào được thêm</div>
                  ) : (
                    fields.map((row, index) => (
                      <div key={row.id} className="p-3 bg-background rounded-lg border shadow-sm space-y-2 relative group">
                <Button
                  type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>

                        <div className="flex gap-2">
                          <FormField
                            control={form.control}
                            name={`evidence.${index}.type`}
                            render={({ field }) => (
                              <FormItem className="w-[120px]">
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-8 text-[10px]">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {EVIDENCE_TYPES.map((t) => (
                                      <SelectItem key={t.value} value={t.value} className="text-[10px]">
                                        <div className="flex items-center gap-1">
                                          <t.icon className="h-3 w-3" />
                                          {t.label}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`evidence.${index}.url`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input className="h-8 text-[10px]" placeholder="Link ảnh/video..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name={`evidence.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input className="h-7 text-[10px] bg-muted/30" placeholder="Mô tả ngắn (tuỳ chọn)" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <div className="md:col-span-12 flex justify-end gap-4 mt-2">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading} className="rounded-xl px-8">
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || canFileComplaint === false || orderItems.length === 0}
                  className="rounded-xl px-10 font-bold"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Gửi khiếu nại
                    </>
                  )}
                </Button>
              </div>
              </div>
            </form>
          </Form>
      </div>
    </RequireAuth>
  );
}

export default function CreateComplaintPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-8 max-w-5xl space-y-8">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[600px]">
            <Skeleton className="md:col-span-5 h-full" />
            <Skeleton className="md:col-span-7 h-full" />
          </div>
        </div>
      }
    >
      <CreateComplaintContent />
    </Suspense>
  );
}
