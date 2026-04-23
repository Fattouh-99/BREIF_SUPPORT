'use client'
import { useThemeMode } from '@/hooks/settings/use-settings'
import React, { useState, useEffect } from 'react'
import Section from '../section-label'
import { cn } from '@/lib/utils'
import { SystemMode } from '../themes-placeholder/systemmode'
import { LightMode } from '../themes-placeholder/lightmode'
import { DarkMode } from '../themes-placeholder/darkmode'

type Props = {}

const DarkModetoggle = (props: Props) => {
  const { setTheme, theme } = useThemeMode()
  const [mounted, setMounted] = useState(false)

  // Wait till NextJS rehydration completes
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="flex flex-col gap-6 sm:gap-10">
      <div className="w-full">
        <Section
          label="Interface Theme"
          message="Select or customize your UI theme "
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        <div
          className={cn(
            'rounded-2xl overflow-hidden cursor-pointer border-4 border-transparent w-full max-w-[300px] mx-auto',
            mounted && theme == 'system' && 'border-indigo-500'
          )}
          onClick={() => setTheme('system')}
        >
          <SystemMode />
        </div>
        <div
          className={cn(
            'rounded-2xl overflow-hidden cursor-pointer border-4 border-transparent w-full max-w-[300px] mx-auto',
            mounted && theme == 'light' && 'border-indigo-500'
          )}
          onClick={() => setTheme('light')}
        >
          <LightMode />
        </div>
        <div
          className={cn(
            'rounded-2xl overflow-hidden cursor-pointer border-4 border-transparent w-full max-w-[300px] mx-auto',
            mounted && theme == 'dark' && 'border-indigo-500'
          )}
          onClick={() => setTheme('dark')}
        >
          <DarkMode />
        </div>
      </div>
    </div>
  )
}

export default DarkModetoggle
