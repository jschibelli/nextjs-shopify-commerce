'use client';

import { EyeIcon, HeartIcon, ShoppingBagIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { ReviewStars } from '@/components/product/review-stars';
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
    reviewStats?: {
      averageRating: number;
      totalReviews: number;
    };
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
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isNew && (
            <Badge variant="secondary" className="bg-green-500 text-white">
              New
            </Badge>
          )}
          {isHot && (
            <Badge variant="secondary" className="bg-red-500 text-white">
              Hot
            </Badge>
          )}
          {isOnSale && (
            <Badge variant="secondary" className="bg-orange-500 text-white">
              Sale
            </Badge>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="mt-4 space-y-2">
        <Link href={`/product/${product.handle}`} className="block">
          <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {product.title}
          </h3>
        </Link>

        {/* Rating */}
        {product.reviewStats && product.reviewStats.totalReviews > 0 && (
          <div className="flex items-center gap-1">
            <ReviewStars rating={product.reviewStats.averageRating} size="sm" />
            <span className="text-xs text-muted-foreground">
              ({product.reviewStats.totalReviews})
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="font-semibold text-sm">
            ${parseFloat(product.priceRange.maxVariantPrice.amount).toFixed(2)}
          </div>
          <Button size="sm" className="h-8 px-3">
            <ShoppingBagIcon className="h-4 w-4 mr-1" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
} 