import { NextRequest } from 'next/server';

/**
 * Helper function to measure performance of API routes
 * @param handler The API route handler to wrap with performance monitoring
 * @returns The wrapped handler with performance monitoring
 */
export function withPerformanceMonitoring(
  handler: (req: NextRequest) => Promise<Response>
) {
  return async function (req: NextRequest): Promise<Response> {
    // Start timing
    const startTime = performance.now();
    
    try {
      // Execute the original handler
      const response = await handler(req);
      
      // Record timing
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Log performance data
      console.log(`[Performance] ${req.method} ${req.nextUrl.pathname} completed in ${duration.toFixed(2)}ms`);
      
      // Add timing headers to the response
      const headers = new Headers(response.headers);
      headers.set('Server-Timing', `total;dur=${duration.toFixed(2)}`);
      
      // Clone the response with the new headers
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    } catch (error) {
      // Also time errors
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.error(`[Performance Error] ${req.method} ${req.nextUrl.pathname} failed after ${duration.toFixed(2)}ms`, error);
      
      // Re-throw the error
      throw error;
    }
  };
} 