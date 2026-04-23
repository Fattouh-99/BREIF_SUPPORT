import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

// Loading fallback component
function EmailMarketingLoading() {
  return (
    <div className="flex items-center justify-center w-full p-4 h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="ml-2">Loading email marketing interface...</span>
    </div>
  );
}

// Static email marketing metrics display
function EmailMarketingMetrics() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">0</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Email Credits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">100</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">0%</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Click-through Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">0%</div>
        </CardContent>
      </Card>
    </div>
  );
}

// Recent campaigns section
function RecentCampaigns() {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Recent Campaigns</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-8 text-center text-muted-foreground">
          No recent campaigns found.
        </div>
      </CardContent>
    </Card>
  );
}

// Static notice about full interface
function InterfaceNotice() {
  return (
    <Card className="mt-4 bg-muted/50">
      <CardContent className="pt-6">
        <p className="text-center text-muted-foreground">
          The full email marketing interface will be available soon. We're currently enhancing our email marketing capabilities.
        </p>
      </CardContent>
    </Card>
  );
}

export default function EmailMarketingPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Email Marketing</h1>
      </div>
      
      <Suspense fallback={<EmailMarketingLoading />}>
        <div className="space-y-4">
          <EmailMarketingMetrics />
          <RecentCampaigns />
          <InterfaceNotice />
        </div>
      </Suspense>
    </div>
  );
}
