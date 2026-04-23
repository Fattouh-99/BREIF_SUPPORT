'use client'
import Section from '@/components/section-label'
import { useToast } from '@/components/ui/use-toast'
import { Copy } from 'lucide-react'
import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type Props = {
  id: string
}

const CodeSnippet = ({ id }: Props) => {
  const { toast } = useToast()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.briefsupport.com'
  
  const vanillaSnippet = `
// Simple chatbot iframe embed
(function() {
  // Prevent multiple initializations
  if (window.chatbotInitialized) return;
  window.chatbotInitialized = true;
  
  // Create the iframe that loads your chatbot
  const iframe = document.createElement('iframe');
  iframe.src = '${baseUrl}/chatbot';
  iframe.style.cssText = \`
        position: fixed;
    bottom: 20px;
    right: 20px;
        width: 60px;
        height: 60px;
    border: none;
    border-radius: 12px;
    z-index: 999998;
    background: transparent;
    pointer-events: none;
    opacity: 0;
    transition: all 0.3s ease;
  \`;
  iframe.id = 'chatbot-iframe';
  
  // Add iframe to page
  document.body.appendChild(iframe);
  
  // Send bot ID when iframe loads
  iframe.onload = () => {
    setTimeout(() => {
      try {
        iframe.contentWindow.postMessage('${id}', '${baseUrl}');
      } catch (e) {
        console.log('Could not send message to iframe');
    }
    }, 100);
  };
  
  // Listen for size updates from the chatbot iframe
  window.addEventListener('message', (e) => {
    // Allow messages from both briefsupport.com and www.briefsupport.com
    const allowedOrigins = ['${baseUrl}', 'https://briefsupport.com', 'https://www.briefsupport.com'];
    if (!allowedOrigins.includes(e.origin)) return;
    
    try {
      const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      
      if (data.width && data.height) {
        const isMobile = window.innerWidth < 768;
        
        iframe.style.opacity = '1';
        iframe.style.pointerEvents = 'auto';
        
        if (isMobile) {
          // Full screen on mobile when open
          iframe.style.top = '0';
          iframe.style.left = '0';
          iframe.style.bottom = '0';
          iframe.style.right = '0';
          iframe.style.width = '100%';
          iframe.style.height = '100%';
          iframe.style.borderRadius = '0';
        } else {
          // Use provided dimensions on desktop
          iframe.style.width = data.width + 'px';
          iframe.style.height = data.height + 'px';
          iframe.style.top = 'auto';
          iframe.style.left = 'auto';
          iframe.style.borderRadius = '12px';
        }
      }
    } catch (err) {
      // Ignore parsing errors
    }
  });
})();
  `;
  
  const reactSnippet = `
import { useEffect, useRef } from 'react';

// Simple chatbot iframe component for React
export function ChatbotEmbed() {
  const iframeRef = useRef(null);
  
  useEffect(() => {
    // Prevent multiple initializations
    if (window.chatbotInitialized) return;
    window.chatbotInitialized = true;
    
    // Create the iframe that loads your chatbot
    const iframe = document.createElement('iframe');
    iframe.src = '${baseUrl}/chatbot';
    iframe.style.cssText = \`
          position: fixed;
      bottom: 20px;
      right: 20px;
          width: 60px;
          height: 60px;
      border: none;
      border-radius: 12px;
      z-index: 999998;
      background: transparent;
      pointer-events: none;
      opacity: 0;
      transition: all 0.3s ease;
    \`;
    iframe.id = 'chatbot-iframe';
    
    // Add iframe to page
    document.body.appendChild(iframe);
    iframeRef.current = iframe;
    
    // Send bot ID when iframe loads
    iframe.onload = () => {
      setTimeout(() => {
        try {
          iframe.contentWindow.postMessage('${id}', '${baseUrl}');
        } catch (e) {
          console.log('Could not send message to iframe');
        }
      }, 100);
    };
    
    // Listen for size updates from the chatbot iframe
    const handleMessage = (e) => {
      // Allow messages from both briefsupport.com and www.briefsupport.com
      const allowedOrigins = ['${baseUrl}', 'https://briefsupport.com', 'https://www.briefsupport.com'];
      if (!allowedOrigins.includes(e.origin)) return;
      
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        
        if (data.width && data.height) {
          const isMobile = window.innerWidth < 768;
          
          iframe.style.opacity = '1';
          iframe.style.pointerEvents = 'auto';
          
          if (isMobile) {
            // Full screen on mobile when open
            iframe.style.top = '0';
            iframe.style.left = '0';
            iframe.style.bottom = '0';
            iframe.style.right = '0';
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.borderRadius = '0';
          } else {
            // Use provided dimensions on desktop
            iframe.style.width = data.width + 'px';
            iframe.style.height = data.height + 'px';
            iframe.style.top = 'auto';
            iframe.style.left = 'auto';
            iframe.style.borderRadius = '12px';
          }
        }
      } catch (err) {
        // Ignore parsing errors
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    // Cleanup
    return () => {
      window.removeEventListener('message', handleMessage);
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    };
  }, []);
  
  // This component doesn't render anything visible
  return null;
}

// Usage example:
// import { ChatbotEmbed } from './ChatbotEmbed';
//
// function App() {
//   return (
//     <div>
//       <h1>Your Website</h1>
//       <ChatbotEmbed />
//     </div>
//   );
// }
  `;
  
  const vueSnippet = `
<!-- ChatbotEmbed.vue -->
<template>
  <!-- This component doesn't render anything visible -->
</template>

<script>
export default {
  name: 'ChatbotEmbed',
  data() {
    return {
      iframe: null
    }
  },
  mounted() {
    this.initChatbot()
  },
  methods: {
    initChatbot() {
      // Prevent multiple initializations
      if (window.chatbotInitialized) return
      window.chatbotInitialized = true
      
      // Create the iframe that loads your chatbot
      const iframe = document.createElement('iframe')
      iframe.src = '${baseUrl}/chatbot'
      iframe.style.cssText = \`
            position: fixed;
        bottom: 20px;
        right: 20px;
            width: 60px;
            height: 60px;
        border: none;
        border-radius: 12px;
        z-index: 999998;
        background: transparent;
        pointer-events: none;
        opacity: 0;
        transition: all 0.3s ease;
      \`
      iframe.id = 'chatbot-iframe'
      
      // Add iframe to page
      document.body.appendChild(iframe)
      this.iframe = iframe
      
      // Send bot ID when iframe loads
      iframe.onload = () => {
        setTimeout(() => {
          try {
            iframe.contentWindow.postMessage('${id}', '${baseUrl}')
          } catch (e) {
            console.log('Could not send message to iframe')
        }
        }, 100)
      }
      
      // Listen for size updates from the chatbot iframe
      const handleMessage = (e) => {
        // Allow messages from both briefsupport.com and www.briefsupport.com
        const allowedOrigins = ['${baseUrl}', 'https://briefsupport.com', 'https://www.briefsupport.com']
        if (!allowedOrigins.includes(e.origin)) return
        
        try {
          const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data
          
          if (data.width && data.height) {
            const isMobile = window.innerWidth < 768
            
            iframe.style.opacity = '1'
            iframe.style.pointerEvents = 'auto'
            
            if (isMobile) {
              // Full screen on mobile when open
              iframe.style.top = '0'
              iframe.style.left = '0'
              iframe.style.bottom = '0'
              iframe.style.right = '0'
              iframe.style.width = '100%'
              iframe.style.height = '100%'
              iframe.style.borderRadius = '0'
            } else {
              // Use provided dimensions on desktop
              iframe.style.width = data.width + 'px'
              iframe.style.height = data.height + 'px'
              iframe.style.top = 'auto'
              iframe.style.left = 'auto'
              iframe.style.borderRadius = '12px'
            }
          }
        } catch (err) {
          // Ignore parsing errors
        }
      }
      
      window.addEventListener('message', handleMessage)
      
      // Store cleanup reference
      this.cleanup = () => {
        window.removeEventListener('message', handleMessage)
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe)
      }
    }
  },
  beforeDestroy() {
    if (this.cleanup) {
      this.cleanup()
    }
  }
}
</script>

<!-- Usage example:
<template>
  <div>
    <h1>Your Website</h1>
    <ChatbotEmbed />
  </div>
</template>

<script>
import ChatbotEmbed from './ChatbotEmbed.vue'

export default {
  components: {
    ChatbotEmbed
  }
}
</script>
-->
  `;

  return (
    <div className="mt-5 flex flex-col gap-3 items-start w-full">
      <Section
        label="Code snippet"
        message="Copy and paste this code snippet into your website"
      />
      <Tabs defaultValue="instructions" className="w-full">
        <TabsList className="w-full flex flex-wrap gap-1">
          <TabsTrigger value="vanilla" className="flex-1 text-xs sm:text-sm">Vanilla JS</TabsTrigger>
          <TabsTrigger value="react" className="flex-1 text-xs sm:text-sm">React</TabsTrigger>
          <TabsTrigger value="vue" className="flex-1 text-xs sm:text-sm">Vue</TabsTrigger>
        </TabsList>

        <TabsContent value="vanilla">
          <div className="bg-cream px-2 sm:px-4 py-3 rounded-lg w-full relative overflow-x-auto">
            <Copy
              className="absolute top-2 right-2 text-gray-400 cursor-pointer w-4 h-4 sm:w-5 sm:h-5"
              onClick={() => {
                navigator.clipboard.writeText(vanillaSnippet)
                toast({
                  title: 'Copied to clipboard',
                  description: 'You can now paste the code inside your website',
                })
              }}
            />
            <pre>
              <code className="text-gray-500 text-xs sm:text-sm whitespace-pre-wrap">{vanillaSnippet}</code>
            </pre>
          </div>
        </TabsContent>
        <TabsContent value="react">
          <div className="bg-cream px-2 sm:px-4 py-3 rounded-lg w-full relative overflow-x-auto">
            <Copy
              className="absolute top-2 right-2 text-gray-400 cursor-pointer w-4 h-4 sm:w-5 sm:h-5"
              onClick={() => {
                navigator.clipboard.writeText(reactSnippet)
                toast({
                  title: 'Copied to clipboard',
                  description: 'You can now paste the code inside your React application',
                })
              }}
            />
            <pre>
              <code className="text-gray-500 text-xs sm:text-sm whitespace-pre-wrap">{reactSnippet}</code>
            </pre>
          </div>
        </TabsContent>
        <TabsContent value="vue">
          <div className="bg-cream px-2 sm:px-4 py-3 rounded-lg w-full relative overflow-x-auto">
            <Copy
              className="absolute top-2 right-2 text-gray-400 cursor-pointer w-4 h-4 sm:w-5 sm:h-5"
              onClick={() => {
                navigator.clipboard.writeText(vueSnippet)
                toast({
                  title: 'Copied to clipboard',
                  description: 'You can now paste the code inside your Vue application',
                })
              }}
            />
            <pre>
              <code className="text-gray-500 text-xs sm:text-sm whitespace-pre-wrap">{vueSnippet}</code>
            </pre>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  )
}

export default CodeSnippet
