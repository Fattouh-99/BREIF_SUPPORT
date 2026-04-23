import { successResponse } from '@/lib/api-response';

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

// Define the pricing plans available in our system
const PRICING_PLANS = {
  // Standard plan
  'STANDARD': {
    name: 'Standard Plan',
    priceId: process.env.STRIPE_STANDARD_PRICE_ID,
    amount: 0, // Free plan
    features: [
      "Up to 1,000 conversations/month",
      "Basic lead qualification",
      "Email support",
      "1 team member",
      "Basic analytics"
    ]
  },
  // Pro plan
  'PRO': {
    name: 'Pro Plan',
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    amount: 1500, // £15/month in cents
    features: [
      "Up to 5,000 conversations/month",
      "Advanced lead qualification", 
      "Priority email support",
      "5 team members",
      "Detailed analytics & reporting",
      "Custom AI training"
    ]
  }
};

export async function GET() {
  return successResponse({
    plans: PRICING_PLANS
  });
} 