'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, ExternalLink, Loader2, AlertTriangle, Info } from 'lucide-react'

interface ConfigStatus {
  portalConfigured: boolean
  environmentVars: {
    stripeSecret: boolean
    stripePublishKey: boolean
    proPriceId: boolean
    appUrl: boolean
  }
}

export const StripeConfigChecker = () => {
  const [status, setStatus] = useState<ConfigStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showTroubleshooting, setShowTroubleshooting] = useState(false)
  const [testInfo, setTestInfo] = useState<any>(null)
  const [testLoading, setTestLoading] = useState(false)

  const checkConfiguration = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Check portal configuration
      const portalResponse = await fetch('/api/stripe/v2/portal-status')
      const portalData = await portalResponse.json()
      
      // Check environment variables (client-side checks for what we can verify)
      const envVars = {
        stripeSecret: !!process.env.STRIPE_SECRET,
        stripePublishKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISH_KEY,
        proPriceId: !!process.env.STRIPE_PRO_PRICE_ID,
        appUrl: !!process.env.NEXT_PUBLIC_APP_URL
      }

      setStatus({
        portalConfigured: portalData.data?.isConfigured || false,
        environmentVars: envVars
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check configuration')
    } finally {
      setLoading(false)
    }
  }

  const runPortalTest = async () => {
    setTestLoading(true)
    setTestInfo(null)
    
    try {
      const response = await fetch('/api/stripe/v2/test-portal')
      const data = await response.json()
      setTestInfo(data)
    } catch (err) {
      setTestInfo({ error: err instanceof Error ? err.message : 'Test failed' })
    } finally {
      setTestLoading(false)
    }
  }

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      checkConfiguration()
    }
  }, [])

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'unknown'

  return (
    <Card className="mt-4 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          🧪 Development: Stripe Configuration Status
        </CardTitle>
        <CardDescription className="text-xs">
          This component only appears in development mode
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={checkConfiguration} 
            disabled={loading}
            size="sm"
            variant="outline"
          >
            {loading ? (
              <>
                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              'Check Configuration'
            )}
          </Button>

          <Button 
            onClick={runPortalTest}
            disabled={testLoading}
            size="sm"
            variant="outline"
          >
            {testLoading ? (
              <>
                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              'Test Portal Setup'
            )}
          </Button>

          <Button 
            onClick={() => setShowTroubleshooting(!showTroubleshooting)}
            size="sm"
            variant="ghost"
          >
            {showTroubleshooting ? 'Hide' : 'Show'} CORS Troubleshooting
          </Button>
        </div>

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Current URL Info */}
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="text-xs space-y-1">
              <div><strong>Current URL:</strong> {currentUrl}</div>
              <div><strong>Return URL will be:</strong> {currentUrl}/billing</div>
            </div>
          </AlertDescription>
        </Alert>

        {status && (
          <div className="space-y-3">
            {/* Portal Configuration */}
            <div className="flex items-center gap-2 text-sm">
              {status.portalConfigured ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span className={status.portalConfigured ? 'text-green-700' : 'text-red-700'}>
                Customer Portal: {status.portalConfigured ? 'Configured' : 'Not Configured'}
              </span>
              {!status.portalConfigured && (
                <a
                  href="https://dashboard.stripe.com/test/settings/billing/portal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                >
                  Setup
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            {/* Environment Variables */}
            <div className="text-sm space-y-1">
              <div className="font-medium text-gray-700">Environment Variables:</div>
              {Object.entries(status.environmentVars).map(([key, isSet]) => (
                <div key={key} className="flex items-center gap-2 ml-4">
                  {isSet ? (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-600" />
                  )}
                  <span className={`text-xs ${isSet ? 'text-green-700' : 'text-red-700'}`}>
                    {key.toUpperCase().replace(/([A-Z])/g, '_$1')}: {isSet ? 'Set' : 'Missing'}
                  </span>
                </div>
              ))}
            </div>

            {/* Warning for missing APP_URL */}
            {!status.environmentVars.appUrl && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 text-xs">
                  <strong>NEXT_PUBLIC_APP_URL</strong> is not set. This can cause CORS issues with the customer portal.
                  Add it to your .env.local file: <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_APP_URL={currentUrl}</code>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* CORS Troubleshooting */}
        {showTroubleshooting && (
          <Alert className="border-purple-200 bg-purple-50">
            <AlertTriangle className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-purple-800">
              <div className="space-y-2">
                <p className="font-medium text-sm">CORS Troubleshooting Tips:</p>
                <ul className="text-xs space-y-1 ml-4 list-disc">
                  <li>Ensure your domain is added to Stripe's allowed origins in the customer portal settings</li>
                  <li>Check that NEXT_PUBLIC_APP_URL matches your current domain exactly</li>
                  <li>Try clearing your browser cache and cookies</li>
                  <li>Verify the return URL in your Stripe portal configuration allows {currentUrl}/billing</li>
                  <li>For production, ensure your domain is properly configured in Stripe dashboard</li>
                </ul>
                <div className="pt-2 border-t border-purple-200">
                  <a
                    href="https://dashboard.stripe.com/test/settings/billing/portal"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Configure Customer Portal Settings
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Test Results */}
        {testInfo && (
          <Alert className="border-gray-200 bg-gray-50">
            <Info className="h-4 w-4 text-gray-600" />
            <AlertDescription className="text-gray-800">
              <div className="space-y-2">
                <p className="font-medium text-sm">Portal Test Results:</p>
                {testInfo.error ? (
                  <div className="text-red-600 text-xs">{testInfo.error}</div>
                ) : (
                  <div className="text-xs space-y-2">
                    <div>
                      <strong>Environment:</strong>
                      <ul className="ml-4 mt-1 space-y-1">
                        {Object.entries(testInfo.data?.environment || {}).map(([key, value]) => (
                          <li key={key}>
                            <code className="bg-gray-100 px-1 rounded">{key}</code>: {String(value)}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {testInfo.data?.user && (
                      <div>
                        <strong>User Info:</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>Has Stripe ID: {testInfo.data.user.hasStripeId ? '✅' : '❌'}</li>
                          <li>Email: {testInfo.data.user.email || 'Unknown'}</li>
                        </ul>
                      </div>
                    )}
                    
                    <div>
                      <strong>Calculated Return URL:</strong> 
                      <code className="bg-gray-100 px-1 rounded ml-1">{testInfo.data?.calculatedReturnUrl}</code>
                    </div>
                    
                    {testInfo.data?.recommendations?.length > 0 && (
                      <div>
                        <strong>Recommendations:</strong>
                        <ul className="ml-4 mt-1 space-y-1 list-disc">
                          {testInfo.data.recommendations.map((rec: string, index: number) => (
                            <li key={index} className="text-amber-700">{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
} 