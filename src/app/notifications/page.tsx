'use client'

import { useNotifications, type Notification } from '@/hooks/use-notifications'
import { Card } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ChevronLeft, ChevronRight, Megaphone } from 'lucide-react'
import { useState, useCallback, useMemo, memo } from 'react'
import { toast } from '@/components/ui/use-toast'

const ITEMS_PER_PAGE = 10

// Memoized notification card component to prevent rerenders
const NotificationCard = memo(({ 
  notification, 
  onClick 
}: { 
  notification: Notification, 
  onClick: (id: string, type: string, domainId?: string, data?: any) => void 
}) => {
  // Extract announcement content from data field if present
  const announcementContent = useMemo(() => {
    try {
      if (notification.data && typeof notification.data === 'object') {
        return notification.data.announcement || '';
      }
      return '';
    } catch (error) {
      console.error('Error parsing notification data:', error);
      return '';
    }
  }, [notification.data]);

  // Handle keyboard interaction for accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(notification.id, notification.type, notification.domainId, notification.data);
    }
  };

  // Create an accessible label based on notification type
  const getAriaLabel = () => {
    const status = notification.read ? 'Read' : 'Unread';
    
    if (notification.type === 'LIVE_SUPPORT') {
      return `${status} live support notification: ${notification.message}`;
    } else if (notification.type === 'TEAM_MESSAGE') {
      return `${status} team message: ${notification.message}`;
    } else {
      return `${status} notification: ${notification.message}`;
    }
  };

  return (
    <Card
      className={`p-4 cursor-pointer transition-colors hover:bg-accent ${
        !notification.read ? 'bg-accent/50' : ''
      }`}
      onClick={() => onClick(notification.id, notification.type, notification.domainId, notification.data)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={getAriaLabel()}
    >
      <div className="flex flex-col gap-2">
        {notification.type === 'LIVE_SUPPORT' ? (
          <>
            <div className="font-medium">
              <span className="text-primary">Live support</span> requested by{' '}
              {notification.message.split('Message: ')[0].split('by ')[1]}
            </div>
            <div className="text-sm text-muted-foreground">
              Message: {notification.message.split('Message: ')[1]}
            </div>
          </>
        ) : notification.type === 'TEAM_MESSAGE' ? (
          <>
            <div className="flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-indigo-500" aria-hidden="true" />
              <span className="font-medium text-indigo-600">{notification.message}</span>
            </div>
            <div className="bg-indigo-50 p-3 rounded-md text-sm my-1 border border-indigo-100">
              "{announcementContent}"
            </div>
          </>
        ) : (
          <p className="font-medium">{notification.message}</p>
        )}
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString()}
          </span>
          {!notification.read && (
            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full" aria-label="New notification">
              New
            </span>
          )}
        </div>
      </div>
    </Card>
  );
});
NotificationCard.displayName = 'NotificationCard';

// Memoized pagination component
const Pagination = memo(({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number, 
  totalPages: number, 
  onPageChange: (page: number) => void 
}) => {
  if (totalPages <= 1) return null;
  
  return (
    <nav aria-label="Pagination" className="mt-6">
      <div className="flex justify-center items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </Button>

        <div className="flex items-center gap-2" role="list">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
              className="min-w-[2.5rem]"
              aria-label={`Page ${page}`}
              aria-current={currentPage === page ? "page" : undefined}
            >
              {page}
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
});
Pagination.displayName = 'Pagination';

export default function NotificationsPage() {
  const { notifications, markAsRead, setNotifications } = useNotifications()
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)

  // Memoized values
  const totalPages = useMemo(() => 
    Math.ceil(notifications.length / ITEMS_PER_PAGE), 
    [notifications.length]
  );
  
  const currentNotifications = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return notifications.slice(startIndex, endIndex);
  }, [notifications, currentPage]);

  // Memoized callbacks
  const handleNotificationClick = useCallback(async (id: string, type: string, domainId?: string, data?: any) => {
    try {
      if (type === 'LIVE_SUPPORT' && domainId) {
        // First check if the conversation still exists
        const response = await fetch(`/api/conversations/${domainId}`)
        if (!response.ok) {
          // If conversation doesn't exist, delete the notification
          await fetch(`/api/notifications/${id}`, { method: 'DELETE' })
          // Remove from local state
          setNotifications((prev: Notification[]) => prev.filter((n: Notification) => n.id !== id))
          toast({
            title: "Conversation no longer available",
            description: "This support request has been closed or deleted.",
            variant: "destructive"
          })
          return
        }

        // Mark as read and navigate to conversation
        await markAsRead(id)
        router.push(`/conversation/${domainId}`)
      } else if (type === 'DOMAIN_SETUP' && domainId) {
        await markAsRead(id)
        router.push(`/settings/${domainId}`)
      } else if (type === 'TEAM_MESSAGE') {
        await markAsRead(id)
        router.push('/conversation')
      } else {
        await markAsRead(id)
      }
    } catch (error) {
      console.error('Error handling notification click:', error)
      toast({
        title: "Error",
        description: "Failed to process notification",
        variant: "destructive"
      })
    }
  }, [markAsRead, router, setNotifications]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, []);

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Notifications</h1>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            No notifications
          </Card>
        ) : (
          <>
            {currentNotifications.map((notification) => (
              <NotificationCard 
                key={notification.id} 
                notification={notification} 
                onClick={handleNotificationClick} 
              />
            ))}

            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={handlePageChange} 
            />
          </>
        )}
      </div>
    </div>
  )
} 