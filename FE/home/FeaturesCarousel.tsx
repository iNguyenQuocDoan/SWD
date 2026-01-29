"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const features = [
    {
        id: 1,
        title: "Claude",
        description: "Sử dụng Claude để viết code một cách nhanh chóng và hiệu quả",
        imageSrc: "/Claude.png",
    },
    {
        id: 2,
        title: "ChatGPT",
        description: "Sử dụng ChatGPT nghiên cứu và tìm kiếm thông tin",
        imageSrc: "/ChatGPT.png",
    },
    {
        id: 3,
        title: "DeepSeek",
        description: "Sử dụng DeepSeek tham khảo các nội dung liên quan đến nghiên cứu thị trường",
        imageSrc: "/DeepSeek.png",
    },
];

export default function FeaturesCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    useEffect(() => {
        if (!isAutoPlaying) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % features.length);
        }, 4000);

        return () => clearInterval(timer);
    }, [isAutoPlaying]);

    const goToPrev = () => {
        setIsAutoPlaying(false);
        setCurrentIndex((prev) => (prev - 1 + features.length) % features.length);
    };

    const goToNext = () => {
        setIsAutoPlaying(false);
        setCurrentIndex((prev) => (prev + 1) % features.length);
    };

    return (
        <section id="features" className="section-spacing">
            <div className="container-custom">
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-2 bg-[var(--surface)] text-[var(--primary)] text-sm font-semibold rounded-full mb-4">
                        Features
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] mb-4">
                        Everything you need
                    </h2>
                    <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
                        Powerful features to help your team work smarter, not harder
                    </p>
                </div>

                {/* Carousel */}
                <div className="relative max-w-5xl mx-auto">
                    {/* Navigation Arrows */}
                    <button
                        onClick={goToPrev}
                        className="absolute left-0 lg:-left-16 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-[var(--surface)] transition-colors"
                        aria-label="Previous feature"
                    >
                        <svg className="w-6 h-6 text-[var(--text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <button
                        onClick={goToNext}
                        className="absolute right-0 lg:-right-16 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-[var(--surface)] transition-colors"
                        aria-label="Next feature"
                    >
                        <svg className="w-6 h-6 text-[var(--text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Cards Container */}
                    <div className="overflow-hidden px-4">
                        <div
                            className="flex transition-transform duration-500 ease-out"
                            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                        >
                            {features.map((feature) => (
                                <div
                                    key={feature.id}
                                    className="w-full flex-shrink-0 px-2"
                                >
                                    <div className="bg-white rounded-2xl p-8 shadow-lg hover-lift">
                                        <div className="relative h-48 sm:h-64 rounded-xl mb-6 overflow-hidden bg-[var(--surface)]">
                                            <Image
                                                src={feature.imageSrc}
                                                alt={feature.title}
                                                fill
                                                className="object-contain"
                                                sizes="(max-width: 640px) 100vw, 1026px"
                                            />
                                        </div>
                                        <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-3">
                                            {feature.title}
                                        </h3>
                                        <p className="text-[var(--text-secondary)]">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Dots Indicator */}
                    <div className="flex justify-center gap-2 mt-8">
                        {features.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setIsAutoPlaying(false);
                                    setCurrentIndex(index);
                                }}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex
                                        ? "w-8 bg-[var(--primary)]"
                                        : "bg-[var(--surface)]"
                                    }`}
                                aria-label={`Go to feature ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
