/**
 * Report Web Vitals
 * This function sends web vitals metrics for performance monitoring
 */
export function reportWebVitals(metric: {
  id: string;
  name: string;
  startTime: number;
  value: number;
  label: 'web-vital' | 'custom';
}) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(metric);
  }
  
  // Send to analytics endpoint in production
  if (process.env.NODE_ENV === 'production') {
    const body = JSON.stringify(metric);
    
    // Use `navigator.sendBeacon()` if available, falling back to `fetch()`
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon('/api/vitals', body);
    } else if (typeof fetch !== 'undefined') {
      fetch('/api/vitals', {
        body,
        method: 'POST',
        keepalive: true,
      });
    }
  }
} 