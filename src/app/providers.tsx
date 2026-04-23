'use client';

import React, { useState, useEffect } from 'react';
import { ensureFirebaseLoaded } from '@/lib/module-compatibility';

// Helper function to ensure objects coming from server components are serializable
export function ensureSerializable(result: any): any {
  if (!result) return result;
  if (typeof result !== 'object') return result;

  if (Array.isArray(result)) {
    return result.map(ensureSerializable);
  }

  // Handle Date objects specially
  if (result instanceof Date) {
    return result.toISOString();
  }

  // Create a new object with the same properties
  const serialized: Record<string, any> = {};
  for (const key in result) {
    if (Object.prototype.hasOwnProperty.call(result, key)) {
      serialized[key] = ensureSerializable(result[key]);
    }
  }
  return serialized;
}

export function Providers({ children }: { children: React.ReactNode }) {
  // Load Firebase modules if available
  useEffect(() => {
    // Load Firebase if it exists
    ensureFirebaseLoaded()
      .catch((error) => {
        console.log('Error loading Firebase modules:', error);
      });
  }, []);

  return children;
} 