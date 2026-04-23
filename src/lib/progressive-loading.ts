import { NextRequest, NextResponse } from 'next/server';
import { successResponse, ApiError } from './api-response';
import { generateUUID } from './uuid';

/**
 * Options for progressive loading
 */
interface ProgressiveLoadOptions {
  /**
   * Initial data to return immediately
   */
  initialData: any;
  
  /**
   * Additional data loaders with their priorities
   * Lower numbers will be executed first
   */
  loaders: Array<{
    priority: number;
    key: string;
    loader: () => Promise<any>;
  }>;
  
  /**
   * Whether to stream results (requires ReadableStream support)
   * If false, will return results as they become available via regular responses
   */
  stream?: boolean;
}

/**
 * Creates a progressive loading handler for Next.js API routes
 * This allows returning initial data quickly while loading additional data in the background
 * 
 * @param req - Next.js request object
 * @param options - Progressive loading options
 * @returns A Response object
 */
export async function progressiveLoad(
  req: NextRequest,
  options: ProgressiveLoadOptions
): Promise<Response> {
  const { initialData, loaders, stream = false } = options;
  
  // Check if client supports streaming
  const acceptsNdjson = req.headers.get('Accept')?.includes('application/x-ndjson');
  const useStreaming = stream && acceptsNdjson;
  
  if (useStreaming) {
    // Stream responses as they become available
    return streamingResponse(initialData, loaders);
  } else {
    // Return quick initial response
    // The client will need to make subsequent requests for the rest of the data
    return standardResponse(req, initialData, loaders);
  }
}

/**
 * Creates a streaming response that sends data as it becomes available
 * 
 * @param initialData - Data to send immediately
 * @param loaders - Additional data loaders
 * @returns A streaming Response
 */
function streamingResponse(
  initialData: any,
  loaders: ProgressiveLoadOptions['loaders']
): Response {
  // Create a stream
  const stream = new ReadableStream({
    async start(controller) {
      // Send initial data immediately
      const initialChunk = JSON.stringify({ type: 'initial', data: initialData }) + '\n';
      controller.enqueue(new TextEncoder().encode(initialChunk));
      
      // Sort loaders by priority
      const sortedLoaders = [...loaders].sort((a, b) => a.priority - b.priority);
      
      // Process each loader sequentially
      for (const loader of sortedLoaders) {
        try {
          const data = await loader.loader();
          const chunk = JSON.stringify({ 
            type: 'update',
            key: loader.key,
            data 
          }) + '\n';
          controller.enqueue(new TextEncoder().encode(chunk));
        } catch (error) {
          const errorChunk = JSON.stringify({ 
            type: 'error',
            key: loader.key,
            error: error instanceof Error ? error.message : 'Unknown error'
          }) + '\n';
          controller.enqueue(new TextEncoder().encode(errorChunk));
        }
      }
      
      // Send complete signal
      const completeChunk = JSON.stringify({ type: 'complete' }) + '\n';
      controller.enqueue(new TextEncoder().encode(completeChunk));
      controller.close();
    }
  });
  
  // Return streaming response
  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-store',
      'Transfer-Encoding': 'chunked'
    }
  });
}

/**
 * Creates a standard response with initial data and starts background loading
 * 
 * @param req - Next.js request object
 * @param initialData - Data to return immediately
 * @param loaders - Additional data loaders
 * @returns A standard Response
 */
async function standardResponse(
  req: NextRequest,
  initialData: any,
  loaders: ProgressiveLoadOptions['loaders']
): Promise<Response> {
  // Generate unique request ID for subsequent requests
  const requestId = generateUUID();
  
  // Store in a global cache for subsequent requests
  progressiveLoadCache.set(requestId, {
    loaders: [...loaders].sort((a, b) => a.priority - b.priority),
    results: {},
    expires: Date.now() + 30000, // 30 second expiration
  });
  
  // Start processing loaders in the background
  processLoaders(requestId);
  
  // Return initial response with request ID
  return successResponse({
    ...initialData,
    _requestId: requestId,
    _progressive: true,
  });
}

/**
 * Process loaders in the background
 * 
 * @param requestId - The request ID
 */
async function processLoaders(requestId: string): Promise<void> {
  const cacheEntry = progressiveLoadCache.get(requestId);
  if (!cacheEntry) return;
  
  // Process each loader
  for (const loader of cacheEntry.loaders) {
    try {
      const result = await loader.loader();
      cacheEntry.results[loader.key] = {
        status: 'success',
        data: result,
      };
    } catch (error) {
      cacheEntry.results[loader.key] = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// In-memory cache for progressive loading results
const progressiveLoadCache = new Map<string, {
  loaders: ProgressiveLoadOptions['loaders'];
  results: Record<string, any>;
  expires: number;
}>();

// Cleanup expired entries every minute
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    // Fix for iterator compatibility - use Array.from instead of direct iteration
    Array.from(progressiveLoadCache.keys()).forEach(key => {
      const value = progressiveLoadCache.get(key);
      if (value && value.expires < now) {
        progressiveLoadCache.delete(key);
      }
    });
  }, 60000);
}

/**
 * Fetches progressive loading results for a specific request
 * 
 * @param requestId - The request ID
 * @returns Results for all completed loaders
 */
export function getProgressiveResults(requestId: string): Record<string, any> | null {
  const cacheEntry = progressiveLoadCache.get(requestId);
  if (!cacheEntry) return null;
  
  return cacheEntry.results;
} 