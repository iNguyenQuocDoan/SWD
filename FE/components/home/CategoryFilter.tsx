"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FadeIn, StaggerItem } from "@/components/animations";
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
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useProducts } from "@/lib/hooks/useProducts";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

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

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: "center",
      loop: true,
      skipSnaps: false,
      slidesToScroll: 1,
      containScroll: "trimSnaps",
    },
    [
      Autoplay({
        delay: 3500,
        stopOnInteraction: true,
        stopOnMouseEnter: true,
      }),
    ]
  );

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [snapCount, setSnapCount] = useState(0);

  const pageSize = 1;
  const pageCount = snapCount ? Math.ceil(snapCount / pageSize) : 0;
  const selectedPage = Math.floor(selectedIndex / pageSize);

  const updateScrollButtons = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setSnapCount(emblaApi.scrollSnapList().length);
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const scrollToPage = useCallback(
    (pageIndex: number) => {
      if (!emblaApi) return;
      emblaApi.scrollTo(pageIndex);
    },
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;
    updateScrollButtons();
    emblaApi.on("select", updateScrollButtons);
    emblaApi.on("reInit", updateScrollButtons);
    return () => {
      emblaApi.off("select", updateScrollButtons);
      emblaApi.off("reInit", updateScrollButtons);
    };
  }, [emblaApi, updateScrollButtons]);

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    const category = categories.find((c) => c.id === categoryId);
    const platformId = category?.platformId;
    setFilter(platformId ? { platformId, limit: 8 } : { limit: 8 });
  };

  return (
    <section className="py-12 md:py-16 lg:py-20 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <FadeIn direction="up">
          <div className="flex items-center justify-between mb-8">
            <div className="w-full lg:max-w-[calc(100%-140px)]">
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

        {/* Product Grid (mobile/tablet) */}
        {!loading && !error && products.length > 0 && (
          <div className="block lg:hidden">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
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
            </div>
          </div>
        )}

        {/* Product Carousel (desktop) */}
        {!loading && !error && products.length > 0 && (
          <div className="hidden lg:block">
            <div className="relative">
              <div className="overflow-visible" ref={emblaRef}>
                <div className="flex -ml-6 py-8 items-center">
                  {products.map((product, index) => (
                    <div
                      key={product._id || product.id}
                      className={`pl-6 flex-[0_0_33.3333%] transition-all duration-300 origin-center ${(() => {
                        const total = snapCount || products.length;
                        if (!total) return "opacity-100 scale-100 z-10";
                        const diff = Math.abs(index - selectedIndex);
                        const wrapped = Math.min(diff, total - diff);
                        if (wrapped === 0) return "opacity-100 scale-100 z-20 group-hover:z-50";
                        if (wrapped === 1) return "opacity-45 scale-90 z-10";
                        return "opacity-0 scale-75 z-0 pointer-events-none";
                      })()}`}
                    >
                      <ProductCard
                        id={product._id || product.id || ""}
                        name={product.title}
                        price={product.price}
                        image={product.thumbnailUrl || undefined}
                        gradient={gradients[index % gradients.length]}
                        variant="carousel"
                        description="Sản phẩm hot trong danh mục này"
                        className="shadow-md"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="icon"
                className="absolute -left-6 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white shadow-md z-20"
                onClick={scrollPrev}
                disabled={!canScrollPrev}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="absolute -right-6 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white shadow-md z-20"
                onClick={scrollNext}
                disabled={!canScrollNext}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
              
              {/* Pagination Dots */}
              {pageCount > 1 && (
                <div className="flex justify-center items-center mt-6 gap-2">
                  {Array.from({ length: pageCount }).map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => scrollToPage(index)}
                      className={`h-2.5 w-2.5 rounded-full transition-colors ${index === selectedPage ? "bg-violet-600" : "bg-gray-300 hover:bg-gray-400"}`}
                      aria-label={`Go to item ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
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
