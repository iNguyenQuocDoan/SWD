"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Star, Users, ShieldCheck, TrendingUp, Quote } from "lucide-react";

const testimonials = [
    {
        name: "Nguyễn Minh Tuấn",
        role: "Nhà sáng tạo nội dung",
        content:
            "Mình đã dùng sàn này hơn 6 tháng rồi. Tài khoản luôn được xác minh và giao hàng tức thì. Sàn giao dịch tốt nhất mình từng dùng.",
        rating: 5,
        avatar: "NMT",
    },
    {
        name: "Trần Thu Hà",
        role: "Freelance Designer",
        content:
            "Mua Canva Pro và Adobe CC ở đây. Giá trị tuyệt vời. Hệ thống ký quỹ giúp mình yên tâm với mỗi giao dịch.",
        rating: 5,
        avatar: "TTH",
    },
    {
        name: "Lê Hoàng Nam",
        role: "Lập trình viên",
        content:
            "ChatGPT Plus và GitHub Copilot được giao trong vài giây. Hỗ trợ khách hàng phản hồi nhanh. Rất recommend.",
        rating: 5,
        avatar: "LHN",
    },
];

const stats = [
    {
        icon: Users,
        value: "10,000+",
        label: "Người dùng",
    },
    {
        icon: ShieldCheck,
        value: "50,000+",
        label: "Giao dịch",
    },
    {
        icon: TrendingUp,
        value: "99.2%",
        label: "Tỷ lệ thành công",
    },
    {
        icon: Star,
        value: "4.8/5",
        label: "Đánh giá trung bình",
    },
];

export function TrustSection() {
    return (
        <section className="py-16 md:py-20">
            <div className="container mx-auto px-4 sm:px-5 lg:px-6">
                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
                    {stats.map((stat, i) => (
                        <div
                            key={i}
                            className="flex flex-col items-center p-6 rounded-2xl border bg-card text-center"
                        >
                            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center mb-3">
                                <stat.icon className="h-5 w-5 text-primary" />
                            </div>
                            <span className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                                {stat.value}
                            </span>
                            <span className="text-sm text-muted-foreground">{stat.label}</span>
                        </div>
                    ))}
                </div>

                {/* Testimonials */}
                <div className="max-w-2xl mb-12">
                    <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">
                        Đánh giá
                    </p>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
                        Được hàng nghìn người tin dùng
                    </h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        Xem những gì khách hàng nói về trải nghiệm mua sắm của họ.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {testimonials.map((testimonial, i) => (
                        <Card key={i} className="border bg-card py-0">
                            <CardContent className="p-6">
                                {/* Quote Icon */}
                                <Quote className="h-8 w-8 text-primary/10 mb-4" />

                                {/* Content */}
                                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                                    &ldquo;{testimonial.content}&rdquo;
                                </p>

                                {/* Rating */}
                                <div className="flex items-center gap-0.5 mb-4">
                                    {[...Array(testimonial.rating)].map((_, j) => (
                                        <Star
                                            key={j}
                                            className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                                        />
                                    ))}
                                </div>

                                {/* Author */}
                                <div className="flex items-center gap-3 pt-4 border-t">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                                        {testimonial.avatar}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">
                                            {testimonial.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {testimonial.role}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
