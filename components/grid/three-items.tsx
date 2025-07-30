import { GridTileImage } from 'components/grid/tile';
import { getCollectionProducts } from 'lib/shopify';
import type { Product } from 'lib/shopify/types';
import Link from 'next/link';

function ThreeItemGridItem({
  item,
  size,
  priority
}: {
  item: Product | DemoProduct;
  size: 'full' | 'half';
  priority?: boolean;
}) {
  return (
    <div
      className={size === 'full' ? 'md:col-span-4 md:row-span-2' : 'md:col-span-2 md:row-span-1'}
    >
      <Link
        className="relative block aspect-square h-full w-full group"
        href={`/product/${item.handle}`}
        prefetch={true}
      >
        <GridTileImage
          src={item.featuredImage.url}
          fill
          sizes={
            size === 'full' ? '(min-width: 768px) 66vw, 100vw' : '(min-width: 768px) 33vw, 100vw'
          }
          priority={priority}
          alt={item.title}
          label={{
            position: size === 'full' ? 'center' : 'bottom',
            title: item.title as string,
            amount: item.priceRange.maxVariantPrice.amount,
            currencyCode: item.priceRange.maxVariantPrice.currencyCode
          }}
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </Link>
    </div>
  );
}

// Demo product type that matches our Product interface
interface DemoProduct {
  id: string;
  title: string;
  handle: string;
  featuredImage: {
    url: string;
    altText?: string;
  };
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

export async function ThreeItemGrid() {
  // Check if environment variables are set
  if (!process.env.SHOPIFY_STORE_DOMAIN || !process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold mb-2">Welcome to Next.js Commerce</h3>
        <p className="text-gray-600 mb-4">
          To display products, you need to configure your Shopify environment variables.
        </p>
        <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg text-left max-w-md mx-auto">
          <h4 className="font-semibold text-primary mb-2">Required Environment Variables:</h4>
          <ul className="text-sm text-primary/80 space-y-1">
            <li>• <code className="bg-primary/10 px-1 rounded">SHOPIFY_STORE_DOMAIN</code></li>
            <li>• <code className="bg-primary/10 px-1 rounded">SHOPIFY_STOREFRONT_ACCESS_TOKEN</code></li>
            <li>• <code className="bg-primary/10 px-1 rounded">SHOPIFY_REVALIDATION_SECRET</code></li>
          </ul>
          <p className="text-xs text-primary/80 mt-3">
            Create a <code className="bg-primary/10 px-1 rounded">.env</code> file in your project root with these variables.
          </p>
        </div>
      </div>
    );
  }

  // Try to get products from various collections
  let homepageItems: (Product | DemoProduct)[] = [];
  
  // First try the original collection
  try {
    homepageItems = await getCollectionProducts({
      collection: 'hidden-homepage-featured-items'
    });
  } catch (error) {
    console.log('Collection "hidden-homepage-featured-items" not found, trying alternative collections...');
  }

  // If no products found, try a generic "featured" collection
  if (!homepageItems[0] || !homepageItems[1] || !homepageItems[2]) {
    try {
      homepageItems = await getCollectionProducts({
        collection: 'featured'
      });
    } catch (error) {
      console.log('Collection "featured" not found, trying "all" collection...');
    }
  }

  // If still no products, try the "all" collection
  if (!homepageItems[0] || !homepageItems[1] || !homepageItems[2]) {
    try {
      homepageItems = await getCollectionProducts({
        collection: 'all'
      });
    } catch (error) {
      console.log('No products found in any collection, using demo products...');
    }
  }

  // If no products found in any collection, use demo products
  if (!homepageItems[0] || !homepageItems[1] || !homepageItems[2]) {
    homepageItems = [
      {
        id: "demo-1",
        title: "Premium Wireless Headphones",
        handle: "premium-wireless-headphones",
        featuredImage: {
          url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop",
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
          url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop",
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
          url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=800&fit=crop",
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

  const [firstProduct, secondProduct, thirdProduct] = homepageItems;

  // Ensure we have all three products before rendering
  if (!firstProduct || !secondProduct || !thirdProduct) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold mb-2">Welcome to Your Store</h3>
        <p className="text-gray-600 mb-4">
          No featured products found. Add products to your Shopify store to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 md:grid-rows-2 gap-4 max-w-7xl mx-auto">
      <ThreeItemGridItem size="full" item={firstProduct} priority={true} />
      <ThreeItemGridItem size="half" item={secondProduct} priority={true} />
      <ThreeItemGridItem size="half" item={thirdProduct} />
    </div>
  );
}
