import { 
  requireAuth,
  getOrCreateUser 
} from '@/lib/auth-utils'
import SideBar from '@/components/sidebar'
import { ChatProvider } from '@/context/user-chat-context'
import React from 'react'
import { redirect } from 'next/navigation'

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

type Props = {
  children: React.ReactNode
}

type Domain = {
  id: string
  name: string
  icon: string
  teamId?: string | null
  userId?: string | null
  permissions?: any
}

const OwnerLayout = async ({ children }: Props) => {
  try {
    // Use centralized auth service for authentication
    const userId = await requireAuth();
    
    // Get or create user with comprehensive error handling
    const authenticated = await getOrCreateUser();
    
    // Handle authentication failure
    if (!authenticated || !authenticated.user) {
      console.error('Dashboard layout: Failed to get or create user', userId);
      return redirect('/auth/sign-in?reason=authentication_error');
    }

    // Optimize domain categorization with better error handling
    const domains = {
      // Personal domains are those without teamId
      personalDomains: authenticated.domain?.filter((d: Domain) => !d.teamId) || [],
      
      // Team domains with improved access control logic
      teamDomains: authenticated.domain?.filter((d: Domain) => {
        // Direct team domain access
        if (d.teamId) return true;
        
        // Permission-based access with enhanced error handling
        if (d.permissions) {
          try {
            const permissionsObj = typeof d.permissions === 'string' 
              ? JSON.parse(d.permissions) 
              : d.permissions;
              
            // Enhanced access check with proper validation
            if (permissionsObj?.accessUsers && Array.isArray(permissionsObj.accessUsers)) {
              return permissionsObj.accessUsers.some((u: any) => 
                u?.userId === authenticated.user?.id
              );
            }
          } catch (error) {
            console.error('Error parsing domain permissions:', error, {
              domainId: d.id,
              permissions: d.permissions
            });
          }
        }
        
        return false;
      }) || []
    }

    return (
      <ChatProvider>
        <div className="flex h-screen w-full overflow-hidden">
          <SideBar 
            domains={domains}
            userType={authenticated.user?.role}
          />
          <div 
            className="w-full h-screen flex flex-col pl-20 md:pl-4 overflow-y-auto overflow-x-hidden"
            style={{ overscrollBehavior: 'none' }}
          >
            {children}
          </div>
        </div>
      </ChatProvider>
    )
  } catch (error) {
    console.error('Error in dashboard layout:', error);
    return redirect('/auth/sign-in?reason=layout_error');
  }
}

export default OwnerLayout
