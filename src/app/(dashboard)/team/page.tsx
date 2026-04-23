'use client';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

import { onCheckEmailExists, onGetPendingInvitations, onGetTeamMembers, onInviteTeamMember, onAcceptInvitation, onRejectInvitation, onLeaveTeam, onUpdateMemberRole, onUpdateDomainAccess, onRemoveMember, onForceOwnerDomainAccess } from '@/actions/team';
import { onCreateTeam, onDeleteTeam } from '@/actions/team/index';
import { generateTeamJoinCode, invalidateTeamJoinCode, joinTeamWithCode, sendJoinCodeViaEmail } from '@/actions/team/joinCode';
import { ensureUserExists } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription, 
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlusCircle, Mail, MoreVertical, Check, X, Loader2, Building, LogOut, Shield, Users, Settings, MessageSquare, Trash2, Target, MessageCircle, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useDebounce } from 'use-debounce';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import InfoBar from '@/components/infobar';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { UserRole, InvitationStatus } from '@prisma/client';
import AnnouncementForm from '@/components/team/AnnouncementForm';
import RecognitionForm from '@/components/team/RecognitionForm';
import TeamGoalsSection from '@/components/team/TeamGoalsSection';
import { getTeamGoals } from '@/actions/team';
import React from 'react';

type Member = {
  id: string;
  fullname: string;
  type: string;
  role: string;
  email: string;
  image: null;
}

type ChatRoom = {
  id: string;
  live: boolean;
  createdAt: Date;
}

type Customer = {
  id: string;
  email: string | null;
}

type Domain = {
  id: string;
  name: string;
  icon: string;
  teamId: string | null;
  userId: string | null;
  campaignId: string | null;
  permissions: any;
  chatRooms: ChatRoom[];
  customers: Customer[];
}

type Team = {
  id: string;
  name: string;
  ownerId: string;
  owner: {
    fullname: string;
    email: string;
  };
  domains: Domain[];
  settings?: {
    id: string;
    recognitionMessage?: string | null;
  } | null;
}

type CurrentUser = {
  id: string;
  role: string;
  email: string;
}

type TeamMembersResponse = {
  success: boolean;
  members: Member[];
  team: Team | null;
  currentUser: CurrentUser;
  message?: string;
  error?: string;
}

// Add type for permissions
type DomainPermissions = {
  canModifyName: boolean;
  canModifyIcon: boolean;
  canModifyChat: boolean;
  canDelete: boolean;
}

type TeamMember = {
  id: string;
  fullname: string;
  email: string;
  role: UserRole;
  type: string;
  image: string | null;
}

type InvitationState = {
  sentInvitations: Invitation[];
  receivedInvitations: Invitation[];
}

type Invitation = {
  id: string;
  email: string;
  role: UserRole;
  status: InvitationStatus;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  senderId: string;
  receiverId: string | null;
  sender: {
    fullname: string;
    email: string;
  };
  receiver: {
    fullname: string;
    email: string;
  } | null;
}

type UserDetails = {
  fullname: string;
  role: UserRole;
  email: string;
}

