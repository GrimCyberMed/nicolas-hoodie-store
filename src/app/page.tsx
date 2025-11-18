import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { CTASection } from '@/components/home/CTASection';
import { AdBanner } from '@/components/ads';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      
      {/* Top Banner Ad */}
      <div className="container mx-auto px-4 py-4">
        <AdBanner position="banner_top" targetPage="home" />
      </div>
      
      <FeaturedProducts />
      <FeaturesSection />
      
      {/* Bottom Banner Ad */}
      <div className="container mx-auto px-4 py-4">
        <AdBanner position="banner_bottom" targetPage="home" />
      </div>
      
      <CTASection />
      <Footer />
    </div>
  );
}
