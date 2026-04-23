'use client';

import { useSearchParams } from 'next/navigation';
import { ReactNode, ComponentType, Suspense, useState, useEffect } from 'react';

// A component that uses useSearchParams and passes it to children
function SearchParamsContent({ 
  children, 
  Component 
}: { 
  children?: never;
  Component: ComponentType<{ searchParams: URLSearchParams }> 
}) {
  const searchParams = useSearchParams();
  return <Component searchParams={searchParams} />;
}

// Higher-order component that wraps a component with search params
export function withSearchParams<T extends { searchParams?: URLSearchParams }>(
  Component: ComponentType<T>
) {
  return function WithSearchParamsWrapper(props: Omit<T, 'searchParams'>) {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center w-full p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading...</span>
        </div>
      }>
        <SearchParamsContent Component={(searchParamsProps) => <Component {...props as any} {...searchParamsProps} />} />
      </Suspense>
    );
  };
}

// A component that consumes search params and renders children with them
interface SearchParamsProviderProps {
  children: (searchParams: URLSearchParams) => ReactNode;
  fallback?: ReactNode;
}

function SearchParamsContentForChildren({ children }: { children: (searchParams: URLSearchParams) => ReactNode }) {
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
      <SearchParamsContentForChildren>
        {children}
      </SearchParamsContentForChildren>
    </Suspense>
  );
}

// Safe useSearchParams hook that works in SSR
export function useSafeSearchParams() {
  const [params, setParams] = useState<URLSearchParams | null>(null);
  
  useEffect(() => {
    // In the browser, we can get the search params from window.location
    const searchParams = new URLSearchParams(window.location.search);
    setParams(searchParams);
  }, []);
  
  // During SSR or if not ready yet, return an empty URLSearchParams object
  if (!params) {
    return new URLSearchParams();
  }
  
  return params;
} 