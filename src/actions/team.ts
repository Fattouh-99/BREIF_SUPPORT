'use server'

import { currentUser } from '@clerk/nextjs/server'
import { client } from '@/lib/prisma'
import { startOfMonth } from 'date-fns'
import { Prisma } from '@prisma/client'

/**
 * Checks if the current user is a team leader
 * @returns Boolean indicating if user is a team leader
 */
export async function isTeamLeader() {
  const user = await currentUser()
  if (!user) return false
  
  const dbUser = await client.user.findUnique({
    where: { clerkId: user.id },
    select: { role: true }
  })
  
  // Check if the user has the OWNER role (which is the team leader)
  return dbUser?.role === 'OWNER'
}

/**
 * Gets the current user's team information
 * @returns Team data with members information
 */
export async function getUserTeam() {
  const user = await currentUser()
  if (!user) return null
  
  const dbUser = await client.user.findUnique({
    where: { clerkId: user.id },
    select: { 
      id: true,
      teamId: true
    }
  })
  
  if (!dbUser?.teamId) return null
  
  // Get the team data with its owner
  const team = await client.team.findUnique({
    where: { id: dbUser.teamId },
    include: {
      owner: {
        select: {
          id: true,
          fullname: true
        }
      }
    }
  })
  
  // Get team members separately
  const teamMembers = await client.user.findMany({
    where: { teamId: dbUser.teamId },
    select: {
      id: true,
      fullname: true,
      email: true,
      role: true,
      clerkId: true
    }
  })
  
  // Combine the data
  return {
    ...team,
    members: teamMembers,
    leader: team?.owner // Use owner as leader
  }
}

/**
 * Gets team performance metrics for the current month
 * @param teamId - Team ID to fetch metrics for
 * @returns Performance metrics for the team
 */
export async function getTeamMetrics(teamId: string) {
  const firstDayOfMonth = startOfMonth(new Date())
  
  // Let's default everything to 0 for new accounts
  const defaultMetrics = {
    clients: {
      total: 0,
      monthly: 0
    },
    tickets: {
      total: 0,
      resolved: 0,
      pending: 0
    },
    chats: {
      total: 0,
      monthly: 0
    }
  }
  
  try {
    // Use raw queries to avoid Prisma schema issues
    // First get domain IDs for this team
    const teamDomainsResults = await client.$queryRaw<{id: string}[]>`
      SELECT id FROM "Domain" WHERE "teamId" = ${teamId}::uuid
    `
    
    // If no domains, return zeros
    if (!teamDomainsResults || teamDomainsResults.length === 0) {
      return defaultMetrics
    }
    
    // Extract domain IDs
    const domainIds = teamDomainsResults.map(d => d.id)
    const domainIdsFormatted = domainIds.map(id => `'${id}'`).join(',')
    
    // Get all counts in a single query to reduce database calls
    const [
      monthlyClientsResults,
      totalClientsResults,
      monthlyChatRoomsResults,
      totalChatRoomsResults
    ] = await Promise.all([
      // Monthly clients
      client.$queryRaw<{count: string}[]>`
        SELECT COUNT(*)::text as count 
        FROM "Customer" 
        WHERE "domainId" IN (${Prisma.raw(domainIdsFormatted)})
        AND "createdAt" >= ${firstDayOfMonth}
      `,
      
      // Total clients
      client.$queryRaw<{count: string}[]>`
        SELECT COUNT(*)::text as count 
        FROM "Customer" 
        WHERE "domainId" IN (${Prisma.raw(domainIdsFormatted)})
      `,
      
      // Monthly chats
      client.$queryRaw<{count: string}[]>`
        SELECT COUNT(*)::text as count 
        FROM "ChatRoom" 
        WHERE "createdAt" >= ${firstDayOfMonth}
      `,
      
      // Total chats
      client.$queryRaw<{count: string}[]>`
        SELECT COUNT(*)::text as count 
        FROM "ChatRoom" 
      `
    ])
    
    // Extract counts from query results
    const monthlyClients = parseInt(monthlyClientsResults[0]?.count || '0', 10)
    const totalClients = parseInt(totalClientsResults[0]?.count || '0', 10)
    const monthlyChatRooms = parseInt(monthlyChatRoomsResults[0]?.count || '0', 10)
    const totalChatRooms = parseInt(totalChatRoomsResults[0]?.count || '0', 10)
    
    // Return metrics with actual counts
    return {
      clients: {
        total: totalClients,
        monthly: monthlyClients
      },
      tickets: {
        total: 0,
        resolved: 0,
        pending: 0
      },
      chats: {
        total: totalChatRooms,
        monthly: monthlyChatRooms
      }
    }
  } catch (error) {
    console.error('Error getting team metrics:', error)
    // On error, return zeros rather than showing incorrect data
    return defaultMetrics
  }
}

/**
 * Get individual team member performance metrics
 * @param teamId - Team ID
 * @returns Array of team member performance data
 */
export async function getTeamMemberPerformance(teamId: string) {
  const firstDayOfMonth = startOfMonth(new Date())
  
  try {
    // Get team members
    const teamMembers = await client.user.findMany({
      where: { teamId },
      select: {
        id: true,
        fullname: true,
        role: true
      }
    })
    
    // Empty or no team members, return empty array
    if (!teamMembers.length) return []
    
    // Get domains owned by this team
    const teamDomainsResults = await client.$queryRaw<{id: string}[]>`
      SELECT id FROM "Domain" WHERE "teamId" = ${teamId}::uuid
    `
    
    // Return empty performance data if no domains
    if (!teamDomainsResults || teamDomainsResults.length === 0) {
      return teamMembers.map(member => ({
        member,
        stats: {
          clients: 0,
          chats: 0,
          tickets: 0,
          performanceScore: 0
        }
      }));
    }
    
    // Extract domain IDs and format them for SQL query
    const domainIds = teamDomainsResults.map(d => d.id)
    const domainIdsFormatted = domainIds.map(id => `'${id}'`).join(',')
    
    // Get performance data for each team member
    const memberPerformance = await Promise.all(
      teamMembers.map(async (member) => {
        let clients = 0;
        let chatAssignments = 0;
        
        try {
          // Count actual client acquisitions
          const clientsQuery = await client.$queryRaw<{count: string}[]>`
            SELECT COUNT(*)::text as count 
            FROM "Customer" 
            WHERE "domainId" IN (${Prisma.raw(domainIdsFormatted)})
            AND "createdAt" >= ${firstDayOfMonth}
          `
          clients = parseInt(clientsQuery[0]?.count || '0', 10)
          
          // Get chat assignments count
          const chatsQuery = await client.$queryRaw<{count: string}[]>`
            SELECT COUNT(*)::text as count 
            FROM "ChatRoom" 
            WHERE "assignedToId" = ${member.id}::uuid
            AND "assignedAt" >= ${firstDayOfMonth}
          `
          chatAssignments = parseInt(chatsQuery[0]?.count || '0', 10)
        } catch (error) {
          console.error(`Error getting stats for member ${member.id}:`, error);
          // Keep defaults at 0 on error
        }
        
        // Default tickets to 0 for new accounts
        const tickets = 0
        
        return {
          member,
          stats: {
            clients,
            chats: chatAssignments,
            tickets,
            // Performance score based on actual activity
            performanceScore: (clients * 5) + (chatAssignments * 0.5) + (tickets * 2)
          }
        }
      })
    )
    
    // Sort by performance score (highest first)
    return memberPerformance.sort((a, b) => b.stats.performanceScore - a.stats.performanceScore)
  } catch (error) {
    console.error('Error in getTeamMemberPerformance:', error);
    return []; // Return empty array on error
  }
}

