import { getCollectionProducts } from 'lib/shopify';
import Link from 'next/link';
import { GridTileImage } from './grid/tile';

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

  // Collections that start with `hidden-*` are hidden from the search page.
  let products: any[] = [];
  
  try {
    products = await getCollectionProducts({ collection: 'hidden-homepage-carousel' });
  } catch (error) {
    console.log('Collection "hidden-homepage-carousel" not found. Please create this collection in your Shopify admin or add products to it.');
  }

  if (!products?.length) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Featured Products Carousel</h3>
          <p className="text-gray-600 text-sm">
            Create a collection named "hidden-homepage-carousel" in your Shopify admin to display products here.
          </p>
        </div>
      </section>
    );
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