export default function TeamManagementPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [team, setTeam] = useState<Team | null>(null);
  const [invitations, setInvitations] = useState<InvitationState>({
    sentInvitations: [],
    receivedInvitations: []
  });
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
  const [hasPendingInvite, setHasPendingInvite] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('MEMBER');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [selectedDomainId, setSelectedDomainId] = useState<string>('');
  const [permissions, setPermissions] = useState<DomainPermissions>({
    canModifyName: false,
    canModifyIcon: false,
    canModifyChat: false,
    canDelete: false
  });
  const [hasCheckedPermissions, setHasCheckedPermissions] = useState(false);
  const [goals, setGoals] = useState({
    newClients: { current: 0, target: 10 },
    interactions: { current: 0, target: 50 },
    tickets: { current: 0, target: 20 }
  });
  const [isJoinCodeDialogOpen, setIsJoinCodeDialogOpen] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinCodeLoading, setJoinCodeLoading] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [invalidatingCode, setInvalidatingCode] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const [debouncedEmail] = useDebounce(inviteEmail, 500);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // First ensure the user exists in our database
      const userResult = await ensureUserExists();
      if (!userResult || !userResult.user) {
        console.error("Failed to ensure user exists");
        toast.error("Authentication error. Please try refreshing the page.");
        return;
      }

      // Fetch all required data in parallel to improve performance
      const [membersRes, invitationsRes] = await Promise.all([
        onGetTeamMembers(),
        onGetPendingInvitations()
      ]);

      // Set team goals if membersRes.team exists
      if (membersRes.team?.id) {
        const teamGoals = await getTeamGoals(membersRes.team.id);
        if (teamGoals) {
          setGoals(teamGoals);
        }
      }
      
      if (membersRes.success) {
        if (membersRes.message) {
          toast.info(membersRes.message);
        }
        setMembers(membersRes.members || []);
        if (membersRes.team) {
          // Just use the domains from the team response to avoid duplication
          const teamData: Team = {
            id: membersRes.team.id,
            name: membersRes.team.name,
            ownerId: membersRes.team.ownerId || '',
            owner: membersRes.team.owner || { fullname: '', email: '' },
            domains: (membersRes.team.domains || []).map(d => ({
              id: d.id,
              name: d.name,
              icon: d.icon,
              teamId: d.teamId,
              userId: d.userId,
              campaignId: d.campaignId,
              permissions: d.permissions,
              chatRooms: [], // Default empty array
              customers: []  // Default empty array
            })),
            settings: (membersRes.team as any).settings || null
          };
          
          // Debug the team settings and join code
          console.log('Team settings loaded:', {
            hasSettings: !!teamData.settings,
            recognitionMessage: teamData.settings?.recognitionMessage
          });
          
          // Try to parse the join code if it exists
          if (teamData.settings?.recognitionMessage) {
            try {
              const parsedMessage = JSON.parse(teamData.settings.recognitionMessage);
              console.log('Parsed join code:', parsedMessage);
            } catch (e) {
              console.error('Failed to parse join code:', e);
            }
          }
          
          setTeam(teamData);
          
          // Simple domain debugging with less verbose output
          console.log('Team data loaded:', {
            teamId: teamData.id,
            teamName: teamData.name,
            domainsCount: teamData.domains.length
          });
        }
        if (membersRes.currentUser) {
          const currentUser = membersRes.currentUser as any;
          setCurrentUserRole(currentUser.role as UserRole);
          setCurrentUserId(currentUser.id || '');
          setUserDetails({
            fullname: currentUser.fullname || '',
            email: currentUser.email || '',
            role: currentUser.role as UserRole
          });
        }
      }

      if (invitationsRes.success) {
        // Process invitations with proper typing
        const sentInvites = (invitationsRes.sentInvitations || []).map(inv => ({
          ...inv,
          sender: {
            fullname: inv.sender?.fullname || '',
            email: inv.sender?.email || ''
          },
          receiver: inv.receiver || null
        }));
        
        const receivedInvites = (invitationsRes.receivedInvitations || []).map(inv => ({
          ...inv,
          sender: {
            fullname: inv.sender?.fullname || '',
            email: inv.sender?.email || ''
          },
          receiver: inv.receiver || null
        }));
        
        // Log detailed information about received invitations for debugging
        console.log('All received invitations:', receivedInvites.map(inv => ({
          id: inv.id,
          from: inv.sender?.fullname || 'Unknown',
          email: inv.email,
          status: inv.status,
          token: inv.token,
          role: inv.role,
          receiverId: inv.receiverId
        })));
        
        // Filter to show ALL pending invitations plus any that match current user
        const filteredReceived = receivedInvites.filter(inv => {
          // Show all PENDING invitations regardless of email - this ensures we don't filter too aggressively
          if (inv.status === 'PENDING') return true;
          
          // For non-pending invitations, check if they're for this user
          const currentUserEmail = userDetails?.email?.toLowerCase();
          const invitationEmail = inv.email?.toLowerCase();
          
          // More lenient matching that handles email variations and receiverId
          const isForCurrentUser = 
            (currentUserEmail && invitationEmail && invitationEmail.includes(currentUserEmail)) || 
            (currentUserEmail && invitationEmail && currentUserEmail.includes(invitationEmail)) ||
            inv.receiverId === currentUserId;
            
          return isForCurrentUser;
        });
        
        console.log('Filtered received invitations (improved logic):', filteredReceived.length);
        
        // Set the processed invitations
        setInvitations({
          sentInvitations: sentInvites as Invitation[],
          receivedInvitations: filteredReceived as Invitation[]
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load team data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const checkEmail = async () => {
      if (!debouncedEmail || !debouncedEmail.includes('@')) {
        setEmailExists(null);
        setHasPendingInvite(false);
        setUserDetails(null);
        return;
      }

      setIsCheckingEmail(true);
      try {
        const result = await onCheckEmailExists(debouncedEmail);
        console.log('Email check response:', result); // Debug log
        if (result.success) {
          setEmailExists(result.exists ?? null);
          setHasPendingInvite(result.hasPendingInvite ?? false);
          setUserDetails(result.userDetails ?? null);
        }
      } catch (error) {
        console.error('Failed to check email:', error);
        setEmailExists(null);
        setHasPendingInvite(false);
        setUserDetails(null);
      } finally {
        setIsCheckingEmail(false);
      }
    };

    checkEmail();
  }, [debouncedEmail]);

  const handleInvite = async () => {
    try {
      // Validate email
      if (!inviteEmail) {
        toast.error('Please enter an email address');
        return;
      }

      if (!inviteEmail.includes('@')) {
        toast.error('Please enter a valid email address');
        return;
      }

      if (!emailExists) {
        toast.error('This email is not registered in your Clerk account');
        return;
      }

      if (hasPendingInvite) {
        toast.error('This email already has a pending invitation');
        return;
      }

      setIsLoading(true);
      const result = await onInviteTeamMember(inviteEmail, inviteRole);
      
      if (result.success) {
        toast.success('Invitation sent successfully');
        setIsInviteOpen(false);
        setInviteEmail('');
        setInviteRole('MEMBER');
        setEmailExists(null);
        setHasPendingInvite(false);
        setUserDetails(null);
        loadData();
      } else {
        toast.error(result.error || 'Failed to send invitation');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvitation = async (token: string) => {
    try {
      setIsLoading(true);
      const result = await onAcceptInvitation(token);
      
      if (result.success) {
        // Immediately update the UI to show the invitation as accepted
        setInvitations(prev => ({
          ...prev,
          receivedInvitations: prev.receivedInvitations.map(inv => 
            inv.token === token 
              ? { ...inv, status: 'ACCEPTED' as InvitationStatus } 
              : inv
          )
        }));
        
        toast.success('Invitation accepted successfully');
        
        // Reload all data to ensure everything is in sync
        await loadData();
      } else {
        toast.error(result.error || 'Failed to accept invitation');
      }
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      toast.error(error.message || 'Failed to accept invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectInvitation = async (token: string) => {
    try {
      setIsLoading(true);
      const result = await onRejectInvitation(token);
      
      if (result.success) {
        // Immediately update the UI to remove the rejected invitation
        setInvitations(prev => ({
          ...prev,
          receivedInvitations: prev.receivedInvitations.map(inv => 
            inv.token === token 
              ? { ...inv, status: 'REJECTED' as InvitationStatus } 
              : inv
          )
        }));
        
        toast.success('Invitation rejected');
        
        // Reload all data to ensure everything is in sync
        await loadData();
      } else {
        toast.error(result.error || 'Failed to reject invitation');
      }
    } catch (error: any) {
      console.error('Error rejecting invitation:', error);
      toast.error(error.message || 'Failed to reject invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveTeam = async () => {
    try {
      const result = await onLeaveTeam();
      if (result.success) {
        toast.success('You have left the team');
        loadData();
      } else {
        toast.error(result.error || 'Failed to leave team');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to leave team');
    }
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: UserRole) => {
    try {
      const result = await onUpdateMemberRole(memberId, newRole as "OWNER" | "ADMIN" | "MEMBER");
      if (result.success) {
        toast.success('Member role updated successfully');
        loadData();
      } else {
        toast.error(result.error || 'Failed to update member role');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update member role');
    }
  };

  const handleManageDomainAccess = async (memberId: string, domainId: string, hasAccess: boolean) => {
    try {
      console.log(`Managing domain access: memberId=${memberId}, domainId=${domainId}, hasAccess=${hasAccess}`);
      
      // Check if the target member is an owner or admin
      const targetMember = members.find(m => m.id === memberId);
      
      // Set permissions based on the member's role
      let permissions = {
        canModifyName: false,
        canModifyIcon: false,
        canModifyChat: false,
        canDelete: false
      };
      
      // If member is owner or admin, grant all permissions
      if (targetMember && (targetMember.role === 'OWNER' || targetMember.role === 'ADMIN')) {
        console.log(`Setting full permissions for ${targetMember.fullname} (${targetMember.role})`);
        permissions = {
          canModifyName: true,
          canModifyIcon: true,
          canModifyChat: true,
          canDelete: true
        };
      }

      const result = await onUpdateDomainAccess(memberId, domainId, hasAccess, hasAccess ? permissions : undefined);
      console.log('Domain access update result:', result);
      
      if (result.success) {
        toast.success('Domain access updated successfully');
        // Reload data to reflect the changes
        await loadData();
      } else {
        toast.error(result.error || 'Failed to update domain access');
      }
    } catch (error: any) {
      console.error('Error updating domain access:', error);
      toast.error(error.message || 'Failed to update domain access');
    }
  };

  const handleCreateTeam = async () => {
    try {
      console.log("Creating team - starting request");
      setIsLoading(true);
      const result = await onCreateTeam();
      console.log("Create team result:", result);
      if (result.success) {
        toast.success('Team created successfully');
        await loadData();
      } else {
        toast.error(result.error || 'Failed to create team');
      }
    } catch (error: any) {
      console.error("Error creating team:", error);
      toast.error(error.message || 'Failed to create team');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const result = await onRemoveMember(memberId);
      if (result.success) {
        toast.success('Member removed successfully');
        loadData();
      } else {
        toast.error(result.error || 'Failed to remove member');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove member');
    }
  };

  // Add permissions modal component
  const PermissionsModal = ({ memberId, domainId }: { memberId: string; domainId: string }) => {
    const [modalPermissions, setModalPermissions] = useState<DomainPermissions>({
      canModifyName: false,
      canModifyIcon: false,
      canModifyChat: false,
      canDelete: false
    });
    
    // Detect if user is owner or admin and set full permissions by default
    useEffect(() => {
      const targetMember = members.find(m => m.id === memberId);
      if (targetMember && (targetMember.role === 'OWNER' || targetMember.role === 'ADMIN')) {
        console.log(`Setting default full permissions for ${targetMember.fullname} (${targetMember.role})`);
        setModalPermissions({
          canModifyName: true,
          canModifyIcon: true,
          canModifyChat: true,
          canDelete: true
        });
      }
    }, [memberId, members]);

    // Load existing permissions when modal opens
    useEffect(() => {
      const domain = team?.domains.find(d => d.id === domainId);
      if (domain?.permissions) {
        try {
          const permissionsObj = typeof domain.permissions === 'string' 
            ? JSON.parse(domain.permissions) 
            : domain.permissions;
            
          // Check if we have the new access model with accessUsers
          if (permissionsObj.accessUsers) {
            // Find this member's permissions in the accessUsers array
            const userAccess = permissionsObj.accessUsers.find((u: any) => u.userId === memberId);
            
            if (userAccess && userAccess.permissions) {
              // Use the member-specific permissions
              setModalPermissions({
                canModifyName: userAccess.permissions.canModifyName ?? false,
                canModifyIcon: userAccess.permissions.canModifyIcon ?? false,
                canModifyChat: userAccess.permissions.canModifyChat ?? false,
                canDelete: userAccess.permissions.canDelete ?? false
              });
              return;
            }
          }
          
          // Fall back to old permissions model if needed
          setModalPermissions({
            canModifyName: permissionsObj.canModifyName ?? false,
            canModifyIcon: permissionsObj.canModifyIcon ?? false,
            canModifyChat: permissionsObj.canModifyChat ?? false,
            canDelete: permissionsObj.canDelete ?? false
          });
        } catch (e) {
          console.error('Error parsing permissions:', e);
          
          // If parsing fails but user is admin/owner, set full permissions
          const targetMember = members.find(m => m.id === memberId);
          if (targetMember && (targetMember.role === 'OWNER' || targetMember.role === 'ADMIN')) {
            setModalPermissions({
              canModifyName: true,
              canModifyIcon: true,
              canModifyChat: true,
              canDelete: true
            });
          } else {
            setModalPermissions({
              canModifyName: false,
              canModifyIcon: false,
              canModifyChat: false,
              canDelete: false
            });
          }
        }
      }
    }, [domainId, memberId, team?.domains, members]);

    const handleSavePermissions = async () => {
      try {
        // Ensure owners and admins always have full permissions
        let finalPermissions = { ...modalPermissions };
        
        if (member && (member.role === 'OWNER' || member.role === 'ADMIN')) {
          console.log(`Ensuring full permissions for ${member.fullname} (${member.role})`);
          finalPermissions = {
            canModifyName: true,
            canModifyIcon: true,
            canModifyChat: true,
            canDelete: true
          };
        }
        
        console.log("Saving permissions:", {
          memberId,
          domainId,
          permissions: finalPermissions
        });
        
        const result = await onUpdateDomainAccess(memberId, domainId, true, finalPermissions);
        console.log("Save permissions result:", result);
        
        if (result.success) {
          toast.success('Permissions updated successfully');
          setIsPermissionsModalOpen(false);
          // Force a complete reload to ensure updated data
          await loadData();
        } else {
          toast.error(result.error || 'Failed to update permissions');
        }
      } catch (error: any) {
        console.error("Permission save error:", error);
        toast.error(error.message || 'Failed to update permissions');
      }
    };

    const domain = team?.domains.find(d => d.id === domainId);
    const member = members.find(m => m.id === memberId);

    return (
      <Dialog open={isPermissionsModalOpen} onOpenChange={setIsPermissionsModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-800 dark:text-gray-100">Manage Domain Permissions</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Configure what {member?.fullname} can do with the domain {domain?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {/* Quick action button to enable all permissions */}
            {member && (member.role === 'OWNER' || member.role === 'ADMIN') && (
              <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-md px-4 py-3 mb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300">
                      Owner/Admin privileges
                    </p>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400">
                      As an {member.role.toLowerCase()}, full permissions are recommended.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setModalPermissions({
                        canModifyName: true,
                        canModifyIcon: true,
                        canModifyChat: true,
                        canDelete: true
                      });
                    }}
                    variant="outline"
                    className="bg-indigo-100 dark:bg-indigo-800 hover:bg-indigo-200 dark:hover:bg-indigo-700 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700"
                  >
                    Enable All Permissions
                  </Button>
                </div>
              </div>
            )}
            <div className="space-y-4">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none text-gray-800 dark:text-gray-200">Modify Domain Name</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Allow changing the domain name
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={modalPermissions.canModifyName}
                  onClick={() => setModalPermissions(prev => ({ ...prev, canModifyName: !prev.canModifyName }))}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    modalPermissions.canModifyName ? "bg-indigo-600 dark:bg-indigo-500" : "bg-zinc-200 dark:bg-zinc-700"
                  )}
                >
                  <span className={cn(
                    "inline-block h-5 w-5 rounded-full bg-white transition-transform",
                    modalPermissions.canModifyName ? "translate-x-6" : "translate-x-1"
                  )} />
                </button>
              </div>

              <div className="flex items-center justify-between space-x-4">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none text-gray-800 dark:text-gray-200">Modify Domain Icon</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Allow changing the domain icon
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={modalPermissions.canModifyIcon}
                  onClick={() => setModalPermissions(prev => ({ ...prev, canModifyIcon: !prev.canModifyIcon }))}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    modalPermissions.canModifyIcon ? "bg-indigo-600 dark:bg-indigo-500" : "bg-zinc-200 dark:bg-zinc-700"
                  )}
                >
                  <span className={cn(
                    "inline-block h-5 w-5 rounded-full bg-white transition-transform",
                    modalPermissions.canModifyIcon ? "translate-x-6" : "translate-x-1"
                  )} />
                </button>
              </div>

              <div className="flex items-center justify-between space-x-4">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none text-gray-800 dark:text-gray-200">Modify Chat Settings</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Allow configuring chat bot settings
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={modalPermissions.canModifyChat}
                  onClick={() => setModalPermissions(prev => ({ ...prev, canModifyChat: !prev.canModifyChat }))}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    modalPermissions.canModifyChat ? "bg-indigo-600 dark:bg-indigo-500" : "bg-zinc-200 dark:bg-zinc-700"
                  )}
                >
                  <span className={cn(
                    "inline-block h-5 w-5 rounded-full bg-white transition-transform",
                    modalPermissions.canModifyChat ? "translate-x-6" : "translate-x-1"
                  )} />
                </button>
              </div>

              <div className="flex items-center justify-between space-x-4">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none text-red-600 dark:text-red-400">Delete Domain</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Allow deleting the domain (use with caution)
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={modalPermissions.canDelete}
                  onClick={() => setModalPermissions(prev => ({ ...prev, canDelete: !prev.canDelete }))}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    modalPermissions.canDelete ? "bg-red-600 dark:bg-red-500" : "bg-zinc-200 dark:bg-zinc-700"
                  )}
                >
                  <span className={cn(
                    "inline-block h-5 w-5 rounded-full bg-white transition-transform",
                    modalPermissions.canDelete ? "translate-x-6" : "translate-x-1"
                  )} />
                </button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsPermissionsModalOpen(false)}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSavePermissions}
              className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              Save Permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // Add these loading components before the return statement
  const LoadingSkeleton = () => (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card rounded-lg border p-6">
            <Skeleton className="h-5 w-32 mb-4" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Members Table Skeleton */}
      <div className="bg-card rounded-lg border">
        <div className="p-6">
          <Skeleton className="h-7 w-40 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Add this after the loadData function
  const ensureOwnerFullPermissions = async () => {
    if (currentUserRole !== 'OWNER' || !team) return;
    
    setIsLoading(true);
    try {
      console.log("Ensuring owner has full permissions for all domains");
      
      // Find all domains connected to the team
      const teamDomains = team.domains || [];
      
      if (teamDomains.length === 0) {
        toast.info("No domains found to update permissions");
        return;
      }
      
      toast.info(`Setting owner permissions for ${teamDomains.length} domains...`);
      
      // Process each domain in sequence for more reliability
      let successCount = 0;
      let failCount = 0;
      
      for (const domain of teamDomains) {
        try {
          // Use the specialized function for setting owner permissions
          const result = await onForceOwnerDomainAccess(domain.id);
          
          if (result.success) {
            successCount++;
            console.log(`Successfully set owner permissions for domain ${domain.name} (${domain.id})`);
          } else {
            failCount++;
            console.error(`Failed to set owner permissions for domain ${domain.name}:`, result.error);
          }
        } catch (error) {
          failCount++;
          console.error(`Error processing domain ${domain.name}:`, error);
        }
      }
      
      if (successCount > 0) {
        toast.success(`Full permissions granted for ${successCount} domains`);
      }
      
      if (failCount > 0) {
        toast.error(`Failed to update permissions for ${failCount} domains`);
      }
      
      // Mark that we've checked permissions
      setHasCheckedPermissions(true);
      
      // Reload data to reflect changes, only if we need to
      if (successCount > 0) {
        await loadData();
      }
      
    } catch (error) {
      console.error("Error ensuring owner permissions:", error);
      toast.error("Failed to update owner permissions");
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-grant permissions to owner when the team data is loaded
  useEffect(() => {
    if (team && currentUserRole === 'OWNER' && team.domains.length > 0 && !hasCheckedPermissions && !isLoading) {
      // Only run this once per session and only if not already loading
      console.log("Owner detected. Checking/ensuring full permissions for all domains...");
      
      // Set this first to prevent double-triggering
      setHasCheckedPermissions(true);
      
      // Schedule this slightly after initial render to ensure component is fully mounted
      const timer = setTimeout(() => {
        console.log("Auto-running ensureOwnerFullPermissions");
        ensureOwnerFullPermissions();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [team, currentUserRole, hasCheckedPermissions, isLoading]);

  // Add this after the existing functions:
  const handleDeleteTeam = async () => {
    try {
      setIsLoading(true);
      const result = await onDeleteTeam();
      
      if (result.success) {
        toast.success('Team deleted successfully');
        loadData();
      } else {
        toast.error(result.error || 'Failed to delete team');
      }
    } catch (error: any) {
      console.error('Error deleting team:', error);
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleGenerateJoinCode = async () => {
    try {
      console.log('Starting join code generation');
      setGeneratingCode(true);
      const result = await generateTeamJoinCode();
      console.log('Join code generation result:', result);
      
      if (result.success) {
        toast.success('Join code generated successfully');
        
        // Update the team state with the new join code immediately
        if (team) {
          // Create a new settings object if it doesn't exist
          const newSettings = team.settings 
            ? { 
                ...team.settings,
                id: team.settings.id || '',
                recognitionMessage: JSON.stringify({
                  joinCode: result.joinCode,
                  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                })
              }
            : {
                id: '',
                teamId: team.id,
                recognitionMessage: JSON.stringify({
                  joinCode: result.joinCode,
                  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                })
              };
          
          const updatedTeam: Team = {
            ...team,
            settings: newSettings
          };
          
          console.log('Updated team with new join code:', updatedTeam);
          setTeam(updatedTeam);
        }
        
        // Also reload data from server to ensure everything is in sync
        setTimeout(() => {
          loadData();
        }, 500);
      } else {
        toast.error(result.error || 'Failed to generate join code');
      }
    } catch (error: any) {
      console.error('Error generating join code:', error);
      toast.error(error.message || 'An error occurred');
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleInvalidateJoinCode = async () => {
    try {
      setInvalidatingCode(true);
      const result = await invalidateTeamJoinCode();
      
      if (result.success) {
        toast.success('Join code invalidated successfully');
        loadData();
      } else {
        toast.error(result.error || 'Failed to invalidate join code');
      }
    } catch (error: any) {
      console.error('Error invalidating join code:', error);
      toast.error(error.message || 'An error occurred');
    } finally {
      setInvalidatingCode(false);
    }
  };

  const handleJoinTeamWithCode = async () => {
    try {
      if (!joinCodeInput) {
        toast.error('Please enter a join code');
        return;
      }
      
      setJoinCodeLoading(true);
      const result = await joinTeamWithCode(joinCodeInput);
      
      if (result.success) {
        toast.success(result.message || 'Successfully joined the team');
        setIsJoinCodeDialogOpen(false);
        setJoinCodeInput('');
        loadData();
      } else {
        toast.error(result.error || 'Failed to join team');
      }
    } catch (error: any) {
      console.error('Error joining team with code:', error);
      toast.error(error.message || 'An error occurred');
    } finally {
      setJoinCodeLoading(false);
    }
  };

  // Add this before the return statement
  useEffect(() => {
      // Debug logs for join code
  if (team?.settings) {
    const hasCode = !!team.settings.recognitionMessage;
    console.log('Has recognition message (useEffect):', hasCode);
    
    // Try to parse the join code if it exists
    if (hasCode) {
      try {
        const parsed = JSON.parse(team.settings.recognitionMessage as string);
        console.log('Join code from useEffect:', parsed);
      } catch (e) {
        console.error('Error parsing join code in useEffect:', e);
      }
    }
  }
  }, [team]);

  // Add this before the return statement
  useEffect(() => {
    // Debug logs for team settings
    if (team) {
      console.log('DEBUG - Team object in effect:', team);
      console.log('DEBUG - Team settings in effect:', team.settings);
      
      if (team.settings?.recognitionMessage) {
        try {
          const data = JSON.parse(team.settings.recognitionMessage);
          console.log('DEBUG - Parsed join code in effect:', data);
        } catch (e) {
          console.error('DEBUG - Error parsing join code in effect:', e);
        }
      }
    }
  }, [team]);

  const handleSendJoinCodeEmail = async () => {
    if (!shareEmail) {
      toast.error('Please enter an email address');
      return;
    }
    
    if (!team) {
      toast.error('Team information not available');
      return;
    }

    try {
      setSendingEmail(true);
      
      // Get the join code from the team settings
      if (!team.settings?.recognitionMessage) {
        toast.error('No join code found. Please generate a code first.');
        return;
      }
      
      let joinCode = '';
      try {
        const data = JSON.parse(team.settings.recognitionMessage);
        if (data && data.joinCode) {
          joinCode = data.joinCode;
        } else {
          toast.error('Invalid join code format');
          return;
        }
      } catch (e) {
        console.error("Error parsing join code:", e);
        toast.error('Invalid join code format');
        return;
      }
      
      const result = await sendJoinCodeViaEmail(shareEmail, joinCode, team.name);
      
      if (result.success) {
        toast.success(result.message || 'Join code sent successfully');
        setShareEmail('');
        setIsShareModalOpen(false);
      } else {
        toast.error(result.error || 'Failed to send join code');
      }
    } catch (error: any) {
      console.error('Error sending join code via email:', error);
      toast.error(error.message || 'An error occurred');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 mr-5 ml-1">
      <InfoBar />
      <div className="overflow-y-auto w-full chat-window rounded-xl shadow-lg flex-1 h-0 flex flex-col gap-8 p-8 bg-slate-50 dark:bg-slate-900">
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <div className="space-y-6">
            {/* Header Section - Refined with better typography and spacing */}
            <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-1">Team Management</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {team ? `${team.name}` : 'You are not currently part of a team'}
                </p>
              </div>
              {!team ? (
                <div className="flex flex-col items-end gap-4">
                  <div className="flex gap-2">
                    <Button 
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                      onClick={handleCreateTeam}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-1" />
                          Creating...
                        </>
                      ) : (
                        <div className="flex text-white items-center gap-2">
                          <PlusCircle className="w-4 h-4" />
                          Create Team
                        </div>
                      )}
                    </Button>
                    
                    <Dialog open={isJoinCodeDialogOpen} onOpenChange={setIsJoinCodeDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                          <LogOut className="w-4 h-4" />
                          Join with Code
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
                        <DialogHeader>
                          <DialogTitle className="text-gray-800 dark:text-gray-100">Join Existing Team</DialogTitle>
                          <DialogDescription className="text-gray-600 dark:text-gray-400">
                            Enter the code provided by your team owner to join their team.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Team Join Code
                            </label>
                            <Input
                              placeholder="Enter join code"
                              value={joinCodeInput}
                              onChange={(e) => setJoinCodeInput(e.target.value)}
                              className="bg-white dark:bg-slate-900"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button 
                            variant="outline" 
                            onClick={() => setIsJoinCodeDialogOpen(false)}
                            className="border-gray-300 dark:border-gray-600"
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleJoinTeamWithCode} 
                            disabled={joinCodeLoading}
                            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                          >
                            {joinCodeLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Joining...
                              </>
                            ) : (
                              'Join Team'
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {invitations.receivedInvitations.length > 0 
                      ? 'You have pending team invitations. Check them below.'
                      : 'Create a team or join an existing one with a code.'}
                  </p>
                </div>
              ) : currentUserRole === 'OWNER' && (
                <div className="flex items-center gap-3">
                  <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600">
                        <PlusCircle className="w-4 h-4" />
                        Invite Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
                      <DialogHeader>
                        <DialogTitle className="text-gray-800 dark:text-gray-100">Invite Team Member</DialogTitle>
                        <DialogDescription className="text-gray-600 dark:text-gray-400">
                          Send an invitation to add a new team member.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        handleInvite();
                      }} className="space-y-4">
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <label>Email</label>
                            <div className="relative">
                              <Input
                                type="email"
                                required
                                placeholder="Enter email address"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                className={cn(
                                  "pr-10",
                                  emailExists === false && "border-red-500 focus-visible:ring-red-500",
                                  emailExists === true && "border-green-500 focus-visible:ring-green-500"
                                )}
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                {isCheckingEmail ? (
                                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                ) : inviteEmail && inviteEmail.includes('@') ? (
                                  emailExists === true ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                  ) : emailExists === false ? (
                                    <X className="h-4 w-4 text-red-500" />
                                  ) : null
                                ) : null}
                              </div>
                            </div>
                            {emailExists === false && !hasPendingInvite && (
                              <p className="text-sm text-red-500 mt-1">
                                This email is not registered.
                              </p>
                            )}
                            {hasPendingInvite && (
                              <p className="text-sm text-amber-500 mt-1">
                                This user already has a pending invitation.
                              </p>
                            )}
                            {emailExists === true && !hasPendingInvite && (
                              <div className="text-sm mt-1">
                                <p className="text-green-500">
                                  Email is valid and can be invited
                                </p>
                                {userDetails && (
                                  <p className="text-gray-600 mt-1">
                                    User: {userDetails.fullname} ({userDetails.role})
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <label>Role</label>
                            <Select 
                              value={inviteRole} 
                              onValueChange={(value: 'ADMIN' | 'MEMBER') => setInviteRole(value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                                <SelectItem value="MEMBER">Member</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsInviteOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit"
                            disabled={isLoading || !inviteEmail}
                          >
                            {isLoading ? 'Sending...' : 'Send Invitation'}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2 border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:border-red-500 dark:text-red-500"
                        disabled={isLoading || (members && members.length > 1)}
                        title={members && members.length > 1 ? "Remove all team members first" : "Delete your team"}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Team
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
                      <DialogHeader>
                        <DialogTitle className="text-red-600 dark:text-red-400">Delete Team</DialogTitle>
                        <DialogDescription className="text-gray-600 dark:text-gray-400">
                          This will permanently delete your team. This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 mb-4">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Requirements for deleting a team:</h3>
                              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                                <ul className="list-disc space-y-1 pl-5">
                                  <li>You must be the team owner</li>
                                  <li>You must remove all team members first</li>
                                  <li>All team resources will be lost</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                        {members && members.length > 1 ? (
                          <p className="text-amber-600 dark:text-amber-400 text-sm font-medium">
                            You still have {members.length - 1} team members. Please remove all members before deleting the team.
                          </p>
                        ) : null}
                      </div>
                      <DialogFooter>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsDeleteDialogOpen(false)}
                          className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          Cancel
                        </Button>
                        <Button 
                          className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                          onClick={handleDeleteTeam}
                          disabled={isLoading || (members && members.length > 1)}
                        >
                          {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          {isLoading ? 'Deleting...' : 'Delete Team'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>

            {/* Display invitations at the top level when user has no team - Improved with more professional styling */}
            {!team && invitations.receivedInvitations.length > 0 && (
              <div className="w-full bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Pending Team Invitations</h2>
                <div className="space-y-4">
                  {invitations.receivedInvitations.map((invitation) => (
                    <Card key={invitation.id} className="border border-gray-200 dark:border-gray-700 shadow-none bg-white dark:bg-slate-800">
                      <CardContent className="py-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-gray-200">
                              <AvatarFallback className="text-lg bg-indigo-50 text-indigo-600">
                                {invitation.sender?.fullname?.substring(0, 2) || '??'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-base font-medium text-gray-800 dark:text-gray-200">{invitation.sender?.fullname || 'Unknown Sender'}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                  invitation.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {invitation.role}
                                </span>
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-50 text-amber-700">
                                  Pending
                                </span>
                              </div>
                            </div>
                          </div>
                          {invitation.status === 'PENDING' && (
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-green-600 text-green-600 hover:bg-green-50"
                                onClick={() => handleAcceptInvitation(invitation.token)}
                                disabled={isLoading}
                              >
                                <Check className="w-4 h-4 mr-1" /> Accept
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                onClick={() => handleRejectInvitation(invitation.token)}
                                disabled={isLoading}
                              >
                                <X className="w-4 h-4 mr-1" /> Decline
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Stats - Refined design with more professional styling */}
            {team && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-slate-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Members</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{members.length}</div>
                    </CardContent>
                  </Card>
                  <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-slate-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Team Domains</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{team?.domains.length || 0}</div>
                    </CardContent>
                  </Card>
                  <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-slate-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Invites</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        {invitations.sentInvitations.filter(inv => inv.status === 'PENDING').length + invitations.receivedInvitations.length}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Enhanced Analytics - More professional card styling */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-slate-800">
                    <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
                      <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">Domain Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        {team.domains.map((domain) => (
                          <div key={domain.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-indigo-50 dark:bg-indigo-900 flex items-center justify-center">
                                <Building className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                              </div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">{domain.name}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Assigned to: <span className="font-medium">{members.find(m => m.id === domain.userId)?.fullname || 'Unassigned'}</span>
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-slate-800">
                    <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
                      <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">Customer Interactions</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-5">
                        {members.map((member) => {
                          const memberDomains = team.domains.filter(d => d.userId === member.id);
                          return (
                            <div key={member.id} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{member.fullname}</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {memberDomains.length} domain{memberDomains.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                              {memberDomains.map((domain) => (
                                <div key={domain.id} className="flex items-center justify-between pl-4 border-l-2 border-indigo-100 dark:border-indigo-800">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">{domain.name}</span>
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1">
                                      <MessageSquare className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {domain.chatRooms?.length || 0}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Users className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {domain.customers?.length || 0}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Team Roles - Professional card styling */}
                <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-slate-800">
                  <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
                    <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">Team Roles Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5">
                    <div className="space-y-5">
                      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-purple-50 dark:bg-purple-900 flex items-center justify-center">
                            <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Owners</span>
                        </div>
                        <span className="text-xl font-semibold text-gray-800 dark:text-gray-100">{members.filter(m => m.role === 'OWNER').length}</span>
                      </div>
                      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-indigo-50 dark:bg-indigo-900 flex items-center justify-center">
                            <Settings className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Admins</span>
                        </div>
                        <span className="text-xl font-semibold text-gray-800 dark:text-gray-100">{members.filter(m => m.role === 'ADMIN').length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-900 flex items-center justify-center">
                            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Members</span>
                        </div>
                        <span className="text-xl font-semibold text-gray-800 dark:text-gray-100">{members.filter(m => m.role === 'MEMBER').length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Team Join Code - Only visible to Owner */}
                {currentUserRole === 'OWNER' && (
                  <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-slate-800">
                    <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
                      <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">Team Join Code</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-5">
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Generate a code that you can share with others to let them join your team.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="flex-1">
                            {team?.settings?.recognitionMessage ? (
                              (() => {
                                try {
                                  const data = JSON.parse(team.settings.recognitionMessage);
                                  if (data && data.joinCode) {
                                    return (
                                      <div className="flex items-center space-x-2">
                                        <div className="bg-gray-100 dark:bg-gray-800 p-2 px-4 rounded border border-gray-200 dark:border-gray-700 font-mono">
                                          {data.joinCode}
                                        </div>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            navigator.clipboard.writeText(data.joinCode);
                                            toast.success('Join code copied to clipboard');
                                          }}
                                          className="border-gray-300 dark:border-gray-600"
                                          title="Copy to clipboard"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                          </svg>
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => setIsShareModalOpen(true)}
                                          className="border-gray-300 dark:border-gray-600"
                                          title="Share via email"
                                        >
                                          <Mail className="h-4 w-4" />
                                        </Button>
                                        <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
                                          <DialogContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
                                            <DialogHeader>
                                              <DialogTitle className="text-gray-800 dark:text-gray-100">Share Join Code</DialogTitle>
                                              <DialogDescription className="text-gray-600 dark:text-gray-400">
                                                Enter the email address of the person you want to invite to your team.
                                              </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4 py-2">
                                              <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                  Email Address
                                                </label>
                                                <Input
                                                  type="email"
                                                  placeholder="Enter recipient's email"
                                                  value={shareEmail}
                                                  onChange={(e) => setShareEmail(e.target.value)}
                                                  className="bg-white dark:bg-slate-900"
                                                />
                                              </div>
                                            </div>
                                            <DialogFooter>
                                              <Button 
                                                variant="outline" 
                                                onClick={() => {
                                                  setShareEmail('');
                                                  setIsShareModalOpen(false);
                                                }}
                                                className="border-gray-300 dark:border-gray-600"
                                              >
                                                Cancel
                                              </Button>
                                              <Button 
                                                onClick={handleSendJoinCodeEmail} 
                                                disabled={sendingEmail}
                                                className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                                              >
                                                {sendingEmail ? (
                                                  <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Sending...
                                                  </>
                                                ) : (
                                                  'Send Code'
                                                )}
                                              </Button>
                                            </DialogFooter>
                                          </DialogContent>
                                        </Dialog>
                                      </div>
                                    );
                                  }
                                } catch (e) {
                                  console.error("Error parsing join code:", e);
                                }
                                return (
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Invalid join code format.
                                  </p>
                                );
                              })()
                            ) : (
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                No join code generated yet.
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {team?.settings?.recognitionMessage ? (
                              <Button
                                variant="outline"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleInvalidateJoinCode();
                                }}
                                disabled={invalidatingCode}
                                className="flex items-center gap-2 border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950 text-red-600 dark:text-red-400"
                              >
                                {invalidatingCode ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                                Invalidate Code
                              </Button>
                            ) : (
                              <Button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleGenerateJoinCode();
                                }}
                                disabled={generatingCode}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                              >
                                {generatingCode ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                                Generate Code
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Team Communication */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100 dark:border-gray-700">
                      <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">Recent Activity</CardTitle>
                      <Button variant="outline" size="sm" className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 dark:bg-gray-800">View All</Button>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        {invitations.sentInvitations.slice(0, 3).map((invitation) => (
                          <div key={invitation.id} className="flex items-center gap-4 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0">
                            <div className="h-9 w-9 rounded-full bg-indigo-50 dark:bg-indigo-900 flex items-center justify-center">
                              <Mail className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium leading-none text-gray-800 dark:text-gray-200">
                                Invitation sent to {invitation.email}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Status: <span className={invitation.status === 'PENDING' ? 'text-amber-600 dark:text-amber-400' : invitation.status === 'ACCEPTED' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>{invitation.status}</span>
                              </p>
                            </div>
                          </div>
                        ))}
                        {team.domains.slice(0, 2).map((domain) => (
                          <div key={domain.id} className="flex items-center gap-4 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0">
                            <div className="h-9 w-9 rounded-full bg-indigo-50 dark:bg-indigo-900 flex items-center justify-center">
                              <Building className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium leading-none text-gray-800 dark:text-gray-200">
                                Domain {domain.name} {domain.userId ? 'assigned' : 'created'}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {domain.userId 
                                  ? `Assigned to ${members.find(m => m.id === domain.userId)?.fullname}` 
                                  : 'Not assigned'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Invitations section - Professional styling */}
                  <Card className="flex flex-col border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100 dark:border-gray-700">
                      <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">Invitations</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between space-y-6 pt-4">
                      {/* Received Invitations */}
                      {invitations.receivedInvitations.length > 0 && (
                        <div className="flex-1">
                          <h3 className="text-sm font-medium mb-4 text-gray-700 dark:text-gray-300 uppercase tracking-wider">Invitations for You</h3>
                          <div className="space-y-4">
                            {invitations.receivedInvitations.map((invitation) => (
                              <div key={invitation.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 border border-gray-200">
                                      <AvatarFallback className="text-lg bg-indigo-50 text-indigo-600">
                                        {invitation.sender?.fullname?.substring(0, 2) || '??'}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="text-base font-medium text-gray-800 dark:text-gray-200">{invitation.sender?.fullname || 'Unknown Sender'}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                          invitation.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                          {invitation.role}
                                        </span>
                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                          invitation.status === 'PENDING' ? 'bg-amber-50 text-amber-700' :
                                          invitation.status === 'ACCEPTED' ? 'bg-green-50 text-green-700' :
                                          'bg-red-50 text-red-700'
                                        }`}>
                                          {invitation.status}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  {invitation.status === 'PENDING' && (
                                    <div className="flex items-center gap-2">
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="border-green-600 text-green-600 hover:bg-green-50"
                                        onClick={() => handleAcceptInvitation(invitation.token)}
                                        disabled={isLoading}
                                      >
                                        <Check className="w-4 h-4 mr-1" /> Accept
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                        onClick={() => handleRejectInvitation(invitation.token)}
                                        disabled={isLoading}
                                      >
                                        <X className="w-4 h-4 mr-1" /> Decline
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* No invitations message */}
                      {invitations.receivedInvitations.length === 0 && invitations.sentInvitations.length === 0 && (
                        <div className="py-8 text-center">
                          <div className="inline-flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                            <Mail className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                          </div>
                          <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">No Invitations Found</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                            There are no pending invitations. The team leader needs to send an invitation to add new members.
                          </p>
                        </div>
                      )}

                      {/* Sent Invitations */}
                      {invitations.sentInvitations.length > 0 && (
                        <div className="flex-1">
                          <h3 className="text-sm font-medium mb-4 text-gray-700 dark:text-gray-300 uppercase tracking-wider">Sent Invitations</h3>
                          <div className="space-y-4">
                            {invitations.sentInvitations.map((invitation) => (
                              <div key={invitation.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-indigo-50 dark:bg-indigo-900 flex items-center justify-center">
                                      <Mail className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div>
                                      <p className="text-base font-medium text-gray-800 dark:text-gray-200">{invitation.email}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                          invitation.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                          {invitation.role}
                                        </span>
                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                                          invitation.status === 'PENDING' ? 'bg-amber-50 text-amber-700' :
                                          invitation.status === 'ACCEPTED' ? 'bg-green-50 text-green-700' :
                                          'bg-red-50 text-red-700'
                                        }`}>
                                          {invitation.status}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(invitation.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Fill space if there are not many invitations */}
                      {(invitations.receivedInvitations.length + invitations.sentInvitations.length < 2) && (
                        <div className="flex-grow"></div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {/* Team Members Table - Professional styling */}
            {team && members.length > 0 && (
              <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-slate-800 overflow-hidden">
                <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">Team Members</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-gray-50 dark:bg-gray-900">
                      <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <TableHead className="font-medium text-gray-700 dark:text-gray-300">Member</TableHead>
                        <TableHead className="font-medium text-gray-700 dark:text-gray-300">Role</TableHead>
                        <TableHead className="font-medium text-gray-700 dark:text-gray-300">Type</TableHead>
                        <TableHead className="font-medium text-gray-700 dark:text-gray-300">Domains</TableHead>
                        <TableHead className="font-medium text-gray-700 dark:text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.map((member) => (
                        <TableRow key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 border-b dark:border-gray-700 last:border-0">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="border border-gray-200 dark:border-gray-700">
                                <AvatarImage src="/placeholder-avatar.jpg" />
                                <AvatarFallback className="bg-indigo-50 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300">
                                  {member.fullname.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-gray-800 dark:text-gray-200">{member.fullname}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{member.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              member.role === 'OWNER' 
                                ? 'bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                                : member.role === 'ADMIN'
                                ? 'bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                            }`}>
                              {member.role}
                            </span>
                          </TableCell>
                          <TableCell className="text-gray-700 dark:text-gray-300">{member.type}</TableCell>
                          <TableCell>
                            {currentUserRole === 'OWNER' && member.id !== currentUserId ? (
                              <>
                                <Select
                                  onValueChange={(domainId) => {
                                    if (domainId === '_none') {
                                      // Find domains this member has access to
                                      const memberDomains = team.domains.filter(d => {
                                        // Check both direct userId and accessUsers array
                                        if (d.userId === member.id) return true;
                                        
                                        // Check accessUsers if it exists
                                        const permissionsObj = d.permissions ? 
                                          (typeof d.permissions === 'string' ? JSON.parse(d.permissions) : d.permissions) : 
                                          {};
                                        const accessUsers = permissionsObj.accessUsers || [];
                                        return accessUsers.some((u: any) => u.userId === member.id);
                                      });
                                      
                                      // Debugging for member domains
                                      console.log(`Domains for member ${member.fullname}:`, memberDomains);
                                      
                                      // Revoke access to all member's domains
                                      memberDomains.forEach(domain => {
                                        handleManageDomainAccess(member.id, domain.id, false);
                                      });
                                    } else {
                                      handleManageDomainAccess(member.id, domainId, true);
                                    }
                                  }}
                                  value={(() => {
                                    // Find domain this member has access to
                                    const memberDomain = team.domains.find(d => {
                                      // Check direct userId assignment
                                      if (d.userId === member.id) return true;
                                      
                                      // Check accessUsers array 
                                      const permissionsObj = d.permissions ? 
                                        (typeof d.permissions === 'string' ? JSON.parse(d.permissions) : d.permissions) : 
                                        {};
                                      const accessUsers = permissionsObj.accessUsers || [];
                                      return accessUsers.some((u: any) => u.userId === member.id);
                                    });
                                    
                                    // Debugging for selected value
                                    console.log(`Selected domain for ${member.fullname}:`, memberDomain);
                                    
                                    return memberDomain?.id || "_none";
                                  })()}
                                >
                                  <SelectTrigger className="w-[200px] border-gray-300 bg-white text-gray-800">
                                    <SelectValue placeholder="Select a domain" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white">
                                    <SelectItem value="_none">No domain</SelectItem>
                                    {/* Debug domains data outside of rendering */}
                                    {(() => { console.log('Rendering domains dropdown:', team.domains); return null; })()}
                                    {team.domains.length === 0 && (
                                      <div className="p-2 text-sm text-muted-foreground text-center">
                                        No domains available
                                      </div>
                                    )}
                                    {Array.isArray(team.domains) ? team.domains.map((domain) => {
                                      if (!domain || !domain.id) {
                                        console.error('Invalid domain object:', domain);
                                        return null;
                                      }
                                      
                                      // Check if this domain is assigned to any members
                                      const assignedUserIds: string[] = [];
                                      
                                      // Add direct userId assignment
                                      if (domain.userId) {
                                        assignedUserIds.push(domain.userId);
                                      }
                                      
                                      // Add users from accessUsers array
                                      let accessUsers: any[] = [];
                                      try {
                                        const permissionsObj = domain.permissions ? 
                                          (typeof domain.permissions === 'string' ? JSON.parse(domain.permissions) : domain.permissions) : 
                                          {};
                                        accessUsers = permissionsObj.accessUsers || [];
                                        accessUsers.forEach((u: any) => {
                                          if (u.userId && !assignedUserIds.includes(u.userId)) {
                                            assignedUserIds.push(u.userId);
                                          }
                                        });
                                      } catch (error) {
                                        console.error('Error parsing domain permissions:', error);
                                      }
                                      
                                      // Check if domain is assigned to current member
                                      const isAssignedToMember = domain.userId === member.id || 
                                        accessUsers.some((u: any) => u.userId === member.id);
                                        
                                      // Create a list of names this domain is assigned to
                                      const assignedToNames = assignedUserIds
                                        .filter(id => id !== member.id)
                                        .map(id => members.find(m => m.id === id)?.fullname || 'Unknown')
                                        .join(', ');
                                      
                                      return (
                                        <SelectItem 
                                          key={domain.id} 
                                          value={domain.id}
                                          className={cn(
                                            isAssignedToMember && "font-medium text-primary",
                                            !isAssignedToMember && assignedUserIds.length > 0 && "text-muted-foreground"
                                          )}
                                        >
                                          {domain.name}
                                          {isAssignedToMember && " (Current)"}
                                          {!isAssignedToMember && assignedToNames && (
                                            ` (Shared with ${assignedToNames})`
                                          )}
                                        </SelectItem>
                                      );
                                    }) : null}
                                  </SelectContent>
                                </Select>
                                
                              </>
                            ) : (
                              <div className="space-y-1">
                                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                                  {(() => {
                                    // Find domain this member has access to
                                    const memberDomain = team.domains.find(d => {
                                      // Check direct userId assignment
                                      if (d.userId === member.id) return true;
                                      
                                      // Check accessUsers array
                                      const permissionsObj = d.permissions ? 
                                        (typeof d.permissions === 'string' ? JSON.parse(d.permissions) : d.permissions) : 
                                        {};
                                      const accessUsers = permissionsObj.accessUsers || [];
                                      return accessUsers.some((u: any) => u.userId === member.id);
                                    });
                                    
                                    return memberDomain?.name || 'No domain assigned';
                                  })()}
                                </span>
                                {(() => {
                                  // Find domain this member has access to
                                  const memberDomain = team.domains.find(d => {
                                    // Check direct userId assignment
                                    if (d.userId === member.id) return true;
                                    
                                    // Check accessUsers array
                                    const permissionsObj = d.permissions ? 
                                      (typeof d.permissions === 'string' ? JSON.parse(d.permissions) : d.permissions) : 
                                      {};
                                    const accessUsers = permissionsObj.accessUsers || [];
                                    return accessUsers.some((u: any) => u.userId === member.id);
                                  });
                                  
                                  if (memberDomain) {
                                    return (
                                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                        <span>{memberDomain.chatRooms?.length || 0} chats</span>
                                        <span>•</span>
                                        <span>{memberDomain.customers?.length || 0} customers</span>
                                      </div>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {currentUserRole === 'OWNER' && member.id !== currentUserId ? (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-gray-500 dark:text-gray-400 hover:text-gray-700">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700">
                                  <DropdownMenuLabel className="text-gray-700 dark:text-gray-300">Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                                  {member.role !== 'ADMIN' && (
                                    <DropdownMenuItem onClick={() => handleUpdateMemberRole(member.id, 'ADMIN')} className="text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                                      <Shield className="w-4 h-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                                      Make Admin
                                    </DropdownMenuItem>
                                  )}
                                  {member.role !== 'MEMBER' && (
                                    <DropdownMenuItem onClick={() => handleUpdateMemberRole(member.id, 'MEMBER')} className="text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                                      <Users className="w-4 h-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                                      Make Member
                                    </DropdownMenuItem>
                                  )}
                                  {/* Check for domain access in both userId and accessUsers array */}
                                  {(() => {
                                    // Find domains this member has access to via direct assignment or accessUsers
                                    const memberDomain = team.domains.find(d => {
                                      // Check direct userId assignment
                                      if (d.userId === member.id) return true;
                                      
                                      // Check accessUsers array
                                      try {
                                        const permissionsObj = d.permissions ? 
                                          (typeof d.permissions === 'string' ? JSON.parse(d.permissions) : d.permissions) : 
                                          {};
                                        const accessUsers = permissionsObj.accessUsers || [];
                                        return accessUsers.some((u: any) => u.userId === member.id);
                                      } catch (e) {
                                        console.error('Error parsing permissions:', e);
                                        return false;
                                      }
                                    });
                                    
                                    if (memberDomain) {
                                      return (
                                        <>
                                          <DropdownMenuItem onClick={() => {
                                            handleManageDomainAccess(member.id, memberDomain.id, false);
                                          }}>
                                            <Users className="w-4 h-4 mr-2" />
                                            Remove Domain Access
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => {
                                            setSelectedMemberId(member.id);
                                            setSelectedDomainId(memberDomain.id);
                                            // Load existing permissions if any, default to full permissions for owners/admins
                                            let existingPermissions = { 
                                              canModifyName: member.role === 'OWNER' || member.role === 'ADMIN',
                                              canModifyIcon: member.role === 'OWNER' || member.role === 'ADMIN',
                                              canModifyChat: member.role === 'OWNER' || member.role === 'ADMIN',
                                              canDelete: member.role === 'OWNER' || member.role === 'ADMIN'
                                            };
                                            setPermissions(existingPermissions);
                                            setIsPermissionsModalOpen(true);
                                          }}>
                                            <Settings className="w-4 h-4 mr-2" />
                                            Manage Permissions
                                          </DropdownMenuItem>
                                        </>
                                      );
                                    }
                                    return null;
                                  })()}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleRemoveMember(member.id)}
                                    className="text-red-600 dark:text-red-400 cursor-pointer"
                                  >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Remove from Team
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            ) : member.id === currentUserId && member.role !== 'OWNER' ? (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleLeaveTeam}
                                className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                              >
                                <LogOut className="w-4 h-4 mr-2 text-red-600 dark:text-red-400" />
                                Leave
                              </Button>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {isPermissionsModalOpen && (
              <PermissionsModal memberId={selectedMemberId} domainId={selectedDomainId} />
            )}
          </div>
        )}
      </div>
      
      {/* Team Components - Goals, Recognition, Announcements */}
      {team && currentUserRole === 'OWNER' && (
        <div className="space-y-8 mt-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Team Management Tools</h2>
          
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-slate-800 overflow-hidden">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4 bg-indigo-50 dark:bg-indigo-900/30">
              <CardTitle className="text-lg font-semibold text-indigo-800 dark:text-indigo-300 flex items-center">
                <Target className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                Team Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 px-6">
              <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <TeamGoalsSection initialGoals={goals} />
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-slate-800 overflow-hidden">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4 bg-blue-50 dark:bg-blue-900/30">
                <CardTitle className="text-lg font-semibold text-blue-800 dark:text-blue-300 flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Team Announcement
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 px-6">
                <div className="space-y-2 mb-3">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Share Important Updates</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Announcements are visible to all team members on their dashboard
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                  <AnnouncementForm />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-slate-800 overflow-hidden">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4 bg-purple-50 dark:bg-purple-900/30">
                <CardTitle className="text-lg font-semibold text-purple-800 dark:text-purple-300 flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                  Team Recognition
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 px-6">
                <div className="space-y-2 mb-3">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Celebrate Achievements</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Recognize team members for their outstanding contributions
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                  <RecognitionForm />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
} 