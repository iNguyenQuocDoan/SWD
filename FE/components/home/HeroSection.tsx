"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle2, Loader2, ShoppingBag } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem, AnimatedCounter } from "@/components/animations";
import { motion } from "framer-motion";
import { statsService } from "@/lib/services/stats.service";
import { useState, useEffect } from "react";

export function HeroSection() {
  const [stats, setStats] = useState({
    totalProducts: 98000,
    totalTransactions: 12000,
    totalSellers: 15000,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await statsService.getStats();
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch (error) {
        // Silently handle error
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <section className="relative min-h-[calc(100vh-80px)] lg:min-h-[550px] w-full flex items-center overflow-hidden py-8 md:py-12 lg:py-14">

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Text Content */}
          <div className="space-y-5 md:space-y-6 text-center lg:text-left lg:pl-20 xl:pl-24">

            {/* Badge */}
            <FadeIn direction="down" delay={0.1}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md bg-white/20 border border-white/30 text-white text-sm font-medium drop-shadow-md">
                <Sparkles className="h-4 w-4" />
                <span>Nền tảng uy tín #1 Việt Nam</span>
              </div>
            </FadeIn>

            {/* Headline */}
            <StaggerContainer staggerDelay={0.1} initialDelay={0.2}>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight max-w-xl">
                <StaggerItem>
                  <span className="block text-white drop-shadow-lg">MARKETPLACE</span>
                </StaggerItem>
                <StaggerItem>
                  <span className="block bg-gradient-to-r from-white via-violet-100 to-white bg-clip-text text-transparent drop-shadow-lg">
                    SẢN PHẨM SỐ
                  </span>
                </StaggerItem>
                <StaggerItem>
                  <span className="block text-white drop-shadow-lg">UY TÍN</span>
                </StaggerItem>
              </h1>
            </StaggerContainer>

            {/* Description */}
            <FadeIn direction="up" delay={0.5}>
              <p className="text-base md:text-lg text-white/90 max-w-xl leading-relaxed drop-shadow-md mx-auto lg:mx-0">
                Mua bán license key, subscription và các sản phẩm số với{" "}
                <span className="text-white font-medium drop-shadow-lg">
                  hệ thống bảo vệ người mua toàn diện
                </span>
              </p>
            </FadeIn>

            {/* Trust indicators */}
            <FadeIn direction="up" delay={0.6}>
              <div className="flex flex-wrap items-center gap-3 text-sm text-white/90 drop-shadow-md justify-center lg:justify-start">
                {[
                  "Giao dịch an toàn",
                  "Bảo vệ người mua",
                  "Hỗ trợ 24/7"
                ].map((item) => (
                  <div key={item} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </FadeIn>

            {/* CTA Buttons */}
            <FadeIn direction="up" delay={0.7}>
              <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="h-12 px-6 text-base font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-300 group rounded-full"
                  asChild
                >
                  <Link href="/products">
                    Khám phá ngay
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-6 text-base font-semibold border-2 rounded-full hover:bg-violet-50 dark:hover:bg-violet-950 transition-all duration-300"
                  asChild
                >
                  <Link href="/seller/register">Đăng ký bán hàng</Link>
                </Button>
              </div>
            </FadeIn>

            {/* Stats */}
            <FadeIn direction="up" delay={0.8}>
              <div className="flex items-center gap-6 pt-3">
                {[
                  { value: stats.totalProducts, suffix: "+", label: "Sản phẩm" },
                  { value: stats.totalTransactions, suffix: "+", label: "Giao dịch" },
                  { value: stats.totalSellers, suffix: "+", label: "Người bán" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-xl md:text-2xl font-bold text-white drop-shadow-lg">
                      {statsLoading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-white inline-block" />
                      ) : (
                        <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                      )}
                    </div>
                    <div className="text-xs text-white/80 mt-0.5 drop-shadow-md">{stat.label}</div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>

          {/* Right: Hero Image */}
          <FadeIn direction="left" delay={0.4} className="hidden lg:block relative h-[500px]">
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Animated Glow behind the image */}
              <motion.div
                className="absolute w-[450px] h-[450px] bg-violet-500/20 blur-[100px] rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              />

              <motion.div
                className="relative z-10 w-full h-full flex items-center justify-center"
                animate={{
                  y: [-15, 15, -15],
                  rotate: [-1, 1, -1]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="relative group">
                  {/* Subtle outer glow on hover */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <Image
                    src="/images/Hero.png"
                    alt="Marketplace Hero"
                    width={450}
                    height={450}
                    className="relative z-10 object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] filter contrast-[1.05]"
                    priority
                  />
                </div>
              </motion.div>

              {/* Decorative elements to maintain the floaty feel */}
              <motion.div
                className="absolute top-1/4 right-[10%] w-3 h-3 bg-violet-400 rounded-full blur-[1px] shadow-[0_0_15px_rgba(167,139,250,0.8)]"
                animate={{ y: [0, -20, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute bottom-1/4 left-[10%] w-4 h-4 bg-fuchsia-400 rounded-full blur-[1px] shadow-[0_0_15px_rgba(232,121,249,0.8)]"
                animate={{ y: [0, 20, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              />
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
