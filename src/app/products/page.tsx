import { Suspense } from 'react';
import { Metadata } from 'next';
import { generateMetadata } from '../metadata';
import ProductList from '@/components/products/product-list';
import { ProductCardSkeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = generateMetadata({
  title: 'Products',
  description: 'Browse our products and services with detailed information and pricing.',
  keywords: ['products', 'pricing', 'services', 'ecommerce'],
});

export default function ProductsPage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-8">Products</h1>
      
      <Suspense fallback={<ProductsLoading />}>
        <ProductList />
      </Suspense>
    </div>
  );
}

function ProductsLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array(8).fill(0).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
} 