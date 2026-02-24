"use client";

import Link from "next/link";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import {
    Tv,
    Bot,
    Gamepad2,
    Share2,
    Briefcase,
    ArrowRight,
} from "lucide-react";

const categories = [
    {
        title: "Tài khoản giải trí",
        description: "Netflix, Spotify, Disney+, YouTube Premium và nhiều hơn nữa.",
        icon: Tv,
        count: "120+ sản phẩm",
        href: "/products?category=streaming",
    },
    {
        title: "Công cụ AI",
        description: "ChatGPT, Midjourney, Claude, Copilot và các công cụ AI hàng đầu.",
        icon: Bot,
        count: "85+ sản phẩm",
        href: "/products?category=ai-tools",
    },
    {
        title: "Tài khoản Gaming",
        description: "Steam, Epic Games, PlayStation, Xbox và các tài khoản game.",
        icon: Gamepad2,
        count: "200+ sản phẩm",
        href: "/products?category=gaming",
    },
    {
        title: "Mạng xã hội",
        description: "Instagram, TikTok, Facebook, Twitter - tài khoản xác minh.",
        icon: Share2,
        count: "150+ sản phẩm",
        href: "/products?category=social-media",
    },
    {
        title: "Công cụ làm việc",
        description: "Microsoft 365, Adobe CC, Notion, Figma Pro và nhiều hơn nữa.",
        icon: Briefcase,
        count: "90+ sản phẩm",
        href: "/products?category=productivity",
    },
];

export function CategoriesSection() {
    return (
        <section id="categories" className="py-16 md:py-20 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-5 lg:px-6">
                {/* Section Header */}
                <div className="max-w-2xl mb-12">
                    <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">
                        Danh mục
                    </p>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
                        Khám phá theo danh mục
                    </h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        Tìm kiếm chính xác những gì bạn cần từ các danh mục sản phẩm được tuyển chọn.
                    </p>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((category) => (
                        <Link
                            key={category.title}
                            href={category.href}
                            className="group"
                        >
                            <Card className="h-full border bg-card hover:border-primary/30 transition-colors duration-200 py-0">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/5 border border-primary/10 shrink-0 group-hover:bg-primary/10 transition-colors">
                                            <category.icon className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors">
                                                    {category.title}
                                                </h3>
                                                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                                                {category.description}
                                            </p>
                                            <span className="text-xs font-medium text-primary/70">
                                                {category.count}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
