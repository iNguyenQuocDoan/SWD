"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingBag, TrendingUp, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { FadeIn } from "@/components/animations";
import { motion } from "framer-motion";

export function CTASection() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-white/5 dark:bg-black/20">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-fuchsia-600/10 blur-[120px] rounded-full" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left: Premium Floating Showcase */}
          <FadeIn direction="right" delay={0.2}>
            <div className="relative h-[450px] hidden lg:flex justify-center items-center">
              <div className="relative w-full max-w-[500px]">
                {/* Main "Shop" Mockup */}
                <motion.div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[400px] rounded-[2.5rem] bg-white/80 dark:bg-neutral-900/80 border border-white/40 dark:border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] backdrop-blur-2xl z-20 flex flex-col p-6 overflow-hidden"
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white font-bold">DS</div>
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 w-3/4 bg-muted rounded-full animate-pulse" />
                    <div className="h-32 w-full bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/20 dark:to-fuchsia-900/20 rounded-2xl border border-dashed border-violet-200 dark:border-violet-800 flex items-center justify-center">
                      <ShoppingBag className="w-12 h-12 text-violet-400 opacity-50" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-10 rounded-xl bg-violet-600/10 dark:bg-violet-600/20" />
                      <div className="h-10 rounded-xl bg-fuchsia-600/10 dark:bg-fuchsia-600/20" />
                    </div>
                  </div>
                </motion.div>

                {/* Floating Stats Card */}
                <motion.div
                  className="absolute -right-4 top-10 w-48 p-4 rounded-3xl bg-white/90 dark:bg-neutral-800/90 border border-white dark:border-white/5 shadow-2xl backdrop-blur-xl z-30"
                  animate={{ y: [0, 20, 0], x: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Doanh thu</p>
                      <p className="text-lg font-black text-emerald-600">+125%</p>
                    </div>
                  </div>
                </motion.div>

                {/* Decorative circles */}
                <div className="absolute -left-10 bottom-20 w-32 h-32 bg-fuchsia-500/30 blur-[60px] rounded-full animate-pulse" />
                <div className="absolute -right-10 top-20 w-32 h-32 bg-violet-500/30 blur-[60px] rounded-full animate-pulse" />
              </div>
            </div>
          </FadeIn>

          {/* Right: Content */}
          <FadeIn direction="left" delay={0.3}>
            <div className="space-y-8 lg:max-w-xl">
              <div className="space-y-4">
                <span className="inline-block px-4 py-1.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-sm font-bold tracking-wide uppercase">
                  Dành cho nhà cung cấp
                </span>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground leading-[1.1] tracking-tight">
                  KHỞI TẠO <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">ĐẾ CHẾ</span> KINH DOANH SỐ
                </h2>
              </div>

              <p className="text-xl text-muted-foreground leading-relaxed">
                Đừng để sản phẩm tuyệt vời của bạn bị giới hạn. Tiếp cận hàng triệu khách hàng tiềm năng với nền tảng thương mại điện tử sản phẩm số hàng đầu.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  "Miễn phí duy trì shop",
                  "Phí sàn thấp nhất",
                  "Rút tiền siêu tốc",
                  "Hỗ trợ 1:1 tận tâm",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-violet-600" />
                    </div>
                    <span className="font-semibold text-foreground/80">{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-6">
                <Button
                  size="lg"
                  className="h-16 px-12 text-lg font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 shadow-[0_20px_40px_-15px_rgba(124,58,237,0.4)] hover:shadow-[0_25px_50px_-12px_rgba(124,58,237,0.5)] transition-all duration-300 rounded-full group"
                  asChild
                >
                  <Link href="/seller/register">
                    Bắt đầu ngay bây giờ
                    <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
