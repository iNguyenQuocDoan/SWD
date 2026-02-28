"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { shopService, Shop, ShopStats } from "@/lib/services/shop.service";
import {
  productService,
  type ProductResponse,
} from "@/lib/services/product.service";
import { reviewService, Review, ShopRatingStats } from "@/lib/services/review.service";
import { inventoryService, type InventoryItem } from "@/lib/services/inventory.service";
import { updateProductSchema, type UpdateProductInput } from "@/lib/validations";
import { toast } from "sonner";
import {
  Store,
  Package,
  Star,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Eye,
  ShoppingBag,
  MessageSquare,
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Database,
  Reply,
  BarChart3,
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

export default function SellerHome() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingStats, setRatingStats] = useState<ShopRatingStats | null>(null);
  const [shopStats, setShopStats] = useState<ShopStats | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("products");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddInventoryModalOpen, setIsAddInventoryModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add inventory states
  const [secretType, setSecretType] = useState<"Account" | "InviteLink" | "Code" | "QR">("Account");
  const [keysText, setKeysText] = useState("");
  const [isSubmittingInventory, setIsSubmittingInventory] = useState(false);

  // Reply to review states
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [unrepliedCount, setUnrepliedCount] = useState(0);

  const form = useForm<UpdateProductInput>({
    resolver: zodResolver(updateProductSchema),
  });

  const fetchData = async () => {
    try {
      const shopData = await shopService.getMyShop();
      if (!shopData) {
        toast.error("Bạn chưa có shop. Vui lòng đăng ký bán hàng trước.");
        return;
      }
      setShop(shopData);

      const [productsRes, reviewsData, statsData, shopStatsData, inventoryRes, unrepliedReviewsCount] = await Promise.all([
        productService.getMyProducts(shopData._id),
        reviewService.getReviewsByShop(shopData._id, 1, 10),
        reviewService.getShopRatingStats(shopData._id),
        shopService.getMyShopStats(),
        inventoryService.getMyInventory({ limit: 1000 }),
        reviewService.getUnrepliedReviewsCount(shopData._id),
      ]);

      setProducts(productsRes.data || []);
      setReviews(reviewsData.reviews || []);
      setRatingStats(statsData);
      setShopStats(shopStatsData);
      setInventoryItems(inventoryRes.items || []);
      setUnrepliedCount(unrepliedReviewsCount);
    } catch {
      toast.error("Lỗi khi tải dữ liệu shop");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleViewClick = (product: ProductResponse) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (product: ProductResponse) => {
    setSelectedProduct(product);
    form.reset({
      title: product.title,
      description: product.description,
      warrantyPolicy: product.warrantyPolicy,
      howToUse: product.howToUse,
      thumbnailUrl: product.thumbnailUrl || "",
      planType: product.planType,
      durationDays: product.durationDays,
      price: product.price,
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (product: ProductResponse) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleAddInventoryClick = (product: ProductResponse) => {
    setSelectedProduct(product);
    setSecretType("Account");
    setKeysText("");
    setIsAddInventoryModalOpen(true);
  };

  const handleAddInventory = async () => {
    if (!selectedProduct?._id && !selectedProduct?.id) {
      toast.error("Không xác định được sản phẩm");
      return;
    }

    const productId = selectedProduct._id || selectedProduct.id!;
    const lines = keysText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      toast.error("Vui lòng nhập ít nhất một key/tài khoản");
      return;
    }

    setIsSubmittingInventory(true);
    try {
      const result = await inventoryService.addBulkInventory({
        productId,
        items: lines.map((value) => ({
          secretType,
          secretValue: value,
        })),
      });

      if (result.added > 0) {
        toast.success(`Đã thêm ${result.added} item vào kho${result.errors.length > 0 ? ` (lỗi: ${result.errors.length})` : ""}`);
      } else {
        toast.error(`Không thể thêm item vào kho${result.errors.length > 0 ? ` (${result.errors.length} lỗi)` : ""}`);
      }
      setIsAddInventoryModalOpen(false);
      await fetchData(); // Refresh stats
    } catch (error: unknown) {
      const maybeMessage =
        error && typeof error === "object" && "message" in error
          ? (error as { message?: unknown }).message
          : undefined;
      const message =
        typeof maybeMessage === "string"
          ? maybeMessage
          : "Không thể thêm inventory. Vui lòng thử lại.";
      toast.error(message);
    } finally {
      setIsSubmittingInventory(false);
    }
  };

  const handleReplyClick = (review: Review) => {
    setSelectedReview(review);
    setReplyText("");
    setIsReplyModalOpen(true);
  };

  const handleReplySubmit = async () => {
    if (!selectedReview || !replyText.trim()) {
      toast.error("Vui lòng nhập nội dung phản hồi");
      return;
    }

    setIsSubmittingReply(true);
    try {
      await reviewService.replyToReview(selectedReview._id, replyText.trim());
      toast.success("Đã gửi phản hồi thành công");
      setIsReplyModalOpen(false);
      await fetchData(); // Refresh reviews
    } catch (error: unknown) {
      const maybeMessage =
        error && typeof error === "object" && "message" in error
          ? (error as { message?: unknown }).message
          : undefined;
      const message =
        typeof maybeMessage === "string"
          ? maybeMessage
          : "Không thể gửi phản hồi. Vui lòng thử lại.";
      toast.error(message);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const onUpdateSubmit = async (data: UpdateProductInput) => {
    if (!selectedProduct?._id) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        price: Number(data.price),
        durationDays: Number(data.durationDays),
        thumbnailUrl: data.thumbnailUrl === "" ? null : data.thumbnailUrl,
      };
      const res = await productService.updateProduct(selectedProduct._id, payload);
      if (!res.success || !res.data) {
        throw new Error(res.message || "Cập nhật thất bại");
      }
      toast.success("Cập nhật sản phẩm thành công!");
      setIsEditModalOpen(false);
      await fetchData(); // Refresh list
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi không xác định");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDeleteConfirm = async () => {
    if (!selectedProduct?._id) return;

    setIsSubmitting(true);
    try {
      await productService.deleteProduct(selectedProduct._id);
      toast.success("Đã xóa sản phẩm thành công");
      setProducts((prev) => prev.filter((p) => p._id !== selectedProduct?._id));
      setIsDeleteModalOpen(false);
    } catch {
      toast.error("Lỗi khi xóa sản phẩm");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (statusFilter === "all") return products;
    return products.filter((p) => p.status === statusFilter);
  }, [products, statusFilter]);

  // Tính toán inventory counts cho mỗi sản phẩm
  const productsWithInventory = useMemo(() => {
    const countsByProduct = new Map<string, { available: number; reserved: number; delivered: number; revoked: number }>();

    for (const item of inventoryItems) {
      const productId = item.productId?._id || "unknown";
      const entry = countsByProduct.get(productId) || { available: 0, reserved: 0, delivered: 0, revoked: 0 };

      if (item.status === "Available") entry.available += 1;
      if (item.status === "Reserved") entry.reserved += 1;
      if (item.status === "Delivered") entry.delivered += 1;
      if (item.status === "Revoked") entry.revoked += 1;

      countsByProduct.set(productId, entry);
    }

    return products.map((p) => {
      const productId = p._id || p.id || "";
      const counts = countsByProduct.get(productId) || { available: 0, reserved: 0, delivered: 0, revoked: 0 };
      return { product: p, ...counts };
    });
  }, [products, inventoryItems]);

  const getProductStatusBadge = (status?: ProductResponse["status"]) => {
    switch (status) {
      case "Pending": return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Chờ duyệt</Badge>;
      case "Approved": return <Badge variant="default"><CheckCircle className="mr-1 h-3 w-3" />Đã duyệt</Badge>;
      case "Rejected": return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Từ chối</Badge>;
      case "Hidden": return <Badge variant="outline"><AlertCircle className="mr-1 h-3 w-3" />Ẩn</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getShopStatusBadge = (status: Shop["status"]) => {
    switch (status) {
      case "Pending": return <Badge variant="secondary">Chờ duyệt</Badge>;
      case "Active": return <Badge variant="default">Hoạt động</Badge>;
      case "Suspended": return <Badge variant="destructive">Tạm ngưng</Badge>;
      case "Closed": return <Badge variant="outline">Đã đóng</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
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
              <h2 className="text-xl font-semibold mb-2">Bạn chưa có shop</h2>
              <p className="text-muted-foreground mb-4">Vui lòng đăng ký bán hàng để bắt đầu</p>
              <Button asChild><Link href="/seller/register">Đăng ký bán hàng</Link></Button>
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
            <p className="text-muted-foreground">{shop.description || "Chưa có mô tả"}</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/seller/reports">
                <BarChart3 className="mr-2 h-4 w-4" />
                Báo cáo & Thống kê
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/seller/orders">Lịch sử bán hàng</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/seller/complaints">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Khiếu nại shop
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
            <CardDescription>Theo dõi trạng thái đăng ký bán hàng của bạn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
              {shop.status === "Pending" && <Clock className="h-8 w-8 text-orange-500 flex-shrink-0" />}
              {shop.status === "Active" && <CheckCircle className="h-8 w-8 text-green-500 flex-shrink-0" />}
              {shop.status === "Suspended" && <AlertCircle className="h-8 w-8 text-red-500 flex-shrink-0" />}
              {shop.status === "Closed" && <XCircle className="h-8 w-8 text-gray-500 flex-shrink-0" />}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">Ngày đăng ký</Label>
                <p className="text-sm">{formatDate(shop.createdAt)}</p>
              </div>
              {shop.approvedAt && (
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">Ngày được duyệt</Label>
                  <p className="text-sm">{formatDate(shop.approvedAt)}</p>
                </div>
              )}
            </div>
            {shop.moderatorNote && (
              <div className="space-y-2 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Ghi chú từ Moderator
                </Label>
                <p className="text-sm">{shop.moderatorNote}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sản phẩm</CardTitle>
              <Package className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{shopStats?.totalProducts ?? products.length}</div>
              <p className="text-xs text-muted-foreground">
                {shopStats?.approvedProducts ?? products.filter((p) => p.status === "Approved").length} đang bán
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đánh giá TB</CardTitle>
              <Star className="h-5 w-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(shopStats?.avgRating ?? ratingStats?.averageRating ?? 0).toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                {shopStats?.totalReviews ?? ratingStats?.totalReviews ?? 0} đánh giá
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tỷ lệ phản hồi</CardTitle>
              <MessageCircle className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{shop.responseRate ?? 0}%</div>
              <p className="text-xs text-muted-foreground">Đánh giá đã phản hồi</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đơn hàng</CardTitle>
              <ShoppingBag className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{shopStats?.totalOrders ?? 0}</div>
              <p className="text-xs text-muted-foreground">{shopStats?.weeklyOrders ?? 0} đơn trong tuần</p>
            </CardContent>
          </Card>
          <Link href="/seller/inventory" className="block">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Kho hàng</CardTitle>
                <Package className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{shopStats?.inventory?.available ?? 0}</div>
                <p className="text-xs text-muted-foreground">Còn hàng (Available)</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Shop Wallet */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ví shop - Số dư</CardTitle>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(shopStats?.availableBalance ?? 0)}</div>
              <p className="text-xs text-muted-foreground">Tiền có thể rút/chi trả (balance)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ví shop - Đang giữ</CardTitle>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatPrice(shopStats?.escrowAmount ?? shopStats?.holdBalance ?? 0)}
              </div>
              <p className="text-xs text-muted-foreground">Tiền đang giữ từ các đơn đã bán (escrow)</p>
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
            <TabsTrigger value="inventory">
              <Database className="mr-2 h-4 w-4" />
              Kho hàng ({shopStats?.inventory?.available ?? 0})
            </TabsTrigger>
            <TabsTrigger value="reviews" className="relative">
              <MessageSquare className="mr-2 h-4 w-4" />
              Đánh giá ({ratingStats?.totalReviews || 0})
              {unrepliedCount > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 min-w-5 px-1.5 text-xs">
                  {unrepliedCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Danh sách sản phẩm</CardTitle>
                    <CardDescription>Quản lý sản phẩm của shop</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[180px]"><SelectValue placeholder="Lọc theo trạng thái" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="Approved">Đã duyệt</SelectItem>
                        <SelectItem value="Pending">Chờ duyệt</SelectItem>
                        <SelectItem value="Rejected">Từ chối</SelectItem>
                        <SelectItem value="Hidden">Ẩn</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button asChild>
                      <Link href="/seller/products/create"><Plus className="mr-2 h-4 w-4" />Thêm</Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Không có sản phẩm</h3>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredProducts.map((product) => (
                      <div
                        key={product._id}
                        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border rounded-xl hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex-1 flex items-start gap-4">
                          <div className="relative h-16 w-16 rounded-xl border bg-muted/30 overflow-hidden flex items-center justify-center flex-shrink-0">
                            {product.thumbnailUrl ? (
                              <Image src={product.thumbnailUrl} alt={product.title} fill className="object-cover" sizes="64px" unoptimized={product.thumbnailUrl?.startsWith("data:")} />
                            ) : (
                              <Package className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-base md:text-lg leading-snug">{product.title}</h3>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                              {getProductStatusBadge(product.status)}
                              <Badge variant="outline">{product.planType}</Badge>
                              <span className="text-sm text-muted-foreground">{formatPrice(product.price)}</span>
                              <span className="text-sm text-muted-foreground">{product.durationDays} ngày</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 relative z-10 flex-wrap">
                          <Button variant="outline" size="sm" onClick={() => handleViewClick(product)}><Eye className="mr-1 h-4 w-4" />Xem</Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditClick(product)}><Edit className="mr-1 h-4 w-4" />Sửa</Button>
                          <Button variant="secondary" size="sm" onClick={() => handleAddInventoryClick(product)}><Database className="mr-1 h-4 w-4" />Thêm kho</Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(product)}><Trash2 className="mr-1 h-4 w-4" />Xóa</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Quản lý kho hàng</CardTitle>
                    <CardDescription>Xem và thêm key/tài khoản cho từng sản phẩm</CardDescription>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href="/seller/inventory">
                      <Eye className="mr-2 h-4 w-4" />
                      Xem chi tiết kho
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {productsWithInventory.length === 0 ? (
                  <div className="text-center py-8">
                    <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Chưa có sản phẩm</h3>
                    <p className="text-muted-foreground">Tạo sản phẩm trước để thêm key vào kho</p>
                  </div>
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[180px]">Sản phẩm</TableHead>
                          <TableHead>Giá</TableHead>
                          <TableHead className="text-center">Còn hàng</TableHead>
                          <TableHead className="text-center">Đã giữ</TableHead>
                          <TableHead className="text-center">Đã giao</TableHead>
                          <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {productsWithInventory.map(({ product, available, reserved, delivered }) => (
                          <TableRow key={product._id || product.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="relative h-10 w-10 rounded-lg border bg-muted/30 overflow-hidden flex items-center justify-center shrink-0">
                                  {product.thumbnailUrl ? (
                                    <Image src={product.thumbnailUrl} alt={product.title} fill className="object-cover" sizes="40px" unoptimized={product.thumbnailUrl?.startsWith("data:")} />
                                  ) : (
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </div>
                                <span className="font-medium">{product.title}</span>
                              </div>
                            </TableCell>
                            <TableCell>{formatPrice(product.price)}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="border-green-500 text-green-600">{available}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="border-amber-500 text-amber-600">{reserved}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="border-blue-500 text-blue-600">{delivered}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="secondary" size="sm" onClick={() => handleAddInventoryClick(product)}>
                                <Plus className="mr-1 h-4 w-4" />
                                Thêm kho
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-4">
            {ratingStats && (
              <Card>
                <CardHeader>
                  <CardTitle>Thống kê đánh giá</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold">{ratingStats.averageRating.toFixed(1)}</div>
                    <div className="flex-1 space-y-1">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = ratingStats.ratingDistribution[star] || 0;
                        const percentage = ratingStats.totalReviews > 0 ? (count / ratingStats.totalReviews) * 100 : 0;
                        return (
                          <div key={star} className="flex items-center gap-2 text-sm">
                            <span className="w-3">{star}</span>
                            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-yellow-400 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="w-8 text-right text-muted-foreground">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Tổng {ratingStats.totalReviews} đánh giá</p>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader>
                <CardTitle>Đánh giá gần đây</CardTitle>
                <CardDescription>Đánh giá từ khách hàng - Bạn có thể phản hồi 1 lần cho mỗi đánh giá</CardDescription>
              </CardHeader>
              <CardContent>
                {reviews.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Chưa có đánh giá.</div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((r) => {
                      const productInfo = typeof r.productId === "object" ? r.productId : null;
                      const userInfo = typeof r.userId === "object" ? r.userId : null;
                      return (
                        <div key={r._id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {renderStars(r.rating)}
                                <span className="text-sm font-medium">
                                  {userInfo?.fullName || "Khách hàng"}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {r.createdAt ? formatDate(r.createdAt) : ""}
                                </span>
                              </div>
                              {productInfo && (
                                <p className="text-xs text-muted-foreground mb-2">
                                  Sản phẩm: {productInfo.title}
                                </p>
                              )}
                              <p className="text-sm">{r.comment}</p>
                              {r.images && r.images.length > 0 && (
                                <div className="flex gap-2 mt-2">
                                  {r.images.map((img, idx) => (
                                    <div key={idx} className="relative w-16 h-16 rounded-lg border overflow-hidden">
                                      <Image
                                        src={img}
                                        alt={`Review image ${idx + 1}`}
                                        fill
                                        className="object-cover"
                                        sizes="64px"
                                        unoptimized={img?.startsWith("data:")}
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            {!r.sellerReply && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReplyClick(r)}
                              >
                                <Reply className="mr-1 h-4 w-4" />
                                Phản hồi
                              </Button>
                            )}
                          </div>

                          {/* Seller Reply */}
                          {r.sellerReply && (
                            <div className="ml-6 p-3 bg-muted/50 rounded-lg border-l-2 border-primary">
                              <div className="flex items-center gap-2 mb-1">
                                <MessageCircle className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium text-primary">Phản hồi của shop</span>
                                {r.sellerReplyAt && (
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(r.sellerReplyAt)}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm">{r.sellerReply}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Chi tiết sản phẩm</DialogTitle>
            </DialogHeader>
            {selectedProduct && (
              <div className="space-y-4 py-4 text-sm">
                {selectedProduct.thumbnailUrl && (
                  <div className="relative w-full h-64 rounded-lg border bg-muted/20 overflow-hidden">
                    <Image
                      src={selectedProduct.thumbnailUrl}
                      alt={selectedProduct.title}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 500px"
                      unoptimized={selectedProduct.thumbnailUrl?.startsWith("data:")}
                    />
                  </div>
                )}
                <h3 className="font-bold text-xl">{selectedProduct.title}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium">Giá</div>
                    <p>{formatPrice(selectedProduct.price)}</p>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Thời hạn</div>
                    <p>{selectedProduct.durationDays} ngày</p>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Loại gói</div>
                    <p>{selectedProduct.planType}</p>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Trạng thái</div>
                    <div>{getProductStatusBadge(selectedProduct.status)}</div>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Mô tả</div>
                  <p className="text-muted-foreground">{selectedProduct.description}</p>
                </div>
                <div>
                  <div className="text-sm font-medium">Chính sách bảo hành</div>
                  <p className="text-muted-foreground">{selectedProduct.warrantyPolicy}</p>
                </div>
                <div>
                  <div className="text-sm font-medium">Hướng dẫn sử dụng</div>
                  <p className="text-muted-foreground">{selectedProduct.howToUse}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa sản phẩm</DialogTitle>
              <DialogDescription>Cập nhật thông tin chi tiết cho sản phẩm của bạn.</DialogDescription>
            </DialogHeader>

            <form onSubmit={form.handleSubmit(onUpdateSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="title">Tiêu đề</label>
                <Input id="title" {...form.register("title")} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="thumbnailUrl">Thumbnail URL</label>
                <Input id="thumbnailUrl" {...form.register("thumbnailUrl")} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="description">Mô tả</label>
                <Textarea id="description" {...form.register("description")} className="min-h-24" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="warrantyPolicy">Chính sách bảo hành</label>
                <Textarea id="warrantyPolicy" {...form.register("warrantyPolicy")} className="min-h-24" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="howToUse">Hướng dẫn sử dụng</label>
                <Textarea id="howToUse" {...form.register("howToUse")} className="min-h-24" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Loại gói</label>
                  <Select
                    value={form.watch("planType")}
                    onValueChange={(v) => form.setValue("planType", v as UpdateProductInput["planType"])}
                  >
                    <SelectTrigger><SelectValue placeholder="Chọn" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Personal">Personal</SelectItem>
                      <SelectItem value="Family">Family</SelectItem>
                      <SelectItem value="Slot">Slot</SelectItem>
                      <SelectItem value="Shared">Shared</SelectItem>
                      <SelectItem value="InviteLink">InviteLink</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="durationDays">Thời hạn (ngày)</label>
                  <Input id="durationDays" type="number" {...form.register("durationDays", { valueAsNumber: true })} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="price">Giá (VND)</label>
                  <Input id="price" type="number" {...form.register("price", { valueAsNumber: true })} />
                </div>
              </div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Hủy</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Lưu thay đổi
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận xóa</DialogTitle>
              <DialogDescription>
                Bạn có chắc muốn xóa sản phẩm {selectedProduct?.title ? `"${selectedProduct.title}"` : "này"}?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Hủy</Button>
              <Button variant="destructive" onClick={onDeleteConfirm} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Xóa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Inventory Modal */}
        <Dialog open={isAddInventoryModalOpen} onOpenChange={setIsAddInventoryModalOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Thêm key/tài khoản vào kho</DialogTitle>
              <DialogDescription>
                Chọn kiểu secret và dán danh sách key (mỗi dòng một key) để thêm nhanh vào kho.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2 flex-1 overflow-y-auto">
              <div className="text-sm">
                <span className="font-medium">Sản phẩm:&nbsp;</span>
                <span>{selectedProduct?.title || "Chưa chọn"}</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="inventory-secretType">Kiểu secret *</Label>
                <Select
                  value={secretType}
                  onValueChange={(v) =>
                    setSecretType(v as "Account" | "InviteLink" | "Code" | "QR")
                  }
                >
                  <SelectTrigger id="inventory-secretType">
                    <SelectValue placeholder="Chọn kiểu secret" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Account">Account (email:password,...)</SelectItem>
                    <SelectItem value="Code">Code (mã kích hoạt)</SelectItem>
                    <SelectItem value="InviteLink">InviteLink (link mời)</SelectItem>
                    <SelectItem value="QR">QR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="inventory-keysText">Danh sách key / tài khoản (mỗi dòng một mục) *</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {keysText.split("\n").filter((l) => l.trim().length > 0).length} key
                    </Badge>
                    {keysText.length > 0 && (
                      <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setKeysText("")}>
                        Xóa tất cả
                      </Button>
                    )}
                  </div>
                </div>
                <Textarea
                  id="inventory-keysText"
                  value={keysText}
                  onChange={(e) => setKeysText(e.target.value)}
                  placeholder={"Ví dụ:\nemail1@example.com:pass1\nemail2@example.com:pass2\n..."}
                  className="min-h-[200px] max-h-[300px] overflow-y-auto font-mono text-sm"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddInventoryModalOpen(false)}>
                Hủy
              </Button>
              <Button type="button" onClick={handleAddInventory} disabled={isSubmittingInventory}>
                {isSubmittingInventory && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Thêm vào kho
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <div className="flex justify-end pt-4">
          <Button asChild variant="outline">
            <Link href="/seller/orders">Xem lịch sử bán hàng</Link>
          </Button>
        </div>

        {/* Reply to Review Modal */}
        <Dialog open={isReplyModalOpen} onOpenChange={setIsReplyModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Phản hồi đánh giá</DialogTitle>
              <DialogDescription>
                Bạn chỉ có thể phản hồi 1 lần cho mỗi đánh giá. Hãy cân nhắc kỹ trước khi gửi.
              </DialogDescription>
            </DialogHeader>
            {selectedReview && (
              <div className="space-y-4 py-2">
                {/* Original Review */}
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {renderStars(selectedReview.rating)}
                    <span className="text-sm text-muted-foreground">
                      {selectedReview.createdAt ? formatDate(selectedReview.createdAt) : ""}
                    </span>
                  </div>
                  <p className="text-sm">{selectedReview.comment}</p>
                </div>

                {/* Reply Input */}
                <div className="space-y-2">
                  <Label htmlFor="reply-text">Nội dung phản hồi *</Label>
                  <Textarea
                    id="reply-text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Nhập phản hồi của bạn..."
                    className="min-h-[120px]"
                    maxLength={1000}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {replyText.length}/1000 ký tự
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsReplyModalOpen(false)}
              >
                Hủy
              </Button>
              <Button
                type="button"
                onClick={handleReplySubmit}
                disabled={isSubmittingReply || !replyText.trim()}
              >
                {isSubmittingReply && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Gửi phản hồi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RequireAuth>
  );
}

