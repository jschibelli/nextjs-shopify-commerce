'use client';

import { Badge } from 'components/ui/badge';
import { Button } from 'components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'components/ui/card';
import {
    DollarSign,
    Heart,
    Package,
    Share2,
    ShoppingCart,
    Star
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import WishlistActions from './wishlist-actions';

function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchWishlistData();
  }, []);

  const fetchWishlistData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch wishlist data
      const wishlistResponse = await fetch('/api/account/wishlist');
      if (wishlistResponse.ok) {
        const data = await wishlistResponse.json();
        setWishlistItems(data.wishlistItems || []);
      } else if (wishlistResponse.status === 401) {
        // Redirect to login if unauthorized
        router.push('/login');
        return;
      } else {
        setError('Failed to fetch wishlist data');
      }

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

  const handleRemoveItem = (itemId: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== itemId));
  };

  const totalValue = wishlistItems.reduce((sum, item) => sum + item.price, 0);
  const savings = wishlistItems.reduce((sum, item) => sum + (item.originalPrice - item.price), 0);

  if (isLoading) {
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
            <Button onClick={fetchWishlistData} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          <p className="text-muted-foreground">
            Save items you love for later
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Share2 className="w-4 h-4 mr-2" />
            Share Wishlist
          </Button>
          <Button>
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add All to Cart
          </Button>
        </div>
      </div>

      {/* Wishlist Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-2xl font-bold">{wishlistItems.length}</p>
                <p className="text-sm text-muted-foreground">Total Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Total Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{wishlistItems.filter(item => item.inStock).length}</p>
                <p className="text-sm text-muted-foreground">In Stock</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">${savings.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Potential Savings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wishlist Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlistItems.map((item) => (
          <Card key={item.id} className="group hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="relative">
                {/* Item Image */}
                <div className="w-full h-48 bg-muted rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                  {item.image && item.image !== '/api/placeholder/150/150' ? (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>
                
                {/* Stock Badge */}
                <Badge 
                  variant={item.inStock ? 'default' : 'secondary'}
                  className="absolute top-2 right-2"
                >
                  {item.inStock ? 'In Stock' : 'Out of Stock'}
                </Badge>
                
                {/* Rating - Only show if rating > 0 */}
                {item.rating > 0 && (
                  <div className="flex items-center space-x-1 mb-2">
                    <Star className="w-4 h-4 text-yellow-500 dark:text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{item.rating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">({item.reviews})</span>
                  </div>
                )}
                
                {/* Item Details */}
                <h3 className="font-medium text-lg mb-2 line-clamp-2">{item.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{item.category}</p>
                
                {/* Price */}
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-lg font-bold">${item.price.toFixed(2)}</span>
                  {item.originalPrice > item.price && (
                    <span className="text-sm text-muted-foreground line-through">${item.originalPrice.toFixed(2)}</span>
                  )}
                </div>
                
                {/* Actions */}
                <WishlistActions item={item} onRemove={handleRemoveItem} />
                
                {/* Added Date */}
                <p className="text-xs text-muted-foreground mt-3">
                  Added {new Date(item.addedDate || Date.now()).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {wishlistItems.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Your wishlist is empty</h3>
            <p className="text-muted-foreground mb-6">
              Start adding items you love to your wishlist
            </p>
            <Button asChild>
              <a href="/search">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Start Shopping
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recently Viewed */}
      <Card>
        <CardHeader>
          <CardTitle>Recently Viewed</CardTitle>
          <CardDescription>
            Items you've recently looked at
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {allProducts.slice(0, 4).map((product) => (
              <div key={product.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden">
                  {product.featuredImage ? (
                    <img 
                      src={product.featuredImage.url} 
                      alt={product.featuredImage.altText || product.title}
                      className="w-12 h-12 object-cover"
                    />
                  ) : (
                    <Package className="w-6 h-6 text-muted-foreground m-3" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{product.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {product.priceRange.minVariantPrice.amount} {product.priceRange.minVariantPrice.currencyCode}
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function WishlistPageWrapper() {
  return (
    <Suspense fallback={<div className="animate-pulse space-y-6"><div className="h-8 bg-muted rounded" /><div className="grid grid-cols-1 md:grid-cols-4 gap-4"><div className="h-20 bg-muted rounded" /><div className="h-20 bg-muted rounded" /><div className="h-20 bg-muted rounded" /><div className="h-20 bg-muted rounded" /></div></div>}>
      <WishlistPage />
    </Suspense>
  );
} 