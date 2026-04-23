import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withPerformanceMonitoring } from '@/lib/performance';
import { validateQuery } from '@/lib/validation';
import { withRateLimit } from '@/lib/rate-limit';
import { progressiveLoad } from '@/lib/progressive-loading';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { executeQuery } from '@/lib/db-utils';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { ApiError, corsHeaders } from '@/lib/api-response';

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

/**
 * Dashboard data API with progressive loading and optimizations
 * Returns dashboard data with prioritized loading
 */

// Schema for dashboard query parameters
const dashboardQuerySchema = z.object({
  timeRange: z.enum(['day', 'week', 'month', 'year']).default('week'),
  includeAnalytics: z.enum(['true', 'false']).transform(val => val === 'true').default('true'),
  includeRecommendations: z.enum(['true', 'false']).transform(val => val === 'true').default('false'),
});

// Create base handler with raw functionality
async function baseDashboardHandler(req: NextRequest): Promise<NextResponse> {
  try {
    // Get and validate the current user
    const user = await currentUser();
    if (!user) {
      return ApiError.Unauthorized();
    }
    
    // Validate query parameters
    const query = validateQuery(req, dashboardQuerySchema);
    
    // Determine if user has access to enhanced analytics
    const hasEnhancedAnalytics = await isFeatureEnabled('enhanced-analytics', user.id);
    
    // Use progressive loading for improved UX
    const response = await progressiveLoad(req, {
      // Initial fast data that loads immediately
      initialData: {
        dashboardType: hasEnhancedAnalytics ? 'enhanced' : 'standard',
        timeRange: query.timeRange,
        user: {
          id: user.id,
          name: user.firstName ? `${user.firstName} ${user.lastName}` : null,
        },
        lastUpdated: new Date().toISOString(),
      },
      
      // Additional data that loads in the background with priority
      loaders: [
        // Summary data (high priority)
        {
          priority: 1,
          key: 'summary',
          loader: async () => {
            return executeQuery(
              async () => {
                // Simulate fetching summary data
                await new Promise(resolve => setTimeout(resolve, 300));
                return {
                  totalItems: 1250,
                  completedItems: 750,
                  progress: 60,
                  activeProjects: 8,
                };
              },
              'Failed to load summary data'
            );
          }
        },
        
        // Recent activity (medium priority)
        {
          priority: 2,
          key: 'recentActivity',
          loader: async () => {
            return executeQuery(
              async () => {
                // Simulate fetching activity data
                await new Promise(resolve => setTimeout(resolve, 500));
                return {
                  activities: [
                    {
                      id: '1',
                      type: 'created',
                      item: 'Project Alpha',
                      timestamp: new Date(Date.now() - 3600000).toISOString(),
                    },
                    {
                      id: '2',
                      type: 'updated',
                      item: 'Task #123',
                      timestamp: new Date(Date.now() - 7200000).toISOString(),
                    }
                  ]
                };
              },
              'Failed to load recent activity'
            );
          }
        },
        
        // Analytics (lower priority, only if requested)
        ...(query.includeAnalytics ? [{
          priority: 3,
          key: 'analytics',
          loader: async () => {
            return executeQuery(
              async () => {
                // Simulate complex analytics query
                await new Promise(resolve => setTimeout(resolve, 1000));
                return {
                  performanceMetrics: {
                    weeklyProgress: [10, 25, 45, 60, 75, 85, 100],
                    completionRate: 0.75,
                    avgTimeToComplete: '3.2 days',
                  },
                  trends: {
                    direction: 'up',
                    percentage: 12.5,
                  }
                };
              },
              'Failed to load analytics data'
            );
          }
        }] : []),
        
        // Recommendations (lowest priority, only if requested)
        ...(query.includeRecommendations ? [{
          priority: 4,
          key: 'recommendations',
          loader: async () => {
            return executeQuery(
              async () => {
                // Simulate complex recommendations engine
                await new Promise(resolve => setTimeout(resolve, 1500));
                return {
                  suggestions: [
                    {
                      id: '1',
                      type: 'task',
                      title: 'Complete onboarding documentation',
                      priority: 'high',
                    },
                    {
                      id: '2',
                      type: 'project',
                      title: 'Consider archiving inactive projects',
                      priority: 'medium',
                    }
                  ]
                };
              },
              'Failed to load recommendations'
            );
          }
        }] : []),
      ],
      
      // Use streaming if client supports it
      stream: true,
    });
    
    // Convert Response to NextResponse
    return NextResponse.json(await response.json(), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    if (error instanceof Response) {
      return NextResponse.json(
        { error: 'Error processing request' },
        { status: error.status }
      );
    }
    return ApiError.InternalError(error instanceof Error ? error.message : 'Unknown error');
  }
}

// Add performance monitoring to the handler
const monitoredHandler = withPerformanceMonitoring(baseDashboardHandler);

// Add rate limiting to the handler
export const GET = withRateLimit(
  (req: NextRequest) => monitoredHandler(req) as Promise<NextResponse>, 
  { limit: 30, windowInSeconds: 60 }
);

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
} 