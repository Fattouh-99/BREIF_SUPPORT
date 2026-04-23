/**
 * Centralized UUID generation utility
 * Browser and Node.js compatible
 */

import crypto from 'crypto'

// Browser and Node.js compatible UUID generator
export function generateUUID(): string {
  return crypto.randomUUID()
}

// UUID validation regex
export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Helper function to validate UUID format
export function isValidUUID(uuid: string): boolean {
  return UUID_REGEX.test(uuid);
}

// Helper function to ensure valid UUID - if invalid, generate a new one
export function ensureValidUUID(uuid?: string): string {
  if (!uuid || !isValidUUID(uuid)) {
    return generateUUID();
  }
  return uuid;
}