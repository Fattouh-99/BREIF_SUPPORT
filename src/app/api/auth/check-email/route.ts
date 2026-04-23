import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }
    
    try {
      // Try to find users with this email
      const users = await clerkClient.users.getUserList({
        emailAddress: [email],
      });
      
      // If any users are found with this email, it exists
      const exists = users.length > 0;
      
      return NextResponse.json({ exists });
    } catch (error) {
      console.error("Error checking email in Clerk:", error);
      // If there's an error, return false to allow registration attempt
      return NextResponse.json({ exists: false });
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 