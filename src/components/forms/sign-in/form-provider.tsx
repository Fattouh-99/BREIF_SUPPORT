'use client'
import { Loader } from '@/components/loader'
import { AuthContextProvider } from '@/context/use-auth-context'
import { useSignInForm } from '@/hooks/sign-in/use-sign-in'
import React, { memo, useMemo } from 'react'
import { FormProvider } from 'react-hook-form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

type Props = {
  children: React.ReactNode
}

// Memoize alert components to prevent re-renders
const LockoutAlert = memo(() => (
  <Alert variant="destructive" className="mb-4">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>
      Account temporarily locked due to too many failed attempts. Please try again later.
    </AlertDescription>
  </Alert>
))
LockoutAlert.displayName = 'LockoutAlert'

type WarningAlertProps = {
  remainingAttempts: number
}

const WarningAlert = memo(({ remainingAttempts }: WarningAlertProps) => (
  <Alert variant="destructive" className="mb-4 bg-yellow-50 border-yellow-200">
    <AlertCircle className="h-4 w-4 text-yellow-600" />
    <AlertDescription className="text-yellow-800">
      Warning: {remainingAttempts} login attempts remaining before temporary lockout.
    </AlertDescription>
  </Alert>
))
WarningAlert.displayName = 'WarningAlert'

const SignInFormProvider = ({ children }: Props) => {
  const { methods, onHandleSubmit, loading, isLocked, remainingAttempts } = useSignInForm()

  // Memoize the alert content to prevent re-renders
  const alertContent = useMemo(() => {
    if (isLocked) {
      return <LockoutAlert />;
    }
    if (!isLocked && remainingAttempts < 5 && remainingAttempts > 0) {
      return <WarningAlert remainingAttempts={remainingAttempts} />;
    }
    return null;
  }, [isLocked, remainingAttempts]);

  return (
    <AuthContextProvider>
      <FormProvider {...methods}>
        <form
          onSubmit={onHandleSubmit}
          className="h-full"
        >
          <div className="flex flex-col justify-between gap-3 h-full relative">
            {alertContent}
            <Loader loading={loading}>{children}</Loader>
          </div>
        </form>
      </FormProvider>
    </AuthContextProvider>
  )
}

export default memo(SignInFormProvider)
