import { USER_REGISTRATION_FORM } from '@/constants/forms'
import React from 'react'
import { useFormContext, FieldErrors } from 'react-hook-form'
import FormGenerator from '../form-generator'
import { useAuthContextHook } from '@/context/use-auth-context'

interface DetailFormProps {
  errors: FieldErrors<any>;
}

function AccountDetailsForm({ errors }: DetailFormProps) {
  const { register } = useFormContext();
  const { setCurrentStep } = useAuthContextHook();
  
  return (
    <>
      <h2 className="text-gravel dark:text-gray-200 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-1 sm:mb-2">Account details</h2>
      <p className="text-iridium dark:text-gray-400 text-center text-xs sm:text-sm md:text-base mb-4 sm:mb-6">Enter your email and password</p>
      <div className="flex flex-col gap-3 sm:gap-4 w-full">
        {USER_REGISTRATION_FORM.map((field) => (
          <FormGenerator
            key={field.id}
            {...field}
            errors={errors}
            register={register}
            name={field.name}
          />
        ))}
      </div>
    </>
  )
}

export default AccountDetailsForm
