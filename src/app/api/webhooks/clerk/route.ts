import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    return new Response('Error occurred during verification', {
      status: 400
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  try {
    if (eventType === 'user.created') {
      // We will no longer create users from the webhook
      // Instead, we'll wait for the complete registration form data
      // to create the user with all fields properly populated
      
      console.log('User created in Clerk:', evt.data.id);
      return NextResponse.json({ 
        success: true, 
        message: 'User creation noted, waiting for registration form data'
      });
    }

    if (eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;
      const primaryEmail = email_addresses?.[0]?.email_address;

      if (!primaryEmail) {
        return new Response('No email found', { status: 400 });
      }

      // Check if user exists in our database first
      const existingUser = await prisma.user.findUnique({
        where: { clerkId: id }
      });
      
      if (existingUser) {
        // Only update if the user exists
        console.log('Updating existing user from Clerk update webhook:', id);
        
        // Create an update object that preserves existing data
        const updateData: Record<string, any> = {
          // Only update email if it's changed
          ...(existingUser.email !== primaryEmail ? { email: primaryEmail } : {}),
        };
        
        // Only update fullname if it's empty or set to default
        if (!existingUser.fullname || existingUser.fullname === 'New User') {
          const newFullname = `${first_name || ''} ${last_name || ''}`.trim();
          if (newFullname) {
            updateData.fullname = newFullname;
          }
        }
        
        // Only update image URL if it's empty and we have a new one
        if (!existingUser.imageUrl && image_url) {
          updateData.imageUrl = image_url;
        }
        
        // Only perform update if there are changes to make
        if (Object.keys(updateData).length > 0) {
          await prisma.user.update({
            where: { clerkId: id },
            data: updateData,
          });
          console.log('User data updated from Clerk webhook:', updateData);
        } else {
          console.log('No changes needed for user from Clerk webhook');
        }
      } else {
        console.log('User not found in database for update webhook:', id);
      }
    }

    if (eventType === 'user.deleted') {
      const { id } = evt.data;
      
      try {
        // Check if user exists first
        const existingUser = await prisma.user.findUnique({
          where: { clerkId: id }
        });
        
        // Only attempt deletion if user exists
        if (existingUser) {
          console.log('Deleting user from database:', id);
          await prisma.user.delete({
            where: { clerkId: id },
          });
        } else {
          console.log('User not found in database for deletion:', id);
        }
      } catch (error) {
        // Handle specific Prisma errors
        if (error instanceof PrismaClientKnownRequestError) {
          // P2025 is "Record to delete does not exist"
          if (error.code === 'P2025') {
            // User doesn't exist, that's fine, just return success
            return NextResponse.json({ success: true });
          }
        }
        // Re-throw other errors
        throw error;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    // Return a 500 response for internal server errors
    return new Response('Internal server error', { status: 500 });
  }
}