"use client";

import Image from "next/image";

export default function Hero() {
    return (
        <section id="home" className="section-spacing pt-32 md:pt-40 min-h-screen flex items-center">
            <div className="container-custom">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Text Content */}
                    <div className="animate-slide-up">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-[var(--text-primary)] leading-tight mb-6">
                            MarketPlace - Sản Phẩm Số Uy Tín
                        </h1>
                        <p className="text-lg sm:text-xl text-[var(--text-secondary)] mb-8 max-w-lg leading-relaxed">
                            Mua bán license key, subscription và các sản phẩm số với hệ thống bảo vệ người mua toàn diện
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button className="px-8 py-4 bg-[var(--primary)] text-white rounded-xl font-semibold hover:bg-[var(--text-primary)] transition-all duration-300 hover-lift">
                                Mua ngay
                            </button>
                            <button className="px-8 py-4 border-2 border-[var(--surface)] text-[var(--text-secondary)] rounded-xl font-semibold hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all duration-300">
                                Đăng kí bán hàng
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="mt-12 grid grid-cols-3 gap-8">
                            <div>
                                <p className="text-3xl font-bold text-[var(--text-primary)]">10K+</p>
                                <p className="text-sm text-[var(--text-secondary)]">Active Users</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-[var(--text-primary)]">99%</p>
                                <p className="text-sm text-[var(--text-secondary)]">Satisfaction</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-[var(--text-primary)]">24/7</p>
                                <p className="text-sm text-[var(--text-secondary)]">Support</p>
                            </div>
                        </div>
                    </div>

                    {/* Floating Mobile Mockup */}
                    <div className="relative flex justify-center lg:justify-end">
                        <div className="relative animate-float">
                            {/* Phone Frame */}
                            <div className="relative w-64 sm:w-80 h-[500px] sm:h-[600px] rounded-[3rem] bg-gradient-to-br from-[var(--surface)] to-white p-2 shadow-2xl animate-pulse-glow">
                                <div className="w-full h-full rounded-[2.5rem] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative">
                                    {/* Notch */}
                                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-black rounded-full"></div>

                                    {/* Screen Content - Wireframe Style */}
                                    <div className="pt-14 px-4 h-full">
                                        <div className="space-y-4">
                                            {/* Header placeholder */}
                                            <div className="h-8 bg-[var(--surface)] rounded-lg"></div>

                                            <div className="relative h-32 rounded-xl overflow-hidden">
                                                <Image
                                                    src="/sceeniphone.jpg"
                                                    alt="MarketPlace preview"
                                                    fill
                                                    className="object-cover"
                                                    sizes="(max-width: 640px) 256px, 306px"
                                                    priority
                                                />
                                            </div>

                                            <div className="space-y-2 text-sm text-[var(--text-secondary)]">
                                                <p className="font-medium text-[var(--text-primary)]">
                                                    Mua ngay các tài khoản bạn muốn
                                                </p>
                                                <p>Netflix, Canva Pro, Claude AI</p>
                                                <p>Facebook, Twitter, Tiktok</p>
                                            </div>

                                            <button className="h-12 w-full bg-[var(--primary)] text-white rounded-xl font-semibold hover:bg-[var(--text-primary)] transition-all duration-300">
                                                Ghé thăm MarketPlace ngay!
                                            </button>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="relative h-24 rounded-xl overflow-hidden bg-[var(--surface)]">
                                                    <Image
                                                        src="/Netflix.png"
                                                        alt="Netflix"
                                                        fill
                                                        className="object-contain"
                                                        sizes="146px"
                                                    />
                                                </div>
                                                <div className="relative h-24 rounded-xl overflow-hidden bg-[var(--surface)]">
                                                    <Image
                                                        src="/X.jpg"
                                                        alt="X"
                                                        fill
                                                        className="object-contain"
                                                        sizes="146px"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative elements */}
                            <div className="absolute -top-8 -right-8 w-16 h-16 bg-[var(--primary)] rounded-full opacity-20 blur-xl"></div>
                            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-[var(--surface)] rounded-full opacity-60 blur-2xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
