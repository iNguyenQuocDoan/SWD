"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, Zap, ArrowRight, Star } from "lucide-react";

import { motion } from "framer-motion";

export function HeroSection() {
    return (
        <section className="relative py-16 md:py-24 lg:py-28 overflow-hidden">
            <div className="container mx-auto px-4 sm:px-5 lg:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-xl"
                    >
                        <Badge
                            variant="secondary"
                            className="mb-6 px-3 py-1 text-xs font-medium tracking-wide uppercase border border-border"
                        >
                            Đáng tin cậy bởi 10,000+ người dùng
                        </Badge>

                        <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-[1.15] tracking-tight text-foreground mb-6">
                            Mua Tài Khoản Số{" "}
                            <span className="text-primary">Uy Tín & An Toàn</span>
                        </h1>

                        <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-md">
                            Sàn giao dịch tài khoản số hàng đầu - License key, Subscription,
                            và các công cụ AI. Thanh toán bảo mật, người bán xác minh, giao
                            hàng tức thì.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 mb-10">
                            <Button size="lg" className="h-12 px-8 text-base font-semibold" asChild>
                                <Link href="/register">
                                    Đăng ký ngay
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="h-12 px-8 text-base font-semibold"
                                asChild
                            >
                                <Link href="/products">
                                    Khám phá sản phẩm
                                </Link>
                            </Button>
                        </div>

                        {/* Trust Indicators */}
                        <div className="flex flex-wrap gap-6">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 dark:bg-green-950">
                                    <Shield className="h-4 w-4 text-green-600" />
                                </div>
                                <span className="font-medium">Thanh toán bảo mật</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950">
                                    <CheckCircle className="h-4 w-4 text-blue-600" />
                                </div>
                                <span className="font-medium">Người bán xác minh</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950">
                                    <Zap className="h-4 w-4 text-amber-600" />
                                </div>
                                <span className="font-medium">Giao hàng tức thì</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Side - Phone Mockup with Floating Animation */}
                    <div className="hidden lg:block relative">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="relative z-10"
                        >
                            {/* Floating Container */}
                            <motion.div
                                animate={{
                                    y: [0, -20, 0],
                                }}
                                transition={{
                                    duration: 6,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                                className="relative w-full max-w-[450px] mx-auto group"
                            >
                                {/* Decorative background glow */}
                                <div className="absolute -inset-4 bg-primary/10 rounded-[3rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                <img
                                    src="/chatgpt-mockup.png"
                                    alt="ChatGPT Mobile Mockup"
                                    className="w-full h-auto drop-shadow-[0_25px_50px_rgba(0,0,0,0.15)] transition-transform duration-700 group-hover:scale-[1.02] relative z-10"
                                />

                                {/* Floating Stats Card */}
                                <motion.div
                                    animate={{
                                        y: [0, 10, 0],
                                    }}
                                    transition={{
                                        duration: 4,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                    className="absolute -bottom-6 -left-12 bg-card border rounded-2xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] z-20"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                                            <CheckCircle className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg leading-none">50,000+</p>
                                            <p className="text-xs text-muted-foreground mt-1">Giao dịch thành công</p>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Additional floating tag */}
                                <motion.div
                                    animate={{
                                        y: [0, -15, 0],
                                        rotate: [12, 15, 12],
                                    }}
                                    transition={{
                                        duration: 5,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                    className="absolute top-1/4 -right-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border rounded-full px-4 py-2 shadow-sm z-20 border-primary/20"
                                >
                                    <span className="text-xs font-semibold text-primary">✓ Được ChatGPT xác nhận</span>
                                </motion.div>
                            </motion.div>

                            {/* Background geometric shapes */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-50/50 dark:bg-blue-900/10 rounded-full blur-2xl -z-10" />
                            <div className="absolute bottom-10 -left-10 w-32 h-32 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-full blur-2xl -z-10" />
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
