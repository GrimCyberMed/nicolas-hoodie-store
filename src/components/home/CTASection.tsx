import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function CTASection() {
  return (
    <section className="py-20 bg-primary text-background">
      <div className="max-w-4xl mx-auto text-center px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to Upgrade Your Wardrobe?
        </h2>
        <p className="text-xl mb-8 opacity-90">
          Explore our collection and find your perfect hoodie today
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/products">
            <Button variant="primary" size="lg" className="bg-background text-foreground hover:opacity-90 min-w-[200px]">
              View Collection
            </Button>
          </Link>
          <Link href="/cart">
            <Button variant="outline" size="lg" className="border-background text-background hover:bg-background/10 min-w-[200px]">
              View Cart
            </Button>
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="text-3xl font-bold mb-2">1000+</div>
            <div className="text-sm opacity-80">Happy Customers</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-2">4.9★</div>
            <div className="text-sm opacity-80">Average Rating</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-2">24/7</div>
            <div className="text-sm opacity-80">Customer Support</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-2">100%</div>
            <div className="text-sm opacity-80">Satisfaction</div>
          </div>
        </div>
      </div>
    </section>
  );
}
