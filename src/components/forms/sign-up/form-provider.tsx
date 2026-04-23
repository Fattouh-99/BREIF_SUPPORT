'use client'
import { Loader } from '@/components/loader'
import { AuthContextProvider } from '@/context/use-auth-context'
import { useSignUpForm } from '@/hooks/sign-up/use-sign-up'
import React, { useState } from 'react'
import { FormProvider } from 'react-hook-form'
import { useRouter } from 'next/navigation'

type Props = {
  children: React.ReactNode
  initialPlan?: string | null
}

const SignUpFormProvider = ({ children, initialPlan }: Props) => {
  const { methods, onHandleSubmit, loading } = useSignUpForm()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Create a wrapper for the form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Call the original submit handler
      await onHandleSubmit(e)
      
      // Reset submission state
      setIsSubmitting(false)
    } catch (error) {
      console.error('Form submission error:', error)
      setIsSubmitting(false)
    }
  }

  return (
    <AuthContextProvider>
      <FormProvider {...methods}>
        <form
          onSubmit={handleFormSubmit}
          className="h-full"
        >
          <div className="flex flex-col justify-between gap-3 h-full">
            <Loader loading={loading || isSubmitting}>{children}</Loader>
          </div>
        </form>
      </FormProvider>
    </AuthContextProvider>
  )
}

export default SignUpFormProvider
