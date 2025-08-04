'use client';

import { Product } from 'lib/shopify/types';
import { ProductDescription } from './product-description';

interface ProductClientWrapperProps {
  product: Product;
}

export function ProductClientWrapper({ product }: ProductClientWrapperProps) {
  return (
    <ProductDescription 
      product={product} 
    />
  );
} 