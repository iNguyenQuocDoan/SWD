"use client";

import { Search, CreditCard, Zap } from "lucide-react";

const steps = [
    {
        step: "01",
        icon: Search,
        title: "Duyệt sản phẩm",
        description:
            "Khám phá sàn giao dịch với hàng nghìn tài khoản số đã xác minh. Lọc theo danh mục, giá và đánh giá.",
    },
    {
        step: "02",
        icon: CreditCard,
        title: "Thanh toán bảo mật",
        description:
            "Thanh toán an toàn với hệ thống ký quỹ. Tiền của bạn được bảo vệ cho đến khi xác nhận nhận hàng.",
    },
    {
        step: "03",
        icon: Zap,
        title: "Nhận hàng tức thì",
        description:
            "Nhận thông tin tài khoản ngay sau khi thanh toán. Bắt đầu sử dụng sản phẩm số mới ngay lập tức.",
    },
];

export function HowItWorksSection() {
    return (
        <section id="how-it-works" className="py-16 md:py-20 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-5 lg:px-6">
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">
                        Quy trình
                    </p>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
                        Đơn giản. An toàn. Nhanh chóng.
                    </h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        Ba bước đơn giản để sở hữu tài khoản số premium được giao hàng tức thì.
                    </p>
                </div>

                {/* Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-4xl mx-auto">
                    {steps.map((item, index) => (
                        <div key={index} className="relative text-center md:text-left">
                            {/* Connector Line (desktop only) */}
                            {index < steps.length - 1 && (
                                <div className="hidden md:block absolute top-8 left-[calc(50%+32px)] right-[calc(-50%+32px)] h-px bg-border" />
                            )}

                            {/* Step Number */}
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl border-2 border-border bg-card mb-6 relative">
                                <item.icon className="h-6 w-6 text-primary" />
                                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                                    {item.step}
                                </span>
                            </div>

                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                {item.title}
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto md:mx-0">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
