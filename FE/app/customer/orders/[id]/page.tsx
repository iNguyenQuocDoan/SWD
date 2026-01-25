"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertIcon } from "@/components/ui/alert";
import { RequireAuth } from "@/components/auth/RequireAuth";
import {
  Package,
  Clock,
  CheckCircle,
  Copy,
  Download,
  AlertCircle,
  Shield,
  Lock,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Types for backend data
type OrderStatus = "pending_payment" | "paid" | "processing" | "completed" | "refunded" | "cancelled";
type PaymentStatus = "pending" | "escrow" | "available" | "paid_out";

interface TimelineItem {
  status: string;
  title: string;
  description: string;
  timestamp: string | null;
  completed: boolean;
}

interface SubOrder {
  id: string;
  productTitle: string;
  sellerName: string;
  amount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  licenseKey: string;
  activatedAt?: string;
  completedAt?: string;
  timeline: TimelineItem[];
}

interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  paymentMethod: string;
  totalAmount: number;
  subOrders: SubOrder[];
}

const statusConfig = {
  pending_payment: {
    label: "Chờ thanh toán",
    variant: "secondary" as const,
    color: "text-gray-600",
  },
  paid: {
    label: "Đã thanh toán",
    variant: "default" as const,
    color: "text-blue-600",
  },
  processing: {
    label: "Đang xử lý",
    variant: "default" as const,
    color: "text-orange-600",
  },
  completed: {
    label: "Hoàn tất",
    variant: "default" as const,
    color: "text-green-600",
  },
  refunded: {
    label: "Đã hoàn tiền",
    variant: "secondary" as const,
    color: "text-gray-600",
  },
  cancelled: {
    label: "Đã hủy",
    variant: "destructive" as const,
    color: "text-red-600",
  },
};

const paymentStatusConfig = {
  pending: {
    label: "Chờ thanh toán",
    variant: "secondary" as const,
    icon: Clock,
  },
  escrow: {
    label: "Đang giữ (Escrow)",
    variant: "default" as const,
    icon: Shield,
  },
  available: {
    label: "Sẵn sàng chi trả",
    variant: "default" as const,
    icon: CheckCircle,
  },
  paid_out: {
    label: "Đã chi trả",
    variant: "default" as const,
    icon: CheckCircle,
  },
};

