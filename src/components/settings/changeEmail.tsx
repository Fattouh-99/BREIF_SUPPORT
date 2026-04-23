'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/loader'
import FormGenerator from '../forms/form-generator'
import { useChangeEmail } from '@/hooks/settings/use-settings'
import Section from '../section-label'
import { useUser } from "@clerk/nextjs"

const ChangeEmail = () => {
  const { register, errors, onChangeEmail, loading } = useChangeEmail()
  const { user } = useUser()
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
      <div className="lg:col-span-1">
        <Section
          label="Change Email"
          message="Update your email address"
        />
      </div>

      <form
        className="lg:col-span-4"
        onSubmit={onChangeEmail}
      >
        <div className="lg:w-[500px] flex flex-col gap-3">
          <div className="text-sm text-gray-500 mb-2">
            Current email: {user?.primaryEmailAddress?.emailAddress || "Not set"}
          </div>
          <FormGenerator
            inputType="input"
            register={register}
            name="email"
            errors={errors}
            placeholder="Enter your new email"
            type="email"
          />
          <FormGenerator
            inputType="input"
            register={register}
            name="confirmEmail"
            errors={errors}
            placeholder="Confirm your new email"
            type="email"
          />

          <Button 
            className="bg-indigo-500 text-white font-semibold hover:bg-indigo-600" 
            type="submit"
          >
            <Loader loading={loading}>
              Update Email
            </Loader>
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ChangeEmail
