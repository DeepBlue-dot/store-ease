"use client"
import { CategorySection } from "@/components/common/CategorySection";
import { HeroSection } from "@/components/common/hero-section";
import { PromotionalSection } from "@/components/common/promotional-section";
import { ProductGrid } from "@/components/products/ProductGrid";

export default function HomePage() {
  return (
    <div >
    <HeroSection/>
    <CategorySection/>
    <ProductGrid/>
    <PromotionalSection/>
    </div>
  );
}
