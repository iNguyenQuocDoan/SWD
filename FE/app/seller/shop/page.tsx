"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
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
import {
  productService,
  type ProductResponse,
} from "@/lib/services/product.service";
import { reviewService, Review, ShopRatingStats } from "@/lib/services/review.service";
import { updateProductSchema, type UpdateProductInput } from "@/lib/validations";
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
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
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
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingStats, setRatingStats] = useState<ShopRatingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("products");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateProductInput>({
    resolver: zodResolver(updateProductSchema),
  });

  const fetchData = async () => {
    // Keep setIsLoading at top level if you want skeleton for whole page
    // setIsLoading(true);
    try {
      const shopData = await shopService.getMyShop();
      if (!shopData) {
        toast.error("Bạn chưa có shop. Vui lòng đăng ký bán hàng trước.");
        return;
      }
      setShop(shopData);

      const [productsRes, reviewsData, statsData] = await Promise.all([
        productService.getMyProducts(shopData._id),
        reviewService.getReviewsByShop(shopData._id, 1, 10),
        reviewService.getShopRatingStats(shopData._id),
      ]);

      setProducts(productsRes.data || []);
      setReviews(reviewsData.reviews || []);
      setRatingStats(statsData);
    } catch (error) {
      console.error("Error fetching shop data:", error);
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
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Lỗi khi xóa sản phẩm");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (statusFilter === "all") return products;
    return products.filter((p) => p.status === statusFilter);
  }, [products, statusFilter]);

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
          <Star key={star} className={`h-4 w-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
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
            {Array.from({ length: 4 }).map((_, i) => (<Skeleton key={i} className="h-32" />))}
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
            <Button variant="outline" asChild><Link href={`/seller/shop/edit`}><Edit className="mr-2 h-4 w-4" />Chỉnh sửa Shop</Link></Button>
            <Button asChild disabled={shop.status !== "Active"}><Link href="/seller/products/create"><Plus className="mr-2 h-4 w-4" />Thêm sản phẩm</Link></Button>
          </div>
        </div>

        {/* Shop Registration Status Card */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center gap-2"><Store className="h-5 w-5" /><CardTitle>Trạng thái đăng ký Shop</CardTitle></div>
            <CardDescription>Theo dõi trạng thái đăng ký bán hàng của bạn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3"><span className="text-sm font-medium">Trạng thái hiện tại:</span>{getShopStatusBadge(shop.status)}</div>
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
              <div className="space-y-1"><Label className="text-sm font-medium text-muted-foreground">Ngày đăng ký</Label><p className="text-sm">{formatDate(shop.createdAt)}</p></div>
              {shop.approvedAt && <div className="space-y-1"><Label className="text-sm font-medium text-muted-foreground">Ngày được duyệt</Label><p className="text-sm">{formatDate(shop.approvedAt)}</p></div>}
            </div>
            {shop.moderatorNote && <div className="space-y-2 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800"><Label className="text-sm font-medium flex items-center gap-2"><MessageSquare className="h-4 w-4" />Ghi chú từ Moderator</Label><p className="text-sm">{shop.moderatorNote}</p></div>}
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Sản phẩm</CardTitle><Package className="h-5 w-5 text-muted-foreground" /></CardHeader>
            <CardContent><div className="text-2xl font-bold">{products.length}</div><p className="text-xs text-muted-foreground">{products.filter((p) => p.status === "Approved").length} đang bán</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Đánh giá TB</CardTitle><Star className="h-5 w-5 text-yellow-500" /></CardHeader>
            <CardContent><div className="text-2xl font-bold">{ratingStats?.averageRating.toFixed(1) || "0.0"}</div><p className="text-xs text-muted-foreground">{ratingStats?.totalReviews || 0} đánh giá</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Đơn hàng</CardTitle><ShoppingBag className="h-5 w-5 text-muted-foreground" /></CardHeader>
            <CardContent><div className="text-2xl font-bold">{shop.totalSales}</div><p className="text-xs text-muted-foreground">Tổng đơn hàng</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle><Clock className="h-5 w-5 text-orange-500" /></CardHeader>
            <CardContent><div className="text-2xl font-bold text-orange-600">{products.filter((p) => p.status === "Pending").length}</div><p className="text-xs text-muted-foreground">Sản phẩm chờ duyệt</p></CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="products"><Package className="mr-2 h-4 w-4" />Sản phẩm ({products.length})</TabsTrigger>
            <TabsTrigger value="reviews"><MessageSquare className="mr-2 h-4 w-4" />Đánh giá ({ratingStats?.totalReviews || 0})</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div><CardTitle>Danh sách sản phẩm</CardTitle><CardDescription>Quản lý sản phẩm của shop</CardDescription></div>
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
                    <Button asChild><Link href="/seller/products/create"><Plus className="mr-2 h-4 w-4" />Thêm</Link></Button>
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
                      <div key={product._id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border rounded-xl hover:bg-muted/40 transition-colors">
                        <div className="flex-1 flex items-start gap-4">
                          <div className="h-16 w-16 rounded-xl border bg-muted/30 overflow-hidden flex items-center justify-center flex-shrink-0">
                            {product.thumbnailUrl ? (
                              <img src={product.thumbnailUrl} alt={product.title} className="h-full w-full object-cover" />
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
                        <div className="flex gap-2 relative z-10">
                          <Button variant="outline" size="sm" onClick={() => handleViewClick(product)}><Eye className="mr-1 h-4 w-4" />Xem</Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditClick(product)}><Edit className="mr-1 h-4 w-4" />Sửa</Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(product)}><Trash2 className="mr-1 h-4 w-4" />Xóa</Button>
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
            {ratingStats && <Card><CardHeader><CardTitle>Phân bố đánh giá</CardTitle></CardHeader><CardContent>{/* ... */}</CardContent></Card>}
            <Card>
              <CardHeader><CardTitle>Đánh giá gần đây</CardTitle><CardDescription>Đánh giá từ khách hàng</CardDescription></CardHeader>
              <CardContent>{/* ... */}</CardContent>
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
                  <img
                    src={selectedProduct.thumbnailUrl}
                    alt={selectedProduct.title}
                    className="w-full h-auto max-h-64 object-contain rounded-lg border bg-muted/20"
                  />
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
              <DialogDescription>
                Cập nhật thông tin chi tiết cho sản phẩm của bạn.
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={form.handleSubmit(onUpdateSubmit)}
              className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2"
            >
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
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn" />
                    </SelectTrigger>
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
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Hủy
                </Button>
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
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Hủy
              </Button>
              <Button variant="destructive" onClick={onDeleteConfirm} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Xóa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RequireAuth>
  );
}
