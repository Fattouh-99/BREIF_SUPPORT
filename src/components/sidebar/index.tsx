'use client'
import useSideBar from '@/context/use-sidebar'
import { cn } from '@/lib/utils'
import React from 'react'
import MaxMenu from './maximized-menu'
import { MinMenu } from './minimized-menu'

type Props = {
  domains: {
    personalDomains: {
      id: string
      name: string
      icon: string | null
    }[] | null | undefined,
    teamDomains: {
      id: string
      name: string
      icon: string | null
    }[] | null | undefined
  }
  userType?: string
}

const SideBar = ({ domains, userType }: Props) => {
  const { expand, onExpand, page, onSignOut, isLoggingOut } = useSideBar()

  return (
    <div
      className={cn(
        'bg-cream dark:bg-neutral-950 h-screen w-[60px] fill-mode-forwards fixed md:relative z-50 overflow-hidden',
        expand == undefined && '',
        expand == true
          ? 'animate-open-sidebar'
          : expand == false && 'animate-close-sidebar'
      )}
    >
      {expand ? (
        <MaxMenu
          domains={domains}
          current={page!}
          onExpand={onExpand}
          onSignOut={onSignOut}
          userType={userType}
          isLoggingOut={isLoggingOut}
        />
      ) : (
        <MinMenu
          domains={domains}
          onShrink={onExpand}
          current={page!}
          onSignOut={onSignOut}
          userType={userType}
          isLoggingOut={isLoggingOut}
        />
      )}
    </div>
  )
}

export default SideBar
