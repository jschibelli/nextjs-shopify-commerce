'use client';

import { Badge } from 'components/ui/badge';
import { Button } from 'components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'components/ui/card';
import { useWishlist } from 'components/wishlist/wishlist-context';
import {
    DollarSign,
    Heart,
    Package,
    ShoppingCart,
    Star
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import WishlistActions from './wishlist-actions';

function WishlistPage() {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { wishlistItems, isLoading: wishlistLoading } = useWishlist();

  useEffect(() => {
    fetchProductsData();
  }, []);

  const fetchProductsData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch products for "Recently Viewed" section
      const productsResponse = await fetch('/api/products');
      if (productsResponse.ok) {
        const data = await productsResponse.json();
        setAllProducts(data.products || []);
      }
    } catch (error) {
      setError('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const totalValue = wishlistItems.reduce((sum, item) => sum + item.price, 0);
  const savings = wishlistItems.reduce((sum, item) => sum + (item.originalPrice - item.price), 0);

  if (isLoading || wishlistLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-muted rounded"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          <p className="text-muted-foreground">
            Save items you love for later
          </p>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-destructive">{error}</p>
            <Button onClick={fetchProductsData} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Wishlist</h1>
        <p className="text-muted-foreground">
          Save items you love for later
        </p>
      </div>

      {/* Wishlist Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Total Items</span>
            </div>
            <p className="text-2xl font-bold">{wishlistItems.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Total Value</span>
            </div>
            <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">In Stock</span>
            </div>
            <p className="text-2xl font-bold">
              {wishlistItems.filter(item => item.inStock).length}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Savings</span>
            </div>
            <p className="text-2xl font-bold">${savings.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Wishlist Items */}
      {wishlistItems.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
            <p className="text-muted-foreground mb-4">
              Start adding items you love to your wishlist
            </p>
            <Button asChild>
              <a href="/search">Start Shopping</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <Card key={item.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <Badge variant={item.inStock ? 'default' : 'secondary'}>
                    {item.inStock ? 'In Stock' : 'Out of Stock'}
                  </Badge>
                </div>
                <CardDescription>{item.category}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-square relative overflow-hidden rounded-lg">
                  {item.image && item.image !== '/api/placeholder/150/150' ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-muted">
                      <Heart className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">${item.price.toFixed(2)}</span>
                    {item.originalPrice > item.price && (
                      <span className="text-sm text-muted-foreground line-through">
                        ${item.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < item.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-muted-foreground ml-1">
                      ({item.reviews})
                    </span>
                  </div>
                  
                  <WishlistActions item={item} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Recently Viewed Section */}
      {allProducts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Recently Viewed</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allProducts.slice(0, 3).map((product) => (
              <Card key={product.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="aspect-square relative overflow-hidden rounded-lg mb-4">
                    {product.featuredImage?.url ? (
                      <img
                        src={product.featuredImage.url}
                        alt={product.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-muted">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold mb-2">{product.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">
                      ${product.priceRange?.minVariantPrice?.amount || '0.00'}
                    </span>
                    <Button size="sm" variant="outline">
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function WishlistPageWrapper() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading...</div>}>
        <WishlistPage />
      </Suspense>
    </div>
  );
} 