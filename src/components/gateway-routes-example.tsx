'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { fetchGatewayRoutes } from '@/lib/fetcher';

interface Route {
  id: string;
  path: string;
  description: string;
}

interface RoutesResponse {
  status: string;
  routes: Route[];
}

export function GatewayRoutesExample() {
  const { getAuthToken } = useAuth();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoading(true);
        // Get the Clerk auth token
        const token = await getAuthToken();
        
        if (!token) {
          setError('Authentication required');
          return;
        }
        
        // Fetch routes with auth token
        const response = await fetchGatewayRoutes<RoutesResponse>(token);
        setRoutes(response.routes);
      } catch (err) {
        console.error('Error fetching routes:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch routes');
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, [getAuthToken]);

  if (loading) {
    return <div>Loading routes...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Available Gateway Routes</h2>
      {routes.length === 0 ? (
        <p>No routes found</p>
      ) : (
        <ul className="space-y-2">
          {routes.map((route) => (
            <li key={route.id} className="p-2 bg-gray-50 rounded">
              <div className="font-medium">{route.path}</div>
              <div className="text-sm text-gray-500">{route.description}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 