'use client'

import { useEffect } from 'react'
import Script from 'next/script'

export default function UploadPage() {
  useEffect(() => {
    // Initialize widget after it's loaded
    if (typeof window !== 'undefined' && (window as any).uploadcare) {
      const widget = (window as any).uploadcare.Widget('[role=uploadcare-uploader]')
      widget.onUploadComplete((info: any) => {
        console.log('UUID:', info.uuid)
        // You can copy the UUID from the console
      })
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-8">Image Upload</h1>
      <input
        type="hidden"
        role="uploadcare-uploader"
        data-public-key={process.env.NEXT_PUBLIC_UPLOAD_CARE_PUBLIC_KEY}
        data-images-only="true"
      />
      <Script
        src="https://ucarecdn.com/libs/widget/3.x/uploadcare.full.min.js"
        strategy="beforeInteractive"
      />
      <div className="mt-8">
        <p className="text-gray-600">Instructions:</p>
        <ol className="list-decimal ml-6 mt-2 space-y-2">
          <li>Click the upload button above</li>
          <li>Select or drag & drop your images</li>
          <li>After upload, check the browser console (F12) for the UUID</li>
          <li>The UUID will look like: 12345678-90ab-cdef-ghij-klmnopqrstuv</li>
        </ol>
      </div>
    </div>
  )
} 