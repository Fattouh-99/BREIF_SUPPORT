import nodemailer from 'nodemailer'
import type { SendMailOptions } from 'nodemailer'
import { SUPPORT_EMAIL } from '@/constants/support'

export function getMailFromAddress(): string {
  return process.env.NODE_MAILER_EMAIL || SUPPORT_EMAIL
}

export function getMailAppPassword(): string {
  return (
    process.env.NODE_MAILER_GMAIL_APP_PASSWORD?.replace(/['"]/g, '').replace(/\s/g, '').trim() ||
    ''
  )
}

export function getMailConfigError(): string | null {
  if (!getMailFromAddress()) {
    return 'NODE_MAILER_EMAIL is not configured.'
  }
  if (!getMailAppPassword()) {
    return 'NODE_MAILER_GMAIL_APP_PASSWORD is not configured.'
  }
  return null
}

export function formatMailError(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error && error.code === 'EAUTH') {
    return `Gmail login failed for ${getMailFromAddress()}. Create a new App Password in Google Account → Security → App passwords, set NODE_MAILER_GMAIL_APP_PASSWORD in .env, then restart the server.`
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'Failed to send email.'
}

export function createMailTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: getMailFromAddress(),
      pass: getMailAppPassword(),
    },
  })
}

export async function sendMail(options: SendMailOptions) {
  const configError = getMailConfigError()
  if (configError) {
    throw new Error(configError)
  }

  const transporter = createMailTransporter()
  return transporter.sendMail({
    from: `"Brief Support" <${getMailFromAddress()}>`,
    ...options,
  })
}
