'use client'
import { Separator } from '@/components/ui/separator'
import { useSettings } from '@/hooks/settings/use-settings'
import React, { useState } from 'react'
import { DomainUpdate } from './domain-update'
import DomainLogoUpload from './domain-logo-upload'
import CodeSnippet from './code-snippet'
import EditChatbotIcon from './edit-chatbot-icon'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/loader'
import { BotIconType } from '@/icons/bot-icons'
import PaymentToggle from './payment-toggle'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const WelcomeMessage = dynamic(
  () => import('./greetings-message').then((props) => props.default),
  {
    ssr: false,
  }
)

type Props = {
  id: string
  name: string
  plan: 'STANDARD' | 'PRO' | 'ULTIMATE'
  chatBot: {
    id: string
    icon: string | null
    iconColor: string | null
    welcomeMessage: string | null
    background: string | null
    textColor: string | null
    themeColor: string | null
    helpDeskColor: string | null
    titleColor: string | null
    bubbleBackground: string | null
    homeTitle: string | null
    homeLayout: string | null

    iconStyle?: BotIconType
    paymentEnabled?: boolean
    popularTopics?: string | null
    customLinks?: Array<{
      id: string
      title: string
      description: string | null
      url: string
      createdAt: string
    }>
  } | null
  helpDeskQuestions?: Array<{
    id: string
    question: string
    answer: string
  }>
  permissions: {
    canModifyName: boolean
    canModifyIcon: boolean
    canModifyChat: boolean
    canDelete: boolean
  }
  domainIcon?: string | null
}

const SettingsForm = ({ id, name, chatBot, plan, permissions, domainIcon, helpDeskQuestions = [] }: Props) => {
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const {
    register,
    control,
    setValue,
    onUpdateSettings,
    errors,
    onDeleteDomain,
    deleting,
    loading,
  } = useSettings(id)

  const handleDeleteDomain = async () => {
    if (!permissions.canDelete) {
      return;
    }

    if (!password) {
      setPasswordError('Password is required')
      return
    }
    
    try {
      const response = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      if (response.ok) {
        await onDeleteDomain()
        setIsOpen(false)
      } else {
        setPasswordError('Incorrect password')
      }
    } catch (error) {
      setPasswordError('Failed to verify password')
    }
  }

  return (
    <form
      className="flex flex-col gap-4 sm:gap-8 pb-6 sm:pb-10 px-4 sm:px-0"
      onSubmit={(e) => {
        e.preventDefault();
        if (!permissions.canModifyName && !permissions.canModifyIcon && !permissions.canModifyChat) {
          return;
        }
        onUpdateSettings(e);
      }}
    >
      <div className="flex flex-col gap-3">
        <h2 className="font-bold text-xl sm:text-2xl">Domain Settings</h2>
        <Separator orientation="horizontal" />
        {permissions.canModifyIcon && (
          <DomainLogoUpload
            register={register}
            errors={errors}
            domainId={id}
            currentIcon={domainIcon}
          />
        )}
        {permissions.canModifyName && (
          <DomainUpdate
            name={name}
            register={register}
            errors={errors}
          />
        )}
      </div>
      {(permissions.canModifyIcon || permissions.canModifyChat) && (
        <div className="flex flex-col gap-3 mt-3 sm:mt-5">
          <div className="flex gap-4 items-center">
            <h2 className="font-bold text-xl sm:text-2xl">Chatbot Settings</h2>
          </div>
          <Separator orientation="horizontal" />
          <div className="grid md:grid-cols-2 gap-4">
            <div className="col-span-1 flex flex-col gap-4 sm:gap-5">
              {permissions.canModifyIcon && (
                <EditChatbotIcon
                  chatBot={chatBot}
                  register={register}
                  setValue={setValue}
                  errors={errors}
                  domainId={id}
                />
              )}
              {permissions.canModifyChat && (
                <WelcomeMessage
                  message={chatBot?.welcomeMessage!}
                  register={register}
                  errors={errors}
                  control={control}
                  setValue={setValue}
                  defaultBackground={chatBot?.background || '#ffffff'}
                  defaultTextColor={chatBot?.textColor || '#374151'}
                  defaultThemeColor={chatBot?.themeColor || '#f3f4f6'}
                  defaultHelpDeskColor={chatBot?.helpDeskColor || '#f3f4f6'}
                  defaultTitleColor={chatBot?.titleColor || '#1F2937'}
                  domainId={id}
                  initialCustomLinks={chatBot?.customLinks || []}
                  initialPopularTopics={chatBot?.popularTopics || undefined}
                  helpDeskQuestions={helpDeskQuestions}
                  defaultHomeTitle={chatBot?.homeTitle || undefined}
                />
              )}
            </div>
            {/* <div className="col-span-1">
              {permissions.canModifyChat && (
                <PaymentToggle
                  chatBot={chatBot}
                  register={register}
                  domainId={id}
                />
              )}
            </div> */}
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 justify-start">
        {(permissions.canModifyName || permissions.canModifyIcon || permissions.canModifyChat) && (
          <Button
            type="submit"
            className="w-full sm:w-[180px] h-[45px] sm:h-[50px] border border-indigo-500 disabled:opacity-50"
          >
            <Loader loading={loading}>Save Changes</Loader>
          </Button>
        )}
        {permissions.canDelete && (
          <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                className="w-full sm:w-auto px-6 sm:px-10 h-[45px] sm:h-[50px] border border-red-500 disabled:opacity-50"
              >
                Delete Domain
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Domain</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your domain
                  and remove all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex flex-col gap-2 py-3">
                <Label htmlFor="password">
                  Please enter your password to confirm deletion
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setPasswordError('')
                  }}
                  placeholder="Enter your password"
                  className={passwordError ? 'border-red-500' : ''}
                />
                {passwordError && (
                  <p className="text-sm text-red-500">{passwordError}</p>
                )}
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => {
                      setPassword('')
                      setPasswordError('')
                }}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteDomain}
                  className="bg-red-600 text-white hover:bg-red-700"
                  disabled={deleting}
                >
                  <Loader loading={deleting}>Delete Domain</Loader>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      {(permissions.canModifyName || permissions.canModifyIcon || permissions.canModifyChat) && (
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 justify-start">
          <p className="text-xs sm:text-sm mt-2 text-red-400 border border-red-400 rounded-md p-2">
            Note: To reflect any changes, you must save the changes.
          </p>
        </div>
      )}
    </form>
  )
}

export default SettingsForm
