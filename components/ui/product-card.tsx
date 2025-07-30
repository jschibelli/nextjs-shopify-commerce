'use client';

import { EyeIcon, HeartIcon, ShoppingBagIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: {
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
  };
  variant?: 'default' | 'featured';
  className?: string;
}

export function ProductCard({ product, variant = 'default', className }: ProductCardProps) {
  const isOnSale = product.tags?.includes('sale') || product.tags?.includes('Sale');
  const isNew = product.tags?.includes('new') || product.tags?.includes('New');
  const isHot = product.tags?.includes('hot') || product.tags?.includes('Hot');

  return (
    <div className={cn('group relative', className)}>
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        <Link href={`/product/${product.handle}`} className="block">
          <Image
            src={product.featuredImage?.url || '/placeholder-product.jpg'}
            alt={product.featuredImage?.altText || product.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          />
        </Link>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-sm"
          >
            <HeartIcon className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-sm"
          >
            <EyeIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {isNew && (
            <Badge variant="secondary" className="bg-green-500 text-white text-xs">
              New
            </Badge>
          )}
          {isHot && (
            <Badge variant="secondary" className="bg-red-500 text-white text-xs">
              Hot
            </Badge>
          )}
          {isOnSale && (
            <Badge variant="secondary" className="bg-orange-500 text-white text-xs">
              Sale
            </Badge>
          )}
        </div>

        {/* Add to Cart Button */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            <ShoppingBagIcon className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <div className="mt-4 space-y-2">
        <Link href={`/product/${product.handle}`} className="block group">
          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {product.title}
          </h3>
        </Link>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">
              ${parseFloat(product.priceRange.maxVariantPrice.amount).toFixed(2)}
            </span>
            {isOnSale && (
              <span className="text-sm text-muted-foreground line-through">
                ${(parseFloat(product.priceRange.maxVariantPrice.amount) * 1.3).toFixed(2)}
              </span>
            )}
          </div>
          
          {variant === 'featured' && (
            <div className="text-xs text-muted-foreground">
              {product.variants?.length || 0} variants
            </div>
          )}
        </div>

        {variant === 'featured' && product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        )}
      </div>
    </div>
  );
} 