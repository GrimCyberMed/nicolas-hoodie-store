import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function HeroSection() {
  return (
    <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-primary to-accent">
      <div className="text-center text-background px-4 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
          Nicolas Hoodie Store
        </h1>
        <p className="text-xl md:text-2xl mb-8 opacity-90">
          Premium Hoodies. Modern Design. Superior Comfort.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/products">
            <Button variant="primary" size="lg" className="bg-background text-foreground hover:opacity-90 min-w-[200px]">
              Shop Now
            </Button>
          </Link>
          <Link href="/products?featured=true">
            <Button variant="outline" size="lg" className="border-background text-background hover:bg-background/10 min-w-[200px]">
              View Featured
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
