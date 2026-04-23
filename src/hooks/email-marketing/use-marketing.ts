import {
  onAddCustomersToEmail,
  onBulkMailer,
  onCreateMarketingCampaign,
  onDeleteCampaign,
  onGetAllCustomerResponses,
  onGetEmailTemplate,
  onRemoveCustomersFromCampaign as removeCustomersFromCampaign,
  onSaveEmailTemplate,
} from '@/actions/mail'
import { useToast } from '@/components/ui/use-toast'
import {
  EmailMarketingBodySchema,
  EmailMarketingSchema,
} from '@/schemas/marketing.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

export const useEmailMarketing = () => {
  const [isSelected, setIsSelected] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [processing, setProcessing] = useState<boolean>(false)
  const [isId, setIsId] = useState<string | undefined>(undefined)
  const [editing, setEditing] = useState<boolean>(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(EmailMarketingSchema),
  })

  const {
    register: registerEmail,
    formState: { errors: emailErrors },
    handleSubmit: SubmitEmail,
    setValue,
  } = useForm({
    resolver: zodResolver(EmailMarketingBodySchema),
  })
  const { toast } = useToast()
  const router = useRouter()

  const onCreateCampaign = handleSubmit(async (values) => {
    try {
      setLoading(true)
      const campaign = await onCreateMarketingCampaign(values.name)
      if (campaign) {
        reset()
        toast({
          title: 'Success',
          description: campaign.message,
        })
        setLoading(false)
        router.refresh()
      }
    } catch (error) {
      console.log(error)
    }
  })

  const onCreateEmailTemplate = SubmitEmail(async (values) => {
    try {
      setEditing(true)
      const template = JSON.stringify(values.description)
      const emailTemplate = await onSaveEmailTemplate(template, isId!)
      if (emailTemplate) {
        toast({
          title: 'Success',
          description: emailTemplate.message,
        })
        setEditing(false)
      }
    } catch (error) {
      console.log(error)
    }
  })

  const onAddCustomersToCampaign = async (campaignId: string) => {
    try {
      setProcessing(true)
      const customersAdd = await onAddCustomersToEmail(isSelected, campaignId)
      if (customersAdd?.status === 200) {
        toast({
          title: 'Success',
          description: customersAdd.message,
        })
        setIsSelected([])
        router.refresh()
      } else {
        toast({
          title: 'Error',
          description: 'Failed to add customers to campaign',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.log(error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  const onSelectedEmails = (email: string) => {
    //add or remove
    const duplicate = isSelected.find((e) => e == email)
    if (duplicate) {
      setIsSelected(isSelected.filter((e) => e !== email))
    } else {
      setIsSelected((prev) => [...prev, email])
    }
  }

  const onBulkEmail = async (emails: string[], campaignId: string) => {
    try {
      const mails = await onBulkMailer(emails, campaignId)
      if (mails?.status === 200) {
        toast({
          title: 'Success',
          description: mails.message,
        })
        router.refresh()
      } else if (mails?.status === 400) {
        toast({
          title: 'Error',
          description: mails.message,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Error',
          description: 'Failed to send campaign emails',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.log(error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    }
  }

  const onSetAnswersId = (id: string) => setIsId(id)

  const onRemoveCustomersFromCampaign = async (customerIds: string[], campaignId: string) => {
    try {
      setProcessing(true)
      const result = await removeCustomersFromCampaign(customerIds, campaignId)
      if (result?.status === 200) {
        toast({
          title: 'Success',
          description: result.message,
        })
        router.refresh()
      } else {
        toast({
          title: 'Error',
          description: 'Failed to remove customers from campaign',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.log(error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  const onDeleteCampaignHandler = async (campaignId: string) => {
    try {
      setProcessing(true)
      const result = await onDeleteCampaign(campaignId)
      if (result?.status === 200) {
        toast({
          title: 'Success',
          description: result.message,
        })
        router.refresh()
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete campaign',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.log(error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  return {
    onSelectedEmails,
    isSelected,
    onCreateCampaign,
    register,
    errors,
    loading,
    processing,
    onAddCustomersToCampaign,
    onBulkEmail,
    onSetAnswersId,
    isId,
    registerEmail,
    emailErrors,
    onCreateEmailTemplate,
    editing,
    setValue,
    onRemoveCustomersFromCampaign,
    onDeleteCampaignHandler,
  }
}

export const useAnswers = (id: string) => {
  const [answers, setAnswers] = useState<
    {
      customer: {
        questions: { question: string; answered: string | null }[]
      }[]
    }[]
  >([])
  const [loading, setLoading] = useState<boolean>(false)

  const onGetCustomerAnswers = async () => {
    try {
      setLoading(true)
      const answer = await onGetAllCustomerResponses(id)
      setLoading(false)
      if (answer) {
        setAnswers(answer)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    onGetCustomerAnswers()
  }, [])

  return { answers, loading }
}

export const useEditEmail = (id: string) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [template, setTemplate] = useState<string>('')

  const onGetTemplate = async (id: string) => {
    try {
      setLoading(true)
      const email = await onGetEmailTemplate(id)
      if (email) {
        setTemplate(email)
      }
      setLoading(false)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    onGetTemplate(id)
  }, [])

  return { loading, template }
}
