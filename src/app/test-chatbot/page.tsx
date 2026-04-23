'use client'

import { useEffect, useState } from 'react'

export default function TestChatbotPage() {
  const [domainInfo, setDomainInfo] = useState<{id: string, name: string} | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch the user's actual domain ID
    const fetchDomainInfo = async () => {
      try {
        const response = await fetch('/api/domains/my-domain')
        if (response.ok) {
          const domain = await response.json()
          setDomainInfo(domain)
          console.log('Using domain:', domain)
        } else {
          const errorData = await response.json()
          setError(errorData.error || 'Failed to fetch domain')
        }
      } catch (err) {
        console.error('Error fetching domain:', err)
        setError('Failed to connect to API')
      }
    }

    fetchDomainInfo()
  }, [])

  useEffect(() => {
    if (!domainInfo) return // Wait for domain info to load

    // Initialize the chatbot when the domain info is available
    const initChatbot = () => {
      // Prevent multiple initializations
      if ((window as any).chatbotInitialized) return;
      (window as any).chatbotInitialized = true;
      
      // Use the actual domain ID from the user's account
      const actualDomainId = domainInfo.id;
      const baseUrl = window.location.origin; // Use current origin
      
      // Create the iframe that loads your chatbot with actual domain
      const iframe = document.createElement('iframe');
      iframe.src = `${baseUrl}/chatbot`; // Use the regular chatbot route
      iframe.style.cssText = `
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
        box-shadow: 0 5px 40px rgba(0,0,0,0.16);
      `;
      iframe.id = 'chatbot-iframe';
      
      // Add iframe to page
      document.body.appendChild(iframe);
      
      // Send bot ID when iframe loads
      iframe.onload = () => {
        setTimeout(() => {
          try {
            // Send actual domain ID to use your real chatbot configuration
            iframe.contentWindow?.postMessage({
              type: 'INIT_CHATBOT',
              domainId: actualDomainId,
              testing: false, // Use real domain mode
              domainName: domainInfo.name
            }, baseUrl);
            
            console.log('Sent chatbot init message with domain:', domainInfo);
          } catch (e) {
            console.log('Could not send message to iframe:', e);
          }
        }, 500);
      };
      
      // Listen for size updates from the chatbot iframe
      const handleMessage = (e: MessageEvent) => {
        // Allow messages from same origin
        if (e.origin !== baseUrl) return;
        
        try {
          const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
          
          // Handle chatbot size changes
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
          
          // Handle other messages
          if (data.type === 'CHATBOT_READY') {
            console.log('Chatbot is ready!');
          }
          
        } catch (err) {
          // Ignore parsing errors
          console.log('Message parsing error:', err);
        }
      };
      
      window.addEventListener('message', handleMessage);
      
      // Cleanup function
      return () => {
        window.removeEventListener('message', handleMessage);
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
        (window as any).chatbotInitialized = false;
      };
    };
    
    // Initialize chatbot
    const cleanup = initChatbot();
    
    // Cleanup on unmount
    return cleanup;
  }, [domainInfo]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Chatbot Test Page
        </h1>
        
        <div className="bg-blue-50 p-6 rounded-lg mb-8 border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-700">
            <li>The chatbot will appear in the bottom-right corner as a floating button</li>
            <li>Click on it to open the chatbot window</li>
            <li>This test is configured to show the <strong>inquiry form</strong> mode</li>
            <li>Fill out the form to test the full height functionality</li>
            <li>Form submissions will be logged to your server console (check terminal)</li>
          </ol>
          
          <div className="mt-4 p-4 bg-green-50 rounded border-l-4 border-green-400">
            <p className="text-green-800">
              <strong>Real Domain Mode:</strong> This test now uses your actual BriefSupport domain configuration. 
              Real data interactions will be saved to your database.
            </p>
          </div>
          
          {domainInfo && (
            <div className="mt-4 p-4 bg-blue-50 rounded border-l-4 border-blue-400">
              <p className="text-blue-800">
                <strong>Using Domain:</strong> {domainInfo.name} (ID: {domainInfo.id})
              </p>
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 rounded border-l-4 border-red-400">
              <p className="text-red-800">
                <strong>Error:</strong> {error}
              </p>
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 p-8 rounded-lg text-center min-h-96">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Test Content Area</h2>
          <p className="text-gray-600 mb-4">This is a sample page to test your chatbot integration.</p>
          <p className="text-gray-600 mb-4">The chatbot should appear in the bottom-right corner.</p>
          <p className="text-gray-600">Try interacting with it to test the inquiry form functionality!</p>
        </div>
      </div>
    </div>
  );
} 