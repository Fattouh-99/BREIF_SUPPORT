// Google Analytics event tracking
export type EventProps = {
  action: string;
  category: string;
  label?: string;
  value?: number;
};

/**
 * Track a custom event in Google Analytics
 */
export const trackEvent = ({ action, category, label, value }: EventProps): void => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

/**
 * Track a page view in Google Analytics
 */
export const trackPageView = (url: string): void => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '', {
    page_path: url,
  });
};

/**
 * Track user conversion
 */
export const trackConversion = (conversionId: string): void => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', 'conversion', {
    send_to: `${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}/${conversionId}`,
  });
};

/**
 * Track outbound link click
 */
export const trackOutboundLink = (url: string): void => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', 'click', {
    event_category: 'outbound',
    event_label: url,
    transport_type: 'beacon',
  });
};

/**
 * Set user properties in Google Analytics
 */
export const setUserProperties = (properties: Record<string, string | boolean | number>): void => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('set', 'user_properties', properties);
}; 