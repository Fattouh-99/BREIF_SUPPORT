import { SIDE_BAR_MENU } from '@/constants/menu'
import { LogOut, Menu } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import DomainMenu from './domain-menu'
import MenuItem from './menu-item'
import { UserRole } from '@prisma/client'

type DomainType = {
  id: string
  name: string
  icon: string | null
}

type Props = {
  onExpand(): void
  current: string
  onSignOut(): void
  userType?: string
  isLoggingOut?: boolean
  domains: {
    personalDomains: DomainType[] | null | undefined
    teamDomains: DomainType[] | null | undefined
  }
}

const MaxMenu = ({ current, domains, onExpand, onSignOut, userType, isLoggingOut }: Props) => {
  return (
    <div className="py-3 px-4 flex flex-col h-full dark:bg-indigo-950 bg-indigo-50 overflow-hidden">
      <div className="flex justify-between items-center">
        <Image
          src="/icons/Icon-Only-Color.svg"
          alt="LOGO"
          sizes="100vw"
          className="animate-fade-in opacity-0 delay-300 fill-mode-forwards"
          style={{
            width: '20%',
            height: 'auto',
          }}
          width={0}
          height={0}
        />
        <Menu
          className="cursor-pointer animate-fade-in opacity-0 delay-300 fill-mode-forwards dark:text-indigo-100 text-indigo-950 hover:dark:text-indigo-200 hover:text-indigo-800"
          onClick={onExpand}
        />
      </div>
      <div className="animate-fade-in opacity-0 delay-300 fill-mode-forwards flex flex-col items-center justify-between h-full text-indigo-900 dark:text-indigo-100 pt-10">
        <div className="flex flex-col w-full">
          {userType === UserRole.SUPER_ADMIN ? (
            <>
              {/* Show Regular Admin Menu Items */}
              {SIDE_BAR_MENU
                .filter(menu => !menu.adminOnly && ['Dashboard', 'Conversations', 'Settings'].includes(menu.label))
                .map((menu, key) => (
                  <MenuItem
                    size="max"
                    {...menu}
                    key={key}
                    current={current}
                  />
                ))
              }
              
              <div className="w-full h-px bg-indigo-200 dark:bg-indigo-800 my-4"></div>
              
              {/* Show Admin-Only Menu Items */}
              {SIDE_BAR_MENU
                .filter(menu => menu.adminOnly)
                .map((menu, key) => (
                  <MenuItem
                    size="max"
                    {...menu}
                    key={key}
                    current={current}
                  />
                ))
              }
            </>
          ) : (
            /* For non-SUPER_ADMIN users, show filtered menu items as before */
            SIDE_BAR_MENU
              .filter(menu => {
                // If user is a MEMBER, only show Conversations and Settings
                if (userType === UserRole.MEMBER) {
                  return ['Dashboard', 'Conversations', 'Settings'].includes(menu.label);
                }
                
                // Otherwise use existing filters
                return !(menu.adminOnly && userType !== UserRole.SUPER_ADMIN)
              })
              .map((menu, key) => (
                <MenuItem
                  size="max"
                  {...menu}
                  key={key}
                  current={current}
                />
              ))
          )}
          
          {/* Only show domain menu for regular owners or admins (not MEMBER or SUPER_ADMIN) */}
          {userType !== UserRole.MEMBER && userType !== UserRole.SUPER_ADMIN && <DomainMenu domains={domains} />}
        </div>
        <div className="flex w-full flex-col">
          <MenuItem
            size="max"
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

export default MaxMenu