export type TeamActivity = {
  id: string;
  type: string;
  userId: string;
  userName: string;
  createdAt: Date;
  details?: string; // Optional property for ticket details
};

/**
 * Get recent team activity
 * @param teamId - Team ID
 * @param limit - Maximum number of activities to return
 * @returns Array of recent team activities
 */
export async function getTeamActivity(teamId: string, limit = 10): Promise<TeamActivity[]> {
  try {
    // Get team members (we need their IDs)
    const teamMembers = await client.user.findMany({
      where: { teamId },
      select: {
        id: true,
        fullname: true,
        clerkId: true
      }
    });
    
    if (!teamMembers.length) return [];
    
    // Get member IDs
    const memberIds = teamMembers.map(member => member.id);
    
    // Get real activity data - find chat rooms shared by team members
    const chatRoomActivity = await client.$queryRaw<Array<{
      id: string;
      type: string;
      userId: string;
      userName: string;
      createdAt: Date;
    }>>`
      SELECT 
        cr.id as id, 
        'conversation' as type,
        u.id as "userId",
        u.fullname as "userName",
        cr."createdAt" as "createdAt"
      FROM "ChatRoom" cr
      JOIN "User" u ON cr."sharedById" = u.id
      WHERE u.id = ANY(${memberIds}::uuid[])
      ORDER BY cr."createdAt" DESC
      LIMIT ${limit / 2}
    `;
    
    // Get booking/appointment activity by team members
    const bookingActivity = await client.$queryRaw<Array<{
      id: string;
      type: string;
      userId: string;
      userName: string;
      createdAt: Date;
      appointmentType: string;
    }>>`
      SELECT 
        b.id as id, 
        'ticket' as type,
        u.id as "userId",
        u.fullname as "userName",
        b."createdAt" as "createdAt",
        b."appointmentType" as "appointmentType"
      FROM "Bookings" b
      JOIN "Domain" d ON b."domainId" = d.id
      JOIN "User" u ON d."userId" = u.id
      WHERE u.id = ANY(${memberIds}::uuid[])
      ORDER BY b."createdAt" DESC
      LIMIT ${limit / 2}
    `;
    
    // Combine activities with a consistent shape
    const allActivities: TeamActivity[] = [
      ...chatRoomActivity.map(activity => ({
        id: activity.id,
        type: activity.type,
        userId: activity.userId,
        userName: activity.userName || 'Team Member',
        createdAt: activity.createdAt,
        details: undefined // No details for chats
      })),
      ...bookingActivity.map(activity => ({
        id: activity.id,
        type: activity.type,
        userId: activity.userId,
        userName: activity.userName || 'Team Member',
        createdAt: activity.createdAt,
        details: activity.appointmentType // Use appointmentType as details
      }))
    ];
    
    // If no real activity, return an empty array
    if (allActivities.length === 0) {
      return [];
    }
    
    // Sort by most recent and limit
    return allActivities
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching team activity:', error);
    // Return empty array if there's an error
    return [];
  }
}

/**
 * Gets team goals and progress
 * @param teamId - Team ID
 * @returns Team goals with current progress
 */
export async function getTeamGoals(teamId: string) {
  // Get team metrics to calculate progress
  const metrics = await getTeamMetrics(teamId)
  
  // Get team size (used as fallback for calculating defaults)
  const teamSize = await client.user.count({
    where: { teamId }
  })
  
  // Calculate default targets based on team size as fallback
  const targetClientsPerMember = 2
  const targetChatsPerMember = 5
  const targetTicketsPerMember = 3
  
  // Set minimum targets to ensure goals are meaningful even for small teams
  const minClientsTarget = 5
  const minChatsTarget = 10
  const minTicketsTarget = 8
  
  // Calculate fallback targets based on team size
  const defaultClientsTarget = Math.max(minClientsTarget, Math.max(1, teamSize) * targetClientsPerMember)
  const defaultInteractionsTarget = Math.max(minChatsTarget, Math.max(1, teamSize) * targetChatsPerMember)
  const defaultTicketsTarget = Math.max(minTicketsTarget, Math.max(1, teamSize) * targetTicketsPerMember)
  
  // Get saved goal settings from database
  let customTargets = {
    clientsTarget: defaultClientsTarget,
    interactionsTarget: defaultInteractionsTarget,
    ticketsTarget: defaultTicketsTarget
  }
  
  try {
    // Try to fetch team settings with custom goals
    const teamSettingsResults = await client.$queryRaw<Array<{
      id: string;
      teamId: string;
      goalSettings?: string;
    }>>`
      SELECT "id", "teamId", "goalSettings" 
      FROM "TeamSettings"
      WHERE "teamId" = ${teamId}::uuid
      LIMIT 1
    `;

    const teamSettings = teamSettingsResults[0];
    
    // Parse stored goal settings if they exist
    if (teamSettings?.goalSettings) {
      try {
        const savedGoals = JSON.parse(teamSettings.goalSettings);
        // Use saved goals if they exist, otherwise use defaults
        customTargets = {
          clientsTarget: savedGoals.clientsTarget || defaultClientsTarget,
          interactionsTarget: savedGoals.interactionsTarget || defaultInteractionsTarget,
          ticketsTarget: savedGoals.ticketsTarget || defaultTicketsTarget
        };
      } catch (e) {
        console.error('Error parsing saved goal settings:', e);
        // Use defaults if parsing fails
      }
    }
  } catch (error) {
    console.error('Error fetching team settings:', error);
    // Use defaults if query fails
  }
  
  // Create goals object with either saved or default targets
  const goals = {
    newClients: {
      current: metrics.clients.monthly,
      target: customTargets.clientsTarget
    },
    interactions: {
      current: metrics.chats.monthly,
      target: customTargets.interactionsTarget
    },
    tickets: {
      current: metrics.tickets.total,
      target: customTargets.ticketsTarget
    }
  }
  
  return goals
}

