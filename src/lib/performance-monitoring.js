/**
 * Client-side performance monitoring utilities
 * Used to track key performance metrics for the website
 */

import { reportWebVitals as reportVitals } from '@/lib/web-vitals';

// Report Web Vitals metrics
export function reportWebVitals(metric) {
  // Use the implementation from web-vitals.ts
  reportVitals(metric);
}

// Function to measure time to first byte
export function measureTTFB() {
  if (typeof window !== 'undefined' && window.performance) {
    const navigation = window.performance.getEntriesByType('navigation')[0];
    if (navigation) {
      const ttfb = navigation.responseStart - navigation.requestStart;
      console.log(`Time to First Byte: ${ttfb.toFixed(0)}ms`);
      return ttfb;
    }
  }
  return null;
}

// Function to measure time to interactive
export function measureTTI() {
  if (typeof window !== 'undefined' && window.performance) {
    const navigation = window.performance.getEntriesByType('navigation')[0];
    if (navigation) {
      const tti = navigation.domInteractive - navigation.startTime;
      console.log(`Time to Interactive: ${tti.toFixed(0)}ms`);
      return tti;
    }
  }
  return null;
}

// Track component render times
export function trackRender(componentName) {
  if (process.env.NODE_ENV !== 'development') {
    return { end: () => {} };
  }
  
  const start = performance.now();
  
  return {
    end: () => {
      const duration = performance.now() - start;
      console.log(`[Render] ${componentName}: ${duration.toFixed(2)}ms`);
    }
  };
}

// Initialize performance monitoring
export function initPerformanceMonitoring() {
  if (typeof window !== 'undefined') {
    // Listen for layout shifts
    let cumulativeLayoutShift = 0;
    
    const observer = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        // Only count layout shifts without recent user input
        if (!entry.hadRecentInput) {
          cumulativeLayoutShift += entry.value;
        }
      }
      
      console.log(`Cumulative Layout Shift: ${cumulativeLayoutShift.toFixed(3)}`);
    });
    
    observer.observe({ type: 'layout-shift', buffered: true });
    
    // Monitor Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      console.log(`Largest Contentful Paint: ${lastEntry.startTime.toFixed(0)}ms`);
    });
    
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    
    // Monitor First Input Delay
    const fidObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      for (const entry of entries) {
        console.log(`First Input Delay: ${entry.processingStart - entry.startTime}ms`);
      }
    });
    
    fidObserver.observe({ type: 'first-input', buffered: true });
  }
} 