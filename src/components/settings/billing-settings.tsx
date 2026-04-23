import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Separator } from '../ui/separator'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { CheckCircle2, Star, Clock, BarChart3, CreditCard } from 'lucide-react'
import { format } from 'date-fns'
import { onGetSubscriptionPlan, onGetAllAccountDomains } from '@/actions/settings'
import { PlanUsage } from '@/components/dashboard/plan-usage'
import { PlanUpgradeModal } from './plan-upgrade-modal'

type Props = {}

const BillingSettings = async (props: Props) => {
  const plan = await onGetSubscriptionPlan() as 'STANDARD' | 'PRO'
  const domainsData = await onGetAllAccountDomains()
  
  // For clients count, we'll use a default for now
  const clients = 0

  // Subscription cards data
  const subscriptionCards = [
    {
      title: 'Standard Plan',
      description: 'Basic features for individuals',
      price: '$0/month',
      features: [
        '10 credits included',
        'Basic chat features',
        'Email support'
      ]
    },
    {
      title: 'Pro Plan',
      description: 'Enhanced features for growing businesses',
      price: '$15/month',
      features: [
        '50 credits included',
        'Advanced chat features',
        'Priority support',
        'Custom branding',
        'Analytics dashboard'
      ]
    }
  ]

  // Find plan features
  const planFeatures = subscriptionCards.find(
    (card) => card.title.toUpperCase() === plan.toUpperCase()
  )?.features
  if (!planFeatures) return null

  // Plan details
  const planDetails = {
    STANDARD: {
      title: 'Standard Plan',
      description: 'Basic features for individuals',
      features: ['10 credits included', 'Basic chat features', 'Email support'],
      limits: '1 domain',
      price: '$0/month',
      color: 'bg-gray-50 dark:bg-gray-900',
      borderColor: 'border-gray-200 dark:border-gray-700',
      textColor: 'text-gray-700 dark:text-gray-300',
      iconBg: 'bg-gray-100 dark:bg-gray-800',
      icon: <Star className="h-5 w-5 text-gray-500 dark:text-gray-400" />,
      badge: null
    },
    PRO: {
      title: 'Pro Plan',
      description: 'Advanced features for professionals',
      features: ['50 credits included', 'All standard features', 'Priority support', 'Custom branding', 'Multi-user access'],
      limits: '5 domains',
      price: '$49/month',
      color: 'bg-indigo-50 dark:bg-indigo-950/30',
      borderColor: 'border-indigo-200 dark:border-indigo-800',
      textColor: 'text-indigo-700 dark:text-indigo-300',
      iconBg: 'bg-indigo-100 dark:bg-indigo-900',
      icon: <Star className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />,
      badge: <Badge variant="outline" className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">Popular</Badge>
    }
  }

  const currentPlan = planDetails[plan as keyof typeof planDetails]
  if (!currentPlan) return null

  // Use estimated billing date for paid plans
  let nextBillingDateDisplay = "N/A"
  
  if (plan !== 'STANDARD') {
    // Fallback for paid plans
    const estimatedDate = new Date()
    estimatedDate.setMonth(estimatedDate.getMonth() + 1)
    nextBillingDateDisplay = format(estimatedDate, 'MMM d, yyyy')
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Billing Settings</h2>
        {plan !== 'STANDARD' && (
          <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Next billing: {nextBillingDateDisplay}</span>
            </div>
          </Badge>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Plan Card */}
        <Card className={`${currentPlan.color} border ${currentPlan.borderColor} shadow-sm overflow-hidden`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-full ${currentPlan.iconBg}`}>
                  {currentPlan.icon}
                </div>
                <div>
                  <CardTitle className={currentPlan.textColor}>
                    {currentPlan.title}
                    {/* Plan badge */}
                    {plan === 'STANDARD' && <Badge className="bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800">Free</Badge>}
                    {plan === 'PRO' && <Badge className="bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-indigo-900 dark:text-indigo-300 dark:border-indigo-800">Pro</Badge>}
                  </CardTitle>
                  <CardDescription className="text-sm">{currentPlan.description}</CardDescription>
                </div>
              </div>
              <CardTitle className={currentPlan.textColor}>{currentPlan.price}</CardTitle>
            </div>
          </CardHeader>
          <Separator className={currentPlan.borderColor} />
          <CardContent className="pt-4">
            <div className="flex gap-2 flex-col">
              {planFeatures.map((feature) => (
                <div
                  key={feature}
                  className="flex gap-2 items-center"
                >
                  <CheckCircle2 className={`h-5 w-5 ${currentPlan.textColor}`} />
                  <p className={currentPlan.textColor}>{feature}</p>
                </div>
              ))}
            </div>
          </CardContent>
          
          {/* Replace custom button with CardFooter and Button component to match Update Payment Method styling */}
          <CardFooter className="bg-gray-50 dark:bg-gray-900 pt-3 mt-[18vh] border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <PlanUpgradeModal plan={plan} planData={null} />
          </CardFooter>
        </Card>

        {/* Merged Usage Statistics and Payment Methods Card */}
        <Card className="shadow-sm dark:bg-slate-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
              Usage Statistics
            </CardTitle>
            <CardDescription>Your current usage metrics</CardDescription>
          </CardHeader>
          <CardContent className="pb-0">
            <PlanUsage
              plan={plan}
              credits={plan === 'STANDARD' ? 10 : 50}
              domains={(domainsData?.personalDomains?.length || 0) + (domainsData?.teamDomains?.length || 0)}
              clients={clients}
            />
            {/* <div className="text-right mt-4">
              <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
                View Detailed Usage
              </Button>
            </div> */}
          </CardContent>
          
          <Separator className="my-2 border-gray-200 dark:border-gray-700" />
          
          {/* Payment Methods Section */}
          <CardHeader className="pt-4 pb-2">
            <CardTitle className="text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
              Payment Methods
            </CardTitle>
            <CardDescription>Manage your payment methods</CardDescription>
          </CardHeader>
          <CardContent>
            {plan !== 'STANDARD' ? (
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded">
                    <CreditCard className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200">•••• 4242</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Expires 12/2025</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-3">
                <p className="text-gray-500 dark:text-gray-400 mb-1">No payment methods yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Add a payment method when you upgrade your plan</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-gray-50 dark:bg-gray-900 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <Button variant={plan !== 'STANDARD' ? "outline" : "default"} className="w-full">
              {plan !== 'STANDARD' ? 'Update Payment Method' : 'Add Payment Method'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default BillingSettings
