'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useSafeSearchParams } from '@/lib/search-params-provider';

export default function SessionExpiredHandler() {
  const searchParams = useSafeSearchParams();
  const [showMessage, setShowMessage] = useState(false);
  const error = searchParams?.get('error');

  useEffect(() => {
    // Show alert if we have a session_expired error parameter
    if (error === 'session_expired') {
      setShowMessage(true);
      
      // Hide message after 10 seconds
      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (!showMessage) {
    return null;
  }

  return (
    <Alert className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Your session has expired</AlertTitle>
      <AlertDescription>
        Your previous session expired due to inactivity. Please sign in again to continue.
      </AlertDescription>
    </Alert>
  );
} 