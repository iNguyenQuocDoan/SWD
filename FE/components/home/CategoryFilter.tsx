"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";
import { ProductCard } from "./ProductCard";
import {
  Filter,
  ArrowRight,
  LayoutGrid,
  Monitor,
  FileSpreadsheet,
  Shield,
  Lock,
  Gamepad2,
  Palette,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useProducts } from "@/lib/hooks/useProducts";

interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  platformId?: string;
}

const categories: Category[] = [
  { id: "all", name: "Tất cả", icon: LayoutGrid },
  { id: "windows", name: "Windows", icon: Monitor, platformId: "windows" },
  { id: "office", name: "Office", icon: FileSpreadsheet, platformId: "office" },
  { id: "antivirus", name: "Antivirus", icon: Shield, platformId: "antivirus" },
  { id: "vpn", name: "VPN", icon: Lock, platformId: "vpn" },
  { id: "games", name: "Game Keys", icon: Gamepad2, platformId: "games" },
  { id: "creative", name: "Creative", icon: Palette, platformId: "creative" },
];

// Gradient presets for visual variety
const gradients = [
  "from-violet-400 to-pink-400",
  "from-orange-400 to-yellow-300",
  "from-cyan-400 to-blue-400",
  "from-pink-400 to-rose-400",
  "from-emerald-400 to-teal-400",
  "from-amber-400 to-orange-400",
];

export function CategoryFilter() {
  const [activeCategory, setActiveCategory] = useState("all");

  const { products, loading, error, setFilter } = useProducts({
    initialFilter: { limit: 8 },
    autoFetch: true,
  });

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    const category = categories.find((c) => c.id === categoryId);
    const platformId = category?.platformId;
    setFilter(platformId ? { platformId, limit: 8 } : { limit: 8 });
  };

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-b from-muted/30 to-background overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Section Header */}
        <FadeIn direction="up">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                KHÁM PHÁ THÊM
              </h2>
              <p className="text-muted-foreground mt-2">
                Tìm kiếm sản phẩm theo danh mục
              </p>
            </div>
            <Button variant="ghost" className="self-start md:self-auto gap-2">
              <Filter className="h-4 w-4" />
              Bộ lọc
            </Button>
          </div>
        </FadeIn>

        {/* Category Tabs */}
        <FadeIn direction="up" delay={0.1}>
          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  className={`rounded-full transition-all ${
                    activeCategory === category.id
                      ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 border-0"
                      : "hover:border-violet-300 hover:text-violet-600"
                  }`}
                  onClick={() => handleCategoryChange(category.id)}
                >
                  <IconComponent className="h-4 w-4 mr-2" />
                  {category.name}
                </Button>
              );
            })}
          </div>
        </FadeIn>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-20 text-muted-foreground">
            <p>Không thể tải sản phẩm. Vui lòng thử lại sau.</p>
          </div>
        )}

        {/* Product Grid */}
        {!loading && !error && products.length > 0 && (
          <StaggerContainer
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            staggerDelay={0.05}
          >
            {products.map((product, index) => (
              <StaggerItem key={product._id || product.id}>
                <ProductCard
                  id={product._id || product.id || ""}
                  name={product.title}
                  price={product.price}
                  image={product.thumbnailUrl || undefined}
                  gradient={gradients[index % gradients.length]}
                  variant="default"
                  className="shadow-md"
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p>Chưa có sản phẩm nào trong danh mục này.</p>
          </div>
        )}

        {/* View All Button */}
        <FadeIn direction="up" delay={0.3}>
          <div className="text-center mt-10">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full h-12 px-8"
              asChild
            >
              <Link
                href={`/products${activeCategory !== "all" ? `?category=${activeCategory}` : ""}`}
              >
                Xem tất cả{" "}
                {categories
                  .find((c) => c.id === activeCategory)
                  ?.name.toLowerCase()}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
