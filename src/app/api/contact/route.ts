import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'
import { createMailTransporter, getMailFromAddress } from '@/lib/mailer'
import { SUPPORT_EMAIL } from '@/constants/support'

export async function POST(request: NextRequest) {
  // Apply rate limiting: 5 contact messages per hour
  const rateLimitResponse = rateLimit(request, { 
    limit: 5, 
    windowInSeconds: 3600, // 1 hour
    identifierFn: (req) => {
      // Use IP address for rate limiting
      const ip = req.ip || req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1'
      return `contact_${ip}`
    }
  })
  
  if (rateLimitResponse) {
    return rateLimitResponse
  }
  try {
    const { name, email, company, phone, message } = await request.json()

    // Validate required fields
    if (!name || !email || !company || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const transporter = createMailTransporter()

    // Email to support inbox
    const supportMailOptions = {
      from: getMailFromAddress(),
      to: getMailFromAddress(),
      subject: `New Contact Form Submission from ${company}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #007bff; margin-top: 0;">Contact Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Name:</td>
                <td style="padding: 8px 0; color: #666;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Email:</td>
                <td style="padding: 8px 0; color: #666;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Company:</td>
                <td style="padding: 8px 0; color: #666;">${company}</td>
              </tr>
              ${phone ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Phone:</td>
                <td style="padding: 8px 0; color: #666;">${phone}</td>
              </tr>` : ''}
            </table>
          </div>
          
          <div style="background-color: #fff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
            <h3 style="color: #007bff; margin-top: 0;">Message</h3>
            <p style="color: #333; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #e7f3ff; border-radius: 8px; border-left: 4px solid #007bff;">
            <p style="margin: 0; color: #333;">
              <strong>Next Steps:</strong> This is a sales inquiry. Please respond within 24 hours to maintain our response time commitment.
            </p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e9ecef;">
          <p style="color: #666; font-size: 12px; text-align: center;">
            This email was sent from the Brief Support contact form.<br>
            Submitted on ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    }

    // Confirmation email to the user
    const confirmationMailOptions = {
      from: getMailFromAddress(),
      to: email,
      subject: 'Thank you for contacting Brief Support',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            Thank you for contacting us, ${name}!
          </h2>
          
          <p style="color: #333; line-height: 1.6;">
            We've received your message and one of our sales representatives will get back to you within 24 hours.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #007bff; margin-top: 0;">Your Submission Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Company:</td>
                <td style="padding: 8px 0; color: #666;">${company}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Email:</td>
                <td style="padding: 8px 0; color: #666;">${email}</td>
              </tr>
              ${phone ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Phone:</td>
                <td style="padding: 8px 0; color: #666;">${phone}</td>
              </tr>` : ''}
            </table>
            <div style="margin-top: 15px;">
              <strong style="color: #333;">Your Message:</strong>
              <p style="color: #666; margin: 5px 0; white-space: pre-wrap;">${message}</p>
            </div>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #e7f3ff; border-radius: 8px; border-left: 4px solid #007bff;">
            <p style="margin: 0; color: #333;">
              <strong>What's Next?</strong> Our sales team will review your inquiry and reach out to discuss how Brief Support can help your business.
            </p>
          </div>
          
          <p style="color: #333; line-height: 1.6; margin-top: 20px;">
            In the meantime, feel free to explore our <a href="https://briefsupport.com/#pricing" style="color: #007bff;">pricing plans</a> or check out our <a href="https://briefsupport.com/demo" style="color: #007bff;">demo</a>.
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e9ecef;">
          <p style="color: #666; font-size: 12px; text-align: center;">
            Best regards,<br>
            The Brief Support Team<br>
            <a href="mailto:${SUPPORT_EMAIL}" style="color: #007bff;">${SUPPORT_EMAIL}</a>
          </p>
        </div>
      `,
    }

    // Send both emails
    await Promise.all([
      transporter.sendMail(supportMailOptions),
      transporter.sendMail(confirmationMailOptions)
    ])

    return NextResponse.json(
      { message: 'Contact form submitted successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error processing contact form:', error)
    return NextResponse.json(
      { error: 'Failed to send email. Please try again.' },
      { status: 500 }
    )
  }
} 