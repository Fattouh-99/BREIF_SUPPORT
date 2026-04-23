'use client'

import {
  onChatBotImageUpdate,
  onDomainLogoUpdate,
  onCreateFilterQuestions,
  onCreateHelpDeskQuestion,
  onCreateNewDomainProduct,
  onDeleteUserDomain,
  onGetAllFilterQuestions,
  onGetAllHelpDeskQuestions,
  onUpdateDomain,
  onUpdatePassword,
  onUpdateWelcomeMessage,
  onUpdateTheme,
  onUpdateEmail,
  onUpdateFullName,
  onCreateNewAppointmentSlot,
  onCreateProduct,
  onUpdateProduct,
  onGetUserProfile,
} from '@/actions/settings'
import { client } from '@/lib/prisma'
import { useToast } from '@/components/ui/use-toast'
import {
  ChangePasswordProps,
  ChangePasswordSchema,
  ChangeEmailProps,
  ChangeEmailSchema,
  ChangeFullNameProps,
  ChangeFullNameSchema,
} from '@/schemas/auth.schema'
import {
  AddProductProps,
  ProductSchema,
  DomainSettingsProps,
  DomainSettingsSchema,
  FilterQuestionsProps,
  FilterQuestionsSchema,
  HelpDeskQuestionsProps,
  HelpDeskQuestionsSchema,
  AddAppointmentProps,
  AddAppointmentSchema,
} from '@/schemas/settings.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { UploadClient } from '@uploadcare/upload-client'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

const upload = new UploadClient({
  publicKey: process.env.NEXT_PUBLIC_UPLOAD_CARE_PUBLIC_KEY as string,
})

export const useThemeMode = () => {
  const { setTheme, theme } = useTheme()
  return {
    setTheme,
    theme,
  }
}

const createNotification = async (type: string, message: string) => {
  try {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, message }),
    })
  } catch (error) {
    console.error('Failed to create notification:', error)
  }
}

export const useChangeFullName = (onSuccess?: () => void) => {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangeFullNameProps>({
    resolver: zodResolver(ChangeFullNameSchema),
  })

  const onChangeFullName = handleSubmit(async (values) => {
    try {
      setLoading(true)
      const response = await onUpdateFullName(values.fullname)
      if (response?.success) {
        toast({ title: 'Success', description: 'Your name has been updated successfully' })
        await createNotification(
          'NAME_CHANGE',
          `You have successfully updated your name to ${values.fullname}`
        )
        if (onSuccess) {
          onSuccess()
        }
      } else {
        toast({ title: 'Error', description: response?.error || 'Something went wrong' })
      }
    } catch (error) {
      console.log(error)
      toast({ title: 'Error', description: 'Something went wrong' })
    } finally {
      setLoading(false)
    }
  })
  
  return {
    register,
    errors,
    onChangeFullName,
    loading
  }
}

export const useChangeEmail = () => {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangeEmailProps>({
    resolver: zodResolver(ChangeEmailSchema),
  })

  const onChangeEmail = handleSubmit(async (values) => {
    try {
      setLoading(true)
      const response = await onUpdateEmail(values.email)
      
      if (response?.success) {
        toast({ 
          title: 'Success', 
          description: 'Your email has been updated successfully' 
        })
      } else {
        toast({ 
          title: 'Error', 
          description: response?.error || 'Something went wrong' 
        })
      }
    } catch (error) {
      console.log(error)
      toast({ 
        title: 'Error', 
        description: 'Something went wrong' 
      })
    } finally {
      setLoading(false)
    }
  })

  return {
    register,
    errors,
    onChangeEmail,
    loading
  }
}

