'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getUserStatistics } from '@/actions/admin'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts'
import { Loader2, Users, ArrowUp, Wallet } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export function UserAnalytics() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const result = await getUserStatistics()
        
        if (result.success && result.stats) {
          setStats(result.stats)
          setError(null)
        } else {
          setError(result.error || 'Failed to load statistics')
        }
      } catch (err) {
        console.error('Error fetching statistics:', err)
        setError('An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <span className="ml-2 text-gray-700 dark:text-gray-300">Loading analytics...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">Error Loading Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    )
  }

  // No stats loaded
  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Analytics</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // Format data for charts
  const growthData = [
    { name: 'Last 7 Days', users: stats.newUsersLast7Days },
    { name: 'Last 30 Days', users: stats.newUsersLast30Days },
    { name: 'Total', users: stats.totalUsers }
  ]

  // Format role data for pie chart
  const roleData = stats.roleDistribution.map((item: any) => ({
    name: item.role,
    value: item.count
  }))

  // Format plan data for pie chart
  const planData = stats.planDistribution.map((item: any) => ({
    name: item.plan,
    value: item.count
  }))

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Users Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-6 w-6 text-indigo-500 mr-2" />
              <span className="text-3xl font-bold">{stats.totalUsers}</span>
            </div>
          </CardContent>
        </Card>

        {/* New Users Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>New Users (Last 7 Days)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ArrowUp className="h-6 w-6 text-green-500 mr-2" />
              <span className="text-3xl font-bold">{stats.newUsersLast7Days}</span>
            </div>
          </CardContent>
        </Card>

        {/* New Users Monthly Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>New Users (Last 30 Days)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ArrowUp className="h-6 w-6 text-green-500 mr-2" />
              <span className="text-3xl font-bold">{stats.newUsersLast30Days}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="growth">
        <TabsList>
          <TabsTrigger value="growth">User Growth</TabsTrigger>
          <TabsTrigger value="roles">User Roles</TabsTrigger>
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
        </TabsList>

        {/* User Growth Chart */}
        <TabsContent value="growth">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>Overview of user growth over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="users" fill="#8884d8" name="Users">
                      {growthData.map((entry: { name: string, users: number }, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Roles Distribution */}
        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>User Role Distribution</CardTitle>
              <CardDescription>Breakdown of users by role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roleData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {roleData.map((entry: { name: string, value: number }, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} users`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Role Summary */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {roleData.map((role: { name: string, value: number }, index: number) => (
                  <div key={index} className="text-center">
                    <Badge variant="outline" style={{ backgroundColor: COLORS[index % COLORS.length] + '20', borderColor: COLORS[index % COLORS.length] }}>
                      <span style={{ color: COLORS[index % COLORS.length] }}>{role.name}</span>
                    </Badge>
                    <p className="mt-1 font-semibold">{role.value} users</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription Plans Distribution */}
        <TabsContent value="plans">
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center">
                  <Wallet className="h-5 w-5 mr-2 text-indigo-500" />
                  Subscription Plan Distribution
                </div>
              </CardTitle>
              <CardDescription>Breakdown of users by subscription plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={planData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {planData.map((entry: { name: string, value: number }, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} users`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Plan Summary */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {planData.map((plan: { name: string, value: number }, index: number) => (
                  <div key={index} className="text-center">
                    <Badge variant="outline" style={{ backgroundColor: COLORS[index % COLORS.length] + '20', borderColor: COLORS[index % COLORS.length] }}>
                      <span style={{ color: COLORS[index % COLORS.length] }}>{plan.name}</span>
                    </Badge>
                    <p className="mt-1 font-semibold">{plan.value} users</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 