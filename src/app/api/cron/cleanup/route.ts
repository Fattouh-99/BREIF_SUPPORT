import { NextResponse } from "next/server";
import { cleanupOldChats } from "@/actions/cleanup";

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Verify that this is a legitimate cron job request
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      return new NextResponse("Cron secret not configured", { status: 500 });
    }

    await cleanupOldChats();
    
    return new NextResponse("Cleanup completed successfully", { status: 200 });
  } catch (error) {
    console.error("Cleanup cron job failed:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 