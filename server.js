const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

// Manually load environment variables for production
const loadEnvVariables = () => {
  try {
    // First check for production env file
    const envPath = path.resolve(process.cwd(), '.env.production');
    const defaultEnvPath = path.resolve(process.cwd(), '.env');
    const localEnvPath = path.resolve(process.cwd(), '.env.local');
    
    let envLoaded = false;
    
    if (fs.existsSync(envPath)) {
      console.log('Loading environment variables from .env.production');
      require('dotenv').config({ path: envPath });
      envLoaded = true;
    } 
    
    if (fs.existsSync(localEnvPath)) {
      console.log('Loading environment variables from .env.local');
      require('dotenv').config({ path: localEnvPath });
      envLoaded = true;
    }
    
    if (fs.existsSync(defaultEnvPath)) {
      console.log('Loading environment variables from .env');
      require('dotenv').config({ path: defaultEnvPath });
      envLoaded = true;
    }
    
    if (!envLoaded) {
      console.warn('No .env files found, using existing environment variables');
    }
    
    // Check critical environment variables
    const requiredVars = [
      'DATABASE_URL',
      'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
      'CLERK_SECRET_KEY',
      'CLERK_WEBHOOK_SECRET'
    ];
    
    const missingVars = requiredVars.filter(key => !process.env[key]);
    
    if (missingVars.length > 0) {
      console.error('⛔ MISSING CRITICAL ENVIRONMENT VARIABLES:');
      missingVars.forEach(key => {
        console.error(`  - ${key}`);
      });
      
      // Provide fallback values for Clerk to prevent errors
      if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
        console.warn('Setting fallback NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_ZWFzeS1vYXJmaXNoLTkuY2xlcmsuYWNjb3VudHMuZGV2JA';
      }
      
      if (!process.env.CLERK_SECRET_KEY) {
        console.warn('Setting fallback CLERK_SECRET_KEY');
        process.env.CLERK_SECRET_KEY = 'sk_test_placeholder_for_build';
      }
      
      if (!process.env.CLERK_WEBHOOK_SECRET) {
        console.warn('Setting fallback CLERK_WEBHOOK_SECRET');
        process.env.CLERK_WEBHOOK_SECRET = 'whsec_placeholder_for_build';
      }
      
      // Only exit in production if DATABASE_URL is missing
      if (!process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
        console.error('Exiting due to missing DATABASE_URL');
        process.exit(1);
      }
    }

    // Log Clerk key status
    console.log(`CLERK KEY STATUS: ${process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'Available' : 'Missing'}`);
    console.log(`CLERK_SECRET STATUS: ${process.env.CLERK_SECRET_KEY ? 'Available' : 'Missing'}`);
    
    // IMPORTANT: Don't set Clerk cookie domain - this causes redirect loops
    // Explicitly delete the cookie domain variable to prevent redirect issues
    delete process.env.NEXT_PUBLIC_CLERK_DOMAIN;
    console.log('Removed Clerk cookie domain setting to prevent redirect loops');
    
    // Set fallbacks for development only
    if (process.env.NODE_ENV !== 'production' && !process.env.DATABASE_URL) {
      console.warn('Setting fallback DATABASE_URL for development');
      process.env.DATABASE_URL = 'postgresql://postgres:password@localhost:5432/briefsupport_db';
    }
  } catch (error) {
    console.error('Error loading environment variables:', error);
  }
};

// Load environment variables before initializing Next.js
loadEnvVariables();

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3000;

app.prepare().then(() => {
  createServer((req, res) => {
    // Log critical authentication headers for debugging
    if (req.url?.includes('/auth') || req.url?.includes('/dashboard')) {
      console.log('Request URL:', req.url);
      console.log('Cookie header:', (req.headers.cookie || '').slice(0, 50) + '...');
      console.log('User-Agent:', req.headers['user-agent']);
    }
    
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
}); 