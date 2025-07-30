import { getCollectionProducts } from 'lib/shopify';
import type { Product } from 'lib/shopify/types';
import Link from 'next/link';
import { ProductCard } from './ui/product-card';

interface FeaturedCollectionProps {
  collectionHandle?: string;
  title?: string;
  description?: string;
  maxProducts?: number;
  variant?: 'grid' | 'carousel' | 'featured';
}

// Demo product type that matches our ProductCard interface
interface DemoProduct {
  id: string;
  title: string;
  handle: string;
  featuredImage?: {
    url: string;
    altText?: string;
  } | null;
  priceRange: {
    maxVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  tags?: string[];
  description?: string;
  variants?: Array<{
    id: string;
    title: string;
    availableForSale: boolean;
  }>;
}

export async function FeaturedCollection({
  collectionHandle = 'featured',
  title = 'Featured Products',
  description = 'Discover our most popular products',
  maxProducts = 6,
  variant = 'grid'
}: FeaturedCollectionProps) {
  // Check if environment variables are set
  if (!process.env.SHOPIFY_STORE_DOMAIN || !process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{title}</h2>
          <p className="text-gray-600 mb-4">
            Configure your Shopify environment variables to display products here.
          </p>
          <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg text-left max-w-md mx-auto">
            <h3 className="font-semibold text-primary mb-2">Required Environment Variables:</h3>
            <ul className="text-sm text-primary/80 space-y-1">
              <li>• <code className="bg-primary/10 px-1 rounded">SHOPIFY_STORE_DOMAIN</code></li>
              <li>• <code className="bg-primary/10 px-1 rounded">SHOPIFY_STOREFRONT_ACCESS_TOKEN</code></li>
            </ul>
          </div>
        </div>
      </section>
    );
  }

  let products: (Product | DemoProduct)[] = [];
  let usingMockData = false;

  try {
    products = await getCollectionProducts({ collection: collectionHandle });
    
    if (!products || products.length === 0) {
      usingMockData = true;
      // Use demo products if no real products found
      products = [
        {
          id: "demo-1",
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
          description: "High-quality wireless headphones with noise cancellation.",
          variants: [{ id: "demo-variant-1", title: "Default", availableForSale: true }]
        },
        {
          id: "demo-2",
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
          description: "Advanced fitness tracking with heart rate monitoring.",
          variants: [{ id: "demo-variant-2", title: "Default", availableForSale: true }]
        },
        {
          id: "demo-3",
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
          description: "Professional-grade camera with 4K video recording.",
          variants: [{ id: "demo-variant-3", title: "Default", availableForSale: true }]
        }
      ];
    }
  } catch (error) {
    console.log(`Collection "${collectionHandle}" not found or error occurred:`, error);
    usingMockData = true;
    // Use demo products as fallback
    products = [
      {
        id: "demo-1",
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
        description: "High-quality wireless headphones with noise cancellation.",
        variants: [{ id: "demo-variant-1", title: "Default", availableForSale: true }]
      }
    ];
  }

  // Limit products to maxProducts
  const displayProducts = products.slice(0, maxProducts);

  if (variant === 'carousel') {
    return (
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">{title}</h2>
          <p className="text-gray-600">{description}</p>
          {usingMockData && (
            <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm text-primary/80">
                Demo mode: Create a collection named "{collectionHandle}" in your Shopify admin to see real products.
              </p>
            </div>
          )}
        </div>
        
        <div className="w-full overflow-x-auto pb-6 pt-1">
          <ul className="flex animate-carousel gap-4">
            {displayProducts.map((product, i) => (
              <li
                key={`${product.handle}${i}`}
                className="relative aspect-square h-[30vh] max-h-[275px] w-2/3 max-w-[475px] flex-none md:w-1/3"
              >
                <Link href={`/product/${product.handle}`} className="relative h-full w-full">
                  <div className="relative h-full w-full overflow-hidden rounded-lg">
                    <img
                      src={product.featuredImage?.url || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop"}
                      alt={product.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="font-semibold">{product.title}</h3>
                      <p className="text-sm opacity-90">
                        ${parseFloat(product.priceRange.maxVariantPrice.amount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  if (variant === 'featured') {
    return (
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">{title}</h2>
          <p className="text-gray-600">{description}</p>
          {usingMockData && (
            <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm text-primary/80">
                Demo mode: Create a collection named "{collectionHandle}" in your Shopify admin to see real products.
              </p>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} variant="featured" />
          ))}
        </div>
      </section>
    );
  }

  // Default grid variant
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">{title}</h2>
        <p className="text-gray-600">{description}</p>
        {usingMockData && (
          <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-sm text-primary/80">
              Demo mode: Create a collection named "{collectionHandle}" in your Shopify admin to see real products.
            </p>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayProducts.map((product) => (
          <ProductCard key={product.id} product={product} variant="default" />
        ))}
      </div>
    </section>
  );
} 