import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/prisma'
import { z } from 'zod'
import nodemailer from 'nodemailer'

// Validation schema for inquiry data
const InquirySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().email('Valid email is required').max(255, 'Email is too long'),
  message: z.string().min(1, 'Message is required').max(5000, 'Message is too long'),
  domainId: z.string().min(1, 'Domain ID is required')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request data
    const validationResult = InquirySchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          message: 'Invalid data provided',
          errors: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const { name, email, message, domainId } = validationResult.data

    // Verify that the domain exists and get owner details
    const domain = await client.domain.findUnique({
      where: { id: domainId },
      select: { 
        id: true, 
        name: true,
        userId: true,
        User: {
          select: {
            id: true,
            fullname: true,
            email: true
          }
        }
      }
    })

    if (!domain) {
      return NextResponse.json(
        { message: 'Invalid domain' },
        { status: 404 }
      )
    }

    if (!domain.userId) {
      return NextResponse.json(
        { message: 'Domain owner not found' },
        { status: 404 }
      )
    }

    // Create a customer record if they don't exist
    let customer = await client.customer.findFirst({
      where: {
        email: email,
        domainId: domainId
      }
    })

    if (!customer) {
      // Check billing limits before creating new customer
      const currentCustomerCount = await client.customer.count({
        where: {
          domainId: domainId
        }
      })

      // Get user's plan limits (same as in the main chatbot logic)
      const userWithPlan = await client.user.findUnique({
        where: { id: domain.userId },
        select: {
          subscription: {
            select: {
              plan: true
            }
          }
        }
      })

      const userPlan = userWithPlan?.subscription?.plan || 'STANDARD'
      const planLimits = {
        'STANDARD': 10,
        'PRO': 50
      }

      const customerLimit = planLimits[userPlan as keyof typeof planLimits]

      // Check if creating a new customer would exceed the limit
      if (currentCustomerCount >= customerLimit) {
        return NextResponse.json(
          { 
            message: `This account has reached its maximum limit of ${customerLimit} contacts under the ${userPlan} plan. Please contact support.`
          },
          { status: 429 }
        )
      }

      // Create new customer
      customer = await client.customer.create({
        data: {
          email: email,
          domainId: domainId
        }
      })
    }

    // Create a notification for the domain owner
    await client.notification.create({
      data: {
        type: 'DOMAIN_SETUP',
        message: `New inquiry from ${name}: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`,
        userId: domain.userId,
        domainId: domainId,
        data: JSON.stringify({
          type: 'inquiry',
          customerName: name,
          customerEmail: email,
          message: message,
          timestamp: new Date().toISOString()
        })
      }
    })

    // Send email notification to domain owner
    if (domain.User?.email) {
      try {
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: process.env.NODE_MAILER_EMAIL,
            pass: process.env.NODE_MAILER_GMAIL_APP_PASSWORD,
          },
        })

        const mailOptions = {
          from: process.env.NODE_MAILER_EMAIL,
          to: domain.User.email,
          subject: `New Inquiry from ${domain.name} - ${name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #4F46E5; margin-bottom: 20px;">New Inquiry Received</h2>
              
              <div style="background-color: #F9FAFB; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin-top: 0; color: #374151;">Inquiry Details</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Domain:</strong> ${domain.name}</p>
                <p><strong>Received:</strong> ${new Date().toLocaleString()}</p>
              </div>
              
              <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin-top: 0; color: #374151;">Message</h3>
                <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
              </div>
              
              <div style="background-color: #E0F2FE; padding: 15px; border-radius: 8px; border-left: 4px solid #0EA5E9;">
                <p style="margin: 0; color: #0C4A6E;">
                  <strong>Next Steps:</strong> Please respond to this inquiry within 24 hours to maintain good customer service.
                  You can reply directly to ${email} or log in to your dashboard to manage this inquiry.
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
                <p style="color: #6B7280; font-size: 14px;">
                  Best regards,<br>
                  The Brief Support Team<br>
                  <a href="mailto:support@briefsupport.com" style="color: #4F46E5;">support@briefsupport.com</a>
                </p>
              </div>
            </div>
          `
        }

        await transporter.sendMail(mailOptions)
        console.log('Email notification sent successfully to:', domain.User.email)
      } catch (emailError) {
        console.error('Error sending email notification:', emailError)
        // Don't fail the entire request if email fails
      }
    }

    // Create a chat room for potential follow-up with the inquiry message
    const chatRoom = await client.chatRoom.create({
      data: {
        customerId: customer.id,
        live: false,
        message: {
          create: {
            message: `Inquiry from ${name} (${email}): ${message}`,
            role: 'user',
            seen: false
          }
        }
      }
    })

    return NextResponse.json(
      { 
        message: 'Your inquiry has been submitted successfully. We will get back to you soon.',
        chatRoomId: chatRoom.id
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error processing inquiry:', error)
    return NextResponse.json(
      { message: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
} 