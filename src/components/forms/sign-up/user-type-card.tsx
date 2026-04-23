'use client'
import { UserRole } from '@prisma/client'
import { Card, CardContent, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { User } from 'lucide-react'
import React from 'react'
import { FieldValues, UseFormRegister, UseFormSetValue } from 'react-hook-form'

type Props = {
  value: UserRole
  title: string
  text: string
  register: UseFormRegister<FieldValues>
  userType: UserRole
  setUserType: React.Dispatch<React.SetStateAction<UserRole>>
  setValue?: UseFormSetValue<FieldValues>
}

const UserTypeCard = ({
  register,
  setUserType,
  text,
  title,
  userType,
  value,
  setValue,
}: Props) => {

  const handleRoleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRole = event.target.value as UserRole;
    
    // Only update if there's a change to avoid unnecessary re-renders
    if (newRole !== userType) {
      setUserType(newRole);
      
      // If changing to MEMBER, set hasPaid to true and select standard plan
      if (newRole === UserRole.MEMBER && setValue) {
        setValue('selectedPlan', 'standard');
        setValue('hasPaid', true);
      }
    }
  };

  return (
    <Label htmlFor={value}>
      <Card
        className={cn(
          'w-full cursor-pointer dark:bg-gray-800 dark:border-gray-700',
          userType === value && 'border-indigo-600 dark:border-indigo-500'
        )}
      >
        <CardContent className="flex justify-between p-2 sm:p-3">
          <div className="flex items-center gap-1 sm:gap-3">
            <Card
              className={cn(
                'flex justify-center p-2 sm:p-3 dark:bg-gray-800 dark:border-gray-700',
                userType === value && 'border-indigo-600 dark:border-indigo-500'
              )}
            >
              <User
                size={24}
                className={cn(
                  userType === value 
                    ? 'text-indigo-600 dark:text-indigo-400' 
                    : 'text-gray-400 dark:text-gray-500'
                )}
              />
            </Card>
            <div className="">
              <CardDescription className="text-xs sm:text-sm font-medium text-iridium dark:text-gray-300">
                {title}
              </CardDescription>
              <CardDescription className="text-xs sm:text-sm text-gray-400 dark:text-gray-500">
                {text}
              </CardDescription>
            </div>
          </div>
          <div>
            <div
              className={cn(
                'w-4 h-4 rounded-full',
                userType === value ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-transparent'
              )}
            >
              <Input
                {...register('role', {
                  onChange: handleRoleChange,
                })}
                value={value}
                id={value}
                className="hidden"
                type="radio"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </Label>
  )
}

export default UserTypeCard
