"use client";

import { ShoppingBag, Shield, Zap, TrendingUp } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";

const features = [
  {
    icon: ShoppingBag,
    title: "Giao hàng tức thì",
    description: "Nhận license key ngay sau thanh toán",
    color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
  },
  {
    icon: Shield,
    title: "Bảo vệ người mua",
    description: "Hệ thống escrow giữ tiền an toàn",
    color: "text-green-600 bg-green-100 dark:bg-green-900/30",
  },
  {
    icon: TrendingUp,
    title: "Đánh giá uy tín",
    description: "Hệ thống Trust Level minh bạch",
    color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
  },
];

export function FeaturesRow() {
  return (
    <section className="py-16 md:py-24 border-y border-white/10 bg-white/[0.02] backdrop-blur-sm relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-violet-500/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-fuchsia-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <FadeIn direction="up">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold text-violet-500 dark:text-violet-400 uppercase tracking-[0.2em] mb-3">
              THE AMAZING DIGITAL MARKETPLACE
            </h2>
            <div className="h-1 w-12 bg-gradient-to-r from-violet-600 to-fuchsia-600 mx-auto rounded-full" />
          </div>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-6xl mx-auto">
          {features.map((feature) => (
            <StaggerItem key={feature.title}>
              <div className="group flex flex-col items-center text-center space-y-5 p-6 rounded-3xl transition-all duration-300 hover:bg-white/[0.04] dark:hover:bg-white/[0.02]">
                <div className={`relative p-5 rounded-2xl ${feature.color} shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                  <feature.icon className="h-8 w-8 stroke-[1.5px]" />
                  {/* Subtle glow */}
                  <div className="absolute inset-0 rounded-2xl bg-current opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-violet-600 transition-colors">{feature.title}</h3>
                  <p className="text-base text-muted-foreground leading-relaxed max-w-[250px]">{feature.description}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
