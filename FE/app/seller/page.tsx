"use client";

import { useEffect, useMemo, useState } from "react";
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
import { RequireAuth } from "@/components/auth/RequireAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  DollarSign,
  Package,
  Clock,
  TrendingUp,
  Plus,
  Store,
  Eye,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import { shopService, type Shop } from "@/lib/services/shop.service";
import {
  productService,
  type ProductResponse,
} from "@/lib/services/product.service";
import { updateProductSchema, type UpdateProductInput } from "@/lib/validations";

// Keep stats UI as-is (mock until BE ready)
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

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

export default function SellerDashboard() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<ProductResponse[]>([]);

  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock stats UI
  const [stats, setStats] = useState<SellerStats>({
    escrowAmount: 1250000,
    availableAmount: 7800000,
    paidOutAmount: 25000000,
    activeProducts: 0,
    pendingProducts: 0,
    totalOrders: 120,
    weeklyOrders: 15,
    avgRating: 4.8,
    totalReviews: 89,
  });

  const form = useForm<UpdateProductInput>({
    resolver: zodResolver(updateProductSchema),
    defaultValues: {
      title: "",
      description: "",
      warrantyPolicy: "",
      howToUse: "",
      thumbnailUrl: "",
      planType: "Personal",
      durationDays: 30,
      price: 0,
    },
  });

    const fetchData = async () => {
      setIsLoading(true);
      try {
      const myShop = await shopService.getMyShop();
      if (!myShop) {
        setShop(null);
        setProducts([]);
        return;
      }
      setShop(myShop);

      const productsRes = await productService.getMyProducts(myShop._id);
      const list = productsRes.data || [];
      setProducts(list);

      // Update stats derived from product list
      setStats((prev) => ({
        ...prev,
        activeProducts: list.filter((p) => p.status === "Approved").length,
        pendingProducts: list.filter((p) => p.status === "Pending").length,
      }));
      } catch (error) {
        console.error("Failed to fetch seller data:", error);
      toast.error("Không thể tải dữ liệu seller");
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
      const payload: UpdateProductInput = {
        ...data,
        price: Number(data.price),
        durationDays: Number(data.durationDays),
        thumbnailUrl: data.thumbnailUrl ? data.thumbnailUrl : null,
      };

      const res = await productService.updateProduct(selectedProduct._id, payload);
      if (!res.success) {
        throw new Error(res.message || "Cập nhật thất bại");
      }

      toast.success("Cập nhật sản phẩm thành công!");
      setIsEditModalOpen(false);

      // Refresh list to stay consistent with BE
      await fetchData();
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
      const res = await productService.deleteProduct(selectedProduct._id);
      if (!res.success) {
        throw new Error(res.message || "Xóa thất bại");
      }
      toast.success("Xóa sản phẩm thành công!");
      setIsDeleteModalOpen(false);
      setProducts((prev) => prev.filter((p) => p._id !== selectedProduct._id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi không xác định");
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
      case "Pending":
        return <Badge variant="secondary">Chờ duyệt</Badge>;
      case "Approved":
        return <Badge variant="default">Đã duyệt</Badge>;
      case "Rejected":
        return <Badge variant="destructive">Từ chối</Badge>;
      case "Hidden":
        return <Badge variant="outline">Ẩn</Badge>;
      default:
        return <Badge variant="outline">{status || "-"}</Badge>;
    }
  };

  return (
    <RequireAuth requiredRole="seller">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16 space-y-8 md:space-y-10">
      <div className="rounded-2xl border bg-card p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Dashboard Seller</h1>
          <p className="text-base text-muted-foreground">Quản lý shop và sản phẩm của bạn</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <Button variant="outline" size="lg" className="h-11" asChild>
            <Link href="/seller/shop">
              <Store className="mr-2 h-5 w-5" />
              Xem Shop
            </Link>
          </Button>
          <Button size="lg" className="h-11" asChild>
            <Link href="/seller/products/create">
              <Plus className="mr-2 h-5 w-5" />
              Thêm sản phẩm
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sản phẩm</CardTitle>
            <Package className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{products.length}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Tổng số sản phẩm trong shop</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đơn hàng (tuần)</CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats.weeklyOrders}</div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đánh giá</CardTitle>
            <Eye className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats.avgRating}/5</div>
            )}
          
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Số dư</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-40" />
            ) : (
              <div className="text-2xl font-bold">{formatPrice(stats.availableAmount)}</div>
            )}
          
          </CardContent>
        </Card>
      </div>
      </div>


      {/* Stats Cards (legacy / placeholders) */}
      <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base md:text-lg font-medium">Đang giữ (Escrow)</CardTitle>
            <Clock className="h-6 w-6 md:h-7 md:w-7 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-40" />
            ) : (
              <>
                  <div className="text-3xl md:text-4xl font-bold text-orange-600">{formatPrice(stats.escrowAmount)}</div>
                  <p className="text-sm md:text-base text-muted-foreground mt-2">Đang chờ customer xác nhận</p>
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
                  <div className="text-3xl md:text-4xl font-bold text-green-600">{formatPrice(stats.availableAmount)}</div>
                  <p className="text-sm md:text-base text-muted-foreground mt-2">Sẵn sàng để chi trả</p>
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
                  <div className="text-3xl md:text-4xl font-bold">{formatPrice(stats.paidOutAmount)}</div>
                <p className="text-sm md:text-base text-muted-foreground mt-2">Tổng đã nhận</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

        {/* Product List Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Sản phẩm của bạn</CardTitle>
                <CardDescription>Quản lý và theo dõi sản phẩm của bạn</CardDescription>
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
              <Button variant="outline" asChild>
                  <Link href="/seller/shop">Quản lý trong Shop</Link>
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
            ) : !shop ? (
              <div className="text-center py-8">
                <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">Bạn chưa có shop.</p>
              </div>
          ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Không có sản phẩm</h3>
              </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <div
                    key={product._id || product.id}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border rounded-xl hover:bg-muted/40 transition-colors"
                >
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
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 self-start md:self-center">
                      <Button variant="outline" size="sm" onClick={() => handleViewClick(product)}>
                        <Eye className="mr-1 h-4 w-4" />
                        Xem
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(product)}>
                        <Edit className="mr-1 h-4 w-4" />
                        Sửa
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(product)}>
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
      </div>

      {/* View Product Modal */}
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

      {/* Edit Product Modal */}
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

      {/* Delete Confirmation Modal */}
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
    </RequireAuth>
  );
}
