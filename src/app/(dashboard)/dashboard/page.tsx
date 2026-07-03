import { DashboardView } from '@/components/dashboard/dashboard-view'
import {
  getChatStats,
  getChatUsageByTime,
  getMostAskedQuestions,
  getUserClients,
  getUserPlanInfo,
} from '@/actions/dashboard'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/auth/sign-in?redirect_url=/dashboard')
  }

  const [stats, clients, planInfo, usageData, topQuestions] = await Promise.all([
    getChatStats(),
    getUserClients(),
    getUserPlanInfo(),
    getChatUsageByTime(),
    getMostAskedQuestions(),
  ])

  const normalizedPlan = (planInfo?.plan?.toUpperCase() === 'PRO' ? 'PRO' : 'STANDARD') as
    | 'STANDARD'
    | 'PRO'

  return (
    <DashboardView
      stats={{
        daily: stats?.daily ?? 0,
        monthly: stats?.monthly ?? 0,
        activeChats: stats?.activeChats ?? 0,
        avgResponseTime: stats?.avgResponseTime ?? 0,
        satisfactionRate: stats?.satisfactionRate ?? 0,
      }}
      clients={clients ?? 0}
      planInfo={{
        plan: normalizedPlan,
        credits: planInfo?.credits ?? 0,
        domains: planInfo?.domains ?? 0,
      }}
      usageData={usageData}
      topQuestions={topQuestions}
    />
  )
}
