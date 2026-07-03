'use client'

import DashboardCard from '@/components/dashboard/cards'
import PeakUsageTimesCard from '@/components/dashboard/peak-usage-times'
import { PlanUsage } from '@/components/dashboard/plan-usage'
import InfoBar from '@/components/infobar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  MessageSquare,
  Users,
  Clock,
  TrendingUp,
  HelpCircle,
  BarChart3,
} from 'lucide-react'

type Plan = 'STANDARD' | 'PRO'

type DashboardViewProps = {
  stats: {
    daily: number
    monthly: number
    activeChats: number
    avgResponseTime: number
    satisfactionRate: number
  }
  clients: number
  planInfo: {
    plan: Plan
    credits: number
    domains: number
  }
  usageData: {
    hourlyUsage: number[]
    dailyUsage: number[]
    hourlyUsageByDay: number[][]
    busiestHour: string
    busiestDay: string
    busiestTime: string
    totalMessages: number
    dayNames: string[]
  } | null
  topQuestions: { question: string; count: number }[] | null
}

export function DashboardView({
  stats,
  clients,
  planInfo,
  usageData,
  topQuestions,
}: DashboardViewProps) {
  return (
    <div className="flex flex-col flex-1 mr-5 ml-1">
      <InfoBar />
      <div
        className="w-full chat-window rounded-xl shadow-lg flex-1 h-0 bg-slate-50 dark:bg-slate-900 overflow-y-auto"
        style={{ overscrollBehavior: 'none' }}
      >
        <div className="max-w-6xl mx-auto space-y-6 p-6 md:p-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Overview of your chatbot performance and customer activity
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <DashboardCard
              title="Today's Chats"
              value={stats.daily}
              icon={<MessageSquare className="text-indigo-600 dark:text-indigo-300" />}
            />
            <DashboardCard
              title="Monthly Chats"
              value={stats.monthly}
              icon={<TrendingUp className="text-indigo-600 dark:text-indigo-300" />}
            />
            <DashboardCard
              title="Active Chats"
              value={stats.activeChats}
              icon={<Users className="text-indigo-600 dark:text-indigo-300" />}
            />
            <DashboardCard
              title="Satisfaction Rate"
              value={stats.satisfactionRate}
              icon={<BarChart3 className="text-indigo-600 dark:text-indigo-300" />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-sm border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-indigo-500" />
                  Response Metrics
                </CardTitle>
                <CardDescription>How fast your support responds</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-4 rounded-lg bg-indigo-50 dark:bg-indigo-950/40">
                  <span className="text-sm text-muted-foreground">Avg. response time</span>
                  <span className="text-xl font-semibold">
                    {stats.avgResponseTime < 60
                      ? `${stats.avgResponseTime}s`
                      : `${Math.round(stats.avgResponseTime / 60)}m`}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-lg bg-indigo-50 dark:bg-indigo-950/40">
                  <span className="text-sm text-muted-foreground">Total customers</span>
                  <span className="text-xl font-semibold">{clients}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle>Plan Usage</CardTitle>
                <CardDescription>
                  Current plan: <span className="font-medium">{planInfo.plan}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <PlanUsage
                  plan={planInfo.plan}
                  credits={planInfo.credits}
                  domains={planInfo.domains}
                  clients={clients}
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PeakUsageTimesCard usageData={usageData} />

            <Card className="shadow-sm border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-indigo-500" />
                  Most Asked Questions
                </CardTitle>
                <CardDescription>What your customers ask about most</CardDescription>
              </CardHeader>
              <CardContent>
                {!topQuestions || topQuestions.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    No questions recorded yet. Data appears as customers use your chatbot.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {topQuestions.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-start justify-between gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                      >
                        <span className="text-sm flex-1 capitalize">{item.question}</span>
                        <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 shrink-0">
                          {item.count}x
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
