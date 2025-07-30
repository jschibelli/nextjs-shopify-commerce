import { Button } from '@/components/ui/button';
import { getCollectionProducts } from 'lib/shopify';
import { X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  description:
    'High-performance ecommerce store built with Next.js, Vercel, and Shopify.',
  openGraph: {
    type: 'website'
  }
};

// Helper function to get new arrival products
async function getNewArrivalProducts() {
  if (!process.env.SHOPIFY_STORE_DOMAIN || !process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
    return { femaleProduct: null, maleProduct: null };
  }

  let products: any[] = [];
  
  // Try different collection names for new arrivals
  const collectionNames = ['new-arrivals', 'new', 'latest', 'featured', 'all'];
  
  for (const collectionName of collectionNames) {
    try {
      products = await getCollectionProducts({ collection: collectionName });
      if (products.length >= 2) break;
    } catch (error) {
      console.log(`Collection "${collectionName}" not found, trying next...`);
    }
  }

  // If no products found, return null
  if (!products.length) {
    return { femaleProduct: null, maleProduct: null };
  }

  // Return first two products as female and male models
  return {
    femaleProduct: products[0],
    maleProduct: products[1]
  };
}

export default async function HomePage() {
  // Get new arrival products for hero section
  const { femaleProduct, maleProduct } = await getNewArrivalProducts();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Banner - FINAL CLEARANCE */}
      <div className="bg-black text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-sm font-medium">
            FINAL CLEARANCE: Take 20% off 'Sale Must-Haves'
          </p>
          <button className="text-white hover:text-gray-300">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Hero Section - NEW SEASON */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Left Model - Female Product */}
            <div className="relative group cursor-pointer">
              <Link href={femaleProduct ? `/product/${femaleProduct.handle}` : '#'}>
                <div className="aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden">
                  {femaleProduct?.featuredImage?.url ? (
                    <Image
                      src={femaleProduct.featuredImage.url}
                      alt={femaleProduct.featuredImage.altText || femaleProduct.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <div className="text-4xl mb-2">👗</div>
                        <p className="text-sm">Female Model</p>
                        <p className="text-xs opacity-80">Black Denim Jacket, Red Mini-Skirt</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    {femaleProduct ? (
                      <>
                        <p className="text-sm font-medium">{femaleProduct.title}</p>
                        <p className="text-xs opacity-80">
                          ${parseFloat(femaleProduct.priceRange.maxVariantPrice.amount).toFixed(2)}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm">Female Model</p>
                        <p className="text-xs opacity-80">Black Denim Jacket, Red Mini-Skirt</p>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            </div>

            {/* Center Content */}
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <h1 className="text-6xl font-bold text-black leading-none">
                  NEW<br />SEASON
                </h1>
                <p className="text-lg text-gray-600">
                  New arrivals are here!
                </p>
              </div>
              <Button 
                variant="outline" 
                size="lg"
                className="border-black text-white bg-black hover:bg-gray-800 hover:text-white transition-colors"
                asChild
              >
                <Link href="/search?collection=new-arrivals">
                  DISCOVER MORE
                </Link>
              </Button>
            </div>

            {/* Right Model - Male Product */}
            <div className="relative group cursor-pointer">
              <Link href={maleProduct ? `/product/${maleProduct.handle}` : '#'}>
                <div className="aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden">
                  {maleProduct?.featuredImage?.url ? (
                    <Image
                      src={maleProduct.featuredImage.url}
                      alt={maleProduct.featuredImage.altText || maleProduct.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <div className="text-4xl mb-2">👔</div>
                        <p className="text-sm">Male Model</p>
                        <p className="text-xs opacity-80">Patterned Shirt, Denim Shorts</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    {maleProduct ? (
                      <>
                        <p className="text-sm font-medium">{maleProduct.title}</p>
                        <p className="text-xs opacity-80">
                          ${parseFloat(maleProduct.priceRange.maxVariantPrice.amount).toFixed(2)}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm">Male Model</p>
                        <p className="text-xs opacity-80">Patterned Shirt, Denim Shorts</p>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Shop by Category</h2>
            <p className="text-gray-600">Explore our curated collections</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* T-SHIRTS */}
            <div className="group cursor-pointer">
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-sm font-medium">"IN THIS GAME OF LIFE, JUST KEEP PLAYING"</p>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">T-SHIRTS</h3>
              <p className="text-red-600 font-medium">Get up to 20% off</p>
            </div>

            {/* JEANS */}
            <div className="group cursor-pointer">
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-sm font-medium">"WHEN I IMAGINE MYU ON VACAY"</p>
                  <p className="text-xs opacity-80">"THINK IT OVER"</p>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">JEANS</h3>
              <p className="text-red-600 font-medium">Get up to 20% off</p>
            </div>

            {/* ACCESSORIES */}
            <div className="group cursor-pointer">
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-sm font-medium">Mini Backpack, Baseball Cap</p>
                  <p className="text-xs opacity-80">Smartphone Case</p>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">ACCESSORIES</h3>
              <p className="text-red-600 font-medium">Get up to 20% off</p>
            </div>
          </div>
        </div>
      </section>



      {/* Floating Settings Icon */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow">
          <div className="w-6 h-6 bg-black rounded"></div>
        </button>
      </div>
    </div>
  );
}

