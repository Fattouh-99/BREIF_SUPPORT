/**
 * This file is imported by all API routes to ensure they use Node.js runtime
 * instead of Edge runtime, which has compatibility issues with Clerk and Prisma
 */

export const runtime = 'nodejs';
export const preferredRegion = 'auto';
export const dynamic = 'force-dynamic';
export const revalidate = 0; // No caching for API routes 