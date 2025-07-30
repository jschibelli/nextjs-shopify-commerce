'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { addItem } from "components/cart/actions";
import { Eye, Heart, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

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
  variant?: "default" | "compact" | "featured";
}

export function ProductCard({ product, variant = "default" }: ProductCardProps) {
  const formatPrice = (amount: string, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(parseFloat(amount));
  };

  // Fallback image for products without featuredImage
  const fallbackImage = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop";
  const imageUrl = product.featuredImage?.url || fallbackImage;
  const imageAlt = product.featuredImage?.altText || product.title;

  // Get the first available variant for add to cart
  const firstVariant = product.variants?.[0];
  const canAddToCart = firstVariant?.availableForSale && firstVariant?.id;

  const handleAddToCart = async () => {
    if (!canAddToCart) return;
    
    try {
      await addItem(null, firstVariant.id);
      toast.success('Item added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart.');
    }
  };

  if (variant === "compact") {
    return (
      <Card className="group hover:shadow-lg transition-all duration-200">
        <CardHeader className="p-4 pb-2">
          <div className="relative aspect-square overflow-hidden rounded-lg">
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <CardTitle className="text-sm font-medium line-clamp-2 mb-2">
            {product.title}
          </CardTitle>
          <p className="text-lg font-semibold text-primary">
            {formatPrice(product.priceRange.maxVariantPrice.amount, product.priceRange.maxVariantPrice.currencyCode)}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <div className="flex gap-2 w-full">
            <Button size="sm" variant="outline" className="flex-1" asChild>
              <Link href={`/product/${product.handle}`}>
                View
              </Link>
            </Button>
            <Button 
              size="sm" 
              onClick={handleAddToCart}
              disabled={!canAddToCart}
              className="flex items-center gap-1"
            >
              <ShoppingCart className="h-3 w-3" />
              {canAddToCart ? 'Add' : 'Out'}
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  }

  if (variant === "featured") {
    return (
      <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
        <CardHeader className="p-0">
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute top-4 right-4 flex gap-2">
              <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                <Heart className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
            {product.tags && product.tags.length > 0 && (
              <div className="absolute bottom-4 left-4">
                <Badge variant="secondary" className="bg-white/90 text-black">
                  {product.tags[0]}
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <CardTitle className="text-xl font-bold mb-2 line-clamp-2">
            {product.title}
          </CardTitle>
          {product.description && (
            <CardDescription className="line-clamp-2 mb-4">
              {product.description}
            </CardDescription>
          )}
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-primary">
              {formatPrice(product.priceRange.maxVariantPrice.amount, product.priceRange.maxVariantPrice.currencyCode)}
            </p>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                asChild
              >
                <Link href={`/product/${product.handle}`}>
                  View Details
                </Link>
              </Button>
              <Button 
                size="sm" 
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className="flex items-center gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                {canAddToCart ? 'Add to Cart' : 'Out of Stock'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className="group hover:shadow-lg transition-all duration-200">
      <CardHeader className="p-4 pb-2">
        <div className="relative aspect-square overflow-hidden rounded-lg">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="text-base font-semibold line-clamp-2 flex-1">
            {product.title}
          </CardTitle>
        </div>
        {product.tags && product.tags.length > 0 && (
          <div className="flex gap-1 mb-3">
            {product.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <Separator className="my-3" />
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-primary">
            {formatPrice(product.priceRange.maxVariantPrice.amount, product.priceRange.maxVariantPrice.currencyCode)}
          </p>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              asChild
            >
              <Link href={`/product/${product.handle}`}>
                View Details
              </Link>
            </Button>
            <Button 
              size="sm" 
              onClick={handleAddToCart}
              disabled={!canAddToCart}
              className="flex items-center gap-1"
            >
              <ShoppingCart className="h-3 w-3" />
              {canAddToCart ? 'Add' : 'Out'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 