/**
 * Get individual team member insights
 * @param userId - User ID to get insights for
 * @returns Insights for this specific team member
 */
export async function getTeamMemberInsights(userId: string) {
  // Get user with team info
  const user = await client.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullname: true,
      teamId: true
    }
  })
  
  if (!user?.teamId) return null
  
  // Get team info
  const team = await client.team.findUnique({
    where: { id: user.teamId },
    include: {
      owner: {
        select: {
          fullname: true
        }
      }
    }
  })
  
  // Get team members
  const teamMembers = await client.user.findMany({
    where: { teamId: user.teamId },
    select: {
      id: true,
      fullname: true
    }
  })
  
  // Get team metrics
  const teamMetrics = await getTeamMetrics(user.teamId)
  
  // Get team goals
  const teamGoals = await getTeamGoals(user.teamId)
  
  // Get member performance
  const memberPerformance = await getTeamMemberPerformance(user.teamId)
  
  // Get this member's performance
  const memberData = memberPerformance.find(m => m.member.id === userId)
  
  // Calculate member's rank
  const memberRank = memberPerformance.findIndex(m => m.member.id === userId) + 1
  
  // Get top performer
  const topPerformer = memberPerformance[0]
  
  // Calculate member's contribution percentage - use accurate data
  const teamTotalClients = teamMetrics.clients.monthly || 1 // Avoid division by zero
  const memberClients = memberData?.stats.clients || 0
  const contribution = teamTotalClients > 0 
    ? Math.round((memberClients / teamTotalClients) * 100)
    : 0
  
  // Try to fetch team settings which contains recognition data
  let recognition = null;
  let announcement = null;
  
  try {
    // Use raw query instead of client.teamSettings to avoid type errors
    const teamSettingsResults = await client.$queryRaw<Array<{
      id: string;
      teamId: string;
      recognitionMessage?: string;
    }>>`
      SELECT "id", "teamId", "recognitionMessage" 
      FROM "TeamSettings"
      WHERE "teamId" = ${user.teamId}::uuid
      LIMIT 1
    `;
    
    // Fetch team announcement separately
    const teamAnnouncementResults = await client.$queryRaw<Array<{
      id: string;
      teamId: string;
      message?: string;
      createdBy?: string;
    }>>`
      SELECT "id", "teamId", "message", "createdBy" 
      FROM "TeamAnnouncement"
      WHERE "teamId" = ${user.teamId}::uuid
      LIMIT 1
    `;
    
    const teamSettings = teamSettingsResults[0];
    const teamAnnouncement = teamAnnouncementResults[0];
    
    if (teamSettings) {
      // Parse recognition message if it exists
      if (teamSettings.recognitionMessage) {
        try {
          recognition = JSON.parse(teamSettings.recognitionMessage);
        } catch (e) {
          console.error('Error parsing recognition message:', e);
        }
      }
    }
    
    // Get announcement from TeamAnnouncement if it exists
    if (teamAnnouncement && teamAnnouncement.message) {
      announcement = {
        message: teamAnnouncement.message,
        createdBy: teamAnnouncement.createdBy,
        createdAt: new Date()
      };
    }
  } catch (error) {
    console.error('Error fetching team settings:', error);
    // Silently fail - this is just for display purposes
  }
  
  // Create a realistic recent win based on actual data
  let recentWin = {
    title: memberData && memberData.stats.clients > 0 
      ? `Acquired ${memberData.stats.clients} new client${memberData.stats.clients > 1 ? 's' : ''} this month`
      : memberData && memberData.stats.chats > 0
        ? `Handled ${memberData.stats.chats} chat${memberData.stats.chats > 1 ? 's' : ''} this month`
        : `Joined ${team?.name || 'the team'}`,
    date: new Date()
  }
  
  // Create team insights with accurate data
  return {
    teamName: team?.name || 'Your Team',
    teamLeader: team?.owner?.fullname || 'Team Leader',
    memberCount: teamMembers.length,
    teamGoal: {
      current: teamGoals.newClients.current || 0,
      target: teamGoals.newClients.target || 5,
      percentage: teamGoals.newClients.target > 0 
        ? Math.min(100, Math.round((teamGoals.newClients.current / teamGoals.newClients.target) * 100)) 
        : 0
    },
    yourContribution: {
      percentage: contribution,
      description: `${memberClients} of ${teamTotalClients} new clients`
    },
    yourRank: memberRank,
    topPerformer: {
      name: topPerformer?.member.fullname || 'No top performer yet',
      metric: topPerformer?.stats.clients 
        ? `${topPerformer.stats.clients} new client${topPerformer.stats.clients > 1 ? 's' : ''}`
        : topPerformer?.stats.chats > 0
          ? `${topPerformer.stats.chats} chat${topPerformer.stats.chats > 1 ? 's' : ''}`
          : 'No metrics yet'
    },
    recentWin,
    announcement,
    recognition
  }
}

/**
 * Get all team members for the current user's team
 * @returns Team members data including the team info
 */
