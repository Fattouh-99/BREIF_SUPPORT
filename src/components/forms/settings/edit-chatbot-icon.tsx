import Section from '@/components/section-label'
import UploadButton from '@/components/upload-button'
import { BotIcons, BotIconType } from '@/icons/bot-icons'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { onChatBotImageUpdate } from '@/actions/settings'
import { useToast } from '@/components/ui/use-toast'
import IconSelector from './icon-selector'
import { Separator } from '@/components/ui/separator'

import Image from 'next/image'
import React from 'react'
import { FieldErrors, FieldValues, UseFormRegister, UseFormSetValue } from 'react-hook-form'

type Props = {
  register: UseFormRegister<FieldValues>
  setValue: UseFormSetValue<FieldValues>
  errors: FieldErrors<FieldValues>
  chatBot: {
    id: string
    icon: string | null
    iconColor: string | null
    welcomeMessage: string | null
    iconStyle?: BotIconType
  } | null
  domainId: string
}

const EditChatbotIcon = ({ register, setValue, errors, chatBot, domainId }: Props) => {
  const { toast } = useToast()
  const [loading, setLoading] = React.useState(false)
  const [selectedIcon, setSelectedIcon] = React.useState<BotIconType>(chatBot?.iconStyle || 'Default')
  const [selectedColor, setSelectedColor] = React.useState(chatBot?.iconColor || '#6366F1')

  const onRemoveIcon = async () => {
    try {
      setLoading(true)
      const response = await onChatBotImageUpdate(domainId, '')
      if (response?.status === 200) {
        toast({
          title: 'Success',
          description: 'Icon removed successfully'
        })
        // Force a page refresh to show the changes
        window.location.reload()
      } else {
        toast({
          title: 'Error',
          description: response?.message || 'Failed to remove icon'
        })
      }
    } catch (error) {
      console.error('Error removing icon:', error)
      toast({
        title: 'Error',
        description: 'Failed to remove icon'
      })
    } finally {
      setLoading(false)
    }
  }

  // Update both icon style and color inputs when color changes
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    setSelectedColor(newColor)
    setValue('iconColor', newColor, { shouldDirty: true })
  }

  // Handle icon selection
  const handleIconSelect = (icon: BotIconType) => {
    setSelectedIcon(icon)
    setValue('iconStyle', icon, { shouldDirty: true })
  }

  // Register form fields
  React.useEffect(() => {
    register('iconColor')
    register('iconStyle')
  }, [register])

  return (
    <div className="py-5 flex flex-col gap-5 items-start w-full">
      <Section
        label="Chatbot icon"
        message="Change the icon and color for the chatbot."
      />
      <div className="flex flex-col gap-4 w-full">
        <UploadButton
          label="Upload Custom Image"
          register={register}
          errors={errors}
        />
        <div className="flex flex-col gap-3">
          <Label htmlFor="iconColor">Icon Color</Label>
          <Input
            type="color"
            id="iconColor"
            value={selectedColor}
            onChange={handleColorChange}
            className="w-32 h-10 p-1 cursor-pointer"
          />
        </div>
        <Separator className="my-2" />
        <div className="flex flex-col gap-3">
          <Label>Choose Icon Style</Label>
          <IconSelector 
            selectedIcon={selectedIcon}
            onSelectIcon={handleIconSelect}
            iconColor={selectedColor}
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        {chatBot?.icon ? (
          <div className="relative">
            <div className="rounded-full overflow-hidden">
              <Image
                src={`https://ucarecdn.com/${chatBot.icon}/`}
                alt="bot"
                width={80}
                height={80}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 hover:bg-red-600"
              onClick={onRemoveIcon}
              disabled={loading}
            >
              <X className="h-4 w-4 text-white" />
            </Button>
          </div>
        ) : (
          <div 
            className="rounded-full cursor-pointer shadow-md w-20 h-20 flex items-center justify-center"
            style={{ backgroundColor: selectedColor }}
          >
            {(() => {
              const IconComponent = BotIcons[selectedIcon];
              return <IconComponent className="w-12 h-12" color="white" />;
            })()}
          </div>
        )}
        <div className="text-sm text-gray-500">
          {chatBot?.icon ? 
            'Using custom uploaded image' : 
            `Using ${selectedIcon} icon style`
          }
        </div>
      </div>
    </div>
  )
}

export default EditChatbotIcon
