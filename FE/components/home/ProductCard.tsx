"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image?: string;
  gradient?: string;
  className?: string;
  variant?: "default" | "compact" | "featured";
}

export function ProductCard({
  id,
  name,
  price,
  image,
  gradient = "from-violet-400 via-fuchsia-400 to-pink-400",
  className = "",
  variant = "default",
}: ProductCardProps) {
  // Variant-specific styles
  const imageHeight = variant === "featured" ? "h-32" : variant === "compact" ? "h-20" : "h-40";
  const cardPadding = variant === "compact" ? "p-2" : "p-4";
  const titleSize = variant === "compact" ? "text-xs" : "text-sm";
  const buttonSize = variant === "compact" ? "text-[10px] px-2 py-1 h-6" : "text-xs px-3 py-1.5 h-7";

  const hasImage = image && image.trim() !== '';
  const [imageError, setImageError] = useState(false);

  return (
    <Link
      href={`/products/${id}`}
      className={`group relative flex flex-col h-full backdrop-blur-md bg-white/90 border border-white/20 rounded-lg overflow-hidden hover:shadow-lg hover:border-violet-300 transition-all duration-200 ${className}`}
    >
      {/* Image - Improved display with better height and full image support */}
      <div className={`${imageHeight} w-full bg-gradient-to-br ${gradient} relative overflow-hidden flex-shrink-0 flex items-center justify-center`}>
        {/* Product Image - Always render when image URL exists */}
        {hasImage && !imageError && (
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 relative z-20" 
            onError={() => {
              // Fallback to gradient if image fails to load
              setImageError(true);
            }}
          />
        )}
        {/* Fallback gradient with initial - Only show when no image or image failed */}
        {(!hasImage || imageError) && (
          <div className="image-fallback absolute inset-0 bg-gradient-to-br from-white/20 to-transparent flex items-center justify-center z-10">
            <span className="text-white/60 font-bold text-2xl">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`${cardPadding} flex flex-col flex-1 min-h-0`}>
        {/* Name */}
        <h3 className={`${titleSize} font-medium text-foreground line-clamp-2 mb-2 group-hover:text-violet-600 transition-colors leading-tight flex-1`}>
          {name}
        </h3>

        {/* Price & Button */}
        <div className="flex items-center justify-between gap-2 mt-auto">
          <p className={`${titleSize} font-bold text-foreground truncate`}>
            {price.toLocaleString("vi-VN")}đ
          </p>
          <Button
            size="sm"
            className={`bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 rounded-full ${buttonSize} flex-shrink-0`}
            onClick={(e) => e.preventDefault()}
          >
            Mua ngay
          </Button>
        </div>
      </div>
    </Link>
  );
}
