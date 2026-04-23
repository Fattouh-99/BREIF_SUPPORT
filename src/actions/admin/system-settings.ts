'use server'

import { client } from '@/lib/prisma'
import { isCurrentUserSuperAdmin } from '.'
import { revalidatePath } from 'next/cache'
import { currentUser } from '@clerk/nextjs/server'

// Get the current system settings
export const getSystemSettings = async () => {
  try {
    // Check if user is super admin
    const isAdmin = await isCurrentUserSuperAdmin()
    if (!isAdmin) {
      throw new Error('Unauthorized. Only super admins can access system settings.')
    }

    // Get the first (and should be only) system settings record
    const settings = await client.systemSettings.findFirst()
    
    if (settings) {
      // Ensure boolean values are properly typed
      return {
        ...settings,
        registrationEnabled: settings.registrationEnabled === true,
        loginEnabled: settings.loginEnabled === true,
        maintenanceMode: settings.maintenanceMode === true,
        forceLogoutAllUsers: settings.forceLogoutAllUsers === true
      }
    }
    
    return settings
  } catch (error) {
    console.error('Error getting system settings:', error)
    throw error
  }
}

// Update system settings
export const updateSystemSettings = async (data: {
  registrationEnabled?: boolean
  loginEnabled?: boolean
  maintenanceMode?: boolean
  maintenanceMessage?: string | null
  forceLogoutAllUsers?: boolean
}) => {
  try {
    // Check if user is super admin
    const isAdmin = await isCurrentUserSuperAdmin()
    if (!isAdmin) {
      throw new Error('Unauthorized. Only super admins can update system settings.')
    }

    const user = await currentUser()
    if (!user) {
      throw new Error('User not found')
    }

    const dbUser = await client.user.findUnique({
      where: {
        clerkId: user.id
      }
    })

    if (!dbUser) {
      throw new Error('Database user not found')
    }

    // Handle the forceLogoutAllUsers flag if provided
    // Ensure all values are explicitly typed as boolean
    const normalizedData = {
      registrationEnabled: data.registrationEnabled === true,
      loginEnabled: data.loginEnabled === true,
      maintenanceMode: data.maintenanceMode === true,
      maintenanceMessage: data.maintenanceMessage,
      forceLogoutAllUsers: data.forceLogoutAllUsers === true
    }

    // Use a transaction to ensure data integrity
    return await client.$transaction(async (tx: any) => {
      // Get existing settings or create new ones
      const existingSettings = await tx.systemSettings.findFirst()

      let updatedSettings
      if (existingSettings) {
        // Update existing settings
        updatedSettings = await tx.systemSettings.update({
          where: {
            id: existingSettings.id
          },
          data: {
            // Explicitly use the normalized boolean values
            registrationEnabled: normalizedData.registrationEnabled,
            loginEnabled: normalizedData.loginEnabled,
            maintenanceMode: normalizedData.maintenanceMode,
            maintenanceMessage: normalizedData.maintenanceMessage,
            // Only update lastForceLogoutAt if forceLogoutAllUsers is true
            ...(normalizedData.forceLogoutAllUsers && { lastForceLogoutAt: new Date() }),
            forceLogoutAllUsers: normalizedData.forceLogoutAllUsers,
            updatedBy: dbUser.id,
            updatedAt: new Date()
          }
        })
      } else {
        // Create new settings
        updatedSettings = await tx.systemSettings.create({
          data: {
            registrationEnabled: normalizedData.registrationEnabled,
            loginEnabled: normalizedData.loginEnabled,
            maintenanceMode: normalizedData.maintenanceMode,
            maintenanceMessage: normalizedData.maintenanceMessage,
            forceLogoutAllUsers: normalizedData.forceLogoutAllUsers,
            lastForceLogoutAt: normalizedData.forceLogoutAllUsers ? new Date() : null,
            updatedBy: dbUser.id,
            updatedAt: new Date()
          }
        })
      }

      // Revalidate the admin page to refresh data
      revalidatePath('/admin')

      // Ensure boolean values are properly typed in response
      return {
        ...updatedSettings,
        registrationEnabled: updatedSettings.registrationEnabled === true,
        loginEnabled: updatedSettings.loginEnabled === true,
        maintenanceMode: updatedSettings.maintenanceMode === true,
        forceLogoutAllUsers: updatedSettings.forceLogoutAllUsers === true
      }
    })
  } catch (error) {
    console.error('Error updating system settings:', error)
    throw error
  }
}

// Check system access based on current settings
export const checkSystemAccess = async () => {
  try {
    // Get the first system settings record
    const settings = await client.systemSettings.findFirst()
    
    // If no settings exist, allow access by default
    if (!settings) {
      return { 
        canAccess: true,
        registrationEnabled: true,
        loginEnabled: true,
        maintenanceMode: false,
        maintenanceMessage: null
      }
    }
    
    // Return access status and maintenance info
    return {
      canAccess: !settings.maintenanceMode,
      registrationEnabled: settings.registrationEnabled === true,
      loginEnabled: settings.loginEnabled === true,
      maintenanceMode: settings.maintenanceMode === true,
      maintenanceMessage: settings.maintenanceMessage
    }
  } catch (error) {
    console.error('Error checking system access:', error)
    return { 
      canAccess: true,
      registrationEnabled: true,
      loginEnabled: true,
      maintenanceMode: false,
      maintenanceMessage: null
    }
  }
} 