"use client";

import dynamic from "next/dynamic";
import {
  HeroSection,
  FeaturesRow,
  FeaturedProducts,
  CategoryFilter,
  CTASection,
} from "@/components/home";

// Dynamic import for animated background to reduce initial bundle size
// ssr: false because animations only run on client
const AnimatedBackground = dynamic(
  () => import("@/components/home/AnimatedBackground").then((mod) => mod.AnimatedBackground),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500" />
    ),
  }
);

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Animated gradient background - dynamically loaded */}
      <AnimatedBackground />

      {/* Content - Centered */}
      <div className="relative z-0 flex flex-col">
        {/* Hero Section */}
        <HeroSection />

        {/* Features Row */}
        <FeaturesRow />

        {/* Featured Products */}
        <FeaturedProducts />

        {/* Category Filter & Products */}
        <CategoryFilter />

        {/* CTA Section */}
        <CTASection />
      </div>
    </div>
  );
}
