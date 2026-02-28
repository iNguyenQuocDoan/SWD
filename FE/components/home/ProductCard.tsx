"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image?: string;
  gradient?: string;
  className?: string;
  description?: string;
  variant?: "default" | "compact" | "featured" | "carousel";
}

export function ProductCard({
  id,
  name,
  price,
  image,
  gradient = "from-violet-400 via-fuchsia-400 to-pink-400",
  className = "",
  description,
  variant = "default",
}: ProductCardProps) {
  // Variant-specific styles
  const imageHeight =
    variant === "featured" ? "h-32" : variant === "compact" ? "h-20" : "h-40";
  const cardPadding = variant === "compact" ? "p-2" : "p-4";
  const titleSize = variant === "compact" ? "text-xs" : "text-sm";
  const buttonSize =
    variant === "compact" ? "text-[10px] px-2 py-1 h-6" : "text-xs px-3 py-1.5 h-7";

  const hasImage = image && image.trim() !== "";
  const isDataUrl = !!(hasImage && image.startsWith("data:"));
  const [imageError, setImageError] = useState(false);

  if (variant === "carousel") {
    return (
      <Link
        href={`/products/${id}`}
        prefetch={true}
        className={`group relative block overflow-visible rounded-2xl ${className}`}
      >
        <div className="">
          <div className="overflow-hidden rounded-2xl border border-white/15 bg-neutral-950/70 shadow-md">
            <div className={`w-full bg-gradient-to-br ${gradient} p-3`}>
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-white/5 flex items-center justify-center">
                {hasImage && !imageError ? (
                  <Image
                    src={image}
                    alt={name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 300px"
                    unoptimized={isDataUrl}
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <span className="text-white/60 font-bold text-5xl">
                    {name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Expanded card (hover): image on top + content panel below */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 w-[420px] -translate-x-1/2 -translate-y-1/2 opacity-0 scale-95 transition-all duration-200 group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto z-50">
          <div className="overflow-hidden rounded-2xl border-0 bg-neutral-950/80 shadow-2xl">
            <div className={`w-full bg-gradient-to-br ${gradient} p-3`}>
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-white/5 flex items-center justify-center">
                {hasImage && !imageError ? (
                  <Image
                    src={image}
                    alt={name}
                    fill
                    className="object-contain"
                    sizes="420px"
                    unoptimized={isDataUrl}
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <span className="text-white/60 font-bold text-5xl">
                    {name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-b from-slate-700/70 to-slate-800/70 px-5 pb-5 pt-4">
              <p className="text-lg font-bold text-white line-clamp-2">{name}</p>
              <p className="mt-1 text-sm text-white/75 line-clamp-2">
                {description || "Sản phẩm hot trong danh mục này"}
              </p>

              <div className="mt-4 flex items-center gap-3">
                <Button
                  size="sm"
                  className="h-10 px-5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700"
                  onClick={(e) => e.preventDefault()}
                >
                  Mua ngay
                </Button>
                <div className="ml-auto text-lg font-bold text-white">
                  {price.toLocaleString("vi-VN")}đ
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/products/${id}`}
      prefetch={true}
      className={`group relative flex flex-col h-full backdrop-blur-xl bg-white/60 dark:bg-neutral-900/60 border border-white/40 dark:border-neutral-800 shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.15)] rounded-2xl overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.25)] hover:border-violet-300/50 dark:hover:border-violet-700/50 transition-all duration-300 ${className}`}
    >
      {/* Background gradient subtle glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 via-transparent to-fuchsia-500/0 group-hover:from-violet-500/5 group-hover:to-fuchsia-500/5 transition-all duration-500 rounded-2xl pointer-events-none" />

      {/* Image Container */}
      <div
        className={`${imageHeight} w-full bg-gradient-to-br ${gradient} relative overflow-hidden flex-shrink-0 flex items-center justify-center rounded-b-2xl shadow-sm`}
      >
        {/* Product Image - Always render when image URL exists */}
        {hasImage && !imageError && (
          <Image
            src={image}
            alt={name}
            fill
            className="object-contain p-2 group-hover:scale-110 group-hover:rotate-1 transition-transform duration-500 ease-out z-20"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
            unoptimized={isDataUrl}
            onError={() => {
              // Fallback to gradient if image fails to load
              setImageError(true);
            }}
          />
        )}
        {/* Fallback gradient with initial - Only show when no image or image failed */}
        {(!hasImage || imageError) && (
          <div className="image-fallback absolute inset-0 bg-gradient-to-br from-white/20 to-black/5 flex items-center justify-center z-10">
            <span className="text-white/80 font-bold text-3xl drop-shadow-md">{name.charAt(0).toUpperCase()}</span>
          </div>
        )}
        {/* Subtle overlay */}
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-300 z-30 pointer-events-none" />
      </div>

      {/* Content */}
      <div className={`${cardPadding} flex flex-col flex-1 min-h-0 relative z-40 bg-white/40 dark:bg-black/20 m-1 rounded-xl`}>
        {/* Name */}
        <h3
          className={`${titleSize} font-semibold text-foreground line-clamp-2 mb-3 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors leading-relaxed flex-1`}
        >
          {name}
        </h3>

        {/* Price & Button */}
        <div className="flex items-center justify-between gap-2 mt-auto">
          <p className={`${titleSize} font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400 truncate`}>
            {price.toLocaleString("vi-VN")}đ
          </p>
          <Button
            size="sm"
            className={`overflow-hidden relative bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-full ${buttonSize} flex-shrink-0 shadow-md group/btn border-0`}
            onClick={(e) => e.preventDefault()}
          >
            <span className="flex items-center gap-1.5 transition-transform duration-300 group-hover/btn:-translate-x-1">
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Mua</span>
            </span>
            <div className="absolute inset-0 h-full w-full opacity-0 group-hover/btn:opacity-20 bg-white transition-opacity duration-300"></div>
          </Button>
        </div>
      </div>
    </Link>
  );
}
