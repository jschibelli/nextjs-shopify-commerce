import { GridTileImage } from 'components/grid/tile';
import { getCollectionProducts } from 'lib/shopify';
import type { Product } from 'lib/shopify/types';
import Link from 'next/link';

function ThreeItemGridItem({
  item,
  size,
  priority
}: {
  item: Product;
  size: 'full' | 'half';
  priority?: boolean;
}) {
  return (
    <div
      className={size === 'full' ? 'md:col-span-4 md:row-span-2' : 'md:col-span-2 md:row-span-1'}
    >
      <Link
        className="relative block aspect-square h-full w-full"
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
      </Link>
    </div>
  );
}

export async function ThreeItemGrid() {
  // Check if environment variables are set
  if (!process.env.SHOPIFY_STORE_DOMAIN || !process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Welcome to Next.js Commerce</h2>
          <p className="text-gray-600 mb-4">
            To display products, you need to configure your Shopify environment variables.
          </p>
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-left max-w-md mx-auto">
            <h3 className="font-semibold text-blue-800 mb-2">Required Environment Variables:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <code className="bg-blue-100 px-1 rounded">SHOPIFY_STORE_DOMAIN</code></li>
              <li>• <code className="bg-blue-100 px-1 rounded">SHOPIFY_STOREFRONT_ACCESS_TOKEN</code></li>
              <li>• <code className="bg-blue-100 px-1 rounded">SHOPIFY_REVALIDATION_SECRET</code></li>
            </ul>
            <p className="text-xs text-blue-600 mt-3">
              Create a <code className="bg-blue-100 px-1 rounded">.env</code> file in your project root with these variables.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Collections that start with `hidden-*` are hidden from the search page.
  let homepageItems: Product[] = [];
  
  try {
    homepageItems = await getCollectionProducts({
      collection: 'hidden-homepage-featured-items'
    });
  } catch (error) {
    console.log('Collection "hidden-homepage-featured-items" not found. Please create this collection in your Shopify admin or add products to it.');
  }

  // If no products found, show a message
  if (!homepageItems[0] || !homepageItems[1] || !homepageItems[2]) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Welcome to Your Store</h2>
          <p className="text-gray-600 mb-4">
            No featured products found. To display products on the homepage:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg text-left max-w-md mx-auto">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Option 1:</strong> Create a collection named "hidden-homepage-featured-items" in your Shopify admin and add at least 3 products to it.
            </p>
            <p className="text-sm text-gray-700">
              <strong>Option 2:</strong> Add products to your store and they will appear in the search page.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const [firstProduct, secondProduct, thirdProduct] = homepageItems;

  return (
    <section className="mx-auto grid max-w-(--breakpoint-2xl) gap-4 px-4 pb-4 md:grid-cols-6 md:grid-rows-2 lg:max-h-[calc(100vh-200px)]">
      <ThreeItemGridItem size="full" item={firstProduct} priority={true} />
      <ThreeItemGridItem size="half" item={secondProduct} priority={true} />
      <ThreeItemGridItem size="half" item={thirdProduct} />
    </section>
  );
}
