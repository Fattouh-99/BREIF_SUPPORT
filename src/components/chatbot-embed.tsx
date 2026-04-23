'use client'

import { useEffect, useRef, useCallback, useState } from 'react'

interface ChatbotEmbedProps {
  botId: string
  baseUrl?: string
}

export function ChatbotEmbed({ 
  botId = '58749ce2-e899-4a48-8b21-af8fca50b206',
  baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://localhost:3000'
}: ChatbotEmbedProps) {
  // Reference to track if the component is mounted
  const isMountedRef = useRef<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false); // Start closed to prevent flash
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Memoized debounce function with proper cleanup
  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }, []);
  
  // Detect Safari browser
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Add Safari detection
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari) {
      document.documentElement.classList.add('safari');
      
      // Add CSS for Safari fix
      const linkElement = document.createElement('link');
      linkElement.rel = 'stylesheet';
      linkElement.href = `${baseUrl}/chatbot-embed.css`;
      document.head.appendChild(linkElement);
      
      // Add page-loaded class after everything is loaded
      if (document.readyState === 'complete') {
        document.documentElement.classList.add('page-loaded');
      } else {
        window.addEventListener('load', () => {
          document.documentElement.classList.add('page-loaded');
        });
      }
    }
    
    return () => {
      if (isSafari) {
        document.documentElement.classList.remove('safari');
        document.documentElement.classList.remove('page-loaded');
        
        // Remove CSS link if it exists
        const linkElement = document.querySelector('link[href$="/chatbot-embed.css"]');
        if (linkElement) {
          document.head.removeChild(linkElement);
        }
      }
    };
  }, [baseUrl]);
  
  // Main initialization effect - simplified to reduce layout shifts
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;
        
    // Set mounted flag
    isMountedRef.current = true;
    
    // Get existing container from page
    const containerElement = document.getElementById('chatbot-root');
    if (!containerElement) {
      console.error('Chatbot container not found');
      return;
    }
    
    // Apply initial styles to prevent flash in Safari
    containerElement.style.width = '60px';
    containerElement.style.height = '60px';
    containerElement.style.opacity = '0';
    containerElement.style.pointerEvents = 'none';
    containerElement.style.background = 'transparent';
    containerElement.style.transition = 'opacity 0.3s ease, width 0.3s ease, height 0.3s ease';
    containerElement.style.position = 'relative';
    containerElement.style.overflow = 'hidden';
    
    // Create and append iframe
    const iframe = document.createElement('iframe');
    iframe.src = `${baseUrl}/chatbot`;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.background = 'transparent';
    iframe.style.backgroundColor = 'transparent';
    iframe.style.border = 'none';
    iframe.style.opacity = '0'; // Start hidden to prevent flash
    
    // Listen for iframe load
    iframe.onload = () => {
      if (iframe.contentWindow) {
        // Send bot ID to iframe
        iframe.contentWindow.postMessage(botId, baseUrl);
        
        // Fade in iframe once loaded
        setTimeout(() => {
          iframe.style.opacity = '1';
          iframe.style.transition = 'opacity 0.3s ease';
          
          // Mark as initialized which allows toggling
          setIsInitialized(true);
          
          // Add ready class for CSS transitions
          containerElement.classList.add('chatbot-ready');
          
          // Reveal container if manually set to open
          if (isOpen) {
            containerElement.style.opacity = '1';
            containerElement.style.pointerEvents = 'auto';
          }
        }, 300);
      }
    };
    
    containerElement.appendChild(iframe);
    iframeRef.current = iframe;
    
    // Create message handler - simplified for better performance
    const handleMessage = debounce((e: MessageEvent) => {
      if (!isMountedRef.current || !iframe.contentWindow) return;
      
      try {
        // Validate origin
        const originUrl = new URL(baseUrl);
        const eventOriginUrl = e.origin ? new URL(e.origin) : null;
        
        if (!eventOriginUrl || originUrl.hostname !== eventOriginUrl.hostname) {
          return;
        }
        
        // Send bot ID
        setTimeout(() => {
          if (iframe.contentWindow) {
            iframe.contentWindow.postMessage(botId, baseUrl);
          }
        }, 300);
      } catch (error) {
        console.error('Error handling message:', error);
      }
    }, 150);
    
    // Toggle function for the user's existing button
    const toggleChatbot = () => {
      if (!containerElement || !isInitialized) return;
      
      setIsOpen(prevOpen => {
        const newOpen = !prevOpen;
        
        if (newOpen) {
          // Show chatbot - apply styles with a slight delay to ensure smooth transitions
          requestAnimationFrame(() => {
            containerElement.style.width = '400px';
            containerElement.style.height = '600px';
            containerElement.style.opacity = '1';
            containerElement.style.pointerEvents = 'auto';
            containerElement.style.borderRadius = '12px';
          });
          
          // Send bot ID to iframe
          if (iframe.contentWindow) {
            iframe.contentWindow.postMessage(botId, baseUrl);
          }
        } else {
          // Hide chatbot
          containerElement.style.width = '60px';
          containerElement.style.height = '60px';
          containerElement.style.opacity = '0';
          containerElement.style.pointerEvents = 'none';
          containerElement.style.borderRadius = '50%';
        }
        
        return newOpen;
      });
    };
    
    // Expose toggle function globally
    (window as any).toggleChatbot = toggleChatbot;
    
    // Listen for button clicks
    const handleButtonClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[aria-label="Open chat support"]')) {
        toggleChatbot();
        e.preventDefault();
        e.stopPropagation();
      }
    };
    
    document.body.addEventListener('click', handleButtonClick, true);
    window.addEventListener('message', handleMessage);
    
    // Clean up on unmount
    return () => {
      // Set unmounted flag
      isMountedRef.current = false;
      
      // Remove event listeners
      window.removeEventListener('message', handleMessage);
      document.body.removeEventListener('click', handleButtonClick, true);
      delete (window as any).toggleChatbot;
      
      // Remove iframe
      if (containerElement && iframeRef.current) {
        containerElement.removeChild(iframeRef.current);
      }
      
      // Remove ready class
      if (containerElement) {
        containerElement.classList.remove('chatbot-ready');
      }
      
      iframeRef.current = null;
    };
  }, [botId, baseUrl, debounce, isOpen, isInitialized]);
  
  // This component doesn't render anything itself
  return null;
}

export default ChatbotEmbed; 