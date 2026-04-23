import { useState, useEffect, useCallback } from 'react';

// Ensure objects coming from server components are serializable
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

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string | null;
  productType?: string | null;
  hasDiscount: boolean;
  discountedPrice?: number | null;
  active: boolean;
  images?: string[];
  variants?: any[];
  createdAt: Date | string;
};

// Fetch products for a user/team
export const useProducts = (userId: string) => {
  const [data, setData] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/products?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const result = await response.json();
      setData(ensureSerializable(result));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId, fetchData]);

  // Add refetch capability
  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch };
};

// Fetch a single product by ID
export const useProduct = (productId: string) => {
  const [data, setData] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(productId ? true : false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!productId) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }
      const result = await response.json();
      setData(ensureSerializable(result));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (productId) {
      fetchData();
    }
  }, [productId, fetchData]);

  // Add refetch capability
  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch };
};

// Update product status (active/inactive)
export const useUpdateProductStatus = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<any>(null);

  const mutate = async ({ productId, active }: { productId: string; active: boolean }) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/products/${productId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update product status');
      }
      
      const result = await response.json();
      const serializedResult = ensureSerializable(result);
      setData(serializedResult);
      return serializedResult;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

// Delete product
export const useDeleteProduct = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<any>(null);

  const mutate = async (productId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      
      const result = await response.json();
      const serializedResult = ensureSerializable(result);
      setData(serializedResult);
      return serializedResult;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
}; 