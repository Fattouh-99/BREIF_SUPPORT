'use server'

import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { randomBytes } from 'crypto'
import { revalidatePath } from 'next/cache'
import { Prisma, UserRole, NotificationType, InvitationStatus } from '@prisma/client'
import { auth } from '@clerk/nextjs/server'
import { ensureUserExists } from '../auth'
import { pusherServer } from '@/lib/pusher'
import { generateUUID } from '@/lib/uuid'

type TeamMember = {
  id: string;
  fullname: string;
  email: string;
  role: UserRole;
}

type Domain = {
  id: string;
  name: string;
  icon: string;
  teamId: string | null;
  userId: string | null;
  campaignId: string | null;
  permissions: any;
  ChatRoom: {
    id: string;
    live: boolean;
    createdAt: Date;
  }[];
  customer: {
    id: string;
    email: string | null;
  }[];
}

type Team = {
  id: string;
  name: string;
  owner: {
    id: string;
    fullname: string;
    email: string;
  };
  members: TeamMember[];
  domains: Domain[];
  settings: any;
}

export const onInviteTeamMember = async (email: string, role: string) => {
  try {
    const user = await currentUser()
    if (!user) throw new Error('Unauthorized')

    const currentUserData = await client.user.findUnique({
      where: { clerkId: user.id }
    })

    if (!currentUserData) throw new Error('User not found')

    // Check if the invited user exists in our database
    const invitedUser = await client.user.findFirst({
      where: { email }
    })

    if (!invitedUser) throw new Error('User not found with this email')

    // Create the invitation
    const invitation = await client.teamInvitation.create({
      data: {
        email: email.toLowerCase(),
        role: role as UserRole,
        status: 'PENDING',
        token: generateUUID(),
        sender: {
          connect: { id: currentUserData.id }
        },
        receiver: {
          connect: { id: invitedUser.id }
        }
      }
    })

    // Create notification for the invited user
    await client.notification.create({
      data: {
        type: 'TEAM_INVITATION',
        message: `${currentUserData.fullname} has invited you to join their team as ${role.toLowerCase()}`,
        user: {
          connect: { id: invitedUser.id }
        }
      }
    })

    revalidatePath('/team')
    revalidatePath('/notifications')
    
    return { success: true, invitation }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const onAcceptInvitation = async (token: string) => {
  try {
    const user = await currentUser()
    if (!user) throw new Error('Unauthorized')

    // Find and validate invitation
    const invitation = await client.teamInvitation.findUnique({
      where: { token },
      include: {
        sender: true
      }
    })

    if (!invitation) {
      throw new Error('Invalid invitation')
    }

    if (invitation.status !== 'PENDING') {
      throw new Error('Invitation is no longer valid')
    }

    if (invitation.expiresAt < new Date()) {
      await client.teamInvitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' }
      })
      throw new Error('Invitation has expired')
    }

    // Get or create user
    const receiver = await client.user.findUnique({
      where: { clerkId: user.id }
    })

    if (!receiver) {
      throw new Error('User not found')
    }

    // Check if sender has a team
    const sender = await client.user.findUnique({
      where: { id: invitation.senderId },
      include: {
        team: true,
        ownedTeams: true
      }
    })

    if (!sender) {
      throw new Error('Sender not found')
    }

    let teamId: string;

    // If sender has no team, create one
    if (!sender.team && sender.ownedTeams.length === 0) {
      const newTeam = await client.team.create({
        data: {
          name: `${sender.fullname}'s Team`,
          owner: {
            connect: { id: sender.id }
          },
          members: {
            connect: [{ id: sender.id }]
          }
        }
      })
      teamId = newTeam.id;

      // Update sender's role to OWNER
      await client.user.update({
        where: { id: sender.id },
        data: {
          role: 'OWNER',
          teamId: newTeam.id
        }
      })
    } else {
      teamId = sender.team?.id || sender.ownedTeams[0].id;
    }

    // Accept invitation and update receiver
    await client.teamInvitation.update({
      where: { id: invitation.id },
      data: {
        status: 'ACCEPTED',
        receiverId: receiver.id
      }
    })

    // Update receiver's role and team
    await client.user.update({
      where: { id: receiver.id },
      data: {
        role: invitation.role as any,
        teamId: teamId
      }
    })

    revalidatePath('/team')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const onRejectInvitation = async (token: string) => {
  try {
    const user = await currentUser()
    if (!user) throw new Error('Unauthorized')

    const invitation = await client.teamInvitation.findUnique({
      where: { token }
    })

    if (!invitation || invitation.status !== 'PENDING') {
      throw new Error('Invalid invitation')
    }

    await client.teamInvitation.update({
      where: { id: invitation.id },
      data: { status: 'REJECTED' }
    })

    revalidatePath('/team')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const onGetTeamMembers = async () => {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    // First get the user and their team info
    const currentUser = await client.user.findUnique({
      where: {
        clerkId: userId,
      },
      select: {
        id: true,
        fullname: true,
        email: true,
        role: true,
        team: {
          include: {
            owner: {
              select: {
                id: true,
                fullname: true,
                email: true
              }
            },
            domains: {
              include: {
                customer: {
                  include: {
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
            },
            members: {
              select: {
                id: true,
                fullname: true,
                email: true,
                role: true
              }
            },
            settings: true
          }
        }
      }
    })

    if (!currentUser) return { success: false, error: 'User not found' }
    
    if (!currentUser.team) {
      return { 
        success: true, 
        message: 'You are not part of a team',
        members: [],
        team: null,
        currentUser: {
          id: currentUser.id,
          fullname: currentUser.fullname,
          email: currentUser.email,
          role: currentUser.role
        }
      }
    }

    const team = currentUser.team
    const isOwner = currentUser.role === 'OWNER'

    // Process domains to track assigned users and access rights
    const processedDomains = team.domains.map(domain => {
      // Parse the permissions JSON if it exists
      const permissionsObj = domain.permissions ? JSON.parse(domain.permissions as string) : {};
      const accessUsers = permissionsObj.accessUsers || [];
      
      // If current user is the owner, ensure they have access to all team domains
      let hasAccess = domain.userId === currentUser.id;
      
      // Owner should always see their domains
      if (isOwner && domain.teamId === team.id) {
        hasAccess = true;
      }
      
      // Check if user has access via the accessUsers array
      if (!hasAccess && accessUsers.length > 0) {
        const userAccess = accessUsers.find((u: any) => u.userId === currentUser.id);
        hasAccess = !!userAccess;
      }
      
      return {
        id: domain.id,
        name: domain.name,
        icon: domain.icon,
        teamId: domain.teamId,
        userId: domain.userId,
        campaignId: domain.campaignId,
        permissions: domain.permissions,
        accessUsers: accessUsers,
        hasAccess: hasAccess,
        chatRooms: domain.customer?.flatMap(c => c.chatRoom || []) || [],
        customers: domain.customer?.map(c => ({
          id: c.id,
          email: c.email || ''
        })) || []
      };
    });

    return {
      success: true,
      members: team.members.map(member => ({
        id: member.id,
        fullname: member.fullname,
        email: member.email,
        role: member.role,
        type: member.role === 'OWNER' ? 'Owner' : member.role === 'ADMIN' ? 'Administrator' : 'Member',
        image: null
      })),
      team: {
        id: team.id,
        name: team.name,
        ownerId: team.owner.id,
        owner: {
          fullname: team.owner.fullname,
          email: team.owner.email
        },
        domains: processedDomains,
        settings: team.settings
      },
      currentUser: {
        id: currentUser.id,
        fullname: currentUser.fullname,
        email: currentUser.email,
        role: currentUser.role
      }
    }
  } catch (error) {
    console.error('Error fetching team members:', error)
    return { success: false, error: 'Failed to fetch team members' }
  }
}

export const onGetPendingInvitations = async () => {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    const user = await client.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        fullname: true,
        email: true,
        sentInvitations: {
          include: {
            sender: {
              select: {
                fullname: true,
                email: true
              }
            },
            receiver: {
              select: {
                fullname: true,
                email: true
              }
            }
          }
        },
        receivedInvitations: {
          include: {
            sender: {
              select: {
                fullname: true,
                email: true
              }
            },
            receiver: {
              select: {
                fullname: true,
                email: true
              }
            }
          }
        }
      }
    })

    // Also check for invitations sent to user's email but not yet linked to their account
    const emailInvitations = await client.teamInvitation.findMany({
      where: {
        email: user?.email || '',
        receiverId: null // These don't have receiverId set yet
      },
      include: {
        sender: {
          select: {
            fullname: true,
            email: true
          }
        },
        receiver: {
          select: {
            fullname: true,
            email: true
          }
        }
      }
    })

    // Combine the two sets of invitations, removing duplicates
    const allReceivedInvitations = [
      ...(user?.receivedInvitations || []),
      ...emailInvitations
    ]

    // Remove duplicates by id
    const uniqueReceivedInvitations = Array.from(
      new Map(allReceivedInvitations.map(inv => [inv.id, inv])).values()
    )

    console.log(`Found ${uniqueReceivedInvitations.length} received invitations for user (${user?.email})`);

    return {
      success: true,
      sentInvitations: user?.sentInvitations || [],
      receivedInvitations: uniqueReceivedInvitations
    }
  } catch (error) {
    console.error('Error fetching pending invitations:', error)
    return { success: false, error: 'Failed to fetch pending invitations' }
  }
}

export const onCheckEmailExists = async (email: string) => {
  try {
    const user = await currentUser()
    if (!user) throw new Error('Unauthorized')

    // Check if email exists in our database
    const existingUser = await client.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        fullname: true,
        email: true,
        role: true,
        receivedInvitations: {
          where: {
            status: 'PENDING'
          }
        }
      }
    })

    // Check if email has pending invitation
    const pendingInvitation = await client.teamInvitation.findFirst({
      where: {
        email: email.toLowerCase(),
        status: 'PENDING'
      }
    })

    // Add console logs for debugging
    console.log('Email check result:', {
      emailExists: !!existingUser,
      pendingInvitation,
      email,
      userDetails: existingUser
    })

    return { 
      success: true, 
      exists: !!existingUser,
      hasPendingInvite: !!pendingInvitation,
      userDetails: existingUser ? {
        fullname: existingUser.fullname,
        email: existingUser.email,
        role: existingUser.role
      } : null,
      message: !existingUser 
        ? "This email is not registered in our system. The user needs to create an account first." 
        : pendingInvitation 
          ? "This user already has a pending invitation." 
          : "Email is valid and can be invited."
    }
  } catch (error: any) {
    console.error('Email check error:', error)
    return { 
      success: false, 
      error: error.message,
      message: "Failed to check email. Please try again."
    }
  }
}

