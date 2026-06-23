/**
 * Centralized UUID generation utility
 * Browser and Node.js compatible
 */

export function generateUUID(): string {
  if (typeof globalThis !== 'undefined' && typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }

  // Fallback for environments without Web Crypto randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.random() * 16 | 0
    const value = char === 'x' ? random : (random & 0x3) | 0x8
    return value.toString(16)
  })
}

// UUID validation regex
export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Helper function to validate UUID format
export function isValidUUID(uuid: string): boolean {
  return UUID_REGEX.test(uuid)
}

// Helper function to ensure valid UUID - if invalid, generate a new one
export function ensureValidUUID(uuid?: string): string {
  if (!uuid || !isValidUUID(uuid)) {
    return generateUUID()
  }
  return uuid
}
