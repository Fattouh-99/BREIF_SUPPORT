import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ArrowBigLeftIcon, ArrowLeft, ArrowRight } from 'lucide-react'
import Image from 'next/image'

type Props = {
  trigger: React.ReactNode
  children: React.ReactNode
  title: string
  description: string
  type?: 'Integration'
  logo?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const Modal = ({
  trigger,
  children,
  title,
  description,
  type,
  logo,
  open,
  onOpenChange,
}: Props) => {
  switch (type) {
    case 'Integration':
      return (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogTrigger asChild>{trigger}</DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <div className="flex justify-center gap-3">
              <div className="w-12 h-12 relative">
                <Image
                  src={"/icons/small-icon.svg"}
                  fill
                  alt="Brief Support"
                />
              </div>
              <div className="text-gray-400">
                <ArrowLeft size={20} />
                <ArrowRight size={20} />
              </div>
              <div className="w-12 h-12 relative">
                <Image
                  src={"/icons/stripe.jpeg"}
                  fill
                  alt="Stripe"
                />
              </div>
            </div>
            <DialogHeader className="flex items-center">
              <DialogTitle className="text-xl">{title}</DialogTitle>
              <DialogDescription className="text-center">
                {description}
              </DialogDescription>
            </DialogHeader>
            {children}
          </DialogContent>
        </Dialog>
      )
    default:
      return (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogTrigger asChild>{trigger}</DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            {children}
          </DialogContent>
        </Dialog>
      )
  }
}

export default Modal
