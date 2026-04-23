'use client';

import { useSearchParams } from 'next/navigation';
import { ReactNode, Suspense } from 'react';

interface SearchParamsProviderProps {
  children: (searchParams: URLSearchParams) => ReactNode;
  fallback?: ReactNode;
}

function SearchParamsContent({ children }: SearchParamsProviderProps) {
  const searchParams = useSearchParams();
  return <>{children(searchParams)}</>;
}

export function SearchParamsProvider({ 
  children, 
  fallback = <div className="flex items-center justify-center w-full p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    <span className="ml-2">Loading...</span>
  </div> 
}: SearchParamsProviderProps) {
  return (
    <Suspense fallback={fallback}>
      <SearchParamsContent>
        {children}
      </SearchParamsContent>
    </Suspense>
  );
}

// Helper hooks to simplify common use cases
export function useWrappedSearchParams() {
  return function SearchParamsWrapper({ children }: { children: (searchParams: URLSearchParams) => ReactNode }) {
    return (
      <SearchParamsProvider>
        {children}
      </SearchParamsProvider>
    );
  };
} 