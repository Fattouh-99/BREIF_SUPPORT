import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { strict } from 'assert'
import { ErrorMessage } from '@hookform/error-message'
import React from 'react'
import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

type Props = {
  type: 'text' | 'email' | 'password' | 'number'
  inputType: 'select' | 'input' | 'textarea'
  options?: { value: string; label: string; id: string }[]
  label?: string
  placeholder: string
  register: UseFormRegister<any>
  name: string
  errors: FieldErrors<FieldValues>
  lines?: number
  form?: string
  defaultValue?: string
  min?: string
  max?: string
}

const FormGenerator = ({
  errors,
  inputType,
  name,
  placeholder,
  defaultValue,
  register,
  type,
  form,
  label,
  lines,
  options,
  min,
  max,
}: Props) => {
  // Use name as fallback for label to ensure unique IDs
  const uniqueId = label || name;
  
  switch (inputType) {
    case 'input':
    default:
      return (
        <Label
          className="flex flex-col gap-2 text-gray-900 dark:text-gray-100 mb-4"
          htmlFor={`input-${uniqueId}`}
        >
          {label && <span className="mb-1 text-sm font-medium">{label}</span>}
          <Input
            id={`input-${uniqueId}`}
            type={type}
            placeholder={placeholder}
            form={form}
            defaultValue={defaultValue}
            min={min}
            max={max}
            className={cn(
              "dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-400",
              "form-input" // Mobile-specific styling class
            )}
            {...register(name)}
          />
          <ErrorMessage
            errors={errors}
            name={name}
            render={({ message }) => (
              <p className="text-red-400 dark:text-red-300 mt-2 text-sm">
                {message === 'Required' ? '' : message}
              </p>
            )}
          />
        </Label>
      )
    case 'select':
      return (
        <Label className="flex flex-col gap-2 text-gray-900 dark:text-gray-100 mb-4" htmlFor={`select-${uniqueId}`}>
          {label && <span className="mb-1 text-sm font-medium">{label}</span>}
          <select
            form={form}
            id={`select-${uniqueId}`}
            {...register(name)}
            defaultValue=""
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
              "file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-400",
              "form-input" // Mobile-specific styling class
            )}
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {options?.length &&
              options.map((option) => (
                <option
                  value={option.value}
                  key={option.id}
                  className="dark:bg-gray-800"
                >
                  {option.label}
                </option>
              ))}
          </select>
          <ErrorMessage
            errors={errors}
            name={name}
            render={({ message }) => (
              <p className="text-red-400 dark:text-red-300 mt-2 text-sm">
                {message === 'Required' ? '' : message}
              </p>
            )}
          />
        </Label>
      )
    case 'textarea':
      return (
        <Label
          className="flex flex-col gap-2 text-gray-900 dark:text-gray-100 mb-4"
          htmlFor={`input-${uniqueId}`}
        >
          {label && <span className="mb-1 text-sm font-medium">{label}</span>}
          <Textarea
            form={form}
            id={`input-${uniqueId}`}
            placeholder={placeholder}
            {...register(name)}
            rows={lines}
            defaultValue={defaultValue}
            className={cn(
              "dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-400",
              "form-input" // Mobile-specific styling class
            )}
          />
          <ErrorMessage
            errors={errors}
            name={name}
            render={({ message }) => (
              <p className="text-red-400 dark:text-red-300 mt-2 text-sm">
                {message === 'Required' ? '' : message}
              </p>
            )}
          />
        </Label>
      )
  }
}

export default FormGenerator
