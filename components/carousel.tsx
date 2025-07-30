import { getCollectionProducts } from 'lib/shopify';
import Link from 'next/link';
import { GridTileImage } from './grid/tile';

// Demo product type
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
}

export async function Carousel() {
  // Check if environment variables are set
  if (!process.env.SHOPIFY_STORE_DOMAIN || !process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold mb-2">Featured Products Carousel</h3>
        <p className="text-gray-600 text-sm">
          Configure your Shopify environment variables to display products here.
        </p>
      </div>
    );
  }

  // Try to get products from various collections
  let products: any[] = [];
  
  // First try the original collection
  try {
    products = await getCollectionProducts({ collection: 'hidden-homepage-carousel' });
  } catch (error) {
    console.log('Collection "hidden-homepage-carousel" not found, trying alternative collections...');
  }

  // If no products found, try a generic "featured" collection
  if (!products?.length) {
    try {
      products = await getCollectionProducts({ collection: 'featured' });
    } catch (error) {
      console.log('Collection "featured" not found, trying "all" collection...');
    }
  }

  // If still no products, try the "all" collection
  if (!products?.length) {
    try {
      products = await getCollectionProducts({ collection: 'all' });
    } catch (error) {
      console.log('No products found in any collection, using demo products...');
    }
  }

  // If no products found in any collection, use demo products
  if (!products?.length) {
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
        }
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
        }
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
        }
      },
      {
        id: "demo-4",
        title: "Wireless Earbuds",
        handle: "wireless-earbuds",
        featuredImage: {
          url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop",
          altText: "Wireless Earbuds"
        },
        priceRange: {
          maxVariantPrice: {
            amount: "149.99",
            currencyCode: "USD"
          }
        }
      },
      {
        id: "demo-5",
        title: "Smart Speaker",
        handle: "smart-speaker",
        featuredImage: {
          url: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&h=400&fit=crop",
          altText: "Smart Speaker"
        },
        priceRange: {
          maxVariantPrice: {
            amount: "89.99",
            currencyCode: "USD"
          }
        }
      },
      {
        id: "demo-6",
        title: "Gaming Console",
        handle: "gaming-console",
        featuredImage: {
          url: "https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=400&h=400&fit=crop",
          altText: "Gaming Console"
        },
        priceRange: {
          maxVariantPrice: {
            amount: "399.99",
            currencyCode: "USD"
          }
        }
      }
    ];
  }

  if (!products?.length) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold mb-2">No Products Found</h3>
        <p className="text-gray-600 text-sm">
          Add products to your Shopify store to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {products.map((product) => (
          <div key={product.id} className="flex-none w-64 group">
            <Link
              className="relative block aspect-square w-full"
              href={`/product/${product.handle}`}
              prefetch={true}
            >
              <GridTileImage
                src={product.featuredImage?.url || '/placeholder-product.jpg'}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                alt={product.featuredImage?.altText || product.title}
                label={{
                  position: 'bottom',
                  title: product.title,
                  amount: product.priceRange.maxVariantPrice.amount,
                  currencyCode: product.priceRange.maxVariantPrice.currencyCode
                }}
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </Link>
          </div>
        ))}
      </div>
      
      {/* Scroll indicators */}
      <div className="flex justify-center mt-4 space-x-2">
        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
      </div>
    </div>
  );
}
