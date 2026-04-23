'use client'

import { FlipWords } from '@/components/ui/flip-words'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Spotlight } from '@/components/ui/spotlight'
import Link from 'next/link'
import { useSafeSearchParams } from '@/lib/search-params-provider'
import { v4 as uuidv4 } from 'uuid'
import '@/styles/auth.css'

type Props = {
  children: React.ReactNode
}

const Layout = ({ children }: Props) => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  
  // Generate and set CSRF token on component mount
  useEffect(() => {
    // Generate a random CSRF token if not already present
    const generateCsrfToken = () => {
      // Generate a unique token using UUID
      const token = uuidv4();
      
      // Store token in sessionStorage with domain-specific key
      const securePrefix = `security_${window.location.hostname.replace(/\./g, '_')}_`
      sessionStorage.setItem(`${securePrefix}csrf_token`, token);
      
      return token;
    };
    
    // Get existing token or generate a new one
    const csrfToken = sessionStorage.getItem('csrf_token') || generateCsrfToken();
    
    // Add the CSRF token as a meta tag in the document head
    let metaTag = document.querySelector('meta[name="csrf-token"]');
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('name', 'csrf-token');
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute('content', csrfToken);
    
    // Detect keyboard open/close for iOS
    const detectKeyboard = () => {
      if (typeof window !== 'undefined') {
        const initialHeight = window.innerHeight;
        
        window.addEventListener('resize', () => {
          const currentHeight = window.innerHeight;
          if (currentHeight < initialHeight * 0.75) {
            setIsKeyboardOpen(true);
            document.body.classList.add('is-keyboard-open');
          } else {
            setIsKeyboardOpen(false);
            document.body.classList.remove('is-keyboard-open');
          }
        });
        
        // Check for home indicator on iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isIOS && window.innerHeight === window.outerHeight) {
          document.body.classList.add('has-home-indicator');
        }
      }
    };
    
    detectKeyboard();
    
    // Set viewport meta tag to prevent scaling
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
      viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
  }, []);

  return (
    <div className={cn(
      "min-h-screen h-full flex w-full bg-indigo-50 dark:bg-gray-900 auth-container",
      isKeyboardOpen ? 'is-keyboard-open' : ''
    )}>
      {/* Left panel - form container with improved mobile sizing */}
      <div className="flex flex-col flex-1 min-h-screen h-full p-4 sm:p-6 md:p-8 overflow-auto auth-form-container">
        <div className="mb-4">
        <Link href="/">
          <Image
            src="/icons/Icon-Only-Color.svg"
            alt="LOGO"
              width={40}
              height={40}
              priority
          />
        </Link>
        </div>
        
        {/* Center children content vertically */}
        <div className="flex-1 flex items-center justify-center">
        {children}
        </div>
      </div>
      
      {/* Right panel - decorative content, only shown on larger screens */}
      <div className={cn(
        "hidden lg:flex flex-1 min-h-screen w-full max-h-full overflow-hidden relative",
        "bg-indigo-100 dark:bg-gray-950",
        "flex-col items-center justify-center pt-10 pl-24 gap-3"
      )}>
        <Spotlight />
        <FlipWords words={['Meet Brief Support - Your Intelligent Sales Assistant', 'Just natural conversation']} />
      </div>
    </div>
  )
}

export default Layout
