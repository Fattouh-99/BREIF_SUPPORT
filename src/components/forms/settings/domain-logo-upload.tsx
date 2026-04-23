import Section from '@/components/section-label'
import UploadButton from '@/components/upload-button'
import { X, Edit, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { onDomainLogoUpdate } from '@/actions/settings'
import { useToast } from '@/components/ui/use-toast'
import Image from 'next/image'
import React from 'react'
import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form'

type Props = {
  register: UseFormRegister<FieldValues>
  errors: FieldErrors<FieldValues>
  domainId: string
  currentIcon?: string | null
}

const DomainLogoUpload = ({ register, errors, domainId, currentIcon }: Props) => {
  const { toast } = useToast()
  const [loading, setLoading] = React.useState(false)
  
  // Check if user already has a logo
  const hasExistingLogo = Boolean(currentIcon)

  const onRemoveLogo = async () => {
    try {
      setLoading(true)
      const response = await onDomainLogoUpdate(domainId, '')
      if (response?.status === 200) {
        toast({
          title: 'Success',
          description: 'Domain logo removed successfully'
        })
        // Force a page refresh to show the changes
        window.location.reload()
      } else {
        toast({
          title: 'Error',
          description: response?.message || 'Failed to remove logo'
        })
      }
    } catch (error) {
      console.error('Error removing logo:', error)
      toast({
        title: 'Error',
        description: 'Failed to remove logo'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="py-5 flex flex-col gap-5 items-start w-full">
      <Section
        label="Domain logo"
        message="Upload a custom logo for your domain that will be used in the chatbot."
      />
      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-col gap-2">
          <Label
            htmlFor={hasExistingLogo ? undefined : "domain-logo-upload"}
            className={`flex gap-2 p-3 rounded-lg text-gray-600 font-semibold text-sm items-center w-fit transition-all duration-200 ${
              hasExistingLogo 
                ? 'bg-gray-100 cursor-not-allowed opacity-60' 
                : 'bg-cream cursor-pointer hover:bg-cream/80'
            }`}
          >
            {!hasExistingLogo && (
              <Input
                {...register('domainLogo')}
                className="hidden"
                type="file"
                id="domain-logo-upload"
                accept="image/png,image/jpeg,image/jpg"
                disabled={hasExistingLogo}
              />
            )}
            {hasExistingLogo ? (
              <Upload className="w-4 h-4" />
            ) : (
              <Edit className="w-4 h-4" />
            )}
            {hasExistingLogo ? 'Upload Disabled' : 'Upload Domain Logo'}
          </Label>
        </div>
        <p className="text-xs sm:text-sm text-gray-400">
          Recommended size is 300px * 300px, size less than 2MB
        </p>
        {errors.domainLogo && (
          <p className="text-red-400 text-xs sm:text-sm mt-2">
            {errors.domainLogo.message as string}
          </p>
        )}
      </div>
      
      {currentIcon && (
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
              <Image
                src={`https://ucarecdn.com/${currentIcon}/`}
                alt="Domain logo"
                width={80}
                height={80}
                className="object-cover"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 hover:bg-red-600 shadow-md"
              onClick={onRemoveLogo}
              disabled={loading}
              title="Remove current logo"
            >
              <X className="h-4 w-4 text-white" />
            </Button>
          </div>
          <div className="text-sm text-gray-500">
            <div className="font-medium">Current domain logo</div>
            <div className="text-xs text-gray-400 mt-1">
              Remove this logo to upload a new one
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DomainLogoUpload 