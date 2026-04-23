import { UserRole } from '@prisma/client'
import React from 'react'
import { FieldValues, UseFormRegister, UseFormSetValue } from 'react-hook-form'
import UserTypeCard from './user-type-card'

type Props = {
  register: UseFormRegister<FieldValues>
  userType: UserRole
  setUserType: React.Dispatch<React.SetStateAction<UserRole>>
  setValue?: UseFormSetValue<FieldValues>
}

const TypeSelectionForm = ({ register, setUserType, userType, setValue }: Props) => {
  return (
    <div className="w-full flex flex-col items-center">
      <h2 className="text-gravel dark:text-gray-200 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-1 sm:mb-2">Create an account</h2>
      <p className="text-iridium dark:text-gray-400 text-center text-xs sm:text-sm md:text-base mb-4 sm:mb-6">
        Tell us about yourself! What do you do?
      </p>
      <div className="w-full space-y-3 sm:space-y-4">
        <UserTypeCard
          register={register}
          setUserType={setUserType}
          userType={userType}
          value={UserRole.OWNER}
          title="I own a business"
          text="Setting up my account for my company."
          setValue={setValue}
        />
        <UserTypeCard
          register={register}
          setUserType={setUserType}
          userType={userType}
          value={UserRole.MEMBER}
          title="I'm a member of a company"
          text="Joining my company's account as a team member."
          setValue={setValue}
        />
      </div>
    </div>
  )
}

export default TypeSelectionForm