export async function onGetTeamMembers() {
  try {
    const user = await currentUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }
    
    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { 
        id: true, 
        teamId: true,
        role: true,
        email: true,
        fullname: true
      }
    })
    
    // If user doesn't have a team yet
    if (!dbUser?.teamId) {
      return {
        success: true,
        message: 'You are not part of a team yet',
        members: [],
        team: null,
        currentUser: {
          id: dbUser?.id,
          role: dbUser?.role,
          email: dbUser?.email
        }
      }
    }
    
    // Get the team with owner info
    const team = await client.team.findUnique({
      where: { id: dbUser.teamId },
      include: {
        owner: {
          select: {
            id: true,
            fullname: true,
            email: true
          }
        },
        domains: true,
        settings: true
      }
    })
    
    // Get all team members
    const members = await client.user.findMany({
      where: { teamId: dbUser.teamId },
      select: {
        id: true,
        fullname: true,
        email: true,
        role: true,
        clerkId: true
      }
    })
    
    const formattedMembers = members.map(member => ({
      id: member.id,
      fullname: member.fullname,
      email: member.email,
      role: member.role,
      type: member.id === team?.ownerId ? 'Owner' : 'Member',
      image: null // No image handling for now
    }))
    
    return {
      success: true,
      members: formattedMembers,
      team,
      currentUser: {
        id: dbUser.id,
        role: dbUser.role,
        email: dbUser.email
      }
    }
  } catch (error) {
    console.error('Error fetching team members:', error)
    return {
      success: false,
      error: 'Failed to fetch team members'
    }
  }
}

/**
 * Get all pending team invitations for the current user
 * @returns Pending invitations data
 */
