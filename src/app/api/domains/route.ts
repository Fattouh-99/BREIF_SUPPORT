import { ApiError, successResponse } from '@/lib/api-response';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return ApiError.Unauthorized();
    }
    
    // Find the DB user and their team
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { 
        id: true,
        teamId: true,
        role: true,
        team: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    if (!dbUser) {
      return ApiError.NotFound('User not found');
    }
    
    // The domains query will depend on whether the user is in a team
    let domainQuery = {};
    
    if (dbUser.teamId) {
      // If user is in a team, get all team domains + their personal domains
      domainQuery = {
        where: {
          OR: [
            { userId: dbUser.id },
            { teamId: dbUser.teamId }
          ]
        }
      };
    } else {
      // If not in a team, only get personal domains
      domainQuery = {
        where: { userId: dbUser.id }
      };
    }
    
    // Fetch the domains
    const domains = await prisma.domain.findMany({
      ...domainQuery,
      select: {
        id: true,
        name: true,
        icon: true,
        userId: true,
        teamId: true,
        permissions: true,
        customer: {
          select: {
            id: true,
            email: true,
            chatRoom: {
              select: {
                id: true, 
                live: true,
                createdAt: true
              }
            }
          }
        }
      }
    });
    
    // Remove duplicate domains (if any exist with the same ID)
    const uniqueDomains = Array.from(
      new Map(domains.map(domain => [domain.id, domain])).values()
    );
    
    console.log(`Found ${domains.length} domains (${uniqueDomains.length} unique) for user ${dbUser.id}`);
    
    return successResponse({ 
      success: true, 
      domains: uniqueDomains,
      team: dbUser.team,
      isTeamOwner: dbUser.role === 'OWNER'
    });
  } catch (error) {
    console.error('Error fetching domains:', error);
    return ApiError.InternalError('Error fetching domains');
  }
} 