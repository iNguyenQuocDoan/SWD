"use client";

import {
  HeroSection,
  CategoriesSection,
  FeaturedProductsSection,
  HowItWorksSection,
  TrustSection,
  FAQSection,
  CTASection,
} from "@/components/landing";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <HeroSection />

      {/* Categories */}
      <CategoriesSection />

      {/* Featured Products */}
      <FeaturedProductsSection />

      {/* How it Works */}
      <HowItWorksSection />

      {/* Trust & Social Proof */}
      <TrustSection />

      {/* FAQ */}
      <FAQSection />

      {/* Call to Action */}
      <CTASection />
    </div>
  );
}
