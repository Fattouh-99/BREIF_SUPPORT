"use client"
import React, { useState, useEffect } from 'react'

type InitialValuesProps = {
  currentStep: number
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>
  tempSignupEmail: string
  setTempSignupEmail: React.Dispatch<React.SetStateAction<string>>
  tempSignupPassword: string
  setTempSignupPassword: React.Dispatch<React.SetStateAction<string>>
  preSelectedPlan: string | null
  setPreSelectedPlan: React.Dispatch<React.SetStateAction<string | null>>
}

const InitialValues: InitialValuesProps = {
  currentStep: 1,
  setCurrentStep: () => undefined,
  tempSignupEmail: '',
  setTempSignupEmail: () => undefined,
  tempSignupPassword: '',
  setTempSignupPassword: () => undefined,
  preSelectedPlan: null,
  setPreSelectedPlan: () => undefined,
}

const authContext = React.createContext(InitialValues)

const { Provider } = authContext

export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [currentStep, setCurrentStep] = useState<number>(
    InitialValues.currentStep
  )
  const [tempSignupEmail, setTempSignupEmail] = useState<string>('')
  const [tempSignupPassword, setTempSignupPassword] = useState<string>('')
  const [preSelectedPlan, setPreSelectedPlan] = useState<string | null>(null)
  
  // Debug logging for context changes
  useEffect(() => {
    console.log('Auth context updated:', { 
      currentStep, 
      tempSignupEmail: tempSignupEmail ? `${tempSignupEmail.substring(0, 3)}...` : '',
      hasPassword: !!tempSignupPassword
    });
  }, [currentStep, tempSignupEmail, tempSignupPassword]);
  
  const values = {
    currentStep,
    setCurrentStep,
    tempSignupEmail,
    setTempSignupEmail,
    tempSignupPassword,
    setTempSignupPassword,
    preSelectedPlan,
    setPreSelectedPlan,
  }
  return <Provider value={values}>{children}</Provider>
}

export const useAuthContextHook = () => {
  const state = React.useContext(authContext)
  return state
}
