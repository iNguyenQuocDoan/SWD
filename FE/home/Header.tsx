"use client";

import { useState } from "react";

const navItems = ["Home", "Features", "Preview", "Pricing"];

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 glass">
            <div className="container-custom">
                <nav className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <a href="#" className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                        Brand
                    </a>

                    {/* Desktop Navigation */}
                    <ul className="hidden md:flex items-center gap-8">
                        {navItems.map((item) => (
                            <li key={item}>
                                <a
                                    href={`#${item.toLowerCase()}`}
                                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200 font-medium"
                                >
                                    {item}
                                </a>
                            </li>
                        ))}
                    </ul>

                    {/* CTA Button */}
                    <div className="hidden md:block">
                        <button className="px-6 py-3 border-2 border-[var(--primary)] text-[var(--primary)] rounded-xl font-semibold hover:bg-[var(--primary)] hover:text-white transition-all duration-300">
                            Get Started
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 rounded-xl hover:bg-[var(--surface)] transition-colors"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <svg
                            className="w-6 h-6 text-[var(--text-primary)]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            {isMenuOpen ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            )}
                        </svg>
                    </button>
                </nav>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-[var(--surface)]">
                        <ul className="flex flex-col gap-4">
                            {navItems.map((item) => (
                                <li key={item}>
                                    <a
                                        href={`#${item.toLowerCase()}`}
                                        className="block py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors font-medium"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {item}
                                    </a>
                                </li>
                            ))}
                            <li className="pt-2">
                                <button className="w-full px-6 py-3 border-2 border-[var(--primary)] text-[var(--primary)] rounded-xl font-semibold hover:bg-[var(--primary)] hover:text-white transition-all duration-300">
                                    Get Started
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </header>
    );
}