export const useChangePassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordProps>({
    resolver: zodResolver(ChangePasswordSchema),
    mode: 'onChange',
  })
  const { toast } = useToast()
  const [loading, setLoading] = useState<boolean>(false)

  const onChangePassword = handleSubmit(async (values) => {
    try {
      setLoading(true)
      const updated = await onUpdatePassword(values.password)
      if (updated?.success) {
        reset()
        toast({ title: 'Success', description: 'Password updated successfully' })
        await createNotification(
          'PASSWORD_CHANGE',
          'Your password has been successfully updated'
        )
      } else {
        toast({ title: 'Error', description: updated?.error || 'Failed to update password' })
      }
    } catch (error) {
      console.log(error)
      toast({ title: 'Error', description: 'Failed to update password' })
    } finally {
      setLoading(false)
    }
  })
  return {
    register,
    errors,
    onChangePassword,
    loading,
  }
}

export const useSettings = (id: string) => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    reset,
  } = useForm<DomainSettingsProps>({
    resolver: zodResolver(DomainSettingsSchema),
  })
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState<boolean>(false)
  const [deleting, setDeleting] = useState<boolean>(false)

  const onUpdateSettings = handleSubmit(async (values) => {
    setLoading(true)
    try {
      if (values.domain) {
        const domain = await onUpdateDomain(id, values.domain)
        if (domain) {
          toast({
            title: 'Success',
            description: domain.message,
          })
        }
      }

      if (values.image?.[0]) {
        const uploaded = await upload.uploadFile(values.image[0])
        const image = await onChatBotImageUpdate(id, uploaded.uuid)
        if (image) {
          toast({
            title: image.status == 200 ? 'Success' : 'Error',
            description: image.message,
          })
        }
      }

      if (values.domainLogo?.[0]) {
        const uploaded = await upload.uploadFile(values.domainLogo[0])
        const domainLogo = await onDomainLogoUpdate(id, uploaded.uuid)
        if (domainLogo) {
          toast({
            title: domainLogo.status == 200 ? 'Success' : 'Error',
            description: domainLogo.message,
          })
        }
      }

      if (values.welcomeMessage) {
        const message = await onUpdateWelcomeMessage(values.welcomeMessage, id)
        if (message) {
          toast({
            title: 'Success',
            description: message.message,
          })
        }
      }

      if (values.background || values.textColor || values.iconColor || values.iconStyle || values.themeColor || values.helpDeskColor || values.titleColor || values.paymentEnabled !== undefined || values.customLinkTitle || values.customLinkDescription || values.customLinkUrl) {
        const themeUpdate = await onUpdateTheme(
          id,
          values.background || '',
          values.textColor || '',
          values.iconColor || '',
          values.iconStyle || '',
          values.themeColor || '',
          values.helpDeskColor || '',
          values.titleColor || '',
          values.paymentEnabled,
          values.customLinkTitle || '',
          values.customLinkDescription || '',
          values.customLinkUrl || ''
        )
        if (themeUpdate) {
          toast({
            title: themeUpdate.status === 200 ? 'Success' : 'Error',
            description: themeUpdate.message,
          })
        }
      }

      // Don't reset the form, just refresh the page to get new values
      router.refresh()
    } catch (error) {
      console.error('Settings update error:', error)
      toast({
        title: 'Error',
        description: 'Failed to update settings',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  })

  const onDeleteDomain = async () => {
    setDeleting(true)
    const deleted = await onDeleteUserDomain(id)
    if (deleted) {
      toast({
        title: 'Success',
        description: deleted.message,
      })
      setDeleting(false)
      router.refresh()
    }
  }
  return {
    register,
    control,
    setValue,
    errors,
    onUpdateSettings,
    onDeleteDomain,
    deleting,
    loading,
  }
}

export const useHelpDesk = (id: string) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<HelpDeskQuestionsProps>({
    resolver: zodResolver(HelpDeskQuestionsSchema),
  })
  const { toast } = useToast()

  const [loading, setLoading] = useState<boolean>(false)
  const [isQuestions, setIsQuestions] = useState<
    { 
      id: string; 
      title: string;
      question: string; 
      answer: string;
      content?: string;
      articleType: string;
      category?: string;
      tags: string[];
      isPublished: boolean;
      isPinned: boolean;
      viewCount: number;
      createdAt: Date;
      updatedAt: Date;
    }[]
  >([])

  const onSubmitQuestion = handleSubmit(async (values) => {
    setLoading(true)
    const question = await onCreateHelpDeskQuestion(id, values)
    if (question) {
      setIsQuestions(question.questions!)
      toast({
        title: question.status == 200 ? 'Success' : 'Error',
        description: question.message,
      })
      setLoading(false)
      reset()
    }
  })

  const onDeleteQuestion = async (questionId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/settings/help-desk/${questionId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Question deleted successfully',
        })
        // Update local state to remove the deleted question
        setIsQuestions(prev => prev.filter(q => q.id !== questionId))
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete question',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to delete question:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const onGetQuestions = async () => {
    setLoading(true)
    const questions = await onGetAllHelpDeskQuestions(id)
    if (questions) {
      setIsQuestions(questions.questions || [])
      setLoading(false)
    }
  }

  useEffect(() => {
    onGetQuestions()
  }, [])

  return {
    register,
    onSubmitQuestion,
    errors,
    isQuestions,
    loading,
    onDeleteQuestion,
  }
}

