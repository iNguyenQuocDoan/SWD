"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth";
import { Store, Menu, X } from "lucide-react";

const navLinks = [
    { href: "/", label: "Home" },
    { href: "#categories", label: "Categories" },
    { href: "#how-it-works", label: "How it Works" },
    { href: "/products", label: "Products" },
    { href: "#faq", label: "FAQ" },
];

export function LandingHeader() {
    const { isAuthenticated, isLoading } = useAuthStore();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-2.5 hover:opacity-90 transition-opacity shrink-0"
                    >
                        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary">
                            <Store className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">
                            F Marketplace
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right Side */}
                    <div className="flex items-center gap-3 shrink-0">
                        {isLoading ? (
                            <div className="h-9 w-24 bg-muted animate-pulse rounded-lg" />
                        ) : !isAuthenticated ? (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="hidden sm:flex h-9 px-4 text-sm font-medium"
                                    asChild
                                >
                                    <Link href="/login">Log in</Link>
                                </Button>
                                <Button
                                    size="sm"
                                    className="hidden sm:flex h-9 px-5 text-sm font-semibold"
                                    asChild
                                >
                                    <Link href="/register">Get Started</Link>
                                </Button>
                            </>
                        ) : (
                            <Button size="sm" className="h-9 px-5 text-sm font-semibold" asChild>
                                <Link href="/customer">Dashboard</Link>
                            </Button>
                        )}

                        {/* Mobile Menu Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden h-9 w-9"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? (
                                <X className="h-5 w-5" />
                            ) : (
                                <Menu className="h-5 w-5" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden border-t py-4 space-y-1">
                        <nav className="flex flex-col">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="px-3 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        {!isLoading && !isAuthenticated && (
                            <div className="border-t pt-4 mt-2 space-y-2">
                                <Button variant="outline" className="w-full h-11" asChild>
                                    <Link
                                        href="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Log in
                                    </Link>
                                </Button>
                                <Button className="w-full h-11" asChild>
                                    <Link
                                        href="/register"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Get Started
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}
