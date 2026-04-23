'use client'

import { useChangeFullName, useUserProfile } from "@/hooks/settings/use-settings"
import FormGenerator from "../forms/form-generator"
import Section from "../section-label"
import { Button } from "../ui/button"
import { Loader } from "../loader"

const ChangeFullName = () => {
  const { profileData, loading: profileLoading, refreshProfile } = useUserProfile()
  const { register, errors, onChangeFullName, loading } = useChangeFullName(refreshProfile)
  
  return(
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
      <div className="lg:col-span-1">
        <Section
          label="Change Full Name"
          message="Update your full name"
        />
      </div>
      <form
        className="lg:col-span-4"
        onSubmit={onChangeFullName}
      >
        <div className="lg:w-[500px] flex flex-col gap-3">
          <div className="text-sm text-gray-500 mb-2">
            Current name: {profileLoading ? 'Loading...' : (profileData?.fullname || "Not set")}
          </div>
          <FormGenerator
            inputType="input"
            register={register}
            name="fullname"
            errors={errors}
            placeholder="Enter your full name"
            type="text"
          />
          <Button 
            className="bg-indigo-500 text-white font-semibold hover:bg-indigo-600" 
            type="submit"
          >
            <Loader loading={loading}>
              Update Full Name
            </Loader>
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ChangeFullName