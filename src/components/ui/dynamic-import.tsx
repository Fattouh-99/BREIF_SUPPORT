'use client';

import React, { Suspense } from 'react';

interface DynamicImportProps {
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
  props?: Record<string, any>;
}

/**
 * DynamicImport component for code splitting
 * 
 * Usage:
 * ```tsx
 * const LazyComponent = React.lazy(() => import('@/components/heavy-component'))
 * 
 * // In your component:
 * <DynamicImport 
 *   component={LazyComponent} 
 *   fallback={<div>Loading...</div>} 
 *   props={{ foo: 'bar' }}
 * />
 * ```
 */
export function DynamicImport({
  component: Component,
  fallback = <div className="min-h-20 flex items-center justify-center">Loading...</div>,
  onError,
  props = {},
}: DynamicImportProps) {
  return (
    <Suspense fallback={fallback}>
      <ErrorBoundary onError={onError}>
        <Component {...props} />
      </ErrorBoundary>
    </Suspense>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  onError?: (error: Error) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-red-200 rounded-md bg-red-50 text-red-500">
          <h3 className="font-medium">Something went wrong</h3>
          <p className="text-sm mt-1">Please try refreshing the page</p>
          {process.env.NODE_ENV === 'development' && (
            <pre className="mt-2 text-xs overflow-auto p-2 bg-red-100 rounded max-h-32">
              {this.state.error?.message}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
} 