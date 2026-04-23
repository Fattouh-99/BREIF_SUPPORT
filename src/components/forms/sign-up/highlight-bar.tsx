'use client'
import { useAuthContextHook } from '@/context/use-auth-context'
import React from 'react'
import { useFormContext } from 'react-hook-form'
import { UserRole } from '@prisma/client'

const HighLightBar = () => {
  const { currentStep } = useAuthContextHook()
  const { watch } = useFormContext()
  
  // Now the total steps is 5 for all users
  const totalSteps = 5
  
  // Calculate progress percentage based on the 5-step flow
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
        style={{ width: `${progressPercentage}%` }}
      ></div>
    </div>
  )
}

export default HighLightBar
