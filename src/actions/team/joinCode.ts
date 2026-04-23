'use server'

import { currentUser } from "@clerk/nextjs/server"
import { client } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { UserRole } from "@prisma/client"
import nodemailer from 'nodemailer'

/**
 * Generate a random join code of specified length
 * @param length Length of the join code
 * @returns Random alphanumeric string
 */
function generateRandomCode(length: number = 8): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

/**
 * Generate a new join code for the team
 * @returns Status of the operation and the new code
 */
export async function generateTeamJoinCode() {
  try {
    const user = await currentUser()
    if (!user) {
      return { success: false, error: 'You must be logged in to generate a join code' }
    }
    
    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { 
        id: true, 
        teamId: true,
        role: true
      }
    })
    
    // Only team owners can generate join codes
    if (!dbUser || dbUser.role !== 'OWNER') {
      return { success: false, error: 'Only team owners can generate join codes' }
    }
    
    // Check if user has a team
    if (!dbUser.teamId) {
      return { success: false, error: 'You must create a team before generating a join code' }
    }
    
    // Generate a unique code
    const joinCode = generateRandomCode()
    
    // Get or create team settings
    let teamSettings = await client.teamSettings.findUnique({
      where: { teamId: dbUser.teamId }
    })
    
    if (teamSettings) {
      // Update the existing team settings
      await client.teamSettings.update({
        where: { id: teamSettings.id },
        data: { 
          recognitionMessage: JSON.stringify({ joinCode, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) })
        }
      })
    } else {
      // Create new team settings
      await client.teamSettings.create({
        data: {
          teamId: dbUser.teamId,
          recognitionMessage: JSON.stringify({ joinCode, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) })
        }
      })
    }
    
    revalidatePath('/team')
    
    return {
      success: true,
      joinCode
    }
  } catch (error) {
    console.error('Error generating team join code:', error)
    return {
      success: false,
      error: 'Failed to generate join code'
    }
  }
}

/**
 * Invalidate the current join code
 * @returns Status of the operation
 */
export async function invalidateTeamJoinCode() {
  try {
    const user = await currentUser()
    if (!user) {
      return { success: false, error: 'You must be logged in to invalidate a join code' }
    }
    
    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { 
        id: true, 
        teamId: true,
        role: true
      }
    })
    
    // Only team owners can invalidate join codes
    if (!dbUser || dbUser.role !== 'OWNER') {
      return { success: false, error: 'Only team owners can invalidate join codes' }
    }
    
    // Check if user has a team
    if (!dbUser.teamId) {
      return { success: false, error: 'You are not a member of any team' }
    }
    
    // Get team settings
    const teamSettings = await client.teamSettings.findUnique({
      where: { teamId: dbUser.teamId }
    })
    
    if (teamSettings) {
      // Update team settings to remove the join code
      await client.teamSettings.update({
        where: { id: teamSettings.id },
        data: { 
          recognitionMessage: null 
        }
      })
    }
    
    revalidatePath('/team')
    
    return {
      success: true
    }
  } catch (error) {
    console.error('Error invalidating team join code:', error)
    return {
      success: false,
      error: 'Failed to invalidate join code'
    }
  }
}

/**
 * Join a team using a join code
 * @param joinCodeInput The join code to use
 * @returns Status of the operation
 */
export async function joinTeamWithCode(joinCodeInput: string) {
  try {
    const user = await currentUser()
    if (!user) {
      return { success: false, error: 'You must be logged in to join a team' }
    }
    
    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { 
        id: true, 
        teamId: true
      }
    })
    
    if (!dbUser) {
      return { success: false, error: 'User not found in the database' }
    }
    
    // Check if user already has a team
    if (dbUser.teamId) {
      return { success: false, error: 'You are already a member of a team' }
    }
    
    // Find all team settings
    const allTeamSettings = await client.teamSettings.findMany({
      include: {
        team: true
      }
    })
    
    // Find the team with the matching join code
    let targetTeamId = null
    
    for (const settings of allTeamSettings) {
      if (!settings.recognitionMessage) continue;
      
      try {
        const data = JSON.parse(settings.recognitionMessage)
        if (data.joinCode === joinCodeInput) {
          // Check if the code is expired
          if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
            return { success: false, error: 'This join code has expired' }
          }
          
          targetTeamId = settings.teamId
          break
        }
      } catch (e) {
        // Skip if we can't parse the JSON
        continue
      }
    }
    
    if (!targetTeamId) {
      return { success: false, error: 'Invalid join code' }
    }
    
    // Add user to the team as a member
    await client.user.update({
      where: { id: dbUser.id },
      data: {
        teamId: targetTeamId,
        role: 'MEMBER' as UserRole
      }
    })
    
    revalidatePath('/team')
    
    return {
      success: true,
      message: 'You have successfully joined the team'
    }
  } catch (error) {
    console.error('Error joining team with code:', error)
    return {
      success: false,
      error: 'Failed to join team'
    }
  }
}

/**
 * Send team join code via email
 * @param email Email address to send the code to
 * @param joinCode The join code to send
 * @param teamName The name of the team
 * @returns Status of the operation
 */
export async function sendJoinCodeViaEmail(email: string, joinCode: string, teamName: string) {
  try {
    const user = await currentUser()
    if (!user) {
      return { success: false, error: 'You must be logged in to share a join code' }
    }
    
    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { 
        id: true, 
        fullname: true,
        teamId: true,
        role: true
      }
    })
    
    // Only team owners can share join codes
    if (!dbUser || dbUser.role !== 'OWNER') {
      return { success: false, error: 'Only team owners can share join codes' }
    }
    
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.NODE_MAILER_EMAIL,
        pass: process.env.NODE_MAILER_GMAIL_APP_PASSWORD,
      },
    })

    const senderName = dbUser.fullname || user.firstName || 'Team Owner';

    const mailOptions = {
      from: process.env.NODE_MAILER_EMAIL,
      to: email,
      subject: `Invitation to Join ${teamName} on Brief Support`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5; text-align: center;">You've Been Invited to Join ${teamName}</h1>
          
          <p style="font-size: 16px; line-height: 1.5;">Hello,</p>
          
          <p style="font-size: 16px; line-height: 1.5;">
            ${senderName} has invited you to join their team on Brief Support.
          </p>
          
          <div style="background-color: #F3F4F6; padding: 16px; border-radius: 8px; margin: 24px 0; text-align: center;">
            <p style="margin: 0 0 8px 0; font-weight: bold;">Your Team Join Code:</p>
            <p style="font-family: monospace; font-size: 24px; letter-spacing: 2px; margin: 0; color: #4F46E5;">${joinCode}</p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.5;">
            To join the team, sign in to your Brief Support account and enter the join code when prompted.
          </p>
          
          <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #F3F4F6;">
            <p style="margin: 0; color: #6B7280; font-size: 14px;">
              This code will expire in 7 days.<br>
              If you have any questions, please contact ${senderName}.
            </p>
          </div>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    
    return {
      success: true,
      message: `Join code sent to ${email}`
    }
  } catch (error) {
    console.error('Error sending join code via email:', error)
    return {
      success: false,
      error: 'Failed to send join code via email'
    }
  }
} 