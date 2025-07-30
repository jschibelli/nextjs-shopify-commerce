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
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Featured Products Carousel</h3>
          <p className="text-gray-600 text-sm">
            Configure your Shopify environment variables to display products here.
          </p>
        </div>
      </section>
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
        title: "Wireless Bluetooth Speaker",
        handle: "wireless-bluetooth-speaker",
        featuredImage: {
          url: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop",
          altText: "Wireless Bluetooth Speaker"
        },
        priceRange: {
          maxVariantPrice: {
            amount: "149.99",
            currencyCode: "USD"
          }
        }
      }
    ];
  }

  // Purposefully duplicating products to make the carousel loop and not run out of products on wide screens.
  const carouselProducts = [...products, ...products, ...products];

  return (
    <div className="w-full overflow-x-auto pb-6 pt-1">
      <ul className="flex animate-carousel gap-4">
        {carouselProducts.map((product, i) => (
          <li
            key={`${product.handle}${i}`}
            className="relative aspect-square h-[30vh] max-h-[275px] w-2/3 max-w-[475px] flex-none md:w-1/3"
          >
            <Link href={`/product/${product.handle}`} className="relative h-full w-full">
              <GridTileImage
                alt={product.title}
                label={{
                  title: product.title,
                  amount: product.priceRange.maxVariantPrice.amount,
                  currencyCode: product.priceRange.maxVariantPrice.currencyCode
                }}
                src={product.featuredImage?.url}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
