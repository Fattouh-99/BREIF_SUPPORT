import { useCallback, useEffect, useState } from 'react';

/**
 * Hook for handling CSRF tokens in client-side code
 */
export function useCSRF() {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch a CSRF token when the component mounts
  useEffect(() => {
    const fetchCSRFToken = async () => {
      try {
        const response = await fetch('/api/csrf', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setToken(data.token);
        } else {
          console.error('Failed to fetch CSRF token');
        }
      } catch (error) {
        console.error('Error fetching CSRF token:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCSRFToken();
  }, []);

  // Get headers to include in fetch requests
  const getCSRFHeader = useCallback((): Record<string, string> => {
    return token ? { 'X-CSRF-Token': token } : {};
  }, [token]);

  // Get input attributes for a hidden form field
  const getCSRFInputProps = useCallback(() => {
    return {
      type: 'hidden',
      name: '_csrf',
      value: token || '',
    };
  }, [token]);

  // Add CSRF token to FormData
  const addCSRFToFormData = useCallback((formData: FormData) => {
    if (token) {
      formData.append('_csrf', token);
    }
    return formData;
  }, [token]);

  return {
    token,
    isLoading,
    getCSRFHeader,
    getCSRFInputProps,
    addCSRFToFormData,
  };
} 