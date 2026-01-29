"use client";

import { useState, useEffect } from "react";

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export default function CountdownOffer() {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({
        days: 7,
        hours: 23,
        minutes: 59,
        seconds: 59,
    });

    useEffect(() => {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 7);

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate.getTime() - now;

            if (distance > 0) {
                setTimeLeft({
                    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((distance % (1000 * 60)) / 1000),
                });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const timeBlocks = [
        { label: "Days", value: timeLeft.days },
        { label: "Hours", value: timeLeft.hours },
        { label: "Minutes", value: timeLeft.minutes },
        { label: "Seconds", value: timeLeft.seconds },
    ];

    return (
        <section className="section-spacing bg-[var(--surface)]">
            <div className="container-custom">
                <div className="text-center max-w-3xl mx-auto">
                    <span className="inline-block px-4 py-2 bg-[var(--primary)] text-white text-sm font-semibold rounded-full mb-6">
                        🔥 Limited Time Offer
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] mb-8">
                        Don&apos;t Miss This Deal
                    </h2>

                    {/* Countdown Timer */}
                    <div className="flex justify-center gap-4 sm:gap-6 mb-10">
                        {timeBlocks.map((block) => (
                            <div
                                key={block.label}
                                className="flex flex-col items-center animate-countdown"
                            >
                                <div className="w-16 sm:w-24 h-16 sm:h-24 bg-white rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center mb-2">
                                    <span className="text-2xl sm:text-4xl font-bold text-[var(--text-primary)]">
                                        {String(block.value).padStart(2, "0")}
                                    </span>
                                </div>
                                <span className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
                                    {block.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    <p className="text-[var(--text-secondary)] mb-8 text-lg">
                        Get 50% off your first year when you sign up today
                    </p>

                    <button className="px-10 py-4 bg-[var(--text-primary)] text-white rounded-xl font-semibold text-lg hover:bg-[var(--primary)] transition-all duration-300 hover-lift shadow-lg">
                        Join Now
                    </button>
                </div>
            </div>
        </section>
    );
}