export async function onGetPendingInvitations() {
  try {
    const user = await currentUser()
    if (!user) {
      console.log('User not authenticated when trying to get invitations');
      return { success: false, error: 'User not authenticated' }
    }
    
    // Log auth info for debugging
    console.log('User authenticated:', { id: user.id, email: user.emailAddresses?.[0]?.emailAddress });
    
    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true, email: true, fullname: true }
    })
    
    if (!dbUser) {
      console.log('User not found in database:', user.id);
      return { success: false, error: 'User not found in database' }
    }
    
    // Log database user for debugging
    console.log('Database user found:', { id: dbUser.id, email: dbUser.email });
    
    // Get invitations sent by this user
    const sentInvitations = await client.teamInvitation.findMany({
      where: { senderId: dbUser.id },
      include: {
        sender: {
          select: { fullname: true, email: true }
        },
        receiver: {
          select: { fullname: true, email: true }
        }
      }
    })
    
    // Get ALL invitations with status PENDING for debugging purposes
    const allPendingInvitations = await client.teamInvitation.findMany({
      where: { status: 'PENDING' },
      include: {
        sender: {
          select: { id: true, fullname: true, email: true }
        },
        receiver: {
          select: { id: true, fullname: true, email: true }
        }
      }
    })
    
    console.log('All pending invitations in the system:', allPendingInvitations.length);
    
    // Get invitations received by this user's email - more broadly
    const receivedInvitations = await client.teamInvitation.findMany({
      where: { 
        OR: [
          { email: dbUser.email },
          { receiverId: dbUser.id },
          // Also try with lowercase email for better matching
          { email: dbUser.email?.toLowerCase() }
        ],
      },
      include: {
        sender: {
          select: { id: true, fullname: true, email: true }
        },
        receiver: {
          select: { id: true, fullname: true, email: true }
        }
      }
    })
    
    console.log('Sent invitations:', sentInvitations.length);
    console.log('Received invitations:', receivedInvitations.length);
    
    return {
      success: true,
      sentInvitations,
      receivedInvitations,
      // Also return user info for verification
      currentUser: {
        id: dbUser.id,
        email: dbUser.email,
        fullname: dbUser.fullname
      },
      allPendingCount: allPendingInvitations.length
    }
  } catch (error) {
    console.error('Error fetching invitations:', error)
    return {
      success: false,
      error: `Failed to fetch invitations: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Check if an email exists in the system and if they have a pending invitation
 * @param email Email to check
 * @returns Status of the email check
 */
export async function onCheckEmailExists(email: string) {
  try {
    if (!email) {
      return { success: false, error: 'Email is required' }
    }
    
    // Find user with this email
    const user = await client.user.findUnique({
      where: { email },
      select: { 
        id: true, 
        fullname: true, 
        role: true,
        teamId: true
      }
    })
    
    // Check for pending invitations to this email
    const pendingInvitation = await client.teamInvitation.findFirst({
      where: { 
        email,
        status: 'PENDING'
      }
    })
    
    return {
      success: true,
      exists: !!user,
      hasPendingInvite: !!pendingInvitation,
      userDetails: user ? {
        fullname: user.fullname,
        role: user.role,
        email
      } : null,
      alreadyInTeam: !!user?.teamId
    }
  } catch (error) {
    console.error('Error checking email:', error)
    return {
      success: false,
      error: 'Failed to check email'
    }
  }
}

/**
 * Invite a user to join the team
 * @param email Email of the user to invite
 * @param role Role to assign to the invited user
 * @returns Status of the invitation
 */
export async function onInviteTeamMember(email: string, role: 'ADMIN' | 'MEMBER') {
  try {
    const user = await currentUser()
    if (!user) {
      return { success: false, error: 'You must be logged in to invite team members' }
    }
    
    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { 
        id: true, 
        teamId: true,
        role: true
      }
    })
    
    // Only team owners can invite members
    if (dbUser?.role !== 'OWNER') {
      return { success: false, error: 'Only team owners can invite new members' }
    }
    
    // Check if user has a team
    if (!dbUser?.teamId) {
      return { success: false, error: 'You must create a team before inviting members' }
    }
    
    // Check if the invited email exists in the system
    const targetUser = await client.user.findUnique({
      where: { email },
      select: { id: true, teamId: true }
    })
    
    // Check if user already has a pending invitation
    const existingInvitation = await client.teamInvitation.findFirst({
      where: { 
        email,
        status: 'PENDING'
      }
    })
    
    if (existingInvitation) {
      return { success: false, error: 'This user already has a pending invitation' }
    }
    
    // If user exists and already in a team
    if (targetUser?.teamId) {
      return { success: false, error: 'This user is already a member of another team' }
    }
    
    // Generate a unique token for the invitation
    const token = `${Math.random().toString(36).substring(2, 15)}-${Date.now()}`
    
    // Create the invitation
    const invitation = await client.teamInvitation.create({
      data: {
        email,
        role,
        token,
        status: 'PENDING',
        senderId: dbUser.id,
        receiverId: targetUser?.id || null,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      }
    })
    
    return {
      success: true,
      invitation
    }
  } catch (error) {
    console.error('Error inviting team member:', error)
    return {
      success: false,
      error: 'Failed to send invitation'
    }
  }
}

/**
 * Accept a team invitation
 * @param token Invitation token
 * @returns Status of the acceptance
 */
export async function onAcceptInvitation(token: string) {
  try {
    const user = await currentUser()
    if (!user) {
      return { success: false, error: 'You must be logged in to accept invitations' }
    }
    
    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { 
        id: true, 
        email: true,
        teamId: true
      }
    })
    
    if (!dbUser) {
      return { success: false, error: 'User not found in the database' }
    }
    
    // Check if user already has a team
    if (dbUser.teamId) {
      return { success: false, error: 'You are already a member of a team' }
    }
    
    // Find the invitation
    const invitation = await client.teamInvitation.findUnique({
      where: { token },
      include: {
        sender: {
          select: { 
            id: true,
            teamId: true
          }
        }
      }
    })
    
    if (!invitation) {
      return { success: false, error: 'Invitation not found' }
    }
    
    // Check if invitation has expired
    if (invitation.expiresAt < new Date()) {
      return { success: false, error: 'Invitation has expired' }
    }
    
    // Check if invitation has already been processed
    if (invitation.status !== 'PENDING') {
      return { success: false, error: `Invitation has already been ${invitation.status.toLowerCase()}` }
    }
    
    // Check if invitation is for this user
    if (invitation.email !== dbUser.email && invitation.receiverId !== dbUser.id) {
      return { success: false, error: 'This invitation is not for you' }
    }
    
    // Get the team from the sender
    const teamId = invitation.sender.teamId
    if (!teamId) {
      return { success: false, error: 'The team no longer exists' }
    }
    
    // Update the invitation status
    await client.teamInvitation.update({
      where: { id: invitation.id },
      data: {
        status: 'ACCEPTED',
        receiverId: dbUser.id
      }
    })
    
    // Add user to the team
    await client.user.update({
      where: { id: dbUser.id },
      data: {
        teamId,
        role: invitation.role
      }
    })
    
    return {
      success: true,
      message: 'You have successfully joined the team'
    }
  } catch (error) {
    console.error('Error accepting invitation:', error)
    return {
      success: false,
      error: 'Failed to accept invitation'
    }
  }
}

/**
 * Reject a team invitation
 * @param token Invitation token
 * @returns Status of the rejection
 */
export async function onRejectInvitation(token: string) {
  try {
    const user = await currentUser()
    if (!user) {
      return { success: false, error: 'You must be logged in to reject invitations' }
    }
    
    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { 
        id: true, 
        email: true
      }
    })
    
    // Find the invitation
    const invitation = await client.teamInvitation.findUnique({
      where: { token }
    })
    
    if (!invitation) {
      return { success: false, error: 'Invitation not found' }
    }
    
    // Check if invitation has already been processed
    if (invitation.status !== 'PENDING') {
      return { success: false, error: `Invitation has already been ${invitation.status.toLowerCase()}` }
    }
    
    // Check if invitation is for this user
    if (invitation.email !== dbUser?.email && invitation.receiverId !== dbUser?.id) {
      return { success: false, error: 'This invitation is not for you' }
    }
    
    // Update the invitation status
    await client.teamInvitation.update({
      where: { id: invitation.id },
      data: {
        status: 'REJECTED',
        receiverId: dbUser?.id || null
      }
    })
    
    return {
      success: true,
      message: 'Invitation rejected successfully'
    }
  } catch (error) {
    console.error('Error rejecting invitation:', error)
    return {
      success: false,
      error: 'Failed to reject invitation'
    }
  }
}

/**
 * Leave the current team
 * @returns Status of leaving the team
 */
export async function onLeaveTeam() {
  try {
    const user = await currentUser()
    if (!user) {
      return { success: false, error: 'You must be logged in to leave a team' }
    }
    
    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { 
        id: true, 
        teamId: true,
        role: true
      }
    })
    
    if (!dbUser?.teamId) {
      return { success: false, error: 'You are not a member of any team' }
    }
    
    // Check if user is the team owner
    if (dbUser.role === 'OWNER') {
      return { success: false, error: 'Team owners cannot leave their team. Transfer ownership first or delete the team.' }
    }
    
    // Remove user from the team
    await client.user.update({
      where: { id: dbUser.id },
      data: {
        teamId: null,
        role: 'MEMBER' // Reset role to MEMBER
      }
    })
    
    return {
      success: true,
      message: 'You have successfully left the team'
    }
  } catch (error) {
    console.error('Error leaving team:', error)
    return {
      success: false,
      error: 'Failed to leave team'
    }
  }
}

/**
 * Update a team member's role
 * @param memberId ID of the member to update
 * @param newRole New role to assign
 * @returns Status of the role update
 */
export async function onUpdateMemberRole(memberId: string, newRole: 'OWNER' | 'ADMIN' | 'MEMBER') {
  try {
    const user = await currentUser()
    if (!user) {
      return { success: false, error: 'You must be logged in to update member roles' }
    }
    
    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { 
        id: true, 
        teamId: true,
        role: true
      }
    })
    
    // Only team owners can update roles
    if (dbUser?.role !== 'OWNER') {
      return { success: false, error: 'Only team owners can update member roles' }
    }
    
    // Check if user is updating their own role
    if (dbUser?.id === memberId) {
      return { success: false, error: 'You cannot update your own role' }
    }
    
    // Find the member being updated
    const memberToUpdate = await client.user.findUnique({
      where: { id: memberId },
      select: { 
        id: true, 
        teamId: true,
        role: true
      }
    })
    
    // Check if member exists and is in the same team
    if (!memberToUpdate || memberToUpdate.teamId !== dbUser?.teamId) {
      return { success: false, error: 'Member not found in your team' }
    }
    
    // Update the member's role
    await client.user.update({
      where: { id: memberId },
      data: { role: newRole }
    })
    
    // If promoting to OWNER, demote current owner
    if (newRole === 'OWNER' && dbUser.teamId) {
      await client.user.update({
        where: { id: dbUser.id },
        data: { role: 'ADMIN' }
      })
      
      // Update team owner reference
      await client.team.update({
        where: { id: dbUser.teamId },
        data: { ownerId: memberId }
      })
    }
    
    return {
      success: true,
      message: `Successfully updated member's role to ${newRole}`
    }
  } catch (error) {
    console.error('Error updating member role:', error)
    return {
      success: false,
      error: 'Failed to update member role'
    }
  }
}

