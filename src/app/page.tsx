import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { CTASection } from '@/components/home/CTASection';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <FeaturedProducts />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </div>
  );
}
