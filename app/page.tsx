import { Carousel } from 'components/carousel';
import { FeaturedCollection } from 'components/featured-collection';
import { ThreeItemGrid } from 'components/grid/three-items';
import CTA from 'components/sections/cta/default';
import Hero from 'components/sections/hero/default';
import { Badge } from 'components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'components/ui/card';
import { Separator } from 'components/ui/separator';
import { ArrowRightIcon, RefreshCwIcon, ShieldCheckIcon, StarIcon, TruckIcon } from 'lucide-react';

export const metadata = {
  description:
    'High-performance ecommerce store built with Next.js, Vercel, and Shopify.',
  openGraph: {
    type: 'website'
  }
};

export default async function HomePage() {
  return (
    <>
      <Hero
        title="Welcome to Next.js Commerce"
        description="A modern e-commerce store built with Next.js, Shopify, and shadcn/ui. Discover beautiful products with seamless shopping experience."
        badge={
          <Badge variant="outline" className="animate-appear">
            <span className="text-muted-foreground">
              Built with Next.js & Shopify
            </span>
            <a href="/demo" className="flex items-center gap-1">
              View Demo
              <ArrowRightIcon className="size-3" />
            </a>
          </Badge>
        }
        buttons={[
          {
            href: "/search",
            text: "Shop Now",
            variant: "default",
          },
          {
            href: "/demo",
            text: "View Demo",
            variant: "outline",
          },
        ]}
        mockup={false}
      />

      {/* Featured Products Section */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-3">Featured Products</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our most popular products
          </p>
        </div>
        <FeaturedCollection 
          collectionHandle="featured"
          title=""
          description=""
          maxProducts={6}
          variant="featured"
        />
      </section>

      <Separator className="mx-auto max-w-7xl" />

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-3">Why Choose Our Store?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience the future of online shopping with our modern, fast, and secure e-commerce platform.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="text-center border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 group">
            <CardHeader className="pb-3">
              <div className="mx-auto w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <TruckIcon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              </div>
              <CardTitle className="text-base">Fast Shipping</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                Free shipping on orders over $50. Get your products delivered quickly and safely.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 group">
            <CardHeader className="pb-3">
              <div className="mx-auto w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <ShieldCheckIcon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              </div>
              <CardTitle className="text-base">Secure Shopping</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                Your data is protected with industry-leading security and encryption standards.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 group">
            <CardHeader className="pb-3">
              <div className="mx-auto w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <RefreshCwIcon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              </div>
              <CardTitle className="text-base">Easy Returns</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                30-day return policy. Not satisfied? Return your purchase hassle-free.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 group">
            <CardHeader className="pb-3">
              <div className="mx-auto w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <StarIcon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              </div>
              <CardTitle className="text-base">Premium Quality</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                Curated selection of high-quality products from trusted brands worldwide.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <CTA
        title="Ready to Start Shopping?"
        buttons={[
          {
            href: "/search",
            text: "Browse Products",
            variant: "default",
          },
          {
            href: "/demo",
            text: "View Demo",
            variant: "outline",
          },
        ]}
      />

      <Separator className="mx-auto max-w-7xl" />

      {/* Testimonials Section */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-3">What Our Customers Say</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our satisfied customers have to say.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4">
              <div className="flex items-center mb-3">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground mb-3 text-sm">
                "Amazing shopping experience! The website is fast, easy to navigate, and the products are exactly as described."
              </p>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-muted rounded-full mr-3"></div>
                <div>
                  <p className="font-semibold text-sm">Sarah Johnson</p>
                  <p className="text-xs text-muted-foreground">Verified Customer</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4">
              <div className="flex items-center mb-3">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground mb-3 text-sm">
                "Fast delivery and excellent customer service. I love how easy it is to find what I'm looking for."
              </p>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-muted rounded-full mr-3"></div>
                <div>
                  <p className="font-semibold text-sm">Mike Chen</p>
                  <p className="text-xs text-muted-foreground">Verified Customer</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4">
              <div className="flex items-center mb-3">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground mb-3 text-sm">
                "The quality of products is outstanding. Will definitely shop here again!"
              </p>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-muted rounded-full mr-3"></div>
                <div>
                  <p className="font-semibold text-sm">Emily Rodriguez</p>
                  <p className="text-xs text-muted-foreground">Verified Customer</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <ThreeItemGrid />
      <Carousel />
    </>
  );
}
