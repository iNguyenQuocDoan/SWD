"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Star, ArrowRight, ShoppingCart, Loader2 } from "lucide-react";
import { useFeaturedProducts } from "@/lib/hooks/useProducts";
import { formatCurrency } from "@/lib/utils";

export function FeaturedProductsSection() {
    const { products, loading, error } = useFeaturedProducts(6);

    return (
        <section className="py-16 md:py-20">
            <div className="container mx-auto px-4 sm:px-5 lg:px-6">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
                    <div className="max-w-2xl">
                        <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">
                            Nổi bật
                        </p>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
                            Sản phẩm hàng đầu
                        </h2>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            Tài khoản premium và subscription được tuyển chọn từ người bán xác minh.
                        </p>
                    </div>
                    <Button variant="outline" className="h-10 self-start sm:self-auto" asChild>
                        <Link href="/products">
                            Xem tất cả sản phẩm
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
                        {[...Array(6)].map((_, i) => (
                            <Card key={i} className="border bg-card animate-pulse py-0 overflow-hidden">
                                <CardContent className="p-5">
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className="w-11 h-11 rounded-xl bg-muted shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-muted rounded w-3/4" />
                                            <div className="h-3 bg-muted rounded w-1/2" />
                                        </div>
                                    </div>
                                    <div className="h-8 bg-muted rounded mb-4" />
                                    <div className="h-4 bg-muted rounded w-1/4 mb-4" />
                                    <div className="h-6 bg-muted rounded w-1/2" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="text-center py-20 border rounded-2xl bg-muted/20">
                        <p className="text-muted-foreground mb-4">Không thể tải danh sách sản phẩm.</p>
                        <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                            Thử lại
                        </Button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && products.length === 0 && (
                    <div className="text-center py-20 border rounded-2xl bg-muted/20">
                        <p className="text-muted-foreground">Hiện chưa có sản phẩm nổi bật nào.</p>
                    </div>
                )}

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {!loading && !error && products.map((product) => {
                        // Get platform/shop info if available in the response
                        const platform = (product as any).platformId;
                        const shop = (product as any).shopId;

                        return (
                            <Card
                                key={product.id || product._id}
                                className="group border bg-card hover:border-primary/20 transition-all duration-300 py-0 overflow-hidden hover:shadow-md"
                            >
                                <CardContent className="p-5">
                                    {/* Product Header */}
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className="w-11 h-11 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                                            {product.thumbnailUrl ? (
                                                <img
                                                    src={product.thumbnailUrl}
                                                    alt={product.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="font-bold text-primary">{product.title.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h3 className="font-semibold text-sm truncate text-foreground group-hover:text-primary transition-colors">
                                                    {product.title}
                                                </h3>
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {platform?.name || (product as any).category || "Sản phẩm số"}
                                            </p>
                                        </div>
                                        {product.salesCount && product.salesCount > 50 && (
                                            <Badge className="text-[10px] px-2 py-0.5 shrink-0 bg-orange-500 text-white border-0">
                                                Bán chạy
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Metrics/Description Snippet */}
                                    <div className="px-3 py-2 rounded-lg bg-muted/50 border border-border/50 mb-4 h-10 overflow-hidden">
                                        <p className="text-[11px] text-muted-foreground line-clamp-2">
                                            {product.description || `Gói ${product.planType} • Bảo hành ${product.durationDays} ngày`}
                                        </p>
                                    </div>

                                    {/* Rating */}
                                    <div className="flex items-center gap-1.5 mb-4">
                                        <div className="flex items-center gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-3.5 w-3.5 ${i < Math.floor(product.avgRating || 5)
                                                            ? "fill-amber-400 text-amber-400"
                                                            : "fill-muted text-muted"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-xs font-medium">{product.avgRating || "5.0"}</span>
                                        <span className="text-xs text-muted-foreground">
                                            ({(product.reviewCount || 0).toLocaleString()})
                                        </span>
                                    </div>

                                    {/* Price */}
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-lg font-bold text-foreground">
                                            {formatCurrency(product.price)}
                                        </span>
                                        {(product as any).oldPrice && (
                                            <span className="text-sm text-muted-foreground line-through">
                                                {formatCurrency((product as any).oldPrice)}
                                            </span>
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter className="p-5 pt-0">
                                    <Button
                                        className="w-full h-9 text-sm"
                                        size="sm"
                                        asChild
                                    >
                                        <Link href={`/products/${product.id || product._id}`}>
                                            <ShoppingCart className="mr-2 h-3.5 w-3.5" />
                                            Xem chi tiết
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
