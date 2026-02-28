"use client";

import { FadeIn } from "@/components/animations";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Loader2 } from "lucide-react";
import { useTopProducts } from "@/lib/hooks/useProducts";
import Link from "next/link";

export function TopProducts() {
  const { products, loading, error } = useTopProducts(5);

  return (
    <FadeIn direction="right" delay={0.3}>
      <div className="backdrop-blur-md bg-white/90 rounded-2xl border border-white/20 p-6 h-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-foreground drop-shadow-sm">TOP SẢN PHẨM</h3>
          <Badge variant="outline" className="text-violet-600 border-violet-200">
            7 ngày qua
          </Badge>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-10 text-muted-foreground text-sm">
            <p>Không thể tải dữ liệu</p>
            {error && <p className="text-xs mt-2 text-red-500">{error}</p>}
          </div>
        )}

        {/* Products List */}
        {!loading && !error && (
          <div className="space-y-4">
            {products.length > 0 ? (
              products.map((product, index) => (
                <Link
                  key={product._id || product.id}
                  href={`/products/${product._id || product.id}`}
                  className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/60 dark:hover:bg-neutral-800/60 hover:shadow-sm border border-transparent hover:border-violet-100 dark:hover:border-violet-500/20 transition-all duration-300 cursor-pointer"
                >
                  {/* Rank */}
                  <div className="w-8 flex justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    {index === 0 && <span className="text-2xl drop-shadow-md">🥇</span>}
                    {index === 1 && <span className="text-2xl drop-shadow-md">🥈</span>}
                    {index === 2 && <span className="text-2xl drop-shadow-md">🥉</span>}
                    {index > 2 && <span className="text-lg font-bold text-muted-foreground">{index + 1}</span>}
                  </div>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm shadow-inner group-hover:rotate-6 transition-transform">
                    {product.title?.charAt(0) || "P"}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 transition-transform duration-300 group-hover:translate-x-1">
                    <p className="font-semibold text-foreground truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{product.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <p className="text-sm font-medium text-muted-foreground/80">
                        {product.price?.toLocaleString("vi-VN")}đ
                      </p>
                      {product.salesCount !== undefined && product.salesCount > 0 && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-muted/50 text-muted-foreground pointer-events-none">
                          Đã bán: {product.salesCount}
                        </Badge>
                      )}
                      {product.avgRating !== undefined && product.avgRating > 0 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 text-amber-600 border-amber-200 bg-amber-50 pointer-events-none">
                          ⭐ {product.avgRating.toFixed(1)}
                          {product.reviewCount !== undefined && product.reviewCount > 0 && (
                            <span className="ml-0.5 opacity-70">({product.reviewCount})</span>
                          )}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Trending indicator */}
                  <div className="flex items-center gap-1 text-emerald-500 group-hover:scale-110 transition-transform bg-emerald-50 dark:bg-emerald-500/10 p-1.5 rounded-full">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-10 text-muted-foreground text-sm">
                <p>Chưa có sản phẩm nào</p>
              </div>
            )}
          </div>
        )}
      </div>
    </FadeIn>
  );
}
