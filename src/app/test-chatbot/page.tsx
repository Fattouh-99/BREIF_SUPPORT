'use client'

import { useEffect, useState } from 'react'
import { getChatbotEmbedScript } from '@/lib/chatbot-embed-snippet'
import { getChatbotBaseUrl } from '@/lib/chatbot-base-url'

const FALLBACK_TEST_DOMAIN_ID = '89932460-fa8a-471d-8cef-e4c5cb90fa95'

export default function TestChatbotPage() {
  const [domainId, setDomainId] = useState<string | null>(null)
  const [mode, setMode] = useState<'loading' | 'domain' | 'test'>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDomainInfo = async () => {
      try {
        const response = await fetch('/api/domains/my-domain')
        if (response.ok) {
          const domain = await response.json()
          setDomainId(domain.id)
          setMode('domain')
          return
        }
      } catch (err) {
        console.error('Error fetching domain:', err)
      }

      setDomainId(FALLBACK_TEST_DOMAIN_ID)
      setMode('test')
      setError('Using local test chatbot mode (no login or domain required).')
    }

    fetchDomainInfo()
  }, [])

  useEffect(() => {
    if (!domainId) return

    const baseUrl = getChatbotBaseUrl()
    const script = document.createElement('script')
    script.textContent = getChatbotEmbedScript(domainId, baseUrl, {
      testMode: mode === 'test',
    })
    document.body.appendChild(script)

    return () => {
      script.remove()
      const iframe = document.getElementById('chatbot-iframe')
      if (iframe?.parentNode) iframe.parentNode.removeChild(iframe)
      ;(window as Window & { chatbotInitialized?: boolean }).chatbotInitialized = false
    }
  }, [domainId, mode])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Chatbot Embed Test
        </h1>

        <div className="bg-blue-50 p-6 rounded-lg mb-8 border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">Local development</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-700">
            <li>Run <code className="bg-blue-100 px-1 rounded">npm run dev</code></li>
            <li>The chatbot loads from <code className="bg-blue-100 px-1 rounded">{getChatbotBaseUrl()}/chatbot</code></li>
            <li>Use this page to simulate embedding on an external website</li>
            <li>Open <code className="bg-blue-100 px-1 rounded">test-chatbot-embed.html</code> for a static HTML test</li>
          </ol>

          {mode === 'domain' && domainId && (
            <div className="mt-4 p-4 bg-green-50 rounded border-l-4 border-green-400">
              <p className="text-green-800">
                <strong>Using your domain ID:</strong> {domainId}
              </p>
            </div>
          )}

          {mode === 'test' && (
            <div className="mt-4 p-4 bg-yellow-50 rounded border-l-4 border-yellow-400">
              <p className="text-yellow-800">
                <strong>Test mode:</strong> Using mock chatbot data. Sign in to load your real domain configuration.
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-gray-50 rounded border-l-4 border-gray-300">
              <p className="text-gray-700">{error}</p>
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-8 rounded-lg text-center min-h-96">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Test Content Area</h2>
          <p className="text-gray-600">The chatbot bubble should appear in the bottom-right corner.</p>
        </div>
      </div>
    </div>
  )
}