type Question = {
  id: string
  question: string
  answered?: string | null
}

export const useFilterQuestions = (id: string) => {
  const [loading, setLoading] = useState(false)
  const [isQuestions, setIsQuestions] = useState<
    {
      id: string
      question: string
      answer: string
    }[]
  >([])
  const router = useRouter()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(FilterQuestionsSchema),
  })

  const onAddFilterQuestions = handleSubmit(async (values) => {
    try {
      setLoading(true)
      const questions = await onCreateFilterQuestions(
        id,
        values.question,
        values.answer
      )
      if (questions) {
        reset()
        toast({
          title: 'Success',
          description: questions.message,
        })
        router.refresh()
      }
    } catch (error) {
      console.log(error)
      toast({
        title: 'Error',
        description: 'Failed to add question',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  })

  const onDeleteQuestion = async (questionId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/settings/filter-questions/${questionId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Question deleted successfully',
        })
        // Update local state to remove the deleted question
        setIsQuestions(prev => prev.filter(q => q.id !== questionId))
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete question',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to delete question:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const onGetQuestions = async () => {
    try {
      setLoading(true)
      const questions = await onGetAllFilterQuestions(id)
      if (questions) {
        setIsQuestions(
          questions.questions!.map((q: Question) => ({
            id: q.id,
            question: q.question,
            answer: q.answered || '',
          }))
        )
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    onGetQuestions()
  }, [])

  return {
    loading,
    onAddFilterQuestions,
    register,
    errors,
    isQuestions,
    onDeleteQuestion,
  }
}

type FormValues = {
  name: string;
  images: FileList;
  additionalImages: FileList;
  price: string;
  productType: string;
  description: string;
  hasDiscount: boolean;
  discount: string;
  discountedPrice: string;
  variants: {
    name: string;
    options: {
      value: string;
      priceAdjustment: number;
      quantity?: number;
    }[];
    trackQuantity: boolean;
  }[];
  existingImage?: string;
  existingAdditionalImages?: string[];
  productUrl?: string;
}

export const useProducts = (domainId: string, editingProductId?: string | null) => {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormValues>()

  useEffect(() => {
    const fetchProduct = async () => {
      if (editingProductId) {
        try {
          const response = await fetch(`/api/products/${editingProductId}`)
          const product = await response.json()
          
          // Set all form fields with existing product data
          setValue('name', product.name)
          setValue('price', product.price.toString())
          setValue('productType', product.productType)
          setValue('description', product.description)
          setValue('hasDiscount', product.hasDiscount)
          if (product.hasDiscount) {
            setValue('discount', product.discount.toString())
            setValue('discountedPrice', product.discountedPrice.toString())
          }
          
          // Handle variants
          if (product.variants) {
            const parsedVariants = typeof product.variants === 'string' 
              ? JSON.parse(product.variants) 
              : product.variants
            setValue('variants', parsedVariants)
          }

          // Set existing images
          if (product.image) {
            setValue('existingImage', product.image)
          }
          if (product.images && Array.isArray(product.images)) {
            setValue('existingAdditionalImages', product.images)
          }
          
          // Set product URL if it exists
          if (product.productUrl) {
            setValue('productUrl', product.productUrl)
          }
        } catch (error) {
          console.error('Error loading product:', error)
          toast({
            title: 'Error',
            description: 'Failed to load product data',
          })
        }
      }
    }
    fetchProduct()
  }, [editingProductId, setValue, toast])

  const onCreateNewProduct = handleSubmit(async (values) => {
    try {
      setLoading(true)
      
      // Debug log
      console.log('Form values before submission:', values);
      
      // Handle main image upload
      let mainImageId = values.existingImage
      if (values.images?.[0]) {
        const uploadedImage = await upload.uploadFile(values.images[0] as File)
        mainImageId = uploadedImage.uuid
      }

      // Handle additional images upload
      let additionalImageIds = values.existingAdditionalImages || []
      if (values.additionalImages?.length) {
        const uploadPromises = Array.from(values.additionalImages as FileList).map(file =>
          upload.uploadFile(file)
        )
        const uploadedImages = await Promise.all(uploadPromises)
        additionalImageIds = [...additionalImageIds, ...uploadedImages.map(img => img.uuid)]
      }

      const productData = {
        name: values.name,
        price: values.price,
        image: mainImageId || '',
        images: additionalImageIds,
        productType: values.productType,
        description: values.description,
        hasDiscount: values.hasDiscount,
        discount: values.hasDiscount ? values.discount : undefined,
        discountedPrice: values.hasDiscount ? values.discountedPrice : undefined,
        variants: values.variants && values.variants.length > 0 ? values.variants : undefined,
        productUrl: values.productUrl,
      }
      
      // Debug log
      console.log('Product data being sent to server:', productData);

      if (editingProductId) {
        await onUpdateProduct(editingProductId, productData)
      } else {
        await onCreateProduct(domainId, productData)
      }

      toast({
        title: 'Success',
        description: `Product ${editingProductId ? 'updated' : 'created'} successfully`,
      })
      router.refresh()
      reset()
    } catch (error) {
      console.error('Error saving product:', error)
      toast({
        title: 'Error',
        description: 'Failed to save product',
      })
    } finally {
      setLoading(false)
    }
  })

  return {
    register,
    errors,
    loading,
    setValue,
    watch,
    onCreateNewProduct,
  }
}
export const useAppointments = (domainId: string) => {
  const { toast } = useToast()
  const [loading, setLoading] = useState<boolean>(false)
  const {
    register,
    reset,
    formState: { errors },
    handleSubmit,
  } = useForm<AddAppointmentProps>({
    resolver: zodResolver(AddAppointmentSchema),
  })

  const onCreateNewAppointment = handleSubmit(async (values) => {
    try {
      setLoading(true)
      const uploaded = await upload.uploadFile(values.image[0])
      const appointment = await onCreateNewAppointmentSlot(
        domainId,
        values.name,
        uploaded.uuid,
        values.price,
        values.appointmentType
      )
      if (appointment) {
        reset()
        toast({
          title: 'Success',
          description: appointment.message,
        })
      }
    } catch (error) {
      console.log(error)
      toast({
        title: 'Error',
        description: 'Failed to create appointment',
      })
    } finally {
      setLoading(false)
    }
  })

  return { onCreateNewAppointment, register, errors, loading }
}

export const useUserProfile = () => {
  const [profileData, setProfileData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true)
        const response = await onGetUserProfile()
        
        if (response?.success && response.user) {
          setProfileData(response.user)
        } else {
          setError(response?.error || 'Failed to fetch user profile')
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
        setError('Failed to fetch user profile')
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  const refreshProfile = async () => {
    try {
      setLoading(true)
      const response = await onGetUserProfile()
      
      if (response?.success && response.user) {
        setProfileData(response.user)
        setError(null)
      } else {
        setError(response?.error || 'Failed to refresh user profile')
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error)
      setError('Failed to refresh user profile')
    } finally {
      setLoading(false)
    }
  }

  return {
    profileData,
    loading,
    error,
    refreshProfile
  }
}