/**
 * Update a member's access to a domain
 * @param memberId Member ID
 * @param domainId Domain ID
 * @param hasAccess Whether the member should have access
 * @param permissions Optional permissions object
 * @returns Status of the access update
 */
export async function onUpdateDomainAccess(
  memberId: string, 
  domainId: string, 
  hasAccess: boolean,
  permissions?: {
    canModifyName: boolean;
    canModifyIcon: boolean;
    canModifyChat: boolean;
    canDelete: boolean;
  }
) {
  try {
    const user = await currentUser()
    if (!user) {
      return { success: false, error: 'You must be logged in to update domain access' }
    }
    
    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { 
        id: true, 
        teamId: true,
        role: true
      }
    })
    
    // Only team owners can update domain access
    if (dbUser?.role !== 'OWNER') {
      return { success: false, error: 'Only team owners can update domain access' }
    }
    
    // Find the domain
    const domain = await client.domain.findUnique({
      where: { id: domainId }
    })
    
    if (!domain) {
      return { success: false, error: 'Domain not found' }
    }
    
    // Check if domain belongs to this team
    if (domain.teamId !== dbUser.teamId) {
      return { success: false, error: 'This domain does not belong to your team' }
    }
    
    // Find the member
    const member = await client.user.findUnique({
      where: { id: memberId },
      select: { 
        id: true,
        teamId: true,
        role: true
      }
    })
    
    // Check if member exists and is in the same team
    if (!member || member.teamId !== dbUser.teamId) {
      return { success: false, error: 'Member not found in your team' }
    }
    
    // Update domain permissions
    if (hasAccess) {
      // Get existing permissions
      let currentPermissions: any = {}
      
      if (domain.permissions) {
        try {
          currentPermissions = typeof domain.permissions === 'string' 
            ? JSON.parse(domain.permissions) 
            : domain.permissions
        } catch (e) {
          console.error('Error parsing permissions:', e)
          currentPermissions = {}
        }
      }
      
      // Create or update the accessUsers array
      if (!currentPermissions.accessUsers) {
        currentPermissions.accessUsers = []
      }
      
      // Remove existing entry for this user if it exists
      currentPermissions.accessUsers = currentPermissions.accessUsers.filter(
        (u: any) => u.userId !== memberId
      )
      
      // Add new entry with permissions
      currentPermissions.accessUsers.push({
        userId: memberId,
        permissions: permissions || {
          canModifyName: member.role === 'OWNER' || member.role === 'ADMIN',
          canModifyIcon: member.role === 'OWNER' || member.role === 'ADMIN',
          canModifyChat: member.role === 'OWNER' || member.role === 'ADMIN',
          canDelete: member.role === 'OWNER'
        }
      })
      
      // Update the domain with new permissions
      await client.domain.update({
        where: { id: domainId },
        data: {
          userId: memberId, // Direct assignment for backward compatibility
          permissions: currentPermissions
        }
      })
    } else {
      // Remove access
      let currentPermissions: any = {}
      
      if (domain.permissions) {
        try {
          currentPermissions = typeof domain.permissions === 'string' 
            ? JSON.parse(domain.permissions) 
            : domain.permissions
        } catch (e) {
          console.error('Error parsing permissions:', e)
          currentPermissions = {}
        }
      }
      
      // Filter out this user from accessUsers
      if (currentPermissions.accessUsers) {
        currentPermissions.accessUsers = currentPermissions.accessUsers.filter(
          (u: any) => u.userId !== memberId
        )
      }
      
      // Update the domain, removing the userId if it matches
      await client.domain.update({
        where: { id: domainId },
        data: {
          userId: domain.userId === memberId ? null : domain.userId,
          permissions: currentPermissions
        }
      })
    }
    
    return {
      success: true,
      message: hasAccess ? 'Domain access granted' : 'Domain access revoked'
    }
  } catch (error) {
    console.error('Error updating domain access:', error)
    return {
      success: false,
      error: 'Failed to update domain access'
    }
  }
}

/**
 * Create a new team for the current user
 * @returns Status of the team creation
 */
export async function onCreateTeam() {
  try {
    const user = await currentUser()
    if (!user) {
      return { success: false, error: 'You must be logged in to create a team' }
    }
    
    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { 
        id: true, 
        teamId: true,
        fullname: true
      }
    })
    
    // Check if user already has a team
    if (dbUser?.teamId) {
      return { success: false, error: 'You are already a member of a team' }
    }
    
    // Create the team - fix type issue by checking if id exists
    if (!dbUser?.id) {
      return { success: false, error: 'User not properly initialized in database' }
    }
    
    const team = await client.team.create({
      data: {
        name: `${dbUser?.fullname || user.firstName}'s Team`,
        ownerId: dbUser.id
      }
    })
    
    // Update user's team and role
    await client.user.update({
      where: { id: dbUser.id },
      data: {
        teamId: team.id,
        role: 'OWNER'
      }
    })
    
    return {
      success: true,
      team
    }
  } catch (error) {
    console.error('Error creating team:', error)
    return {
      success: false,
      error: 'Failed to create team'
    }
  }
}

/**
 * Remove a member from the team
 * @param memberId ID of the member to remove
 * @returns Status of the removal
 */
