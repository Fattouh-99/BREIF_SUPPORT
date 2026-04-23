import React, { useState, useEffect } from 'react'
import { FieldErrors } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { validateTeamCode } from '@/actions/team'
import { Spinner } from '@/components/spinner'
import { CheckCircle2, AlertCircle } from 'lucide-react'

type Props = {
  errors: FieldErrors
  companyCode: string
  setCompanyCode: (value: string) => void
  setTeamId?: (id: string | null) => void
  onValidCodeFound?: (isValid: boolean) => void
}

const CompanyCodeForm = ({ 
  errors, 
  companyCode, 
  setCompanyCode,
  setTeamId,
  onValidCodeFound
}: Props) => {
  const [isValidating, setIsValidating] = useState(false)
  const [validationMessage, setValidationMessage] = useState<{
    type: 'success' | 'error' | 'info' | null
    message: string
  }>({ type: null, message: '' })
  const [teamInfo, setTeamInfo] = useState<{
    id: string
    name: string
    ownerName: string
  } | null>(null)

  // Validate code when it changes
  useEffect(() => {
    const validateCode = async () => {
      // Don't validate empty codes or codes that are too short
      if (!companyCode || companyCode.length < 4) {
        setValidationMessage({ type: null, message: '' })
        setTeamInfo(null)
        if (setTeamId) setTeamId(null)
        if (onValidCodeFound) onValidCodeFound(false)
        return
      }

      setIsValidating(true)
      try {
        const result = await validateTeamCode(companyCode)
        if (result.success && result.team) {
          setValidationMessage({ 
            type: 'success', 
            message: `Valid code for ${result.team.name}` 
          })
          setTeamInfo(result.team)
          if (setTeamId) setTeamId(result.team.id)
          if (onValidCodeFound) onValidCodeFound(true)
        } else {
          setValidationMessage({ 
            type: 'error', 
            message: result.error || 'Invalid team code' 
          })
          setTeamInfo(null)
          if (setTeamId) setTeamId(null)
          if (onValidCodeFound) onValidCodeFound(false)
        }
      } catch (error) {
        setValidationMessage({ 
          type: 'error', 
          message: 'Error validating code'
        })
        setTeamInfo(null)
        if (setTeamId) setTeamId(null)
        if (onValidCodeFound) onValidCodeFound(false)
      } finally {
        setIsValidating(false)
      }
    }

    // Use a debounce to avoid too many API calls
    const timeoutId = setTimeout(validateCode, 500)
    return () => clearTimeout(timeoutId)
  }, [companyCode, setTeamId, onValidCodeFound])

  return (
    <div className="w-full">
      <h2 className="text-gravel dark:text-gray-200 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-1 sm:mb-2">Company Verification</h2>
      <p className="text-iridium dark:text-gray-400 text-center text-xs sm:text-sm md:text-base mb-6 sm:mb-8">
        Enter the code provided by your company administrator
      </p>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Company Code
          </label>
          <div className="relative">
            <Input 
              type="text"
              placeholder="Enter your company code"
              className={`w-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 ${
                validationMessage.type === 'success' 
                  ? 'border-green-500 pr-10' 
                  : validationMessage.type === 'error'
                  ? 'border-red-500 pr-10'
                  : ''
              }`}
              value={companyCode}
              onChange={(e) => setCompanyCode(e.target.value)}
            />
            {isValidating && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Spinner noPadding />
              </div>
            )}
            {!isValidating && validationMessage.type === 'success' && (
              <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 h-5 w-5" />
            )}
            {!isValidating && validationMessage.type === 'error' && (
              <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 h-5 w-5" />
            )}
          </div>
          {validationMessage.type && (
            <p className={`text-xs sm:text-sm ${
              validationMessage.type === 'success' 
                ? 'text-green-600 dark:text-green-400' 
                : validationMessage.type === 'error'
                ? 'text-red-500 dark:text-red-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {validationMessage.message}
            </p>
          )}
          {errors.companyCode && (
            <p className="text-red-500 dark:text-red-400 text-xs sm:text-sm">
              {errors.companyCode.message as string}
            </p>
          )}
        </div>
        
        {teamInfo && (
          <div className="p-4 border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 rounded-md">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              Team Information
            </p>
            <ul className="mt-2 space-y-1">
              <li className="text-sm text-green-700 dark:text-green-300">
                <span className="font-medium">Name:</span> {teamInfo.name}
              </li>
              <li className="text-sm text-green-700 dark:text-green-300">
                <span className="font-medium">Owner:</span> {teamInfo.ownerName}
              </li>
            </ul>
          </div>
        )}
        
        <div className="space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This code verifies that you're authorized to join your company's account. 
            If you don't have a code, please contact your administrator.
          </p>
        </div>
      </div>
    </div>
  )
}

export default CompanyCodeForm 