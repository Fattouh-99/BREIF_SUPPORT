import { CheckCircle2Icon } from 'lucide-react'
import React from 'react'
import { Button } from '../ui/button'
import { StripeConnect } from '../settings/stripe-connect'

type IntegrationModalBodyProps = {
  type: string
  connections: {
    [key in 'stripe']: boolean
  }
}

export const IntegrationModalBody = ({
  type,
  connections,
}: IntegrationModalBodyProps) => {
  switch (type) {
    case 'stripe':
      return (
        <div className="flex flex-col gap-6 p-6 bg-white rounded-lg">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Stripe would like to access
            </h2>
            <div className="space-y-3">
              {[
                'Payment and bank information',
                'Products and services you sell', 
                'Business and tax information',
                'Create and update Products',
              ].map((item, key) => (
                <div
                  key={key}
                  className="flex items-center gap-3 pl-4 py-2 bg-gray-50 rounded-md"
                >
                  <CheckCircle2Icon className="w-5 h-5 text-green-500" />
                  <p className="text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <Button 
              variant="outline"
              className="hover:bg-gray-100"
            >
              Learn more
            </Button>
            <StripeConnect connected={connections[type]} />
          </div>
        </div>
      )
    default:
      return <></>
  }
}
