'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CheckIcon, ShoppingCartIcon } from 'lucide-react';

interface ProductDetailProps {
  product: any; // Replace with proper typing from Prisma schema
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    
    try {
      // Simulate API call for cart addition
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Show success state
      // You could trigger a toast notification here
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <article className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
            loading="eager"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-400">No image available</span>
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <nav aria-label="Breadcrumb" className="mb-3">
          <ol className="flex items-center gap-1 text-sm text-gray-500">
            <li>
              <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
            </li>
            <li>
              <span aria-hidden="true">/</span>
            </li>
            <li className="text-gray-700 font-medium" aria-current="page">
              {product.name}
            </li>
          </ol>
        </nav>

        <h1 className="text-2xl font-bold md:text-3xl">{product.name}</h1>
        
        <div className="mt-2">
          <p className="text-lg font-semibold">
            {product.price ? formatCurrency(product.price) : 'Contact for pricing'}
          </p>
        </div>
        
        {product.active ? (
          <div className="flex items-center gap-1 mt-1">
            <CheckIcon className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-700">In Stock</span>
          </div>
        ) : (
          <div className="mt-1 text-sm text-red-500">Currently unavailable</div>
        )}

        <div className="mt-6 prose prose-sm">
          <p>{product.description}</p>
        </div>

        {product.features && (
          <div className="mt-6">
            <h2 className="text-lg font-medium mb-3">Features</h2>
            <ul className="list-disc pl-5 space-y-1">
              {product.features.map((feature: string, index: number) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8">
          <Button
            onClick={handleAddToCart}
            disabled={!product.active || isAdding}
            size="lg"
            className="w-full md:w-auto flex items-center gap-2"
          >
            <ShoppingCartIcon className="h-4 w-4" />
            {isAdding ? 'Adding...' : 'Add to Cart'}
          </Button>
        </div>
        
        {product.productUrl && (
          <div className="mt-3">
            <Link
              href={product.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm"
            >
              Visit product website
            </Link>
          </div>
        )}
      </div>
    </article>
  );
} 