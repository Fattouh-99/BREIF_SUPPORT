import { UserRole } from '@prisma/client'
import { ZodType, z } from 'zod'

export const UserRegistrationSchema = z
  .object({
    role: z.nativeEnum(UserRole),
    selectedPlan: z.string().optional(),
    hasPaid: z.boolean().optional().default(false),
    fullname: z
      .string()
      .min(4, { message: 'your full name must be atleast 4 characters long' }),
    email: z.string().email({ message: 'Incorrect email format' }),
    confirmEmail: z.string().email(),
    password: z
      .string()
      .min(8, { message: 'Your password must be atleast 8 characters long' })
      .max(64, {
        message: 'Your password can not be longer then 64 characters long',
      })
      .refine(
        (value) => /^[a-zA-Z0-9_.-]*$/.test(value ?? ''),
        'password should contain only alphabets and numbers'
      ),
    confirmPassword: z.string(),
    otp: z.string().min(6, "Please enter the complete verification code"),
    products: z.string().min(1, 'Please describe your products/services'),
    categories: z.string().min(1, 'Please describe your product categories'),
    targetAudience: z.string().min(1, 'Please describe your target audience'),
    clerkUserId: z.string().optional(),
    clerkSessionId: z.string().optional(),
    teamId: z.string().optional(),
  })
  .refine((schema) => schema.password === schema.confirmPassword, {
    message: 'passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((schema) => schema.email === schema.confirmEmail, {
    message: 'Your emails not match',
    path: ['confirmEmail'],
  })

export type UserLoginProps = {
  email: string
  password: string
}

export type ChangePasswordProps = {
  password: string
  confirmPassword: string
}

export type ChangeEmailProps = {
  email: string
  confirmEmail: string
}

export type ChangeFullNameProps = {
  fullname: string
}

export const UserLoginSchema: ZodType<UserLoginProps> = z.object({
  email: z.string().email({ message: 'You did not enter a valid email' }),
  password: z
    .string()
    .min(8, { message: 'Your password must be atleast 8 characters long' })
    .max(64, {
      message: 'Your password can not be longer then 64 characters long',
    }),
})

export const ChangePasswordSchema: ZodType<ChangePasswordProps> = z
  .object({
    password: z
      .string()
      .min(8, { message: 'Your password must be atleast 8 characters long' })
      .max(64, {
        message: 'Your password can not be longer then 64 characters long',
      })
      .refine(
        (value) => /^[a-zA-Z0-9_.-]*$/.test(value ?? ''),
        'password should contain only alphabets and numbers'
      ),
    confirmPassword: z.string(),
  })
  .refine((schema) => schema.password === schema.confirmPassword, {
    message: 'passwords do not match',
    path: ['confirmPassword'],
  })

export const ChangeEmailSchema: ZodType<ChangeEmailProps> = z.object({
  email: z.string().email({ message: 'You did not enter a valid email' }),
  confirmEmail: z.string().email(),
})

export const ChangeFullNameSchema: ZodType<ChangeFullNameProps> = z.object({
  fullname: z.string().min(4, { message: 'Your full name must be at least 4 characters long' })
})

export type UserRegistrationProps = z.infer<typeof UserRegistrationSchema>
