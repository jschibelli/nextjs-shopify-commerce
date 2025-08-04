import { getCollectionProducts, getCollections } from 'lib/shopify';
import { Product } from 'lib/shopify/types';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get all available collections
    const collections = await getCollections();
    
    // Test the new-arrivals collection specifically
    let newArrivalsProducts: Product[] = [];
    try {
      newArrivalsProducts = await getCollectionProducts({ collection: 'new-arrivals' });
    } catch (error) {
      console.error('Error fetching new-arrivals collection:', error);
    }

    // Test hydrogen collection for comparison
    let hydrogenProducts: Product[] = [];
    try {
      hydrogenProducts = await getCollectionProducts({ collection: 'hydrogen' });
    } catch (error) {
      console.error('Error fetching hydrogen collection:', error);
    }

    return NextResponse.json({
      allCollections: collections.map(c => ({ handle: c.handle, title: c.title })),
      newArrivalsProducts: newArrivalsProducts.length,
      hydrogenProducts: hydrogenProducts.length,
      newArrivalsSample: newArrivalsProducts.slice(0, 2).map(p => ({
        title: p.title,
        handle: p.handle,
        price: p.priceRange.maxVariantPrice.amount
      })),
      hydrogenSample: hydrogenProducts.slice(0, 2).map(p => ({
        title: p.title,
        handle: p.handle,
        price: p.priceRange.maxVariantPrice.amount
      }))
    });
  } catch (error) {
    console.error('Test collections error:', error);
    return NextResponse.json(
      { error: 'Failed to test collections' },
      { status: 500 }
    );
  }
} 