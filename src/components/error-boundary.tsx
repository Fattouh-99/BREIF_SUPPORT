'use client';

import React from 'react';
import { ErrorBoundary as ReactErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { Button } from '@/components/ui/button';
import { RefreshCcw, AlertTriangle } from 'lucide-react';

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="p-4 rounded-md border border-red-200 bg-red-50 flex flex-col items-center justify-center text-center space-y-4">
      <div className="rounded-full bg-red-100 p-3 text-red-600">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-medium text-red-800">Something went wrong</h3>
      <div className="text-sm text-red-700 max-w-md">
        <p>We've encountered an error displaying this content.</p>
        {process.env.NODE_ENV !== 'production' && (
          <pre className="mt-2 text-xs text-left bg-red-100 p-2 rounded overflow-x-auto">
            {error.message}
          </pre>
        )}
      </div>
      <Button 
        variant="outline" 
        size="sm"
        onClick={resetErrorBoundary}
        className="flex items-center gap-2 text-red-800 border-red-300 hover:bg-red-100"
      >
        <RefreshCcw className="h-4 w-4" />
        Try again
      </Button>
    </div>
  );
}

interface ErrorInfo {
  componentStack: string;
}

export function logError(error: Error, info: React.ErrorInfo) {
  // Log error to console
  console.error('Error captured by error boundary:', error);
  console.error('Component stack:', info.componentStack);
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary 
      FallbackComponent={ErrorFallback}
      onError={logError}
    >
      {children}
    </ReactErrorBoundary>
  );
}

// For wrapping specific components that might have errors
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallbackRender?: React.ComponentType<FallbackProps>
) {
  const displayName = Component.displayName || Component.name || 'Component';
  
  const WrappedComponent = (props: P) => (
    <ReactErrorBoundary 
      FallbackComponent={fallbackRender || ErrorFallback}
      onError={logError}
    >
      <Component {...props} />
    </ReactErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${displayName})`;
  
  return WrappedComponent;
} 