import { isLocalChatbotUrl } from '@/lib/chatbot-base-url'

type EmbedScriptOptions = {
  testMode?: boolean
}

function buildOriginCheckJs(baseUrl: string): string {
  const allowLocalhost = isLocalChatbotUrl(baseUrl)

  return allowLocalhost
    ? `function isAllowedOrigin(origin) {
    if (!origin) return false;
    try {
      var eventHost = new URL(origin).hostname.replace(/^www\\./, '');
      var baseHost = new URL(CHATBOT_BASE_URL).hostname.replace(/^www\\./, '');
      if (eventHost === baseHost) return true;
      if (eventHost === 'localhost' || eventHost === '127.0.0.1') return true;
      return false;
    } catch (e) {
      return false;
    }
  }`
    : `function isAllowedOrigin(origin) {
    if (!origin) return false;
    try {
      var eventHost = new URL(origin).hostname.replace(/^www\\./, '');
      var baseHost = new URL(CHATBOT_BASE_URL).hostname.replace(/^www\\./, '');
      return eventHost === baseHost;
    } catch (e) {
      return false;
    }
  }`
}

function buildSendBotIdJs(options?: EmbedScriptOptions): string {
  if (options?.testMode) {
    return `function sendBotId() {
    if (!iframe.contentWindow) return;
    try {
      iframe.contentWindow.postMessage({
        type: 'INIT_CHATBOT',
        domainId: CHATBOT_DOMAIN_ID,
        testing: true
      }, '*');
    } catch (e) {
      console.warn('Could not send bot ID to chatbot iframe');
    }
  }`
  }

  return `function sendBotId() {
    if (!iframe.contentWindow) return;
    try {
      iframe.contentWindow.postMessage(CHATBOT_DOMAIN_ID, '*');
    } catch (e) {
      console.warn('Could not send bot ID to chatbot iframe');
    }
  }`
}

/**
 * Generates the core chatbot iframe embed script for customer websites.
 * Used by settings code snippets (Vanilla JS, React, Vue).
 */
export function getChatbotEmbedScript(
  domainId: string,
  baseUrl: string,
  options?: EmbedScriptOptions
): string {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '')
  const chatbotPath = options?.testMode ? '/chatbot-test' : '/chatbot'

  return `(function() {
  if (window.chatbotInitialized) return;
  window.chatbotInitialized = true;

  var CHATBOT_DOMAIN_ID = '${domainId}';
  var CHATBOT_BASE_URL = '${normalizedBaseUrl}';

  var iframe = document.createElement('iframe');
  iframe.src = CHATBOT_BASE_URL + '${chatbotPath}';
  iframe.id = 'chatbot-iframe';
  iframe.title = 'Brief Support Chat';
  iframe.setAttribute('allow', 'clipboard-write');
  iframe.style.cssText = [
    'position: fixed',
    'bottom: 20px',
    'right: 20px',
    'width: 80px',
    'height: 80px',
    'border: none',
    'border-radius: 50%',
    'z-index: 999998',
    'background: transparent',
    'pointer-events: none',
    'opacity: 0',
    'transition: width 0.3s ease, height 0.3s ease, opacity 0.3s ease, border-radius 0.3s ease',
  ].join(';');

  ${buildOriginCheckJs(normalizedBaseUrl)}

  ${buildSendBotIdJs(options)}

  function applyIframeSize(width, height, isOpen) {
    iframe.style.opacity = '1';
    iframe.style.pointerEvents = 'auto';

    var isMobile = window.innerWidth < 768;

    if (isMobile && isOpen) {
      iframe.style.top = '0';
      iframe.style.left = '0';
      iframe.style.bottom = '0';
      iframe.style.right = '0';
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.borderRadius = '0';
      return;
    }

    iframe.style.top = 'auto';
    iframe.style.left = 'auto';
    iframe.style.bottom = '20px';
    iframe.style.right = '20px';
    iframe.style.width = width + 'px';
    iframe.style.height = height + 'px';
    iframe.style.borderRadius = isOpen ? '12px' : '50%';
  }

  window.addEventListener('message', function(e) {
    if (!isAllowedOrigin(e.origin)) return;

    if (e.data === 'GET_BOT_ID') {
      sendBotId();
      return;
    }

    try {
      var data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      if (data && data.width && data.height) {
        applyIframeSize(data.width, data.height, !!data.open);
      }
    } catch (err) {
      // Ignore non-JSON messages
    }
  });

  iframe.onload = function() {
    sendBotId();
    setTimeout(sendBotId, 250);
    setTimeout(sendBotId, 1000);
  };

  document.body.appendChild(iframe);
})();`
}

