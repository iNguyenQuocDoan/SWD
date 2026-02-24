"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Store } from "lucide-react";

const footerLinks = {
    product: {
        title: "Product",
        links: [
            { label: "Browse Accounts", href: "/products" },
            { label: "Categories", href: "/categories" },
            { label: "Top Sellers", href: "/sellers" },
            { label: "New Arrivals", href: "/products?sort=newest" },
            { label: "Deals", href: "/products?sort=discount" },
        ],
    },
    company: {
        title: "Company",
        links: [
            { label: "About Us", href: "/about" },
            { label: "Careers", href: "/careers" },
            { label: "Blog", href: "/blog" },
            { label: "Contact", href: "/contact" },
        ],
    },
    support: {
        title: "Support",
        links: [
            { label: "Help Center", href: "/help" },
            { label: "FAQ", href: "#faq" },
            { label: "Seller Guide", href: "/seller/guide" },
            { label: "Report an Issue", href: "/support" },
        ],
    },
    legal: {
        title: "Legal",
        links: [
            { label: "Terms of Service", href: "/terms" },
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Refund Policy", href: "/refund" },
            { label: "Cookie Policy", href: "/cookies" },
        ],
    },
};

export function LandingFooter() {
    return (
        <footer className="border-t bg-card">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Main Footer */}
                <div className="py-12 md:py-16">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                        {/* Brand Column */}
                        <div className="col-span-2 md:col-span-1">
                            <Link href="/" className="flex items-center gap-2.5 mb-4">
                                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary">
                                    <Store className="h-4 w-4 text-primary-foreground" />
                                </div>
                                <span className="font-bold text-base">F Marketplace</span>
                            </Link>
                            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                                The most trusted digital marketplace for premium accounts,
                                subscriptions, and AI tools.
                            </p>
                        </div>

                        {/* Link Columns */}
                        {Object.values(footerLinks).map((section) => (
                            <div key={section.title}>
                                <h4 className="font-semibold text-sm text-foreground mb-4">
                                    {section.title}
                                </h4>
                                <ul className="space-y-2.5">
                                    {section.links.map((link) => (
                                        <li key={link.label}>
                                            <Link
                                                href={link.href}
                                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <Separator />

                {/* Bottom Bar */}
                <div className="py-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} F Marketplace. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link
                            href="https://twitter.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Twitter
                        </Link>
                        <Link
                            href="https://facebook.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Facebook
                        </Link>
                        <Link
                            href="https://instagram.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Instagram
                        </Link>
                        <Link
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            GitHub
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
