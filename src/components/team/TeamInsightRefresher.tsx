'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TeamInsightRefresher() {
  const router = useRouter();

  useEffect(() => {
    // Function to check for updates
    const checkForUpdates = async () => {
      try {
        const response = await fetch('/api/team/settings');
        if (!response.ok) {
          console.error('Failed to fetch team settings');
          return;
        }
        // Don't need to do anything with the response
        // Just trigger a refresh of the page data
        router.refresh();
      } catch (error) {
        console.error('Error checking for team settings updates:', error);
      }
    };

    // Initially check once
    checkForUpdates();
    
    // Then set up periodic checks (every 30 seconds)
    const interval = setInterval(checkForUpdates, 30000);
    
    // Cleanup
    return () => clearInterval(interval);
  }, [router]);

  // This component doesn't render anything
  return null;
} 