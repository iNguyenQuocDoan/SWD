"use client";

import Image from "next/image";

const opportunities = [
    {
        id: 1,
        title: "Instant Delivery",
        description: "Nhận sản phẩm ngay sau khi thanh toán, không cần chờ đợi",
        imageSrc: "/Immediate delivery.png",
    },
    {
        id: 2,
        title: "Guarantee",
        description: "Đảm bảo sản phẩm chính hãng, đảm bảo kích hoạt thành công",
        imageSrc: "/guarantee.png",
    },
];

export default function Opportunities() {
    return (
        <section className="section-spacing bg-[var(--surface)]">
            <div className="container-custom">
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-2 bg-white text-[var(--primary)] text-sm font-semibold rounded-full mb-4">
                        Opportunities
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] mb-4">
                        Our Opportunities
                    </h2>
                    <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
                        Discover how our platform helps teams grow faster
                    </p>
                </div>

                {/* Grid */}
                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {opportunities.map((item, index) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-2xl overflow-hidden shadow-lg hover-lift group"
                        >
                            <div className="relative h-48 sm:h-64 overflow-hidden">
                                <Image
                                    src={item.imageSrc}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 486px"
                                />
                            </div>

                            {/* Content */}
                            <div className="p-6 sm:p-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-[var(--surface)] rounded-xl flex items-center justify-center">
                                        <span className="text-[var(--primary)] font-bold">{item.id}</span>
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                                        {item.title}
                                    </h3>
                                </div>
                                <p className="text-[var(--text-secondary)] leading-relaxed">
                                    {item.description}
                                </p>

                                {/* Learn more link */}
                                <a
                                    href="#"
                                    className="inline-flex items-center gap-2 mt-6 text-[var(--primary)] font-semibold hover:gap-4 transition-all duration-300"
                                >
                                    Learn more
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
