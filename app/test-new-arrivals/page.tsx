import { getCollectionProducts } from 'lib/shopify';
import { Product } from 'lib/shopify/types';

export default async function TestNewArrivalsPage() {
  let products: Product[] = [];
  let error = null;

  try {
    products = await getCollectionProducts({ collection: 'new-arrivals' });
  } catch (err) {
    error = err;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">New Arrivals Collection Test</h1>
      
      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error.toString()}
        </div>
      ) : (
        <div>
          <p className="mb-4">
            <strong>Products found:</strong> {products.length}
          </p>
          
          {products.length === 0 ? (
            <p className="text-gray-600">No products found in new-arrivals collection.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">{product.title}</h3>
                  <p className="text-gray-600 mb-2">Handle: {product.handle}</p>
                  <p className="text-gray-600 mb-2">
                    Price: ${parseFloat(product.priceRange.maxVariantPrice.amount).toFixed(2)}
                  </p>
                  {product.featuredImage?.url && (
                    <img 
                      src={product.featuredImage.url} 
                      alt={product.featuredImage.altText || product.title}
                      className="w-full h-48 object-cover rounded"
                    />
                  )}
                  <a 
                    href={`/product/${product.handle}`}
                    className="inline-block mt-2 text-blue-600 hover:underline"
                  >
                    View Product
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 