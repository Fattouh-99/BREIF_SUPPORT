import { z } from 'zod'

export const MAX_UPLOAD_SIZE = 1024 * 1024 * 2 // 2MB
export const ACCEPTED_FILE_TYPES = ['image/png', 'image/jpg', 'image/jpeg']

export type DomainSettingsProps = {
  domain?: string
  image?: any
  domainLogo?: any
  welcomeMessage?: string
  background?: string
  textColor?: string
  iconColor?: string
  iconStyle?: string
  paymentEnabled?: boolean
  themeColor?: string
  helpDeskColor?: string
  titleColor?: string
  customLinkTitle?: string
  customLinkDescription?: string
  customLinkUrl?: string
  
  // Feedback Configuration
  feedbackEnabled?: boolean
  feedbackQuestion?: string
  feedbackYesText?: string
  feedbackNoText?: string
  feedbackFollowUp?: string
}

export type HelpDeskQuestionsProps = {
  title: string
  question: string
  answer: string
  content?: string
  articleType: 'faq' | 'article' | 'guide'
  category?: string
  tags: string[]
  isPublished: boolean
  isPinned: boolean
}

export type AddProductProps = {
  name: string
  images: any
  additionalImages?: any
  price: string
  productType: string
  description: string
  hasDiscount: boolean
  discount?: string
  discountedPrice?: string
  variants?: { name: string; options: string[] }[]
  existingImage?: string
  existingAdditionalImages?: string[]
  productUrl?: string
}

export type FilterQuestionsProps = z.infer<typeof FilterQuestionsSchema>

export const AddDomainSchema = z.object({
  domain: z
    .string()
    .min(4, { message: 'A domain must have atleast 3 characters' })
    .refine(
      (value) =>
        /^((?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,3}$/.test(value ?? ''),
      'This is not a valid domain'
    ),
  image: z
    .any()
    .refine((files) => files?.[0]?.size <= MAX_UPLOAD_SIZE, {
      message: 'Your file size must be less then 2MB',
    })
    .refine((files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type), {
      message: 'Only JPG, JPEG & PNG are accepted file formats',
    }),
})

export const DomainSettingsSchema = z
  .object({
    domain: z
      .string()
      .min(4, { message: 'A domain must have atleast 3 characters' })
      .refine(
        (value) =>
          /^((?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,3}$/.test(value ?? ''),
        'This is not a valid domain'
      )
      .optional()
      .or(z.literal('').transform(() => undefined)),
    image: z.any().optional(),
    domainLogo: z.any().optional(),
    welcomeMessage: z
      .string()
      .min(6, 'The message must be atleast 6 characters')
      .optional()
      .or(z.literal('').transform(() => undefined)),
    background: z
      .string()
      .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color')
      .optional()
      .or(z.literal('').transform(() => undefined)),
    textColor: z
      .string()
      .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color')
      .optional()
      .or(z.literal('').transform(() => undefined)),
    iconColor: z
      .string()
      .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color')
      .optional()
      .or(z.literal('').transform(() => undefined)),
    themeColor: z
      .string()
      .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color')
      .optional()
      .or(z.literal('').transform(() => undefined)),
    helpDeskColor: z
      .string()
      .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color')
      .optional()
      .or(z.literal('').transform(() => undefined)),
    titleColor: z
      .string()
      .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color')
      .optional()
      .or(z.literal('').transform(() => undefined)),
    iconStyle: z
      .string()
      .optional()
      .or(z.literal('').transform(() => undefined)),
    paymentEnabled: z.boolean().optional(),
    customLinkTitle: z
      .string()
      .optional()
      .or(z.literal('').transform(() => undefined)),
    customLinkDescription: z
      .string()
      .optional()
      .or(z.literal('').transform(() => undefined)),
    customLinkUrl: z
      .string()
      .url('Please enter a valid URL')
    .optional()
    .or(z.literal('').transform(() => undefined)),
    
  // Feedback Configuration
  feedbackEnabled: z.boolean().optional(),
  feedbackQuestion: z
    .string()
    .min(1, 'Feedback question cannot be empty')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  feedbackYesText: z
    .string()
    .min(1, 'Yes button text cannot be empty')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  feedbackNoText: z
    .string()
    .min(1, 'No button text cannot be empty')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  feedbackFollowUp: z
    .string()
    .min(1, 'Follow-up text cannot be empty')
      .optional()
      .or(z.literal('').transform(() => undefined))
  })
  .refine(
    (schema) => {
      if (schema.image?.length) {
        if (
          ACCEPTED_FILE_TYPES.includes(schema.image?.[0].type!) &&
          schema.image?.[0].size <= MAX_UPLOAD_SIZE
        ) {
          return true
        }
      }
      if (!schema.image?.length) {
        return true
      }
    },
    {
      message:
        'The file must be less then 2MB, and only PNG, JPEG & JPG files are accepted',
      path: ['image'],
    }
  )
  .refine(
    (schema) => {
      if (schema.domainLogo?.length) {
        if (
          ACCEPTED_FILE_TYPES.includes(schema.domainLogo?.[0].type!) &&
          schema.domainLogo?.[0].size <= MAX_UPLOAD_SIZE
        ) {
          return true
        }
      }
      if (!schema.domainLogo?.length) {
        return true
      }
    },
    {
      message:
        'The file must be less then 2MB, and only PNG, JPEG & JPG files are accepted',
      path: ['domainLogo'],
    }
  )

export const HelpDeskQuestionsSchema = z.object({
  title: z.string().min(1, { message: 'Title cannot be left empty' }),
  question: z.string().min(1, { message: 'Question cannot be left empty' }),
  answer: z.string().min(1, { message: 'Answer cannot be left empty' }),
  content: z.string().optional(),
  articleType: z.enum(['faq', 'article', 'guide']),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  isPublished: z.boolean().default(true),
  isPinned: z.boolean().default(false),
})

export const FilterQuestionsSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required'),
})

export const ProductSchema = z.object({
  name: z.string().min(1, { message: 'Product name is required' }),
  images: z.any(),
  additionalImages: z.any().optional(),
  price: z.string().min(1, { message: 'Price is required' }),
  productType: z.string().min(1, { message: 'Product type is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  hasDiscount: z.boolean().default(false),
  discount: z.string().optional(),
  discountedPrice: z.string().optional(),
  variants: z.array(
    z.object({
      name: z.string(),
      options: z.array(z.string())
    })
  ).optional(),
  existingImage: z.string().optional(),
  existingAdditionalImages: z.array(z.string()).optional(),
  productUrl: z.string().url('Please enter a valid URL').optional(),
})

export const AddAppointmentSchema = z.object({
  name: z.string().min(1, 'Appointment name is required'),
  image: z.any(),
  price: z.string().min(1, 'Price is required'),
  appointmentType: z.string().min(1, 'Appointment type is required'),
  // date and slot will be handled separately when actual booking occurs
})

export type AddAppointmentProps = z.infer<typeof AddAppointmentSchema>
