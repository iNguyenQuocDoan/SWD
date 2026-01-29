"use client";

export default function VideoSection() {

    return (
        <section className="section-spacing">
            <div className="container-custom">
                <div className="text-center mb-12">
                    <span className="inline-block px-4 py-2 bg-[var(--surface)] text-[var(--primary)] text-sm font-semibold rounded-full mb-4">
                        Watch
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] mb-4">
                        See it in action
                    </h2>
                    <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
                        Watch our quick product tour and discover what makes us different
                    </p>
                </div>

                {/* Video Container */}
                <div className="max-w-4xl mx-auto">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                        <div className="aspect-video bg-black">
                            <iframe
                                className="w-full h-full"
                                src="https://www.youtube.com/embed/LR04bU_yV5k?si=SC2xXCNE98lBOUH6"
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                            />
                        </div>
                    </div>

                    {/* Video Info */}
                    <div className="flex items-center justify-center gap-8 mt-8 text-[var(--text-secondary)]">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>2:30 min</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>10K+ views</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
