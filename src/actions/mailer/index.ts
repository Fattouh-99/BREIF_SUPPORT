'use server'
import nodemailer from 'nodemailer'

export const onMailer = async (
  ownerName: string,
  domainName: string,
  customerEmail: string,
  customerQuery: string
) => {
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
    to: process.env.NODE_MAILER_EMAIL,
    subject: `Live Support Required - ${domainName}`,
    html: `
      <h2>Live Support Request</h2>
      <p>Hello ${ownerName},</p>
      <p>A customer on your ${domainName} domain requires live support assistance.</p>
      <h3>Customer Details:</h3>
      <ul>
        <li><strong>Email:</strong> ${customerEmail}</li>
        <li><strong>Query:</strong> ${customerQuery}</li>
      </ul>
      <p>The conversation has been transferred to live chat mode. Please log in to your dashboard to assist the customer.</p>
      <p>Best regards,<br>Brief Support Team</p>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    return { status: 200, message: 'Email sent' }
  } catch (error) {
    console.error('Error sending support request email:', error)
    return { status: 500, message: 'Error sending email' }
  }
}
