import DOMPurify, { Config } from 'isomorphic-dompurify';

// Configuration for DOMPurify
const defaultConfig: Config = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
  ALLOW_DATA_ATTR: false,
  ADD_ATTR: ['target'],
  FORBID_TAGS: ['style', 'script', 'iframe', 'form', 'input', 'button'],
  FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick'],
};

// Sanitize HTML content
export const sanitizeHtml = (dirty: string, config: Config = {}): string => {
  const mergedConfig = { ...defaultConfig, ...config };
  return DOMPurify.sanitize(dirty, mergedConfig).toString();
};

// Sanitize plain text (strips all HTML)
export const sanitizeText = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] }).toString();
};

// Sanitize URL
export const sanitizeUrl = (url: string): string => {
  const sanitized = DOMPurify.sanitize(url, {
    ALLOWED_TAGS: [],
  }).toString();
  
  // Additional URL validation
  try {
    const parsed = new URL(sanitized);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '#';
    }
    return parsed.toString();
  } catch {
    return '#';
  }
};

// Sanitize JSON
export const sanitizeJson = (json: string): string => {
  try {
    const parsed = JSON.parse(json);
    const sanitized = JSON.stringify(parsed, (key, value) => {
      if (typeof value === 'string') {
        return sanitizeText(value);
      }
      return value;
    });
    return sanitized;
  } catch {
    return '{}';
  }
};

// Sanitize form input
export const sanitizeInput = (input: string): string => {
  return sanitizeText(input).trim();
}; 