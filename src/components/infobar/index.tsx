'use client'

import React, { useState, memo, useCallback } from 'react'
import BreadCrumb from './bread-crumb'
import { Bell } from 'lucide-react'
import { Button } from '../ui/button'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useNotifications, type Notification } from '@/hooks/use-notifications'
import { useRouter } from 'next/navigation'
import { DomainSetupDialog } from '../dialogs/domain-setup'
import { cn } from '@/lib/utils'

const MAX_DROPDOWN_NOTIFICATIONS = 3

const InfoBar = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications()
  const router = useRouter()
  const [setupDialog, setSetupDialog] = useState<{
    isOpen: boolean;
    domainId: string;
    domainName: string;
  }>({
    isOpen: false,
    domainId: '',
    domainName: '',
  })

  const unreadCount = notifications.filter((n: Notification) => !n.read).length
  const recentNotifications = notifications.slice(0, MAX_DROPDOWN_NOTIFICATIONS)
  const hasMoreNotifications = notifications.length > MAX_DROPDOWN_NOTIFICATIONS

  const handleNotificationClick = useCallback((notification: Notification) => {
    markAsRead(notification.id)
    if (notification.type === 'DOMAIN_SETUP') {
      // Open the setup dialog instead of navigating
      setSetupDialog({
        isOpen: true,
        domainId: notification.domainId,
        domainName: notification.message.split(' ')[5], // Extract domain name from message
      })
    }
  }, [markAsRead])

  const handleViewAllClick = useCallback(() => {
    router.push('/notifications')
  }, [router])

  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsRead()
  }, [markAllAsRead])

  return (
    <>
      <div className="flex w-full justify-between items-center py-1 px-5 mt-5">
        <BreadCrumb />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            {notifications.length === 0 ? (
              <DropdownMenuItem className="text-muted-foreground">
                No notifications
              </DropdownMenuItem>
            ) : (
              <>
                {unreadCount > 0 && (
                  <>
                    <DropdownMenuItem 
                      className="flex justify-center text-sm text-primary hover:text-primary/80 cursor-pointer"
                      onClick={handleMarkAllAsRead}
                    >
                      Mark all as read
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {recentNotifications.map((notification: Notification) => (
                  <DropdownMenuItem 
                    key={notification.id}
                    className={cn(
                      "flex flex-col items-start gap-2 py-3 cursor-pointer border-l-2",
                      !notification.read ? "border-l-primary bg-muted/50" : "border-l-transparent",
                      "hover:bg-muted/80 transition-colors"
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex flex-col gap-1 px-1">
                      {/* Format live support message */}
                      {notification.type === 'LIVE_SUPPORT' ? (
                        <>
                          <div className={cn(
                            "text-sm leading-snug",
                            !notification.read && "font-medium"
                          )}>
                            <span className="text-primary">Live support</span> requested by{' '}
                            {notification.message.split('Message: ')[0].split('by ')[1]}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Message: {notification.message.split('Message: ')[1]}
                          </div>
                        </>
                      ) : (
                        <div className={cn(
                          "text-sm leading-snug",
                          !notification.read && "font-medium"
                        )}>
                          {notification.message}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          {new Date(notification.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {!notification.read && (
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
                {hasMoreNotifications && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-sm text-primary hover:text-primary/80 cursor-pointer"
                      onClick={handleViewAllClick}
                    >
                      View all notifications
                    </DropdownMenuItem>
                  </>
                )}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* <Separator className="mb-8" orientation="horizontal" /> */}

      <DomainSetupDialog 
        isOpen={setupDialog.isOpen}
        onClose={() => setSetupDialog(prev => ({ ...prev, isOpen: false }))}
        domainId={setupDialog.domainId}
        domainName={setupDialog.domainName}
      />
    </>
  )
}

export default memo(InfoBar)
