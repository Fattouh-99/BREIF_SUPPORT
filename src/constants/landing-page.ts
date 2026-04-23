import { PLANS, formatPrice } from '@/lib/stripe/config'

export const pricingCards = [
  {
    title: PLANS.STANDARD.name,
    description: PLANS.STANDARD.description,
    price: formatPrice(PLANS.STANDARD.price),
    duration: PLANS.STANDARD.price === 0 ? '' : 'month',
    highlight: 'Key features',
    features: PLANS.STANDARD.features,
    priceId: PLANS.STANDARD.priceId || '',
    planId: 'STANDARD'
  },
  {
    title: PLANS.PRO.name,
    description: PLANS.PRO.description,
    price: formatPrice(PLANS.PRO.price),
    duration: 'month',
    highlight: 'Everything in Standard, plus',
    features: PLANS.PRO.features,
    priceId: PLANS.PRO.priceId || '',
    planId: 'PRO'
  }
]