export async function onRemoveMember(memberId: string) {
  try {
    const user = await currentUser()
    if (!user) {
      return { success: false, error: 'You must be logged in to remove team members' }
    }
    
    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { 
        id: true, 
        teamId: true,
        role: true
      }
    })
    
    // Only team owners can remove members
    if (dbUser?.role !== 'OWNER') {
      return { success: false, error: 'Only team owners can remove members' }
    }
    
    // Check if user is trying to remove themselves
    if (dbUser?.id === memberId) {
      return { success: false, error: 'You cannot remove yourself from the team' }
    }
    
    // Find the member to remove
    const memberToRemove = await client.user.findUnique({
      where: { id: memberId },
      select: { 
        id: true, 
        teamId: true,
        role: true
      }
    })
    
    // Check if member exists and is in the same team
    if (!memberToRemove || memberToRemove.teamId !== dbUser?.teamId) {
      return { success: false, error: 'Member not found in your team' }
    }
    
    // Check if trying to remove another owner
    if (memberToRemove.role === 'OWNER') {
      return { success: false, error: 'You cannot remove the team owner' }
    }
    
    // Remove member from team
    await client.user.update({
      where: { id: memberId },
      data: {
        teamId: null,
        role: 'MEMBER' // Reset role to MEMBER
      }
    })
    
    // Remove domain access for this member
    const domains = await client.domain.findMany({
      where: { 
        teamId: dbUser.teamId,
        userId: memberId
      }
    })
    
    // Update each domain to remove this user
    for (const domain of domains) {
      let permissions: any = {}
      
      if (domain.permissions) {
        try {
          permissions = typeof domain.permissions === 'string' 
            ? JSON.parse(domain.permissions) 
            : domain.permissions
            
          // Remove user from accessUsers
          if (permissions.accessUsers) {
            permissions.accessUsers = permissions.accessUsers.filter(
              (u: any) => u.userId !== memberId
            )
          }
        } catch (e) {
          console.error('Error parsing permissions:', e)
        }
      }
      
      // Update domain
      await client.domain.update({
        where: { id: domain.id },
        data: {
          userId: null,
          permissions
        }
      })
    }
    
    return {
      success: true,
      message: 'Member removed successfully'
    }
  } catch (error) {
    console.error('Error removing team member:', error)
    return {
      success: false,
      error: 'Failed to remove team member'
    }
  }
}

/**
 * Force owner permissions for all domains in the team
 * @param domainId Optional specific domain ID to update
 * @returns Status of the permission update
 */
export async function onForceOwnerDomainAccess(domainId?: string) {
  try {
    const user = await currentUser()
    if (!user) {
      return { success: false, error: 'You must be logged in to update domain permissions' }
    }
    
    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { 
        id: true, 
        teamId: true,
        role: true
      }
    })
    
    // Only team owners can force permissions
    if (dbUser?.role !== 'OWNER') {
      return { success: false, error: 'Only team owners can update domain permissions' }
    }
    
    if (!dbUser?.teamId) {
      return { success: false, error: 'You are not a member of any team' }
    }
    
    // Prepare the query to find domains
    const whereClause = domainId 
      ? { id: domainId, teamId: dbUser.teamId }
      : { teamId: dbUser.teamId }
      
    // Find all domains in this team or the specific domain
    const domains = await client.domain.findMany({
      where: whereClause
    })
    
    if (domains.length === 0) {
      return { success: false, error: 'No domains found' }
    }
    
    // Update each domain with owner permissions
    for (const domain of domains) {
      let currentPermissions: any = {}
      
      if (domain.permissions) {
        try {
          currentPermissions = typeof domain.permissions === 'string' 
            ? JSON.parse(domain.permissions) 
            : domain.permissions
        } catch (e) {
          console.error('Error parsing permissions:', e)
          currentPermissions = {}
        }
      }
      
      // Create or update the accessUsers array
      if (!currentPermissions.accessUsers) {
        currentPermissions.accessUsers = []
      }
      
      // Remove existing entry for owner if it exists
      currentPermissions.accessUsers = currentPermissions.accessUsers.filter(
        (u: any) => u.userId !== dbUser.id
      )
      
      // Add new entry with full permissions
      currentPermissions.accessUsers.push({
        userId: dbUser.id,
        permissions: {
          canModifyName: true,
          canModifyIcon: true,
          canModifyChat: true,
          canDelete: true
        }
      })
      
      // Update the domain with new permissions
      await client.domain.update({
        where: { id: domain.id },
        data: {
          permissions: currentPermissions
        }
      })
    }
    
    return {
      success: true,
      message: `Owner permissions enforced for ${domains.length} domain(s)`
    }
  } catch (error) {
    console.error('Error forcing owner permissions:', error)
    return {
      success: false,
      error: 'Failed to update domain permissions'
    }
  }
}

/**
 * Validate a team join code
 * @param code Team join code to validate
 * @returns Team information if valid, null if invalid
 */
export async function validateTeamCode(code: string) {
  try {
    console.log('Validating team code:', code);
    
    if (!code) {
      console.log('Code is empty');
      return { success: false, error: 'Code is required' }
    }
    
    // Debug: Log all team settings in the database
    try {
      const allTeamSettings = await client.$queryRaw`
        SELECT ts.id, ts."teamId", ts."recognitionMessage", t.name as team_name, u.fullname as owner_name
        FROM "TeamSettings" ts
        JOIN "Team" t ON ts."teamId" = t.id
        JOIN users u ON t."ownerId" = u.id
      `;
      console.log('All team settings:', allTeamSettings);
    } catch (dbError) {
      console.error('Error fetching team settings:', dbError);
    }
    
    // Find team settings with this join code
    console.log('Searching for team with joinCode:', code);
    const teamSettingsResults = await client.$queryRaw<any[]>`
      SELECT ts.id, ts."teamId", ts."recognitionMessage", t.name as team_name, u.fullname as owner_name
      FROM "TeamSettings" ts
      JOIN "Team" t ON ts."teamId" = t.id
      JOIN users u ON t."ownerId" = u.id
    `;
    
    console.log('Team settings found:', teamSettingsResults);
    
    // Filter results to find the one with matching join code
    const matchingTeamSetting = teamSettingsResults.find(ts => {
      if (!ts.recognitionMessage) return false;
      
      try {
        const recognitionData = JSON.parse(ts.recognitionMessage);
        return recognitionData.joinCode === code;
      } catch (e) {
        console.error('Error parsing recognitionMessage:', e);
        return false;
      }
    });
    
    // If no team found with this code
    if (!matchingTeamSetting) {
      console.log('No team found with code:', code);
      return { success: false, error: 'Invalid team code' }
    }
    
    console.log('Matching team setting found:', matchingTeamSetting);
    
    // Parse the recognitionMessage to get the joinCode and expiresAt
    const recognitionData = JSON.parse(matchingTeamSetting.recognitionMessage);
    
    // Check if code has expired
    if (recognitionData.expiresAt && new Date(recognitionData.expiresAt) < new Date()) {
      console.log('Code has expired:', recognitionData.expiresAt);
      return { success: false, error: 'This code has expired' }
    }
    
    return {
      success: true,
      team: {
        id: matchingTeamSetting.teamId,
        name: matchingTeamSetting.team_name,
        ownerName: matchingTeamSetting.owner_name
      }
    }
  } catch (error) {
    console.error('Error validating team code:', error)
    return {
      success: false,
      error: 'Failed to validate team code'
    }
  }
}

