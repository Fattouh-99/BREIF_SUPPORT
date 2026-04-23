import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET!, {
  apiVersion: '2024-04-10',
  typescript: true,
})

// Centralized plan configuration - single source of truth
export const PLANS = {
  STANDARD: {
    name: 'Standard',
    description: 'Perfect for getting started',
    price: 0,
    priceId: null, // Free plan
    interval: 'month',
    isFree: true,
    features: [
      'Up to 100 chatbot requests/month',
      'Basic chatbot functionality', 
      'Email support',
      '1 domain',
      'Basic analytics'
    ],
    credits: 100,
    maxDomains: 1,
    maxContacts: 1000,
    maxEmailsPerMonth: 10,
  },
  PRO: {
    name: 'Pro', 
    description: 'For growing businesses',
    price: 1200, // £12.00 in cents
    productId: process.env.STRIPE_PRO_PRODUCT_ID || undefined,
    priceId: process.env.STRIPE_PRO_PRICE_ID || undefined,
    interval: 'month',
    isFree: false,
    features: [
      'Up to 1,000 chatbot requests/month',
      'Advanced chatbot features',
      'Priority email support',
      '5 domains',
      'Advanced analytics',
      'Custom branding',
      'API access'
    ],
    credits: 1000,
    maxDomains: 5,
    maxContacts: 10000,
    maxEmailsPerMonth: 100,
  }
} as const

// Define plan type from PLANS keys
export type PlanType = keyof typeof PLANS // 'STANDARD' | 'PRO'

// Helper functions
export const formatPrice = (priceInCents: number): string => {
  if (priceInCents === 0) return 'Free'
  return `£${(priceInCents / 100).toFixed(0)}`
}

export const getPlanByPriceId = (priceId: string): PlanType | null => {
  for (const [planKey, plan] of Object.entries(PLANS)) {
    if (plan.priceId === priceId) {
      return planKey as PlanType
    }
  }
  return null
}

export const isValidPlan = (plan: string): plan is PlanType => {
  return plan in PLANS
}

// Helper function to get plans in order (for UI display)
export const getPlansInOrder = () => {
  const planOrder: PlanType[] = ['STANDARD', 'PRO']
  return planOrder.map(key => ({ key, ...PLANS[key] }))
}

// Helper function to compare plans
export const isPlanUpgrade = (fromPlan: PlanType, toPlan: PlanType) => {
  const planOrder: PlanType[] = ['STANDARD', 'PRO']
  return planOrder.indexOf(toPlan) > planOrder.indexOf(fromPlan)
}

// Check if a plan upgrade is valid
export const canUpgradeToPlan = (currentPlan: PlanType, targetPlan: PlanType): boolean => {
  const planOrder: PlanType[] = ['STANDARD', 'PRO']
  const currentIndex = planOrder.indexOf(currentPlan)
  const targetIndex = planOrder.indexOf(targetPlan)
  return targetIndex > currentIndex
}

// Check if a plan downgrade is valid
export const canDowngradeToPlan = (currentPlan: PlanType, targetPlan: PlanType): boolean => {
  const planOrder: PlanType[] = ['STANDARD', 'PRO']
  const currentIndex = planOrder.indexOf(currentPlan)
  const targetIndex = planOrder.indexOf(targetPlan)
  return targetIndex < currentIndex
} 