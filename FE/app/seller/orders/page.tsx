"use client";

import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { orderService, type SellerOrderItem } from "@/lib/services/order.service";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

const formatDateTime = (value?: string | Date | null) => {
  if (!value) return "-";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("vi-VN");
};

export default function SellerOrdersPage() {
  const [items, setItems] = useState<SellerOrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCredentials, setVisibleCredentials] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await orderService.getSellerOrderItems({ limit: 100 });
        setItems(res.items);
      } catch (error) {
        console.error("Failed to fetch seller order items:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <RequireAuth requiredRole="seller">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold">Lịch sử bán hàng</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Xem lại các đơn hàng đã bán để hỗ trợ xử lý tranh chấp với khách.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Đơn hàng theo item</CardTitle>
            <CardDescription>
              Mỗi dòng là một item đã bán (liên kết với một key/tài khoản trong inventory).
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có đơn hàng nào.</p>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã đơn</TableHead>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Khách hàng</TableHead>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead>Giá / SL</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Key đã giao</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-xs md:text-sm">
                          {item.orderCode || "-"}
                        </TableCell>
                        <TableCell className="text-xs md:text-sm">
                          {formatDateTime(item.deliveredAt || item.createdAt)}
                        </TableCell>
                        <TableCell className="text-xs md:text-sm">
                          {item.customer ? (
                            <div className="space-y-0.5">
                              <div className="font-medium">{item.customer.fullName || "N/A"}</div>
                              <div className="text-muted-foreground">{item.customer.email}</div>
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-xs md:text-sm">
                          {item.product ? (
                            <div className="flex items-center gap-3">
                              {item.product.thumbnailUrl && (
                                <div className="h-10 w-10 rounded-md overflow-hidden bg-muted border">
                                  <img
                                    src={item.product.thumbnailUrl}
                                    alt={item.product.title}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="space-y-0.5">
                                <div className="font-medium line-clamp-2">{item.product.title}</div>
                                <div className="text-muted-foreground text-[11px] md:text-xs">
                                  {item.product.planType} • {item.product.durationDays} ngày
                                </div>
                              </div>
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-xs md:text-sm">
                          <div className="space-y-0.5">
                            <div>{formatPrice(item.unitPrice)}</div>
                            <div className="text-muted-foreground text-[11px] md:text-xs">
                              SL: {item.quantity} • Tổng: {formatPrice(item.subtotal)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs md:text-sm">
                          <div className="flex flex-col gap-1">
                            <Badge variant="outline" className="w-fit">
                              {item.itemStatus}
                            </Badge>
                            <Badge variant="outline" className="w-fit text-[11px]">
                              {item.holdStatus} • {formatPrice(item.holdAmount)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs md:text-sm max-w-xs">
                          {item.credential ? (
                            <div className="flex items-center gap-2">
                              <span className="font-mono break-all">
                                {visibleCredentials[item.id]
                                  ? item.credential
                                  : "••••••••••••••••••••••••••"}
                              </span>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() =>
                                  setVisibleCredentials((prev) => ({
                                    ...prev,
                                    [item.id]: !prev[item.id],
                                  }))
                                }
                              >
                                {visibleCredentials[item.id] ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RequireAuth>
  );
}

