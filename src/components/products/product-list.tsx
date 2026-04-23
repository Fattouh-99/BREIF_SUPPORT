'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/product-card';
import { ProductCardSkeleton } from '@/components/ui/skeleton';

// Helper function to ensure objects are serializable
function ensureSerializable(obj: any): any {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }
  
  // Handle Date objects
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  
  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(ensureSerializable);
  }
  
  // Handle plain objects
  const result: Record<string, any> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = ensureSerializable(obj[key]);
    }
  }
  return result;
}

async function fetchProducts() {
  const response = await fetch('/api/products');
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  const data = await response.json();
  return ensureSerializable(data);
}

export default function ProductList() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const getProducts = async () => {
      try {
        setIsLoading(true);
        const data = await fetchProducts();
        setProducts(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    getProducts();
    
    // Set up a refresh interval (optional)
    const intervalId = setInterval(getProducts, 60 * 1000); // Refresh every minute
    
    return () => clearInterval(intervalId);
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array(8).fill(0).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-lg border border-red-200 bg-red-50 text-center">
        <h3 className="text-lg font-medium text-red-800 mb-2">Error loading products</h3>
        <p className="text-red-600">
          {error.message || 'Something went wrong. Please try again.'}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="p-8 rounded-lg border border-gray-200 bg-gray-50 text-center">
        <h3 className="text-lg font-medium text-gray-800 mb-2">No products found</h3>
        <p className="text-gray-600">
          We couldn't find any products. Please check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product: any) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
} 