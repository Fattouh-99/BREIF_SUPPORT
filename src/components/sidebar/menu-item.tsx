import { cn } from '@/lib/utils'
import Link from 'next/link'
import React from 'react'
import { Loader2 } from 'lucide-react'

type Props = {
  size: 'max' | 'min'
  label: string
  icon: JSX.Element
  path?: string
  current?: string
  onSignOut?(): void
  isLoggingOut?: boolean
}

const MenuItem = ({ size, path, icon, label, current, onSignOut, isLoggingOut }: Props) => {
  const isActive = current === path
  const isSignOut = label === 'Sign out'

  const iconElement = React.cloneElement(icon, {
    className: cn(
      'w-5 h-5',
      isSignOut 
        ? 'text-red-500 group-hover:text-red-600'
        : isActive 
          ? 'text-indigo-600 dark:text-indigo-400' 
          : 'text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300'
    )
  })

  // Loading indicator for sign out
  const loadingIcon = (
    <Loader2 className="w-5 h-5 animate-spin text-red-500" />
  )

  switch (size) {
    case 'max':
      return isSignOut ? (
        <button
          onClick={onSignOut}
          disabled={isLoggingOut}
          className={cn(
            'group rounded-lg p-2.5 my-1.5 transition-all duration-200 flex items-center justify-center w-full',
            'bg-red-100/50 hover:border-red-400 hover:bg-red-200 hover:shadow-sm',
            'dark:bg-red-900/30 dark:border-red-800 dark:hover:border-red-700 dark:hover:bg-red-800/50',
            'transform hover:scale-105 active:scale-95',
            isLoggingOut && 'opacity-70 cursor-not-allowed hover:scale-100 active:scale-100'
          )}
        >
          {isLoggingOut ? loadingIcon : iconElement}
          <span className={cn(
            "text-red-500 group-hover:text-red-600 ml-2",
            isLoggingOut && "text-red-400"
          )}>
            {isLoggingOut ? 'Signing out...' : label}
          </span>
        </button>
      ) : (
        <Link
          className={cn(
            'group flex items-center gap-2 px-3 py-2 rounded-lg my-1 transition-colors',
            isActive
              ? 'bg-indigo-200 dark:bg-indigo-900'
              : 'hover:bg-indigo-100 dark:hover:bg-red-400'
          )}
          href={path ? `/${path}` : '#'}
        >
          {iconElement}
          <span className={cn(
            'transition-colors',
            isActive 
              ? 'text-indigo-600 dark:text-indigo-400' 
              : 'text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300'
          )}>
            {label}
          </span>
        </Link>
      )
    case 'min':
      return isSignOut ? (
        <button
          onClick={onSignOut}
          disabled={isLoggingOut}
          className={cn(
            'group rounded-lg p-2.5 my-1.5 transition-all duration-200 flex items-center justify-center w-full',
            'bg-red-100/50 hover:border-red-400 hover:bg-red-200 hover:shadow-sm',
            'dark:bg-red-900/30 dark:border-red-800 dark:hover:border-red-700 dark:hover:bg-red-800/50',
            'transform hover:scale-105 active:scale-95',
            isLoggingOut && 'opacity-70 cursor-not-allowed hover:scale-100 active:scale-100'
          )}
          aria-label="Sign out"
          title={isLoggingOut ? "Signing out..." : "Sign out"}
        >
          {isLoggingOut ? loadingIcon : iconElement}
        </button>
      ) : (
        <Link
          className={cn(
            'group rounded-lg p-2 my-1 transition-colors flex items-center justify-center',
            isActive
              ? 'bg-indigo-200 dark:bg-indigo-900'
              : 'hover:bg-indigo-100 dark:hover:bg-indigo-500'
          )}
          href={path ? `/${path}` : '#'}
        >
          {iconElement}
        </Link>
      )
    default:
      return null
  }
}

export default MenuItem
