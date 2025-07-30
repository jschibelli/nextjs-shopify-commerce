import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductCard } from "@/components/ui/product-card";
import { ProductSkeleton } from "@/components/ui/product-skeleton";
import { Separator } from "@/components/ui/separator";
import { getProducts } from "lib/shopify";
import { Monitor, Moon, Palette, ShoppingCart, Star, Sun, TrendingUp, Zap } from "lucide-react";

// Mock product data as fallback
const mockProducts = [
  {
    id: "1",
    title: "Premium Wireless Headphones",
    handle: "premium-wireless-headphones",
    featuredImage: {
      url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
      altText: "Premium Wireless Headphones"
    },
    priceRange: {
      maxVariantPrice: {
        amount: "299.99",
        currencyCode: "USD"
      }
    },
    tags: ["Wireless", "Premium"],
    description: "High-quality wireless headphones with noise cancellation and premium sound quality.",
    variants: [
      {
        id: "mock-variant-1",
        title: "Default Title",
        availableForSale: true
      }
    ]
  },
  {
    id: "2",
    title: "Smart Fitness Watch",
    handle: "smart-fitness-watch",
    featuredImage: {
      url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
      altText: "Smart Fitness Watch"
    },
    priceRange: {
      maxVariantPrice: {
        amount: "199.99",
        currencyCode: "USD"
      }
    },
    tags: ["Smart", "Fitness"],
    description: "Advanced fitness tracking with heart rate monitoring and GPS.",
    variants: [
      {
        id: "mock-variant-2",
        title: "Default Title",
        availableForSale: true
      }
    ]
  },
  {
    id: "3",
    title: "Ultra HD Camera",
    handle: "ultra-hd-camera",
    featuredImage: {
      url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop",
      altText: "Ultra HD Camera"
    },
    priceRange: {
      maxVariantPrice: {
        amount: "599.99",
        currencyCode: "USD"
      }
    },
    tags: ["4K", "Professional"],
    description: "Professional-grade camera with 4K video recording capabilities.",
    variants: [
      {
        id: "mock-variant-3",
        title: "Default Title",
        availableForSale: true
      }
    ]
  }
];

// Helper function to validate product structure
function isValidProduct(product: any): boolean {
  return (
    product &&
    typeof product.id === 'string' &&
    typeof product.title === 'string' &&
    typeof product.handle === 'string' &&
    product.priceRange &&
    product.priceRange.maxVariantPrice &&
    typeof product.priceRange.maxVariantPrice.amount === 'string' &&
    typeof product.priceRange.maxVariantPrice.currencyCode === 'string'
  );
}

export default async function DemoPage() {
  // Try to get real products from Shopify
  let products = [];
  let usingMockData = false;

  try {
    // Check if Shopify environment variables are set
    if (process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
      const shopifyProducts = await getProducts({});
      
      // Filter and validate products
      const validProducts = shopifyProducts.filter(isValidProduct);
      
      if (validProducts.length > 0) {
        products = validProducts;
        usingMockData = false;
      } else {
        products = mockProducts;
        usingMockData = true;
      }
    } else {
      products = mockProducts;
      usingMockData = true;
    }
  } catch (error) {
    console.log('Error fetching products from Shopify:', error);
    products = mockProducts;
    usingMockData = true;
  }

  // Limit to 6 products for demo
  const demoProducts = products.slice(0, 6);

  // Debug information (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('Demo page products:', {
      totalProducts: products.length,
      demoProducts: demoProducts.length,
      usingMockData,
      firstProduct: demoProducts[0] ? {
        id: demoProducts[0].id,
        title: demoProducts[0].title,
        hasImage: !!demoProducts[0].featuredImage,
        hasPrice: !!demoProducts[0].priceRange?.maxVariantPrice
      } : null
    });
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">shadcn/ui + Next.js Commerce</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Beautiful, accessible components for your e-commerce store
        </p>
        
        <div className="flex flex-wrap gap-4 mb-8">
          <Badge variant="default" className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            Premium Components
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Trending
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Fast & Accessible
          </Badge>
          <Badge variant="destructive" className="flex items-center gap-1">
            <Palette className="h-3 w-3" />
            Dark Mode Ready
          </Badge>
          {usingMockData && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Monitor className="h-3 w-3" />
              Using Demo Data
            </Badge>
          )}
        </div>
      </div>

      <Separator className="my-8" />

      {/* Data Source Information */}
      {usingMockData && (
        <Card className="mb-8 bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <Monitor className="h-5 w-5" />
              Demo Mode
            </CardTitle>
            <CardDescription className="text-amber-700 dark:text-amber-300">
              Currently showing demo products. To see real products, configure your Shopify environment variables.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-amber-700 dark:text-amber-300">
              <p className="mb-2">Required environment variables:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">SHOPIFY_STORE_DOMAIN</code></li>
                <li><code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">SHOPIFY_STOREFRONT_ACCESS_TOKEN</code></li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Theme Information */}
      <Card className="mb-8 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme Support
          </CardTitle>
          <CardDescription>
            This demo showcases components in both light and dark modes. Try switching themes using the toggle in the navbar!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-background border">
              <Sun className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Light Mode</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-background border">
              <Moon className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Dark Mode</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-background border">
              <Monitor className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">System Mode</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Featured Products Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Featured Products</h2>
        {demoProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoProducts.slice(0, 3).map((product) => (
              <ProductCard key={product.id} product={product} variant="featured" />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No products available</p>
              <p className="text-sm">Products will appear here once they're added to your store.</p>
            </div>
          </div>
        )}
      </section>

      <Separator className="my-8" />

      {/* Compact Products Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Grid View</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {demoProducts.map((product) => (
            <ProductCard key={product.id} product={product} variant="default" />
          ))}
        </div>
      </section>

      <Separator className="my-8" />

      {/* Default Products Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Default View</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demoProducts.map((product) => (
            <ProductCard key={product.id} product={product} variant="default" />
          ))}
        </div>
      </section>

      <Separator className="my-8" />

      {/* Loading Skeletons */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Loading States</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProductSkeleton variant="default" />
          <ProductSkeleton variant="default" />
          <ProductSkeleton variant="default" />
        </div>
      </section>

      <Separator className="my-8" />

      {/* Component Showcase */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Component Showcase</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
              <CardDescription>Different button styles available</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Badge Variants</CardTitle>
              <CardDescription>Different badge styles available</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Interactive Features */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Interactive Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Button Sizes</CardTitle>
              <CardDescription>Different button sizes for different use cases</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Loading States</CardTitle>
              <CardDescription>Buttons with loading states</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button disabled>Disabled</Button>
              <Button>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Loading...
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Ready to Build?
          </CardTitle>
          <CardDescription>
            Start building your e-commerce store with these beautiful components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Start Building
            </Button>
            <Button variant="outline" size="lg">
              View Documentation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 