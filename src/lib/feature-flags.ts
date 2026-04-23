import { cache } from 'react';
import { client } from '@/lib/prisma';

// Define feature flag types
export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description: string;
  rolloutPercentage?: number; // 0-100
}

// Default flags if database is unavailable
const DEFAULT_FLAGS: Record<string, FeatureFlag> = {
  'new-dashboard': {
    name: 'new-dashboard',
    enabled: false,
    description: 'Enable the new dashboard experience',
    rolloutPercentage: 0,
  },
  'enhanced-analytics': {
    name: 'enhanced-analytics',
    enabled: false,
    description: 'Enable enhanced analytics features',
  },
  'beta-features': {
    name: 'beta-features',
    enabled: false,
    description: 'Enable beta features',
    rolloutPercentage: 10, // 10% rollout
  },
};

// In-memory cache for feature flags
let flagsCache: Record<string, FeatureFlag> | null = null;

/**
 * Gets all feature flags with caching
 * Falls back to default flags if database is unavailable
 */
export const getFeatureFlags = cache(async (): Promise<Record<string, FeatureFlag>> => {
  // Return cached flags if available
  if (flagsCache) {
    return flagsCache;
  }
  
  try {
    // Try to fetch from database if a feature flags table exists
    // This is a simplified example - in production, you'd have a proper
    // Prisma model defined for feature flags
    const flags = await client.$queryRaw`
      SELECT * FROM "FeatureFlag" 
      WHERE "deletedAt" IS NULL
    `.catch(() => null);
    
    // If we have flags from the database, format them
    if (flags && Array.isArray(flags) && flags.length > 0) {
      const flagsRecord: Record<string, FeatureFlag> = {};
      
      flags.forEach((flag: any) => {
        flagsRecord[flag.name] = {
          name: flag.name,
          enabled: flag.enabled,
          description: flag.description,
          rolloutPercentage: flag.rolloutPercentage,
        };
      });
      
      flagsCache = flagsRecord;
      return flagsRecord;
    }
    
    // No flags in database, use defaults
    flagsCache = DEFAULT_FLAGS;
    return DEFAULT_FLAGS;
  } catch (error) {
    console.error('Failed to fetch feature flags:', error);
    flagsCache = DEFAULT_FLAGS;
    return DEFAULT_FLAGS;
  }
});

/**
 * Get a specific feature flag by name
 * 
 * @param name - Feature flag name
 * @returns Feature flag object or undefined if not found
 */
export async function getFeatureFlag(name: string): Promise<FeatureFlag | undefined> {
  const flags = await getFeatureFlags();
  return flags[name];
}

/**
 * Check if a feature flag is enabled
 * 
 * @param name - Feature flag name
 * @param userId - Optional user ID for percentage rollouts
 * @returns True if feature flag is enabled for this user
 */
export async function isFeatureEnabled(
  name: string,
  userId?: string
): Promise<boolean> {
  const flag = await getFeatureFlag(name);
  
  // Flag not found or explicitly disabled
  if (!flag || !flag.enabled) {
    return false;
  }
  
  // Flag enabled for all users (no percentage rollout)
  if (!flag.rolloutPercentage || flag.rolloutPercentage >= 100) {
    return true;
  }
  
  // Percentage rollout requires a userId
  if (!userId) {
    return false;
  }
  
  // Determine if user is in the rollout percentage
  // Use userId hash for consistent results
  const hash = hashString(userId);
  const percentage = hash % 100;
  
  return percentage < flag.rolloutPercentage;
}

/**
 * Simple string hashing function
 * 
 * @param str - String to hash
 * @returns A number between 0-99
 */
function hashString(str: string): number {
  let hash = 0;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Ensure positive number between 0-99
  return Math.abs(hash) % 100;
}

/**
 * React hook to check if a feature is enabled (Client component)
 * 
 * @param name - Feature flag name
 * @param userId - Optional user ID for percentage rollouts
 * @returns Boolean indicating if feature is enabled
 */
export function useFeatureFlag(name: string, userId?: string): boolean {
  // For client components, implement with React state
  // This is a simplified version that would need to be enhanced
  // with proper data fetching in a real implementation
  
  // Default to false until we implement proper client-side fetch
  return false;
} 