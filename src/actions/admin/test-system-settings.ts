'use server'

import { PrismaClient } from '@prisma/client'
import { getSystemSettings, updateSystemSettings } from './system-settings'

// Test function to manually verify the update function works
export async function testSystemSettings() {
  try {
    // Make sure boolean values are explicitly set to false
    const result = await updateSystemSettings({
      registrationEnabled: false,
      loginEnabled: false,
      maintenanceMode: false,
      maintenanceMessage: null,
      forceLogoutAllUsers: false
    })
    
    // Ensure the returned data has proper boolean values
    return { 
      success: true, 
      result: {
        ...result,
        registrationEnabled: result.registrationEnabled === true,
        loginEnabled: result.loginEnabled === true,
        maintenanceMode: result.maintenanceMode === true,
        forceLogoutAllUsers: result.forceLogoutAllUsers === true
      }
    }
  } catch (error) {
    console.error('Test error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    }
  }
}

// Function to get current settings for debugging
export async function debugSystemSettings() {
  try {
    const settings = await getSystemSettings()
    
    if (settings) {
      // Ensure boolean values are properly typed
      return { 
        success: true, 
        settings: {
          ...settings,
          registrationEnabled: settings.registrationEnabled === true,
          loginEnabled: settings.loginEnabled === true,
          maintenanceMode: settings.maintenanceMode === true,
          forceLogoutAllUsers: settings.forceLogoutAllUsers === true
        }
      }
    }
    
    return { success: true, settings }
  } catch (error) {
    console.error('Debug error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    }
  }
} 