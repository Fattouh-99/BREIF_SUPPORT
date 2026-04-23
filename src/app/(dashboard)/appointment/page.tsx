import { onGetAllBookingsForCurrentUser } from '@/actions/appointment'
import AllAppointments from '@/components/appointment/all-appointments'
import InfoBar from '@/components/infobar'
import Section from '@/components/section-label'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { client } from '@/lib/prisma'
import React, { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

// Loading component
const AppointmentsSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-8 w-[200px]" />
      <Skeleton className="h-4 w-[300px]" />
    </div>
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex justify-between items-center p-4 border rounded-lg">
          <div className="space-y-2">
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-3 w-[100px]" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-3 w-[80px]" />
          </div>
        </div>
      ))}
    </div>
  </div>
)

const Page = async () => {
  // Check user's dashboard type
  const user = await currentUser()
  if (!user) redirect('/auth/sign-in')

  const userData = await client.user.findUnique({
    where: { clerkId: user.id },
    select: { dashboard: true }
  })

  // Redirect to dashboard if user's dashboard type is 'services'
  if (userData?.dashboard === 'services') {
    redirect('/dashboard')
  }

  const bookingsData = await onGetAllBookingsForCurrentUser(user.id)
  const bookings = bookingsData?.bookings || []

  return (
    <>
      <InfoBar />
      <div className="overflow-y-auto w-full chat-window flex-1 h-0">
        <div className="flex flex-col gap-5 mr-5 ml-1">
          <Section
            label="Appointments"
            message="Manage your appointments"
          />
          <Suspense fallback={<AppointmentsSkeleton />}>
            <AllAppointments bookings={bookings} />
          </Suspense>
        </div>
      </div>
    </>
  )
}

export default Page
