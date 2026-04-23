'use client'

import React from 'react'

import { Button } from '@/components/ui/button'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { ErrorMessage } from '@hookform/error-message'
import { Loader } from '@/components/loader'
import FormGenerator from '../forms/form-generator'
import { UploadIcon } from 'lucide-react'
import { useAppointments } from '@/hooks/settings/use-settings'

type CreateAppointmentFormProps = {
  id: string
}

export const CreateAppointmentForm = ({ id }: CreateAppointmentFormProps) => {
  const { onCreateNewAppointment, register, errors, loading } = useAppointments(id)
  return (
    <form
      className="mt-3 w-full flex flex-col gap-5 py-10"
      onSubmit={onCreateNewAppointment}
    >
      <FormGenerator
        inputType="input"
        register={register}
        label="Appointment Name:"
        name="name"
        errors={errors}
        placeholder="Your appointment name"
        type="text"
      />

      <FormGenerator
        inputType="select"
        register={register}
        label="Select Appointment Type:"
        name="appointmentType"
        errors={errors}
        type="text"
        placeholder="Select appointment type"
        options={[
          { value: "consultation", label: "Consultation", id: "consultation" },
          { value: "follow_up", label: "Follow-up Visit", id: "follow_up" },
          { value: "checkup", label: "Regular Checkup", id: "checkup" },
          { value: "treatment", label: "Treatment Session", id: "treatment" },
          { value: "evaluation", label: "Initial Evaluation", id: "evaluation" }
        ]}
      />
    
      <div className="flex flex-col items-start">
        <p className="text-sm font-semibold mb-1">Upload Appointment Image:</p>
        <Label
          htmlFor="upload-product"
          className="flex gap-1 p-2 rounded-lg border border-indigo-500 text-indigo-500 cursor-pointer text-sm items-center"
        >
          <Input
            {...register('image')}
            className="hidden"
            type="file"
            id="upload-product"
          />
          <UploadIcon />
          Upload
        </Label>
        <ErrorMessage
          errors={errors}
          name="image"
          render={({ message }) => (
            <p className="text-red-400 mt-2">
              {message === 'Required' ? '' : message}
            </p>
          )}
        />
      </div>

      <FormGenerator
        inputType="input"
        register={register}
        label="Price"
        name="price"
        errors={errors}
        placeholder="0.00"
        type="text"
      />

      <Button
        type="submit"
        className="w-full border border-indigo-500 text-indigo-500"
      >
        <Loader loading={loading}>Create Product</Loader>
      </Button>
    </form>
  )
}
