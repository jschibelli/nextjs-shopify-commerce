'use client';

import { Product } from 'lib/shopify/types';
import { ProductDescription } from './product-description';
import { ProductReviews } from './product-reviews';

interface ProductClientWrapperProps {
  product: Product;
}

export function ProductClientWrapper({ product }: ProductClientWrapperProps) {
  return (
    <div className="space-y-8">
    <ProductDescription 
      product={product} 
    />
      <ProductReviews 
        productId={product.id}
        productTitle={product.title}
      />
    </div>
  );
} 