/**
 * Generate a join code for a team
 * @param teamId ID of the team
 * @param expiryDays Number of days until the code expires
 * @returns Status of the join code generation
 */
export async function generateTeamJoinCode(teamId: string, expiryDays = 7) {
  try {
    const user = await currentUser()
    if (!user) {
      return { success: false, error: 'You must be logged in to generate a join code' }
    }
    
    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { 
        id: true, 
        teamId: true,
        role: true
      }
    })
    
    // Only team owners can generate join codes
    if (dbUser?.role !== 'OWNER') {
      return { success: false, error: 'Only team owners can generate join codes' }
    }
    
    // Check if the team exists and belongs to this user
    const teamResults = await client.$queryRaw<any[]>`
      SELECT id, name FROM "Team" 
      WHERE id = ${teamId}::uuid 
      AND "ownerId" = ${dbUser.id}::uuid
    `
    
    if (!teamResults || teamResults.length === 0) {
      return { success: false, error: 'Team not found or you are not the owner' }
    }
    
    // Generate a secure random code - without dashes for simpler validation
    const joinCode = `${Math.random().toString(36).substring(2, 4)}${Math.random().toString(36).substring(2, 4)}${Math.random().toString(36).substring(2, 4)}`.toUpperCase()
    
    // Set expiration date
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiryDays)
    
    // Check if TeamSettings exists for this team
    const teamSettingsResults = await client.$queryRaw<any[]>`
      SELECT id, "recognitionMessage" FROM "TeamSettings" WHERE "teamId" = ${teamId}::uuid
    `;
    
    // Prepare the recognitionMessage with the join code
    const joinCodeData = {
      joinCode: joinCode,
      expiresAt: expiresAt
    };
    
    if (teamSettingsResults && teamSettingsResults.length > 0) {
      // TeamSettings exists, update it
      const teamSettingsId = teamSettingsResults[0].id;
      const currentRecognitionMessage = teamSettingsResults[0].recognitionMessage;
      
      // Parse existing recognitionMessage if it exists
      let updatedMessage = joinCodeData;
      if (currentRecognitionMessage) {
        try {
          const currentData = JSON.parse(currentRecognitionMessage);
          // Merge existing data with new join code data
          updatedMessage = { ...currentData, ...joinCodeData };
        } catch (e) {
          console.error('Error parsing existing recognitionMessage:', e);
        }
      }
      
      // Update TeamSettings with new recognitionMessage
      await client.$executeRaw`
        UPDATE "TeamSettings" 
        SET "recognitionMessage" = ${JSON.stringify(updatedMessage)}
        WHERE id = ${teamSettingsId}::uuid
      `;
    } else {
      // TeamSettings doesn't exist, create it
      await client.$executeRaw`
        INSERT INTO "TeamSettings" ("id", "teamId", "recognitionMessage", "createdAt", "updatedAt")
        VALUES (
          gen_random_uuid(),
          ${teamId}::uuid,
          ${JSON.stringify(joinCodeData)},
          now(),
          now()
        )
      `;
    }
    
    console.log('Team join code generated:', {
      teamId,
      joinCode,
      expiresAt
    });
    
    return {
      success: true,
      joinCode,
      expiresAt
    }
  } catch (error) {
    console.error('Error generating join code:', error)
    return {
      success: false,
      error: 'Failed to generate join code'
    }
  }
}

/**
 * ADMIN ONLY: Directly set a join code for a team (for debugging)
 * @param teamId ID of the team
 * @param code The join code to set manually
 * @returns Status of the operation
 */
export async function adminSetTeamJoinCode(teamId: string, code: string) {
  try {
    const user = await currentUser()
    if (!user) {
      return { success: false, error: 'You must be logged in to use this function' }
    }
    
    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { 
        role: true
      }
    })
    
    // Only admins and owners can use this function
    if (dbUser?.role !== 'OWNER' && dbUser?.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'You are not authorized to use this function' }
    }
    
    console.log('Setting manual join code for team:', teamId, 'code:', code);
    
    // Set expiration date (7 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)
    
    // Check if TeamSettings exists for this team
    const teamSettingsResults = await client.$queryRaw<any[]>`
      SELECT id, "recognitionMessage" FROM "TeamSettings" WHERE "teamId" = ${teamId}::uuid
    `;
    
    // Prepare the recognitionMessage with the join code
    const joinCodeData = {
      joinCode: code,
      expiresAt: expiresAt
    };
    
    if (teamSettingsResults && teamSettingsResults.length > 0) {
      // TeamSettings exists, update it
      const teamSettingsId = teamSettingsResults[0].id;
      const currentRecognitionMessage = teamSettingsResults[0].recognitionMessage;
      
      // Parse existing recognitionMessage if it exists
      let updatedMessage = joinCodeData;
      if (currentRecognitionMessage) {
        try {
          const currentData = JSON.parse(currentRecognitionMessage);
          // Merge existing data with new join code data
          updatedMessage = { ...currentData, ...joinCodeData };
        } catch (e) {
          console.error('Error parsing existing recognitionMessage:', e);
        }
      }
      
      // Update TeamSettings with new recognitionMessage
      await client.$executeRaw`
        UPDATE "TeamSettings" 
        SET "recognitionMessage" = ${JSON.stringify(updatedMessage)}
        WHERE id = ${teamSettingsId}::uuid
      `;
    } else {
      // TeamSettings doesn't exist, create it
      await client.$executeRaw`
        INSERT INTO "TeamSettings" ("id", "teamId", "recognitionMessage", "createdAt", "updatedAt")
        VALUES (
          gen_random_uuid(),
          ${teamId}::uuid,
          ${JSON.stringify(joinCodeData)},
          now(),
          now()
        )
      `;
    }
    
    console.log('Join code set successfully:', {
      teamId,
      joinCode: code,
      expiresAt
    });
    
    return {
      success: true,
      message: `Join code manually set to ${code}`,
      joinCode: code,
      expiresAt
    }
  } catch (error) {
    console.error('Error setting manual join code:', error)
    return {
      success: false,
      error: 'Failed to set join code'
    }
  }
} 