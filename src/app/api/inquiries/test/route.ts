import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

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

    // For testing, just log the inquiry instead of saving to database
    console.log('Test Inquiry Received:', {
      name,
      email,
      message,
      domainId,
      timestamp: new Date().toISOString()
    })

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Return success response
    return NextResponse.json(
      { 
        message: 'Your test inquiry has been submitted successfully. This is a test environment.',
        testMode: true
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error processing test inquiry:', error)
    return NextResponse.json(
      { message: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
} 