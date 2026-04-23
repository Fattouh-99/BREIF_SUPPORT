import React, { memo, useState } from 'react'
import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import dynamic from 'next/dynamic'
import { ErrorMessage } from '@hookform/error-message'

const Edit = dynamic(() => import('lucide-react').then(mod => mod.Edit), {
  ssr: false,
  loading: () => <span className="w-4 h-4" />
})

type Props = {
  register: UseFormRegister<any>
  errors: FieldErrors<FieldValues>
  label: string
}

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB in bytes

const UploadButton = memo(({ errors, label, register }: Props) => {
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setUploadStatus(null)

    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      setUploadStatus({
        type: 'error',
        message: 'File size must be less than 2MB'
      })
      e.target.value = '' // Reset input
      return
    }

    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      setUploadStatus({
        type: 'error',
        message: 'Only JPG, JPEG and PNG files are allowed'
      })
      e.target.value = ''
      return
    }

    setUploadStatus({
      type: 'success',
      message: 'File selected successfully'
    })
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <Label
          htmlFor="upload-button"
          className="flex gap-2 p-2 sm:p-3 rounded-lg bg-cream text-gray-600 cursor-pointer font-semibold text-xs sm:text-sm items-center"
        >
          <Input
            {...register('image', {
              onChange: handleFileChange
            })}
            className="hidden"
            type="file"
            id="upload-button"
            accept="image/png,image/jpeg,image/jpg"
          />
          <Edit />
          {label}
        </Label>
        <p className="text-xs sm:text-sm text-gray-400 sm:ml-6 mt-1 sm:mt-2">
          Recommended size is 300px * 300px,<br className="hidden sm:block" /> size less than 2MB
        </p>
      </div>
      {uploadStatus && (
        <p className={`text-xs sm:text-sm mt-2 ${
          uploadStatus.type === 'success' ? 'text-green-500' : 'text-red-400'
        }`}>
          {uploadStatus.message}
        </p>
      )}
      <ErrorMessage
        errors={errors}
        name="image"
        render={({ message }) => (
          <p className="text-red-400 text-xs sm:text-sm mt-2">
            {message === 'Required' ? '' : message}
          </p>
        )}
      />
    </>
  )
})

UploadButton.displayName = 'UploadButton'

export default UploadButton
