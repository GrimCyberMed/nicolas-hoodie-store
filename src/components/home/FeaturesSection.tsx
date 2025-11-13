const features = [
  {
    icon: '🎨',
    title: 'Modern Design',
    description: 'Carefully crafted designs that blend style with comfort',
  },
  {
    icon: '✨',
    title: 'Premium Quality',
    description: 'Made with the finest materials for lasting durability',
  },
  {
    icon: '🚚',
    title: 'Fast Shipping',
    description: 'Quick and reliable delivery to your doorstep',
  },
  {
    icon: '💯',
    title: 'Satisfaction Guaranteed',
    description: '30-day money-back guarantee on all purchases',
  },
  {
    icon: '🌍',
    title: 'Eco-Friendly',
    description: 'Sustainable materials and ethical production',
  },
  {
    icon: '🎁',
    title: 'Gift Ready',
    description: 'Beautiful packaging perfect for gifting',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Choose Us
          </h2>
          <p className="text-secondary text-lg max-w-2xl mx-auto">
            We're committed to providing the best hoodies with exceptional service
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-lg hover:bg-muted transition-colors group"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">
                {feature.title}
              </h3>
              <p className="text-secondary">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
