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

// Helper function to get new arrival products for hero section
async function getNewArrivalProducts() {
  if (!process.env.SHOPIFY_STORE_DOMAIN || !process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
    return { femaleProduct: null, maleProduct: null };
  }

  let products: any[] = [];
  
  // Try to get products from new-arrivals collection
  try {
    products = await getCollectionProducts({ collection: 'new-arrivals' });
    
    if (products.length >= 2) {
      return {
        femaleProduct: products[0],
        maleProduct: products[1]
      };
    } else if (products.length === 1) {
      // If only one product in new-arrivals, try to get a second from hydrogen collection
      try {
        const hydrogenProducts = await getCollectionProducts({ collection: 'hydrogen' });
        if (hydrogenProducts.length > 0) {
          return {
            femaleProduct: products[0], // New arrival product
            maleProduct: hydrogenProducts[0] // First hydrogen product
          };
        }
      } catch (error) {
        // Continue to fallback
      }
      
      // If we can't get a second product, return the new arrival product for both sides
      return {
        femaleProduct: products[0],
        maleProduct: products[0]
      };
    }
  } catch (error) {
    // Collection not found, fall back
  }

  // Fallback to hydrogen collection
  try {
    products = await getCollectionProducts({ collection: 'hydrogen' });
    if (products.length >= 2) {
      return {
        femaleProduct: products[0],
        maleProduct: products[1]
      };
    } else if (products.length === 1) {
      return {
        femaleProduct: products[0],
        maleProduct: products[0]
      };
    }
  } catch (error) {
    // hydrogen collection not found
  }

  return { femaleProduct: null, maleProduct: null };
}

// Helper function to get multiple products from hydrogen collection
async function getHydrogenProducts() {
  if (!process.env.SHOPIFY_STORE_DOMAIN || !process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
    return [null, null, null];
  }

  try {
    const products = await getCollectionProducts({ collection: 'hydrogen' });
    return [
      products[0] || null,
      products[1] || null,
      products[2] || null
    ];
  } catch (error) {
    return [null, null, null];
  }
}

export default async function HomePage() {
  // Get new arrival products for hero section
  const { femaleProduct, maleProduct } = await getNewArrivalProducts();

  // Get multiple products from hydrogen collection
  const [hydrogenProduct1, hydrogenProduct2, hydrogenProduct3] = await getHydrogenProducts();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Banner - FINAL CLEARANCE */}
      <div className="bg-black text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-sm font-medium">
            FINAL CLEARANCE: Take 20% off 'Sale Must-Haves'
          </p>
          <button className="text-white hover:text-white/80">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Hero Section - NEW SEASON */}
      <section className="bg-muted py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Left Model - Female Product */}
            <div className="relative group cursor-pointer">
              <Link href={femaleProduct ? `/product/${femaleProduct.handle}` : '#'}>
                <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                  {femaleProduct?.featuredImage?.url ? (
                    <Image
                      src={femaleProduct.featuredImage.url}
                      alt={femaleProduct.featuredImage.altText || femaleProduct.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-muted to-muted/80 flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
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
                <h1 className="text-6xl font-bold text-foreground leading-none">
                  NEW<br />SEASON
                </h1>
                <p className="text-lg text-muted-foreground">
                  New arrivals are here!
                </p>
              </div>
              <Button 
                variant="outline" 
                size="lg"
                className="border-foreground text-background bg-foreground hover:bg-foreground/80 hover:text-background transition-colors"
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
                <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                  {maleProduct?.featuredImage?.url ? (
                    <Image
                      src={maleProduct.featuredImage.url}
                      alt={maleProduct.featuredImage.altText || maleProduct.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-muted to-muted/80 flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
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
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Shop by Category</h2>
            <p className="text-muted-foreground">Explore our curated collections</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Hydrogen Product 1 */}
            <Link href="/search?collection=hydrogen" className="group cursor-pointer">
              <div className="relative aspect-square bg-muted rounded-lg overflow-hidden mb-4">
                {hydrogenProduct1?.featuredImage?.url ? (
                  <Image
                    src={hydrogenProduct1.featuredImage.url}
                    alt={hydrogenProduct1.featuredImage.altText || hydrogenProduct1.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-muted to-muted/80 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <div className="text-4xl mb-2">👕</div>
                      <p className="text-sm">Hydrogen Collection</p>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  {hydrogenProduct1 ? (
                    <p className="text-sm font-medium">{hydrogenProduct1.title}</p>
                  ) : (
                    <p className="text-sm font-medium">Hydrogen Collection</p>
                  )}
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">HYDROGEN</h3>
              <p className="text-red-600 font-medium">Get up to 20% off</p>
            </Link>

            {/* Hydrogen Product 2 */}
            <Link href="/search?collection=hydrogen" className="group cursor-pointer">
              <div className="relative aspect-square bg-muted rounded-lg overflow-hidden mb-4">
                {hydrogenProduct2?.featuredImage?.url ? (
                  <Image
                    src={hydrogenProduct2.featuredImage.url}
                    alt={hydrogenProduct2.featuredImage.altText || hydrogenProduct2.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-muted to-muted/80 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <div className="text-4xl mb-2">👖</div>
                      <p className="text-sm">Hydrogen Collection</p>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  {hydrogenProduct2 ? (
                    <p className="text-sm font-medium">{hydrogenProduct2.title}</p>
                  ) : (
                    <p className="text-sm font-medium">Hydrogen Collection</p>
                  )}
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">HYDROGEN</h3>
              <p className="text-red-600 font-medium">Get up to 20% off</p>
            </Link>

            {/* Hydrogen Product 3 */}
            <Link href="/search?collection=hydrogen" className="group cursor-pointer">
              <div className="relative aspect-square bg-muted rounded-lg overflow-hidden mb-4">
                {hydrogenProduct3?.featuredImage?.url ? (
                  <Image
                    src={hydrogenProduct3.featuredImage.url}
                    alt={hydrogenProduct3.featuredImage.altText || hydrogenProduct3.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-muted to-muted/80 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <div className="text-4xl mb-2">👜</div>
                      <p className="text-sm">Hydrogen Collection</p>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  {hydrogenProduct3 ? (
                    <p className="text-sm font-medium">{hydrogenProduct3.title}</p>
                  ) : (
                    <p className="text-sm font-medium">Hydrogen Collection</p>
                  )}
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">HYDROGEN</h3>
              <p className="text-red-600 font-medium">Get up to 20% off</p>
            </Link>
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

