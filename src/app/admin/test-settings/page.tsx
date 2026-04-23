'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { testSystemSettings, debugSystemSettings } from '@/actions/admin/test-system-settings'

export default function TestSettingsPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleTest = async () => {
    setLoading(true)
    try {
      const result = await testSystemSettings()
      setResult(result)
    } catch (error) {
      console.error('Test failed:', error)
      setResult({ error: String(error) })
    } finally {
      setLoading(false)
    }
  }

  const handleDebug = async () => {
    setLoading(true)
    try {
      const result = await debugSystemSettings()
      setResult(result)
    } catch (error) {
      console.error('Debug failed:', error)
      setResult({ error: String(error) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Test System Settings</CardTitle>
          <CardDescription>
            Test page for system settings functions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={handleTest} 
              disabled={loading}
            >
              {loading ? 'Testing...' : 'Test Update'}
            </Button>
            <Button 
              onClick={handleDebug}
              disabled={loading}
              variant="outline"
            >
              {loading ? 'Loading...' : 'Get Current Settings'}
            </Button>
          </div>
          
          {result && (
            <div className="mt-6 p-4 border rounded-md bg-muted">
              <h3 className="text-lg font-medium mb-2">Result:</h3>
              <pre className="whitespace-pre-wrap overflow-auto max-h-[400px] p-2 bg-background rounded">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 