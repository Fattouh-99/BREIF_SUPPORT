'use client';

import React from 'react';
import { DynamicImport } from '@/components/ui/dynamic-import';

// Lazy load the heavy product form component
const ProductForm = React.lazy(() => import('./product-form').then(mod => ({
  default: mod.CreateProductForm
})));

interface LazyProductFormProps {
  id: string;
  editingProductId?: string | null;
}

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

/**
 * A lazy-loaded wrapper for the ProductForm component
 * This enables code splitting for the heavy product form
 */
export default function LazyProductForm(props: LazyProductFormProps) {
  // Ensure props are serializable before passing to lazy-loaded component
  const serializedProps = ensureSerializable(props);
  
  return (
    <DynamicImport 
      component={ProductForm}
      props={serializedProps}
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse flex flex-col space-y-4 w-full max-w-3xl px-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
            <div className="h-20 bg-gray-200 rounded w-full"></div>
            <div className="h-10 bg-gray-200 rounded w-2/4"></div>
            <div className="flex space-x-4">
              <div className="h-20 bg-gray-200 rounded w-1/4"></div>
              <div className="h-20 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      }
    />
  );
} 