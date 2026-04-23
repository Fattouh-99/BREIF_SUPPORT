'use client'
import React, { memo, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import FormGenerator from '../form-generator'
import { USER_LOGIN_FORM } from '@/constants/forms'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type Props = {}

// Memoize form title and text to prevent re-renders
const FormHeader = memo(() => (
  <>
    <h2 className="text-gravel text-center dark:text-white text-2xl sm:text-3xl font-bold">Log In</h2>
    <p className="text-iridium text-center dark:text-gray-400 text-sm mt-2">
      Welcome back! Please enter your credentials
    </p>
  </>
))
FormHeader.displayName = 'FormHeader'

const LoginForm = (props: Props) => {
  const {
    register,
    formState: { errors },
  } = useFormContext()
  
  // Memoize form fields to prevent unnecessary re-renders
  const formFields = useMemo(() => 
    USER_LOGIN_FORM.map((field) => (
      <FormGenerator
        key={field.id}
        {...field}
        errors={errors}
        register={register}
        name={field.name}
      />
    )),
  [errors, register]
  )

  return (
    <div className="flex flex-col justify-between h-full">
      <div>
      <FormHeader />
        <div className="mt-6">
        {formFields}
        </div>
      </div>
      <div className="mt-6 flex flex-col space-y-4">
        <Button type="submit" className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white text-base">
          Sign In
        </Button>
        <div className="text-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
          </span>
          <Link href="/auth/sign-up" className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}

export default memo(LoginForm)
