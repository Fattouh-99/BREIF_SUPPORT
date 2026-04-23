'use client'
import React from 'react'
import { Button } from '../ui/button'
import { Loader } from '../loader'
import { useStripe } from '@/hooks/billing/use-billing'

type StripeConnectProps = {
  connected: boolean
}

export const StripeConnect = ({ connected }: StripeConnectProps) => {
  const { onStripeConnect, onStripeAccountPending } = useStripe()
  return (
    <Button
      disabled={connected}
      onClick={onStripeConnect}
      className="bg-indigo-500 text-white hover:bg-indigo-700"
    >
      <Loader loading={onStripeAccountPending}>
        {connected ? 'Connected' : 'Connect to stripe'}
      </Loader>
    </Button>
  )
}
