"use client";

import { HeroCanvas } from "@/components/three/HeroCanvas";

export default function ProductPreview() {
    return (
        <section id="preview" className="section-spacing bg-[var(--surface)]">
            <div className="container-custom">
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-2 bg-white text-[var(--primary)] text-sm font-semibold rounded-full mb-4">
                        Preview
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] mb-4">
                        Live Product Preview
                    </h2>
                    <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
                        See how customers experience the product in real time
                    </p>
                </div>

                <div className="max-w-5xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                        <div className="bg-[var(--surface)] px-4 py-3 flex items-center gap-3">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            </div>
                            <div className="flex-1 max-w-md mx-auto">
                                <div className="bg-white rounded-lg px-4 py-1.5 text-sm text-[var(--text-secondary)] flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    brand.com/dashboard
                                </div>
                            </div>
                        </div>

                        <div className="relative h-[400px] sm:h-[500px] overflow-hidden">
                            <HeroCanvas embedded className="w-full h-full" />
                        </div>
                    </div>

                    <div className="text-center mt-10">
                        <button className="px-8 py-4 bg-[var(--primary)] text-white rounded-xl font-semibold hover:bg-[var(--text-primary)] transition-all duration-300 hover-lift">
                            Try Interactive Demo
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
