import {
  onBookNewAppointment,
  onDomainCustomerResponses,
  saveAnswers,
} from '@/actions/appointment'
import { useToast } from '@/components/ui/use-toast'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

export const usePortal = (
  customerId: string,
  domainId: string,
  email: string
) => {
  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm()
  const { toast } = useToast()
  const [step, setStep] = useState<number>(1)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedSlot, setSelectedSlot] = useState<string | undefined>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [questions, setQuestions] = useState<Array<{ id: string, question: string, answered: string | null }>>([])

  useEffect(() => {
    const loadQuestions = async () => {
      const response = await onDomainCustomerResponses(customerId)
      if (response?.questions) {
        setQuestions(response.questions)
      }
    }
    loadQuestions()
  }, [customerId])

  setValue('date', date)

  const onNext = () => setStep((prev) => prev + 1)

  const onPrev = () => setStep((prev) => prev - 1)

  const onBookAppointment = handleSubmit(async (values) => {
    try {
      setLoading(true)
      const answeredQuestions = Object.keys(values)
        .filter((key) => key.startsWith('question'))
        .reduce((obj: any, key) => {
          obj[key.split('question-')[1]] = values[key]
          return obj
        }, {})

      const savedAnswers = await saveAnswers(answeredQuestions, customerId)

      if (savedAnswers) {
        // Find the question that asks for the name
        const nameQuestion = questions.find(q => 
          q.question.toLowerCase().includes('name')
        )
        
        // Get the corresponding answer for the name question
        const name = nameQuestion 
          ? answeredQuestions[nameQuestion.id] as string 
          : 'Guest'

        const booked = await onBookNewAppointment(
          domainId,
          customerId,
          values.slot,
          values.date,
          email,
          name,
          0, // default price
          '', // default image
          'Discovery Call' // default appointment type
        )
        
        if (booked && booked.status == 200) {
          toast({
            title: 'Success',
            description: booked.message,
          })
          setStep(3)
        }

        setLoading(false)
      }
    } catch (error) {}
  })

  const onSelectedTimeSlot = (slot: string) => setSelectedSlot(slot)

  return {
    step,
    onNext,
    onPrev,
    register,
    errors,
    loading,
    onBookAppointment,
    date,
    setDate,
    onSelectedTimeSlot,
    selectedSlot,
  }
}
