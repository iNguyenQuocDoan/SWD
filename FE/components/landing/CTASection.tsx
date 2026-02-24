"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTASection() {
    return (
        <section className="py-16 md:py-20">
            <div className="container mx-auto px-4 sm:px-5 lg:px-6">
                <div className="relative overflow-hidden rounded-2xl border bg-card p-10 md:p-16 text-center">
                    {/* Subtle grid pattern */}
                    <div
                        className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage:
                                "linear-gradient(rgba(0,0,0,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.1) 1px, transparent 1px)",
                            backgroundSize: "40px 40px",
                        }}
                    />

                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
                            Bắt đầu mua sắm
                            <br />
                            tài khoản số{" "}
                            <span className="text-primary">thông minh</span>
                        </h2>
                        <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-lg mx-auto">
                            Tham gia cùng hàng nghìn người mua hài lòng trên sàn giao dịch tài
                            khoản số uy tín nhất. Tạo tài khoản miễn phí ngay.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                size="lg"
                                className="h-12 px-8 text-base font-semibold"
                                asChild
                            >
                                <Link href="/register">
                                    Tạo tài khoản miễn phí
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="h-12 px-8 text-base font-semibold"
                                asChild
                            >
                                <Link href="/products">Khám phá sản phẩm</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
