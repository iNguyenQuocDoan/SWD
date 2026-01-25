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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { shopService, Shop } from "@/lib/services/shop.service";
import { productService, Product } from "@/lib/services/product.service";
import { reviewService, Review, ShopRatingStats } from "@/lib/services/review.service";
import { toast } from "sonner";
import {
  Store,
  Package,
  Star,
  Plus,
  Edit,
  Trash2,
  Eye,
  ShoppingBag,
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function SellerShopPage() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingStats, setRatingStats] = useState<ShopRatingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("products");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Delete dialog states
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchShopData();
  }, []);

  const fetchShopData = async () => {
    try {
      setIsLoading(true);
      const shopData = await shopService.getMyShop();

      if (!shopData) {
        toast.error("Bạn chưa có shop. Vui lòng đăng ký bán hàng trước.");
        return;
      }

      setShop(shopData);

      // Fetch products and reviews in parallel
      const [productsData, reviewsData, statsData] = await Promise.all([
        productService.getMyProducts(shopData._id),
        reviewService.getReviewsByShop(shopData._id, 1, 10),
        reviewService.getShopRatingStats(shopData._id),
      ]);

      setProducts(productsData);
      setReviews(reviewsData.reviews);
      setRatingStats(statsData);
    } catch (error) {
      console.error("Error fetching shop data:", error);
      toast.error("Lỗi khi tải dữ liệu shop");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteProductId) return;

    try {
      setIsDeleting(true);
      await productService.deleteProduct(deleteProductId);
      toast.success("Đã xóa sản phẩm thành công");
      setProducts((prev) => prev.filter((p) => p._id !== deleteProductId));
      setDeleteProductId(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Lỗi khi xóa sản phẩm");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProducts =
    statusFilter === "all"
      ? products
      : products.filter((p) => p.status === statusFilter);

  const getProductStatusBadge = (status: Product["status"]) => {
    switch (status) {
      case "Pending":
        return (
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            Chờ duyệt
          </Badge>
        );
      case "Approved":
        return (
          <Badge variant="default">
            <CheckCircle className="mr-1 h-3 w-3" />
            Đã duyệt
          </Badge>
        );
      case "Rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Từ chối
          </Badge>
        );
      case "Hidden":
        return (
          <Badge variant="outline">
            <AlertCircle className="mr-1 h-3 w-3" />
            Ẩn
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getShopStatusBadge = (status: Shop["status"]) => {
    switch (status) {
      case "Pending":
        return <Badge variant="secondary">Chờ duyệt</Badge>;
      case "Active":
        return <Badge variant="default">Hoạt động</Badge>;
      case "Suspended":
        return <Badge variant="destructive">Tạm ngưng</Badge>;
      case "Closed":
        return <Badge variant="outline">Đã đóng</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <RequireAuth>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </RequireAuth>
    );
  }

  if (!shop) {
    return (
      <RequireAuth>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Store className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                Bạn chưa có shop
              </h2>
              <p className="text-muted-foreground mb-4">
                Vui lòng đăng ký bán hàng để bắt đầu
              </p>
              <Button asChild>
                <Link href="/customer/become-seller">Đăng ký bán hàng</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold">{shop.shopName}</h1>
              {getShopStatusBadge(shop.status)}
            </div>
            <p className="text-muted-foreground">
              {shop.description || "Chưa có mô tả"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/seller/shop/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa Shop
              </Link>
            </Button>
            <Button asChild disabled={shop.status !== "Active"}>
              <Link href="/seller/products/create">
                <Plus className="mr-2 h-4 w-4" />
                Thêm sản phẩm
              </Link>
            </Button>
          </div>
        </div>

        {/* Shop Registration Status Card */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              <CardTitle>Trạng thái đăng ký Shop</CardTitle>
            </div>
            <CardDescription>
              Theo dõi trạng thái đăng ký bán hàng của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status Display */}
            <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">Trạng thái hiện tại:</span>
                  {getShopStatusBadge(shop.status)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {shop.status === "Pending" && "Đơn đăng ký của bạn đang chờ moderator xem xét và duyệt. Vui lòng chờ trong giây lát."}
                  {shop.status === "Active" && "Shop của bạn đã được duyệt và đang hoạt động. Bạn có thể bắt đầu bán hàng!"}
                  {shop.status === "Suspended" && "Shop của bạn đã bị tạm ngưng hoạt động. Vui lòng liên hệ admin để biết thêm chi tiết."}
                  {shop.status === "Closed" && "Shop của bạn đã bị đóng hoặc từ chối. Vui lòng liên hệ admin nếu bạn có thắc mắc."}
                </p>
              </div>
              {shop.status === "Pending" && (
                <Clock className="h-8 w-8 text-orange-500 flex-shrink-0" />
              )}
              {shop.status === "Active" && (
                <CheckCircle className="h-8 w-8 text-green-500 flex-shrink-0" />
              )}
              {shop.status === "Suspended" && (
                <AlertCircle className="h-8 w-8 text-red-500 flex-shrink-0" />
              )}
              {shop.status === "Closed" && (
                <XCircle className="h-8 w-8 text-gray-500 flex-shrink-0" />
              )}
            </div>

            {/* Registration Details */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">
                  Ngày đăng ký
                </Label>
                <p className="text-sm">{formatDate(shop.createdAt)}</p>
              </div>
              {shop.approvedAt && (
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Ngày được duyệt
                  </Label>
                  <p className="text-sm">{formatDate(shop.approvedAt)}</p>
                </div>
              )}
            </div>

            {/* Moderator Note */}
            {shop.moderatorNote && (
              <div className="space-y-2 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Ghi chú từ Moderator
                </Label>
                <p className="text-sm">{shop.moderatorNote}</p>
              </div>
            )}

            {/* Action Messages */}
            {shop.status === "Pending" && (
              <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-orange-900 dark:text-orange-200">
                      Đang chờ duyệt
                    </p>
                    <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                      Shop của bạn đang chờ moderator xem xét. Bạn sẽ nhận được thông báo khi shop được duyệt hoặc từ chối.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {shop.status === "Active" && (
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900 dark:text-green-200">
                      Shop đã được duyệt
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Chúc mừng! Shop của bạn đã được duyệt và sẵn sàng để bán hàng. Bạn có thể bắt đầu thêm sản phẩm ngay bây giờ.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {shop.status === "Closed" && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900 dark:text-red-200">
                      Shop đã bị đóng
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      Shop của bạn đã bị đóng hoặc từ chối. {shop.moderatorNote ? "Vui lòng xem ghi chú từ moderator ở trên." : "Vui lòng liên hệ admin để biết thêm chi tiết."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {shop.status === "Suspended" && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
                      Shop bị tạm ngưng
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      Shop của bạn đã bị tạm ngưng hoạt động. {shop.moderatorNote ? "Vui lòng xem ghi chú từ moderator ở trên." : "Vui lòng liên hệ admin để biết thêm chi tiết."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sản phẩm</CardTitle>
              <Package className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground">
                {products.filter((p) => p.status === "Approved").length} đang bán
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đánh giá TB</CardTitle>
              <Star className="h-5 w-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {ratingStats?.averageRating.toFixed(1) || "0.0"}
              </div>
              <p className="text-xs text-muted-foreground">
                {ratingStats?.totalReviews || 0} đánh giá
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đơn hàng</CardTitle>
              <ShoppingBag className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{shop.totalSales}</div>
              <p className="text-xs text-muted-foreground">Tổng đơn hàng</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
              <Clock className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {products.filter((p) => p.status === "Pending").length}
              </div>
              <p className="text-xs text-muted-foreground">Sản phẩm chờ duyệt</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="products">
              <Package className="mr-2 h-4 w-4" />
              Sản phẩm ({products.length})
            </TabsTrigger>
            <TabsTrigger value="reviews">
              <MessageSquare className="mr-2 h-4 w-4" />
              Đánh giá ({ratingStats?.totalReviews || 0})
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Danh sách sản phẩm</CardTitle>
                    <CardDescription>
                      Quản lý sản phẩm của shop
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Lọc theo trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="Approved">Đã duyệt</SelectItem>
                        <SelectItem value="Pending">Chờ duyệt</SelectItem>
                        <SelectItem value="Rejected">Từ chối</SelectItem>
                        <SelectItem value="Hidden">Ẩn</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button asChild>
                      <Link href="/seller/products/create">
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Không có sản phẩm
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {statusFilter === "all"
                        ? "Bạn chưa có sản phẩm nào. Hãy thêm sản phẩm đầu tiên!"
                        : "Không có sản phẩm với trạng thái này"}
                    </p>
                    {statusFilter === "all" && (
                      <Button asChild>
                        <Link href="/seller/products/create">Thêm sản phẩm</Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredProducts.map((product) => (
                      <div
                        key={product._id}
                        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <h3 className="font-semibold">{product.title}</h3>
                              <div className="flex items-center gap-3 mt-2 flex-wrap">
                                {getProductStatusBadge(product.status)}
                                <Badge variant="outline">
                                  {product.planType}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {formatPrice(product.price)}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {product.durationDays} ngày
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/seller/products/${product._id}`}>
                              <Eye className="mr-1 h-4 w-4" />
                              Xem
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/seller/products/${product._id}/edit`}>
                              <Edit className="mr-1 h-4 w-4" />
                              Sửa
                            </Link>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteProductId(product._id)}
                          >
                            <Trash2 className="mr-1 h-4 w-4" />
                            Xóa
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-4">
            {/* Rating Distribution */}
            {ratingStats && (
              <Card>
                <CardHeader>
                  <CardTitle>Phân bố đánh giá</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <div className="text-4xl font-bold">
                        {ratingStats.averageRating.toFixed(1)}
                      </div>
                      <div className="flex justify-center mt-1">
                        {renderStars(Math.round(ratingStats.averageRating))}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {ratingStats.totalReviews} đánh giá
                      </p>
                    </div>
                    <div className="flex-1 space-y-2">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = ratingStats.ratingDistribution[star] || 0;
                        const percentage =
                          ratingStats.totalReviews > 0
                            ? (count / ratingStats.totalReviews) * 100
                            : 0;
                        return (
                          <div key={star} className="flex items-center gap-2">
                            <span className="text-sm w-3">{star}</span>
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-yellow-400 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground w-8">
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews List */}
            <Card>
              <CardHeader>
                <CardTitle>Đánh giá gần đây</CardTitle>
                <CardDescription>
                  Đánh giá từ khách hàng
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Chưa có đánh giá
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Shop của bạn chưa nhận được đánh giá nào
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => {
                      const user =
                        typeof review.userId === "object"
                          ? review.userId
                          : null;
                      return (
                        <div
                          key={review._id}
                          className="p-4 border rounded-lg space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                {user?.fullName?.charAt(0) || "U"}
                              </div>
                              <div>
                                <p className="font-medium text-sm">
                                  {user?.fullName || "Người dùng"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(review.createdAt)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                          <p className="text-sm">{review.comment}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={!!deleteProductId}
          onOpenChange={() => setDeleteProductId(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận xóa sản phẩm</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể
                hoàn tác.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteProductId(null)}
                disabled={isDeleting}
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteProduct}
                disabled={isDeleting}
              >
                {isDeleting ? "Đang xóa..." : "Xóa sản phẩm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RequireAuth>
  );
}
