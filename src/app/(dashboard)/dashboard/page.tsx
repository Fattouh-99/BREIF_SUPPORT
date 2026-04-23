import InfoBar from "@/components/infobar";
import { getOrCreateUser } from "@/actions/auth";
import { redirect } from "next/navigation";
import { UsageAlert } from "@/components/billing/usage-alert";

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  // Make sure the user is authenticated and exists in our database
  const userData = await getOrCreateUser();
  
  if (!userData) {
    // If authentication failed, redirect to sign-in
    redirect('/auth/sign-in?reason=dashboard_auth_failed');
  }
  
  return (
    <div>
      <InfoBar />
      <div className="p-6">
        <UsageAlert />
        <h1 className="text-2xl font-bold mb-6">Welcome, {userData.user.fullname || 'User'}</h1>
        
        {/* Dashboard content goes here */}
      </div>
    </div>
  );
}
