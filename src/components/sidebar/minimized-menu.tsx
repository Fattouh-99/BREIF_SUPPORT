import { SIDE_BAR_MENU } from '@/constants/menu'

import React from 'react'

import { LogOut, MonitorSmartphone } from 'lucide-react'
import { MenuLogo } from '@/icons/menu-logo'
import MenuItem from './menu-item'
import DomainMenu from './domain-menu'
import { UserRole } from '@prisma/client'

type DomainType = {
  id: string
  name: string
  icon: string | null
}

type MinMenuProps = {
  onShrink(): void
  current: string
  onSignOut(): void
  userType?: string
  isLoggingOut?: boolean
  domains: {
    personalDomains: DomainType[] | null | undefined
    teamDomains: DomainType[] | null | undefined
  }
}

export const MinMenu = ({
  onShrink,
  current,
  onSignOut,
  domains,
  userType,
  isLoggingOut,
}: MinMenuProps) => {
  return (
    <div className="flex flex-col items-center h-full dark:bg-indigo-950 bg-indigo-50">
      <span className="animate-fade-in pt-5 opacity-0 delay-300 fill-mode-forwards cursor-pointer flex justify-center dark:text-white text-indigo-950">
        <MenuLogo onClick={onShrink} />
      </span>
      <div className="animate-fade-in opacity-0 delay-300 fill-mode-forwards flex flex-col justify-between h-full pt-10 w-full dark:text-indigo-100 text-indigo-950">
        <div className="flex flex-col items-center">
          {userType === UserRole.SUPER_ADMIN ? (
            <>
              {SIDE_BAR_MENU
                .filter(menu => !menu.adminOnly && ['Dashboard', 'Conversations', 'Settings'].includes(menu.label))
                .map((menu, key) => (
                  <MenuItem
                    size="min"
                    {...menu}
                    key={key}
                    current={current}
                  />
                ))
              }
              
              <div className="w-8 h-px bg-indigo-200 dark:bg-indigo-800 my-4"></div>
              
              {SIDE_BAR_MENU
                .filter(menu => menu.adminOnly)
                .map((menu, key) => (
                  <MenuItem
                    size="min"
                    {...menu}
                    key={key}
                    current={current}
                  />
                ))
              }
            </>
          ) : (
            SIDE_BAR_MENU
              .filter(menu => {
                if (userType === UserRole.MEMBER) {
                  return ['Dashboard', 'Conversations', 'Settings'].includes(menu.label);
                }
                
                return !(menu.adminOnly && userType !== UserRole.SUPER_ADMIN)
              })
              .map((menu, key) => (
                <MenuItem
                  size="min"
                  {...menu}
                  key={key}
                  current={current}
                />
              ))
          )}
          
          {userType !== UserRole.MEMBER && userType !== UserRole.SUPER_ADMIN && (
            <DomainMenu
              min
              domains={domains}
            />
          )}
        </div>
        <div className="flex flex-col items-center">
          <MenuItem
            size="min"
            label="Sign out"
            icon={<LogOut />}
            onSignOut={onSignOut}
            isLoggingOut={isLoggingOut}
          />
        </div>
      </div>
    </div>
  )
}
