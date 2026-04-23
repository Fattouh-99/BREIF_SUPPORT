import {
  onDomainCustomerResponses,
  onGetAllDomainBookings,
} from '@/actions/appointment'
import { onGetDomainProductsAndConnectedAccountId } from '@/actions/payments'
import PortalForm from '@/components/forms/portal/portal-form'
import React from 'react'

const CustomerPaymentPage = async ({
  params,
}: {
  params: { domainid: string; customerid: string }
}) => {
  const questions = await onDomainCustomerResponses(params.customerid)
  const productsData = await onGetDomainProductsAndConnectedAccountId(
    params.domainid
  )

  if (!questions) return null

  // Convert Decimal prices to numbers for compatibility with component props
  const products = productsData?.products?.map(product => ({
    ...product,
    price: parseFloat(product.price.toString())
  }));

  return (
    <PortalForm
      email={questions.email!}
      products={products}
      amount={productsData?.amount}
      domainid={params.domainid}
      customerId={params.customerid}
      questions={questions.questions}
      stripeId={productsData?.stripeId!}
      type="Payment"
    />
  )
}

export default CustomerPaymentPage