export function getReactChatbotEmbedComponent(
  domainId: string,
  baseUrl: string,
  options?: EmbedScriptOptions
): string {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '')
  const chatbotPath = options?.testMode ? '/chatbot-test' : '/chatbot'
  const allowLocalhost = isLocalChatbotUrl(normalizedBaseUrl)

  const originCheck = allowLocalhost
    ? `const isAllowedOrigin = (origin) => {
      if (!origin) return false;
      try {
        const eventHost = new URL(origin).hostname.replace(/^www\\./, '');
        const baseHost = new URL(CHATBOT_BASE_URL).hostname.replace(/^www\\./, '');
        if (eventHost === baseHost) return true;
        if (eventHost === 'localhost' || eventHost === '127.0.0.1') return true;
        return false;
      } catch (e) {
        return false;
      }
    };`
    : `const isAllowedOrigin = (origin) => {
      if (!origin) return false;
      try {
        const eventHost = new URL(origin).hostname.replace(/^www\\./, '');
        const baseHost = new URL(CHATBOT_BASE_URL).hostname.replace(/^www\\./, '');
        return eventHost === baseHost;
      } catch (e) {
        return false;
      }
    };`

  const sendBotId = options?.testMode
    ? `const sendBotId = () => {
      if (!iframe.contentWindow) return;
      try {
        iframe.contentWindow.postMessage({
          type: 'INIT_CHATBOT',
          domainId: CHATBOT_DOMAIN_ID,
          testing: true,
        }, '*');
      } catch (e) {
        console.warn('Could not send bot ID to chatbot iframe');
      }
    };`
    : `const sendBotId = () => {
      if (!iframe.contentWindow) return;
      try {
        iframe.contentWindow.postMessage(CHATBOT_DOMAIN_ID, '*');
      } catch (e) {
        console.warn('Could not send bot ID to chatbot iframe');
      }
    };`

  return `import { useEffect } from 'react';

export function ChatbotEmbed() {
  useEffect(() => {
    if (window.chatbotInitialized) return;
    window.chatbotInitialized = true;

    const CHATBOT_DOMAIN_ID = '${domainId}';
    const CHATBOT_BASE_URL = '${normalizedBaseUrl}';

    const iframe = document.createElement('iframe');
    iframe.src = CHATBOT_BASE_URL + '${chatbotPath}';
    iframe.id = 'chatbot-iframe';
    iframe.title = 'Brief Support Chat';
    iframe.setAttribute('allow', 'clipboard-write');
    iframe.style.cssText = [
      'position: fixed',
      'bottom: 20px',
      'right: 20px',
      'width: 80px',
      'height: 80px',
      'border: none',
      'border-radius: 50%',
      'z-index: 999998',
      'background: transparent',
      'pointer-events: none',
      'opacity: 0',
      'transition: width 0.3s ease, height 0.3s ease, opacity 0.3s ease, border-radius 0.3s ease',
    ].join(';');

    ${originCheck}

    ${sendBotId}

    const applyIframeSize = (width, height, isOpen) => {
      iframe.style.opacity = '1';
      iframe.style.pointerEvents = 'auto';

      const isMobile = window.innerWidth < 768;

      if (isMobile && isOpen) {
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.style.bottom = '0';
        iframe.style.right = '0';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.borderRadius = '0';
        return;
      }

      iframe.style.top = 'auto';
      iframe.style.left = 'auto';
      iframe.style.bottom = '20px';
      iframe.style.right = '20px';
      iframe.style.width = width + 'px';
      iframe.style.height = height + 'px';
      iframe.style.borderRadius = isOpen ? '12px' : '50%';
    };

    const handleMessage = (e) => {
      if (!isAllowedOrigin(e.origin)) return;

      if (e.data === 'GET_BOT_ID') {
        sendBotId();
        return;
      }

      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data && data.width && data.height) {
          applyIframeSize(data.width, data.height, !!data.open);
        }
      } catch (err) {
        // Ignore non-JSON messages
      }
    };

    window.addEventListener('message', handleMessage);

    iframe.onload = () => {
      sendBotId();
      setTimeout(sendBotId, 250);
      setTimeout(sendBotId, 1000);
    };

    document.body.appendChild(iframe);

    return () => {
      window.removeEventListener('message', handleMessage);
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      window.chatbotInitialized = false;
    };
  }, []);

  return null;
}

// Usage example:
// import { ChatbotEmbed } from './ChatbotEmbed.jsx';
//
// function App() {
//   return (
//     <div>
//       <h1>Your Website</h1>
//       <ChatbotEmbed />
//     </div>
//   );
// }
`
}

export function getDevTestEmbedScript(domainId: string): string {
  return getChatbotEmbedScript(domainId, 'http://localhost:3000', { testMode: true })
}
