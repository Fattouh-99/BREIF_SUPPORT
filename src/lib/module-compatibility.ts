/**
 * This file helps handle compatibility issues between ESM and CommonJS modules
 * when using libraries like Firebase in Next.js with code-splitting enabled.
 * 
 * The problem occurs when webpack chunks CommonJS modules that use 'exports' into
 * separate files loaded in an ESM context where 'exports' is not defined.
 */

export const ensureFirebaseLoaded = () => {
  // Similar wrapper for Firebase
  return import('firebase/app');
};

// Add more compatibility wrappers as needed 