export const onLeaveTeam = async () => {
  try {
    const user = await currentUser()
    if (!user) throw new Error('Unauthorized')

    const currentUserData = await client.user.findUnique({
      where: { clerkId: user.id }
    })

    if (!currentUserData) throw new Error('User not found')

    // Update user role to remove team association
    await client.user.update({
      where: { id: currentUserData.id },
      data: { 
        role: 'MEMBER',
        teamId: null
      }
    })

    revalidatePath('/team')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const onUpdateMemberRole = async (memberId: string, newRole: UserRole) => {
  try {
    const user = await currentUser()
    if (!user) throw new Error('Unauthorized')

    const currentUserData = await client.user.findUnique({
      where: { clerkId: user.id },
      select: {
        id: true,
        role: true
      }

    })

    if (!currentUserData) throw new Error('User not found')
    if (currentUserData.role !== 'OWNER') throw new Error('Only owners can update member roles')
    if (newRole === 'OWNER') throw new Error('Cannot set another user as owner')

    // Update member's role
    await client.user.update({
      where: { id: memberId },
      data: { role: newRole }
    })

    // Create notification for the member
    await client.notification.create({
      data: {
        type: 'TEAM_ROLE_UPDATE',
        message: `Your role has been updated to ${newRole.toLowerCase()}`,
        userId: memberId,
        read: false
      }
    })

    revalidatePath('/team')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const onContactOwner = async (message: string) => {
  try {
    const user = await currentUser()
    if (!user) throw new Error('Unauthorized')

    const currentUserData = await client.user.findUnique({
      where: { clerkId: user.id }
    })

    if (!currentUserData) throw new Error('User not found')

    // Find team owner
    const owner = await client.user.findFirst({
      where: { role: 'OWNER' }
    })

    if (!owner) throw new Error('Team owner not found')

    // Create notification for the owner
    await client.notification.create({
      data: {
        type: 'TEAM_MESSAGE',
        message: `Team member ${currentUserData.fullname} sent you a message: ${message}`,
        userId: owner.id,
        read: false
      }
    })

    revalidatePath('/notifications')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const onUpdateDomainAccess = async (
  memberId: string, 
  domainId: string, 
  hasAccess: boolean,
  permissions?: {
    canModifyName: boolean;
    canModifyIcon: boolean;
    canModifyChat: boolean;
    canDelete: boolean;
  }
) => {
  try {
    const user = await currentUser()
    if (!user) throw new Error('Unauthorized')

    const currentUserData = await client.user.findUnique({
      where: { clerkId: user.id },
      include: {
        team: true
      }
    })

    if (!currentUserData) throw new Error('User not found')

    // Get the domain to verify ownership
    const domain = await client.domain.findUnique({
      where: { id: domainId },
      include: {
        User: true,
        team: true
      }
    })

    if (!domain) throw new Error('Domain not found')

    // Check if the current user is the domain owner
    const isDomainOwner = domain.userId === currentUserData.id

    // If the domain belongs to a team, verify team ownership and permissions
    if (domain.teamId) {
      // Only team owners can modify permissions
      if (currentUserData.role !== 'OWNER') {
        throw new Error('Only team owners can manage domain access')
      }
      if (domain.teamId !== currentUserData.team?.id) {
        throw new Error('Domain does not belong to your team')
      }
    } else {
      // If not in a team context, only domain owner can modify
      if (!isDomainOwner) {
        throw new Error('Only domain owner can manage access')
      }
    }

    // Get the member to verify team membership if in team context
    const member = await client.user.findUnique({
      where: { id: memberId },
      include: {
        team: true
      }
    })

    if (!member) throw new Error('Member not found')
    
    if (domain.teamId) {
      if (member.teamId !== currentUserData.team?.id) {
        throw new Error('Member does not belong to your team')
      }
    }

    // Check if the target member is an owner or admin
    // Force full permissions for owners regardless of what was passed
    let finalPermissions = permissions;
    
    if (hasAccess && member.role === 'OWNER') {
      console.log(`Ensuring full permissions for team owner (memberId=${memberId})`);
      finalPermissions = {
        canModifyName: true,
        canModifyIcon: true,
        canModifyChat: true,
        canDelete: true
      };
    } else if (!hasAccess) {
      // If removing access, clear permissions
      finalPermissions = undefined;
    } else if (!finalPermissions) {
      // Default permissions if none provided
      finalPermissions = {
        canModifyName: false,
        canModifyIcon: false,
        canModifyChat: false,
        canDelete: false
      };
    }

    // Create a permissions structure that includes both owner and member access
    const currentPermissions = domain.permissions ? JSON.parse(domain.permissions as string) : {};
    
    if (hasAccess) {
      // When granting access, add the member to the accessUsers list
      currentPermissions.accessUsers = currentPermissions.accessUsers || [];
      
      // Remove if already exists to avoid duplicates
      const existingIndex = currentPermissions.accessUsers.findIndex(
        (u: any) => u.userId === memberId
      );
      
      if (existingIndex >= 0) {
        currentPermissions.accessUsers.splice(existingIndex, 1);
      }
      
      // Add the member with their permissions
      currentPermissions.accessUsers.push({
        userId: memberId,
        permissions: finalPermissions
      });
      
      // If this is for the owner, set top-level permissions too for backward compatibility
      if (member.role === 'OWNER') {
        console.log(`Setting direct permissions for owner ${memberId}`);
        // Copy the permissions to the top level for UI compatibility
        Object.assign(currentPermissions, finalPermissions);
      }

      // If this user is the only one with access, set top-level permissions to theirs
      // This ensures settings screens will work correctly for sole owners
      if (currentPermissions.accessUsers.length === 1) {
        console.log('Setting top-level permissions from sole user with access');
        Object.assign(currentPermissions, finalPermissions);
      }
      
      // For owners, also set direct user ID for legacy compatibility
      if (member.role === 'OWNER') {
        // Update domain ownership to provide maximum compatibility with legacy code
        // This is redundant but makes debugging easier and provides multiple paths to check permissions
        console.log(`Setting direct userId ownership for owner ${memberId} on domain ${domainId}`);
      }
    } else {
      // When revoking access, remove the member from accessUsers
      if (currentPermissions.accessUsers) {
        currentPermissions.accessUsers = currentPermissions.accessUsers.filter(
          (u: any) => u.userId !== memberId
        );

        // If there's still one user with access, set top-level permissions to theirs
        if (currentPermissions.accessUsers.length === 1) {
          const remainingUser = currentPermissions.accessUsers[0];
          if (remainingUser.permissions) {
            console.log('Setting top-level permissions to remaining user');
            Object.assign(currentPermissions, remainingUser.permissions);
          }
        }

        // If no users left with access, clear top-level permissions
        if (currentPermissions.accessUsers.length === 0) {
          console.log('Clearing top-level permissions as no users have access');
          currentPermissions.canModifyName = false;
          currentPermissions.canModifyIcon = false;
          currentPermissions.canModifyChat = false;
          currentPermissions.canDelete = false;
        }
      }
    }
    
    // Make sure the JSON serialization is working correctly
    let newPermissionsString = '';
    try {
      newPermissionsString = JSON.stringify(currentPermissions);
      // Double-check parsing works
      JSON.parse(newPermissionsString);
    } catch (e) {
      console.error('Error with JSON permissions:', e);
      throw new Error('Failed to process permissions JSON');
    }
    
    console.log('New permissions string:', newPermissionsString);
    
    // Update domain with the new permissions structure
    const updatedDomain = await client.domain.update({
      where: { id: domainId },
      data: {
        permissions: newPermissionsString
      },
      select: {
        id: true,
        permissions: true
      }
    });
    
    console.log('Updated domain permissions:', updatedDomain.permissions);

    // Create notification for the member
    if (memberId !== currentUserData.id) {
      await client.notification.create({
        data: {
          type: 'DOMAIN_ACCESS',
          message: `Your access to domain ${domain.name} has been ${hasAccess ? 'granted' : 'revoked'}${finalPermissions ? ' with default permissions' : ''}`,
          userId: memberId,
          domainId: domain.id,
          read: false
        }
      })
    }

    revalidatePath('/team')
    // Also revalidate the settings path for this domain
    revalidatePath(`/settings/${domain.name}`)
    return { success: true }
  } catch (error: any) {
    console.error('Update domain access error:', error)
    return { success: false, error: error.message }
  }
}

export const onCreateTeam = async () => {
  try {
    const user = await currentUser();
    if (!user) throw new Error('Unauthorized');

    // First ensure the user exists in the database
    const userResult = await ensureUserExists();
    if (!userResult || !userResult.user) {
      throw new Error('Failed to ensure user exists');
    }

    // Use the confirmed user data
    const currentUserData = await client.user.findUnique({
      where: { clerkId: user.id }
    });

    if (!currentUserData) throw new Error('User not found');

    // Check if user already has a team
    const existingTeam = await client.team.findFirst({
      where: {
        OR: [
          { ownerId: currentUserData.id },
          { members: { some: { id: currentUserData.id } } }
        ]
      }
    });

    if (existingTeam) {
      throw new Error('You are already part of a team');
    }

    // Create new team
    const team = await client.team.create({
      data: {
        name: `${currentUserData.fullname}'s Team`,
        owner: {
          connect: { id: currentUserData.id }
        },
        members: {
          connect: [{ id: currentUserData.id }]
        }
      }
    });

    // Update user role to OWNER
    await client.user.update({
      where: { id: currentUserData.id },
      data: {
        role: 'OWNER',
        teamId: team.id
      }
    });

    revalidatePath('/team');
    return { success: true, team };
  } catch (error: any) {
    console.error('Create team error:', error);
    return { success: false, error: error.message };
  }
};

export const onRemoveMember = async (memberId: string) => {
  try {
    const user = await currentUser();
    if (!user) throw new Error('Unauthorized');

    const currentUserData = await client.user.findUnique({
      where: { clerkId: user.id },
      include: {
        team: true
      }
    });

    if (!currentUserData) throw new Error('User not found');
    if (currentUserData.role !== 'OWNER') throw new Error('Only owners can remove team members');

    // Get the member to be removed
    const member = await client.user.findUnique({
      where: { id: memberId }
    });

    if (!member) throw new Error('Member not found');
    if (member.role === 'OWNER') throw new Error('Cannot remove team owner');

    // Remove member from team
    await client.user.update({
      where: { id: memberId },
      data: {
        teamId: null,
        role: 'MEMBER'
      }
    });

    // Create notification for the removed member
    await client.notification.create({
      data: {
        type: 'TEAM_ROLE_UPDATE',
        message: `You have been removed from the team by ${currentUserData.fullname}`,
        userId: memberId,
        read: false
      }
    });

    revalidatePath('/team');
    return { success: true };
  } catch (error: any) {
    console.error('Remove member error:', error);
    return { success: false, error: error.message };
  }
};

export const onTransferConversation = async (chatRoomId: string, memberId: string) => {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    // Find the current user
    const currentUser = await client.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, fullname: true }
    });

    if (!currentUser) {
      throw new Error('Current user not found');
    }

    // First verify the user has access to this chat room
    const chatRoom = await client.chatRoom.findUnique({
      where: { id: chatRoomId },
      include: {
        Customer: true,
        sharedWith: true,
        sharedBy: true,
        assignedTo: true
      }
    })

    if (!chatRoom) {
      throw new Error('Chat room not found')
    }

    // Get the team member's details
    const teamMember = await client.user.findUnique({
      where: { id: memberId },
      select: {
        id: true,
        fullname: true,
        email: true
      }
    })

    if (!teamMember) {
      throw new Error('Team member not found')
    }

    // First create a transfer request record to track the transfer
    const transferRequest = await client.transferRequest.create({
      data: {
        chatRoomId,
        fromUserId: currentUser.id,
        toUserId: memberId,
        status: 'ACCEPTED'  // Auto-accept in this case
      }
    });

    // Update chat room with new assignee using the new direct relationship
    const updatedChatRoom = await client.chatRoom.update({
      where: { id: chatRoomId },
      data: {
        assignedToId: memberId,
        assignedAt: new Date()
      }
    })

    // Add a system message about the transfer
    await client.chatMessage.create({
      data: {
        chatRoomId,
        message: `This conversation has been transferred to ${teamMember.fullname}.`,
        role: "assistant",
        seen: false
      }
    })

    return updatedChatRoom
  } catch (error) {
    console.error('Error transferring conversation:', error)
    return null
  }
}

export const onForceOwnerDomainAccess = async (domainId: string) => {
  try {
    const user = await currentUser()
    if (!user) throw new Error('Unauthorized')

    const currentUserData = await client.user.findUnique({
      where: { clerkId: user.id }
    })

    if (!currentUserData) throw new Error('User not found')
    if (currentUserData.role !== 'OWNER') throw new Error('Only owners can use this function')

    // Get the domain
    const domain = await client.domain.findUnique({
      where: { id: domainId }
    })

    if (!domain) throw new Error('Domain not found')

    // Force full permissions for the owner
    const fullPermissions = {
      canModifyName: true,
      canModifyIcon: true,
      canModifyChat: true,
      canDelete: true
    }

    // Create a comprehensive permissions structure
    let permissionsObj
    try {
      permissionsObj = domain.permissions ? JSON.parse(domain.permissions as string) : {}
    } catch (e) {
      console.error('Error parsing permissions, creating new object:', e)
      permissionsObj = {}
    }

    // CRUCIAL CHANGE: Set top-level permissions for compatibility with UI components
    // These are the permissions that most components directly use
    permissionsObj = {
      ...permissionsObj,
      ...fullPermissions, // Add full permissions at top level for maximum compatibility
      canModifyName: true,
      canModifyIcon: true,
      canModifyChat: true,
      canDelete: true
    }

    // Ensure accessUsers array exists
    permissionsObj.accessUsers = permissionsObj.accessUsers || []

    // Remove owner from accessUsers if already present
    permissionsObj.accessUsers = permissionsObj.accessUsers.filter(
      (u: any) => u.userId !== currentUserData.id
    )

    // Add owner with full permissions
    permissionsObj.accessUsers.push({
      userId: currentUserData.id,
      permissions: fullPermissions,
      isOwner: true // Additional flag to mark as owner
    })

    // Serialize and validate JSON
    const permissionsJson = JSON.stringify(permissionsObj)

    console.log(`Setting owner permissions for domain ${domainId}:`, permissionsJson)

    // Update the domain with the new permissions
    const updatedDomain = await client.domain.update({
      where: { id: domainId },
      data: {
        permissions: permissionsJson,
        // Also update userId for maximum compatibility
        userId: currentUserData.id
      },
      select: {
        id: true,
        name: true,
        permissions: true
      }
    })

    console.log('Domain updated with owner permissions:', {
      id: updatedDomain.id,
      name: updatedDomain.name,
      permissions: updatedDomain.permissions
    })

    revalidatePath('/team')
    // Also revalidate the settings page for this domain
    revalidatePath(`/settings/${domain.name}`)
    return { 
      success: true,
      domain: updatedDomain
    }
  } catch (error: any) {
    console.error('Force owner access error:', error)
    return { success: false, error: error.message }
  }
}

export const onDeleteTeam = async () => {
  try {
    const user = await currentUser();
    if (!user) throw new Error('Unauthorized');

    const currentUserData = await client.user.findUnique({
      where: { clerkId: user.id },
      include: {
        team: {
          include: {
            members: true
          }
        }
      }
    });

    if (!currentUserData) throw new Error('User not found');
    
    // Verify user is a team owner
    if (currentUserData.role !== 'OWNER') {
      throw new Error('Only team owners can delete teams');
    }
    
    // Verify user has a team
    if (!currentUserData.team) {
      throw new Error('You are not part of any team');
    }
    
    // Check if there are other members in the team
    const otherMembers = currentUserData.team.members.filter(
      member => member.id !== currentUserData.id
    );
    
    if (otherMembers.length > 0) {
      throw new Error('You must remove all team members before deleting the team');
    }
    
    // Get team ID for reference
    const teamId = currentUserData.team.id;
    
    // Update the user to remove team association and reset role to MEMBER
    await client.user.update({
      where: { id: currentUserData.id },
      data: {
        teamId: null,
        role: 'MEMBER'
      }
    });
    
    // Delete the team
    await client.team.delete({
      where: { id: teamId }
    });
    
    revalidatePath('/team');
    return { success: true, message: 'Team deleted successfully' };
  } catch (error: any) {
    console.error('Delete team error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get the current user's team and domains
 */
export async function onGetTeamAndDomains() {
  try {
    // Get current user
    const user = await currentUser();
    if (!user) {
      return { success: false, message: 'Not authenticated' };
    }
    
    // Get current user's profile with team and domains
    const userProfile = await client.user.findUnique({
      where: { clerkId: user.id },
      include: { 
        team: {
          include: {
            domains: true
          }
        },
        domains: true
      }
    });
    
    if (!userProfile) {
      return { success: false, message: 'User profile not found' };
    }
    
    // Combine team domains and user domains
    const teamDomains = userProfile.team?.domains || [];
    const personalDomains = userProfile.domains || [];
    
    // Remove duplicates and format for frontend
    const allDomains = [...teamDomains, ...personalDomains]
      .filter((domain, index, self) => 
        index === self.findIndex(d => d.id === domain.id)
      )
      .map(domain => ({
        id: domain.id,
        name: domain.name,
        icon: domain.icon || '',
        teamId: domain.teamId,
        userId: domain.userId
      }));
    
    return { 
      success: true, 
      domains: allDomains,
      team: userProfile.team 
        ? {
            id: userProfile.team.id,
            name: userProfile.team.name
          }
        : null
    };
  } catch (error) {
    console.error('Error getting team and domains:', error);
    return { success: false, message: 'Error getting team and domains' };
  }
} 