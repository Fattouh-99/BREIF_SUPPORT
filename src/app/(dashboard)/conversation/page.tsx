import ConversationClient from '@/components/conversations/conversation-client'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { onGetTeamAndDomains } from '@/actions/team/index'
import { Suspense } from 'react'
import ErrorRefresh from '@/components/conversations/error-refresh'
import { ConversationContextProvider } from '@/components/conversations/conversation-context'
import { headers } from 'next/headers'

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

// Loading state for the conversation page
function ConversationLoading() {
  return (
    <div className="h-screen w-full p-2">
      <div className="h-12 w-full animate-pulse rounded-md bg-muted/50 mb-2"></div>
      <div className="flex h-[calc(100vh-60px)] gap-2">
        <div className="w-[320px] h-full animate-pulse rounded-md bg-muted/50"></div>
        <div className="flex-1 animate-pulse rounded-md bg-muted/50"></div>
      </div>
    </div>
  );
}

// Error boundary wrapper to catch React errors
function ConversationErrorBoundary({ children }: { children: React.ReactNode }) {
  try {
    return <>{children}</>;
  } catch (error) {
    console.error('Error in conversation page:', error);
    return <ErrorRefresh />;
  }
}

// This wrapper helps prevent unnecessary re-renders and infinite refresh cycles
function ConversationWrapper({ domains }: { domains: any[] }) {
  return (
    <ConversationErrorBoundary>
      <ConversationContextProvider>
        <Suspense fallback={<ConversationLoading />}>
          <ConversationClient domains={domains} />
        </Suspense>
      </ConversationContextProvider>
    </ConversationErrorBoundary>
  );
}

export default async function ConversationPage() {
  try {
    // Get user auth data with simplified error handling
    const authResult = await auth();
    const userId = authResult?.userId;
    
    // Only redirect to login if no user ID found - don't redirect to dashboard
    if (!userId) {
      redirect('/auth/sign-in');
    }

    // Fetch domains with improved error handling
    let domains: any[] = [];
    try {
      const domainsResponse = await onGetTeamAndDomains();
      domains = domainsResponse?.success ? domainsResponse.domains || [] : [];
    } catch (error) {
      console.warn('[ConversationPage] Error fetching domains, continuing with empty array:', error);
      // Continue with empty domains array instead of failing
    }
    
    // Simplified logging
    console.log(`[ConversationPage] Loading conversation page for user ${userId.slice(0, 8)}... with ${domains.length} domains`);
    
    // Return the wrapped component with domains passed as props
    return <ConversationWrapper domains={domains} />;
  } catch (error) {
    console.error('Error loading conversation page:', error);
    return <ErrorRefresh />;
  }
}
