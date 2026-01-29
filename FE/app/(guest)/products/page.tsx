"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Package,
  Loader2,
} from "lucide-react";
import { productService } from "@/lib/services/product.service";
import { inventoryService } from "@/lib/services/inventory.service";
import { toast } from "sonner";
import type { Product } from "@/types";

type SortOption = "newest" | "price_low" | "price_high" | "rating";
type PlatformFilter = "all" | string;
type DurationFilter = "all" | "1month" | "3months" | "1year";
type PackageFilter = "all" | "Personal" | "Family" | "Slot" | "Shared" | "InviteLink";

function ProductsContent() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("all");
  const [durationFilter, setDurationFilter] = useState<DurationFilter>("all");
  const [packageFilter, setPackageFilter] = useState<PackageFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const itemsPerPage = 12;
  const [inventoryCounts, setInventoryCounts] = useState<Record<string, number>>({});
  const [inStockOnly, setInStockOnly] = useState(false);
  const [platforms, setPlatforms] = useState<Array<{ _id: string; platformName: string }>>([]);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const filter: any = {
          page: currentPage,
          limit: itemsPerPage,
        };

        // Apply filters
        if (platformFilter !== "all") {
          filter.platformId = platformFilter;
        }
        if (packageFilter !== "all") {
          filter.planType = packageFilter;
        }
        if (searchQuery) {
          // Backend should handle search, but for now we'll filter client-side
        }

        const response = await productService.getProducts(filter);

        if (!response.success) {
          throw new Error(response.message || "Không thể tải danh sách sản phẩm");
        }

        // BE returns: { success: true, data: Product[], pagination: {...} }
        const list = (response.data as any) || [];
        setProducts(list);

        // Extract unique platforms from products
        const uniquePlatforms = new Map<string, { _id: string; platformName: string }>();
        list.forEach((p: Product) => {
          const platform = p.platformId || p.platform;
          if (platform && typeof platform === "object") {
            const platformObj = platform as { _id?: string; id?: string; platformName?: string };
            const platformId = platformObj._id || platformObj.id;
            if (platformId) {
              uniquePlatforms.set(platformId, {
                _id: platformId,
                platformName: platform.platformName || "Unknown",
              });
            }
          }
        });
        setPlatforms(Array.from(uniquePlatforms.values()));

        setPagination(
          (response as any).pagination || {
            page: currentPage,
            limit: itemsPerPage,
            total: 0,
            totalPages: 1,
          }
        );

        // Fetch inventory counts for each product (available items)
        try {
          const entries = await Promise.all(
            list.map(async (p: any) => {
              const id = p._id || p.id;
              if (!id) return [null, 0] as const;
              try {
                const count = await inventoryService.getAvailableCount(id);
                return [id as string, count] as const;
              } catch {
                return [id as string, 0] as const;
              }
            })
          );
          const counts: Record<string, number> = {};
          for (const [id, count] of entries) {
            if (id) counts[id] = count;
          }
          setInventoryCounts(counts);
        } catch (err) {
          console.error("Failed to fetch inventory counts:", err);
          setInventoryCounts({});
        }
      } catch (error: any) {
        console.error("Failed to fetch products:", error);
        toast.error("Không thể tải danh sách sản phẩm");
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, platformFilter, packageFilter, searchQuery]);

  // Filter và sort products (client-side filtering for search)
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter (client-side if backend doesn't support)
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (typeof p.platform === "object" 
            ? p.platform.platformName?.toLowerCase().includes(searchQuery.toLowerCase())
            : false)
      );
    }

    // Duration filter (client-side)
    if (durationFilter !== "all") {
      const durationDaysMap: Record<string, number> = {
        "1month": 30,
        "3months": 90,
        "1year": 365,
      };
      filtered = filtered.filter(
        (p) => p.durationDays === durationDaysMap[durationFilter]
      );
    }

    // In-stock filter (requires inventoryCounts)
    if (inStockOnly) {
      filtered = filtered.filter((p) => {
        const id = (p as any)._id || (p as any).id;
        const count = inventoryCounts[id as string] ?? 0;
        return count > 0;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price_low":
          return a.price - b.price;
        case "price_high":
          return b.price - a.price;
        case "rating":
          const aRating = typeof a.shop === "object" ? (a.shop as any).ratingAvg || 0 : 0;
          const bRating = typeof b.shop === "object" ? (b.shop as any).ratingAvg || 0 : 0;
          return bRating - aRating;
        case "newest":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return filtered;
  }, [products, searchQuery, sortBy, durationFilter, inStockOnly, inventoryCounts]);

  // Pagination
  const totalPages = pagination.totalPages || Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const paginatedProducts = filteredAndSortedProducts;

  const hasActiveFilters =
    platformFilter !== "all" ||
    durationFilter !== "all" ||
    packageFilter !== "all" ||
    inStockOnly;

  const resetFilters = () => {
    setPlatformFilter("all");
    setDurationFilter("all");
    setPackageFilter("all");
    setInStockOnly(false);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="container mx-auto px-4 sm:px-5 lg:px-6 py-6 md:py-8 lg:py-10">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">Danh mục sản phẩm</h1>
          <p className="text-base md:text-lg text-muted-foreground">
            Tìm kiếm và so sánh các gói tài khoản, thuê bao số theo nền tảng
          </p>
        </div>

        {/* Search & Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo platform, planType, tiêu đề..."
              className="pl-10 h-12 text-base"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as SortOption)}
          >
            <SelectTrigger className="w-full sm:w-[220px] h-12 text-base">
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mới nhất</SelectItem>
              <SelectItem value="price_low">Giá: thấp → cao</SelectItem>
              <SelectItem value="price_high">Giá: cao → thấp</SelectItem>
              <SelectItem value="rating">Đánh giá cao nhất</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 md:gap-3 items-center">
          <span className="text-base font-medium text-muted-foreground w-full sm:w-auto">
            Lọc theo:
          </span>

          <Select
            value={platformFilter}
            onValueChange={(value) => {
              setPlatformFilter(value as PlatformFilter);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-[160px] md:w-[180px] h-11 text-base">
              <SelectValue placeholder="Nền tảng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả nền tảng</SelectItem>
              {platforms.map((platform) => (
                <SelectItem key={platform._id} value={platform._id}>
                  {platform.platformName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={durationFilter}
            onValueChange={(value) => {
              setDurationFilter(value as DurationFilter);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-[160px] md:w-[180px] h-11 text-base">
              <SelectValue placeholder="Thời hạn" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="1month">1 tháng</SelectItem>
              <SelectItem value="3months">3 tháng</SelectItem>
              <SelectItem value="1year">1 năm</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={packageFilter}
            onValueChange={(value) => {
              setPackageFilter(value as PackageFilter);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-[160px] md:w-[180px] h-11 text-base">
              <SelectValue placeholder="Loại gói" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="Personal">Cá nhân</SelectItem>
              <SelectItem value="Family">Gia đình</SelectItem>
              <SelectItem value="Slot">Slot</SelectItem>
              <SelectItem value="Shared">Shared</SelectItem>
              <SelectItem value="InviteLink">Invite Link</SelectItem>
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant={inStockOnly ? "default" : "outline"}
            size="default"
            onClick={() => {
              setInStockOnly((prev) => !prev);
              setCurrentPage(1);
            }}
            className="h-11 text-base"
          >
            {inStockOnly ? "Đang lọc: Còn hàng" : "Chỉ hiển thị còn hàng"}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="default"
              onClick={resetFilters}
              className="h-11 text-base"
            >
              <X className="h-5 w-5 mr-2" />
              Xóa bộ lọc
            </Button>
          )}
        </div>

        {/* Results count */}
        {filteredAndSortedProducts.length > 0 && (
          <p className="text-base md:text-lg text-muted-foreground">
            Tìm thấy <span className="font-semibold text-foreground">{filteredAndSortedProducts.length}</span> sản phẩm
          </p>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <Skeleton className="aspect-video w-full rounded-t-lg" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-6 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : paginatedProducts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <Package className="h-10 w-10 text-muted-foreground mb-3" />
              <h3 className="text-lg font-semibold mb-1.5">
                Không tìm thấy sản phẩm
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-4">
                Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để xem thêm kết quả
              </p>
              {hasActiveFilters && (
                <Button onClick={resetFilters} variant="default">
                  Đặt lại bộ lọc
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
              {paginatedProducts.map((product) => (
                <Card
                  key={product._id || product.id}
                  className="group hover:shadow-xl transition-all duration-300 cursor-pointer border hover:border-primary/30 h-full flex flex-col"
                >
                  <Link href={`/products/${product._id || product.id}`} className="flex-1 flex flex-col">
                    <CardContent className="p-5 md:p-6 space-y-4 flex-1 flex flex-col">
                      {/* Badges */}
                      <div className="flex gap-1.5 flex-wrap">
                        <Badge variant="secondary" className="text-sm px-2.5 py-1">
                          {typeof (product as any).platformId === "object"
                            ? ((product as any).platformId.platformName || "N/A")
                            : (typeof (product as any).platform === "object"
                              ? ((product as any).platform.platformName || "N/A")
                              : "N/A")}
                        </Badge>
                        <Badge variant="outline" className="text-sm px-2.5 py-1">
                          {product.planType}
                        </Badge>
                        <Badge variant="outline" className="text-sm px-2.5 py-1">
                          {product.durationDays} ngày
                        </Badge>
                      </div>

                      {/* Thumbnail */}
                      {(product as any).thumbnailUrl ? (
                        <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={(product as any).thumbnailUrl}
                            alt={product.title}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      ) : null}

                      {/* Title */}
                      <h3 className="font-semibold text-lg md:text-xl line-clamp-2 group-hover:text-primary transition-colors min-h-[3.5rem] flex-1">
                        {product.title}
                      </h3>

                      {/* Shop Rating */}
                      <div className="flex items-center gap-2 text-base">
                        <span className="text-muted-foreground text-sm">
                          Shop:{" "}
                          {typeof (product as any).shopId === "object"
                            ? ((product as any).shopId.shopName || "N/A")
                            : (typeof (product as any).shop === "object"
                              ? ((product as any).shop.shopName || "N/A")
                              : "N/A")}
                        </span>
                      </div>

                      {/* Price, stock & Buy */}
                      <div className="space-y-3 pt-2 border-t">
                        <div className="flex items-center justify-between flex-wrap gap-1.5">
                          <span className="text-2xl md:text-3xl font-bold text-primary">
                            {formatPrice(product.price)}
                          </span>

                          <div className="flex flex-col items-end gap-1 text-sm">
                            <span className="text-muted-foreground">
                              Còn{" "}
                              <span className="font-semibold">
                                {inventoryCounts[(product as any)._id || (product as any).id || ""] ?? 0}
                              </span>{" "}
                              trong kho
                            </span>
                            <Button
                              type="button"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                globalThis.window.location.href = `/products/${product._id || product.id}`;
                              }}
                            >
                              Mua
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 md:gap-3 mt-6 md:mt-8">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 md:h-11 md:w-11"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Trang trước"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? "default" : "outline"}
                      className="h-10 w-10 md:h-11 md:w-11 text-base"
                      onClick={() => setCurrentPage(pageNum)}
                      aria-label={`Trang ${pageNum}`}
                      aria-current={
                        pageNum === currentPage ? "page" : undefined
                      }
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 md:h-11 md:w-11"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="Trang sau"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ProductsLoading() {
  return (
    <div className="container py-6 md:py-8">
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Đang tải sản phẩm...</p>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsContent />
    </Suspense>
  );
}