export default function CustomerOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);
      try {
        // TODO: Fetch from backend
        // const orderData = await orderService.getOrderById(params.id);
        // setOrder(orderData);
      } catch (error) {
        console.error("Failed to fetch order:", error);
        toast.error("Không thể tải thông tin đơn hàng");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [params.id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Đã sao chép vào clipboard");
  };

  const handleConfirmActivation = async (subOrderId: string) => {
    try {
      // TODO: Call backend API
      // await orderService.confirmActivation(subOrderId);
      toast.success("Đã xác nhận kích hoạt thành công. Tiền sẽ được chuyển cho seller.");
      // Refresh order data
      // fetchOrder();
    } catch (error) {
      console.error("Failed to confirm activation:", error);
      toast.error("Không thể xác nhận kích hoạt");
    }
  };

  const handleReportIssue = (subOrderId: string) => {
    router.push(`/customer/tickets/create?order=${subOrderId}`);
  };

  if (isLoading) {
    return (
      <RequireAuth>
        <div className="container py-6 md:py-8 max-w-5xl">
          <div className="space-y-6">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </RequireAuth>
    );
  }

  if (!order) {
    return (
      <RequireAuth>
        <div className="container py-6 md:py-8 max-w-5xl">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Không tìm thấy đơn hàng</h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-4">
                Đơn hàng này không tồn tại hoặc bạn không có quyền xem.
              </p>
              <Button onClick={() => router.push("/customer/orders")} variant="default">
                Quay lại danh sách
              </Button>
            </CardContent>
          </Card>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div className="container py-6 md:py-8 max-w-5xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Đơn hàng #{order.id}</h1>
            <p className="text-muted-foreground">
              Ngày đặt: {order.date}
            </p>
          </div>
          <Badge
            variant={statusConfig[order.status].variant}
            className="text-sm px-3 py-1"
          >
            {statusConfig[order.status].label}
          </Badge>
        </div>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin đơn hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Mã đơn hàng</p>
                <p className="font-medium">{order.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Trạng thái</p>
                <Badge variant={statusConfig[order.status].variant}>
                  {statusConfig[order.status].label}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Phương thức thanh toán
                </p>
                <p className="font-medium">{order.paymentMethod}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Tổng tiền</p>
                <p className="font-bold text-lg text-primary">
                  {formatPrice(order.totalAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SubOrders */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Chi tiết đơn hàng</h2>

          {order.subOrders.map((subOrder, index) => {
            const PaymentStatusIcon = paymentStatusConfig[subOrder.paymentStatus].icon;
            const currentStatus = statusConfig[subOrder.status];

            return (
              <Card key={subOrder.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{subOrder.productTitle}</CardTitle>
                      <CardDescription>
                        Seller: <span className="font-medium">{subOrder.sellerName}</span>
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-2">
                      <p className="text-xl font-bold text-primary">
                        {formatPrice(subOrder.amount)}
                      </p>
                      <Badge
                        variant={currentStatus.variant}
                        className={currentStatus.color}
                      >
                        {currentStatus.label}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 pt-6">
                  {/* Payment Status */}
                  <Alert
                    variant={
                      subOrder.paymentStatus === "paid_out"
                        ? "success"
                        : subOrder.paymentStatus === "escrow"
                        ? "info"
                        : "default"
                    }
                  >
                    <PaymentStatusIcon className="h-4 w-4" />
                    <AlertDescription>
                      <div>
                        <p className="font-semibold mb-1">
                          Trạng thái thanh toán:{" "}
                          {paymentStatusConfig[subOrder.paymentStatus].label}
                        </p>
                        {subOrder.paymentStatus === "escrow" ? (
                          <p className="text-sm">
                            Tiền đang được giữ. Vui lòng xác nhận sau khi kích hoạt thành
                            công để tiền được chuyển cho seller.
                          </p>
                        ) : subOrder.paymentStatus === "paid_out" ? (
                          <p className="text-sm">
                            Tiền đã được chuyển từ Escrow cho seller sau khi bạn xác nhận
                            kích hoạt.
                          </p>
                        ) : null}
                      </div>
                    </AlertDescription>
                  </Alert>

                  <Separator />

                  {/* Digital Delivery */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-lg">
                        Thông tin tài khoản của bạn
                      </h3>
                    </div>

                    <Card className="border-primary/50 bg-primary/5">
                      <CardContent className="p-4 space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-4 flex-wrap">
                            <code className="text-base md:text-lg font-mono font-bold break-all">
                              {subOrder.licenseKey}
                            </code>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCopy(subOrder.licenseKey)}
                              className="flex-shrink-0"
                            >
                              <Copy className="mr-2 h-3 w-3" />
                              Sao chép
                            </Button>
                          </div>
                        </div>

                        {subOrder.activatedAt && (
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-muted-foreground">
                              Đã kích hoạt lúc: {subOrder.activatedAt}
                            </span>
                          </div>
                        )}

                        <div className="bg-background/50 p-3 rounded-md space-y-1 text-xs">
                          <p className="font-semibold flex items-center gap-2">
                            <Lock className="h-3 w-3" />
                            Lưu ý bảo mật:
                          </p>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            <li>Không chia sẻ thông tin đăng nhập với người khác</li>
                            <li>Thay đổi mật khẩu sau khi nhận tài khoản</li>
                            <li>Bảo mật thông tin để tránh bị thu hồi</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      {subOrder.status === "processing" &&
                        subOrder.paymentStatus === "escrow" && (
                          <>
                            <Button
                              variant="default"
                              onClick={() => handleConfirmActivation(subOrder.id)}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Xác nhận đã kích hoạt
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleReportIssue(subOrder.id)}
                            >
                              <AlertCircle className="mr-2 h-4 w-4" />
                              Báo cáo vấn đề
                            </Button>
                          </>
                        )}
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/help">
                          <Download className="mr-2 h-3 w-3" />
                          Tải hướng dẫn
                        </Link>
                      </Button>
                    </div>

                    {subOrder.status === "processing" && (
                      <p className="text-xs text-muted-foreground">
                        💡 Sau khi xác nhận, tiền sẽ được chuyển cho seller và đơn hàng
                        hoàn tất.
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* Timeline */}
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Tiến trình đơn hàng
                    </h4>
                    <div className="space-y-4">
                      {subOrder.timeline.map((item, idx) => {
                        const isLast = idx === subOrder.timeline.length - 1;
                        return (
                          <div key={idx} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div
                                className={`h-3 w-3 rounded-full ${
                                  item.completed
                                    ? "bg-green-600"
                                    : "bg-gray-300 border-2 border-gray-400"
                                }`}
                              />
                              {!isLast && (
                                <div
                                  className={`w-0.5 h-full min-h-[60px] ${
                                    item.completed
                                      ? "bg-green-600"
                                      : "bg-gray-300"
                                  }`}
                                />
                              )}
                            </div>
                            <div className="flex-1 pb-6">
                              <div className="flex items-start justify-between gap-4 flex-wrap">
                                <div>
                                  <p
                                    className={`font-medium ${
                                      item.completed ? "" : "text-muted-foreground"
                                    }`}
                                  >
                                    {item.title}
                                  </p>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {item.description}
                                  </p>
                                </div>
                                {item.timestamp && (
                                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {item.timestamp}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Support Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Cần hỗ trợ?
            </CardTitle>
            <CardDescription>
              Nếu gặp vấn đề với sản phẩm hoặc đơn hàng, vui lòng tạo yêu cầu hỗ trợ
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button
              variant="default"
              onClick={() => router.push(`/customer/tickets/create?order=${order.id}`)}
            >
              Tạo yêu cầu hỗ trợ
            </Button>
            <Button variant="outline" asChild>
              <Link href="/customer/tickets">Xem lịch sử hỗ trợ</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
    </RequireAuth>
  );
}
