"use client";

import { useState, useEffect } from "react";
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
import { RequireAuth } from "@/components/auth/RequireAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import {
  DollarSign,
  Package,
  Clock,
  TrendingUp,
  Plus,
  AlertCircle,
  ShoppingBag,
  CheckCircle,
  Store,
} from "lucide-react";

// Types for backend data
interface Product {
  id: string;
  title: string;
  status: "approved" | "pending_review" | "draft" | "suspended";
  price: number;
  stock: number;
  sales: number;
}

interface SellerStats {
  escrowAmount: number;
  availableAmount: number;
  paidOutAmount: number;
  activeProducts: number;
  pendingProducts: number;
  totalOrders: number;
  weeklyOrders: number;
  avgRating: number;
  totalReviews: number;
}

interface Order {
  id: string;
  product: string;
  amount: number;
  status: "processing" | "pending" | "completed";
  date: string;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

export default function SellerDashboard() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<SellerStats>({
    escrowAmount: 0,
    availableAmount: 0,
    paidOutAmount: 0,
    activeProducts: 0,
    pendingProducts: 0,
    totalOrders: 0,
    weeklyOrders: 0,
    avgRating: 0,
    totalReviews: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // TODO: Fetch from backend
        // const [productsRes, ordersRes, statsRes] = await Promise.all([
        //   productService.getMyProducts(),
        //   orderService.getMyOrders(),
        //   sellerService.getStats(),
        // ]);
        // setProducts(productsRes);
        // setOrders(ordersRes);
        // setStats(statsRes);
      } catch (error) {
        console.error("Failed to fetch seller data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts =
    statusFilter === "all"
      ? products
      : products.filter((p) => p.status === statusFilter);

  return (
    <RequireAuth requiredRole="seller">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16 space-y-8 md:space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">Dashboard Seller</h1>
          <p className="text-base md:text-lg text-muted-foreground">
            Quản lý shop và sản phẩm của bạn
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="lg" className="h-12 md:h-14 text-base md:text-lg" asChild>
            <Link href="/seller/shop">
              <Store className="mr-2 h-5 w-5" />
              Xem Shop
            </Link>
          </Button>
          <Button size="lg" className="h-12 md:h-14 text-base md:text-lg" asChild>
            <Link href="/seller/products/create">
              <Plus className="mr-2 h-5 w-5" />
              Thêm sản phẩm
            </Link>
          </Button>
        </div>
      </div>

      {/* Financial Stats */}
      <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base md:text-lg font-medium">
              Đang giữ (Escrow)
            </CardTitle>
            <Clock className="h-6 w-6 md:h-7 md:w-7 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-40" />
            ) : (
              <>
                <div className="text-3xl md:text-4xl font-bold text-orange-600">
                  {formatPrice(stats.escrowAmount)}
                </div>
                <p className="text-sm md:text-base text-muted-foreground mt-2">
                  Đang chờ customer xác nhận
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base md:text-lg font-medium">Sẵn sàng</CardTitle>
            <DollarSign className="h-6 w-6 md:h-7 md:w-7 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-40" />
            ) : (
              <>
                <div className="text-3xl md:text-4xl font-bold text-green-600">
                  {formatPrice(stats.availableAmount)}
                </div>
                <p className="text-sm md:text-base text-muted-foreground mt-2">
                  Sẵn sàng để chi trả
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base md:text-lg font-medium">Đã nhận</CardTitle>
            <TrendingUp className="h-6 w-6 md:h-7 md:w-7 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-40" />
            ) : (
              <>
                <div className="text-3xl md:text-4xl font-bold">
                  {formatPrice(stats.paidOutAmount)}
                </div>
                <p className="text-sm md:text-base text-muted-foreground mt-2">Tổng đã nhận</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Product Stats */}
      <div className="grid gap-6 md:gap-8 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base md:text-lg font-medium">
              Sản phẩm active
            </CardTitle>
            <Package className="h-6 w-6 md:h-7 md:w-7 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <>
                <div className="text-3xl md:text-4xl font-bold">{stats.activeProducts}</div>
                <p className="text-sm md:text-base text-muted-foreground mt-2">Đang bán</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base md:text-lg font-medium">
              Chờ duyệt
            </CardTitle>
            <AlertCircle className="h-6 w-6 md:h-7 md:w-7 text-orange-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <>
                <div className="text-3xl md:text-4xl font-bold text-orange-600">{stats.pendingProducts}</div>
                <p className="text-sm md:text-base text-muted-foreground mt-2">Đang kiểm duyệt</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base md:text-lg font-medium">Đơn hàng</CardTitle>
            <ShoppingBag className="h-6 w-6 md:h-7 md:w-7 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <>
                <div className="text-3xl md:text-4xl font-bold">{stats.totalOrders}</div>
                <p className="text-sm md:text-base text-muted-foreground mt-2">
                  {stats.weeklyOrders > 0 ? `+${stats.weeklyOrders} tuần này` : "Tuần này"}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base md:text-lg font-medium">Đánh giá TB</CardTitle>
            <CheckCircle className="h-6 w-6 md:h-7 md:w-7 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <>
                <div className="text-3xl md:text-4xl font-bold">
                  {stats.avgRating > 0 ? `${stats.avgRating} ⭐` : "- ⭐"}
                </div>
                <p className="text-sm md:text-base text-muted-foreground mt-2">{stats.totalReviews} đánh giá</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Products Management */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Sản phẩm của bạn</CardTitle>
              <CardDescription>
                Quản lý và theo dõi sản phẩm của bạn
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="approved">Đã duyệt</SelectItem>
                  <SelectItem value="pending_review">Chờ duyệt</SelectItem>
                  <SelectItem value="draft">Bản nháp</SelectItem>
                  <SelectItem value="suspended">Đã khóa</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" asChild>
                <Link href="/seller/products">Xem tất cả</Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Không có sản phẩm</h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-4">
                  {statusFilter === "all"
                    ? "Bạn chưa có sản phẩm nào. Hãy tạo sản phẩm đầu tiên của bạn."
                    : "Không có sản phẩm với trạng thái này."}
                </p>
                {statusFilter === "all" && (
                  <Button asChild>
                    <Link href="/seller/products/create">Thêm sản phẩm</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold">{product.title}</h3>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <Badge
                            variant={
                              product.status === "approved"
                                ? "default"
                                : product.status === "pending_review"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {product.status === "approved"
                              ? "Đã duyệt"
                              : product.status === "pending_review"
                              ? "Chờ duyệt"
                              : "Bản nháp"}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Giá: {formatPrice(product.price)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            Tồn kho: {product.stock}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            Đã bán: {product.sales}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/seller/products/${product.id}/edit`}>
                        Chỉnh sửa
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Đơn hàng gần đây</CardTitle>
              <CardDescription>Các đơn hàng cần xử lý</CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link href="/seller/orders">Xem tất cả</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                Chưa có đơn hàng nào.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{order.product}</p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="text-sm text-muted-foreground">
                        {order.id}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {order.date}
                      </span>
                      <Badge
                        variant={
                          order.status === "processing"
                            ? "default"
                            : order.status === "pending"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {order.status === "processing"
                          ? "Đang xử lý"
                          : order.status === "pending"
                          ? "Chờ xử lý"
                          : "Hoàn tất"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-bold text-lg">
                      {formatPrice(order.amount)}
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/seller/orders/${order.id}`}>Xem chi tiết</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </RequireAuth>
  );
}
