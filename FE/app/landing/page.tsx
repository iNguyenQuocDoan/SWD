import Hero from "@/home/Hero";
import FeaturesCarousel from "@/home/FeaturesCarousel";
import ProductPreview from "@/home/ProductPreview";
import VideoSection from "@/home/VideoSection";
import Opportunities from "@/home/Opportunities";
import CountdownOffer from "@/home/CountdownOffer";

export default function LandingLegacy() {
  return (
    <div className="min-h-screen">
      <main>
        <Hero />
        <FeaturesCarousel />
        <ProductPreview />
        <VideoSection />
        <Opportunities />
        <CountdownOffer />
      </main>
    </div>
  );
}
