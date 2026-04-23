/**
 * Enhanced fetcher utility for making API requests
 * Provides consistent error handling and URL conversion
 */

// Convert localhost to 127.0.0.1 in development to avoid DNS resolution issues
export function normalizeUrl(url: string): string {
  if (process.env.NODE_ENV === 'development') {
    return url.replace(/localhost/g, '127.0.0.1');
  }
  return url;
}

// Timeout for fetch requests (5 seconds default)
const FETCH_TIMEOUT = 5000;

// Default fetch options
const defaultOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
  timeoutMs: FETCH_TIMEOUT,
};

/**
 * Enhanced fetch with timeout, error handling, and localhost conversion
 */
export async function fetcher<T>(url: string, options = {}): Promise<T> {
  const normalizedUrl = normalizeUrl(url);
  const mergedOptions = { ...defaultOptions, ...options };
  const { timeoutMs, ...fetchOptions } = mergedOptions;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const fetchPromise = fetch(normalizedUrl, {
      ...fetchOptions,
      signal: controller.signal,
    });

    const response = await fetchPromise;
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    return await response.json() as T;
  } catch (error: any) {
    console.error(`Fetch error for ${normalizedUrl}:`, error);

    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }

    // Enhance error message with more details
    const enhancedMessage = error.message || 'Unknown fetch error';
    throw new Error(`Fetch failed: ${enhancedMessage}`);
  }
}

/**
 * Post data to an API endpoint
 */
export async function postData<T, R>(url: string, data: T, options = {}): Promise<R> {
  return fetcher<R>(url, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options,
  });
}

/**
 * Put data to an API endpoint
 */
export async function putData<T, R>(url: string, data: T, options = {}): Promise<R> {
  return fetcher<R>(url, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options,
  });
}

/**
 * Delete data from an API endpoint
 */
export async function deleteData<R>(url: string, options = {}): Promise<R> {
  return fetcher<R>(url, {
    method: 'DELETE',
    ...options,
  });
}

/**
 * Fetch data with Clerk authentication
 * Uses the provided token in the Authorization header
 */
export async function fetchWithAuth<R>(url: string, token: string, options = {}): Promise<R> {
  return fetcher<R>(url, {
    headers: {
      ...defaultOptions.headers,
      'Authorization': `Bearer ${token}`,
    },
    ...options,
  });
}

/**
 * Fetch gateway routes with Clerk authentication
 * This function should be used in components to fetch routes data
 */
export async function fetchGatewayRoutes<R>(token: string): Promise<R> {
  return fetchWithAuth<R>('/api/actuator/gateway/routes', token);
} 