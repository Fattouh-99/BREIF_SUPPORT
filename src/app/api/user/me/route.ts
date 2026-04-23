import { currentUser } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'
import { successResponse, cachedSuccessResponse, ApiError, corsHeaders } from '@/lib/api-response'
import { executeQuery, findUserByClerkId } from '@/lib/db-utils'
import { rateLimit } from '@/lib/rate-limit'

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

/**
 * Consolidated User API Endpoint
 * 
 * This endpoint replaces multiple previous endpoints:
 * - /api/user - Basic user info (id only)
 * - /api/user/current - User info with team data
 * 
 * Query parameters:
 * - includeTeam=true - Include team information
 * - includeDashboard=true - Include dashboard preferences
 * 
 * Example: /api/user/me?includeTeam=true&includeDashboard=true
 */

export async function OPTIONS() {
  return successResponse({}, 200)
}

export async function GET(request: NextRequest) {
  // Apply rate limiting (20 requests per minute)
  const rateLimitResponse = rateLimit(request, { limit: 20 });
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    // Get the URL to parse query parameters
    const { searchParams } = new URL(request.url)
    const includeTeam = searchParams.get('includeTeam') === 'true'
    const includeDashboard = searchParams.get('includeDashboard') === 'true'
    
    const user = await currentUser()
    if (!user) {
      return ApiError.Unauthorized()
    }

    try {
      // Get user details with appropriate caching based on fields requested
      const userData = await executeQuery(
        async () => {
          return await findUserByClerkId(user.id, {
            id: true,
            fullname: true,
            email: true,
            teamId: true,
            role: true,
            ...(includeTeam && {
              team: {
                select: {
                  id: true,
                  name: true
                }
              }
            }),
            ...(includeDashboard && {
              dashboard: true
            })
          });
        },
        'Error fetching user data',
        10000 // 10 second timeout
      );

      // Use different cache times based on what's being requested
      // Dashboard preferences change more frequently than basic user data
      const cacheType = includeDashboard ? 'short' : 'medium';
      
      return cachedSuccessResponse(userData, cacheType);
    } catch (dbError: any) {
      console.error('Database error:', dbError);
      
      if (dbError.status === 404) {
        return ApiError.NotFound('User not found');
      }
      
      return ApiError.ServiceUnavailable('Database operation failed');
    }
  } catch (error: any) {
    console.error('Error getting user data:', error)
    return ApiError.InternalError(error?.message || 'Unknown error')
  }
} 