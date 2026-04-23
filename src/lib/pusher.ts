import PusherServer from 'pusher'
import PusherClient from 'pusher-js'

// Debug function to log environment variable status
const debugEnvVars = () => {
  console.log('[PUSHER DEBUG] Environment variables check:', {
    PUSHER_APP_ID: process.env.PUSHER_APP_ID ? 'SET' : 'MISSING',
    NEXT_PUBLIC_PUSHER_APP_KEY: process.env.NEXT_PUBLIC_PUSHER_APP_KEY ? 'SET' : 'MISSING',
    PUSHER_APP_SECRET: process.env.PUSHER_APP_SECRET ? 'SET' : 'MISSING',
    NEXT_PUBLIC_PUSHER_APP_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER ? 'SET' : 'MISSING',
    NODE_ENV: process.env.NODE_ENV
  });
};

// Check if Pusher credentials are available
const isPusherConfigured = () => {
  const hasRequiredVars = !!(
    process.env.NEXT_PUBLIC_PUSHER_APP_KEY &&
    process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER &&
    process.env.PUSHER_APP_ID &&
    process.env.PUSHER_APP_SECRET
  );
  
  if (!hasRequiredVars && process.env.NODE_ENV === 'development') {
    debugEnvVars();
  }
  
  return hasRequiredVars;
};

// Get environment variables with validation - only log errors if really missing
const getEnvVar = (name: string, suppressWarnings: boolean = false) => {
  const value = process.env[name];
  
  if (!value && !suppressWarnings) {
    // Only log error if we're not in a configured state
    if (!isPusherConfigured()) {
      console.error(`Missing required environment variable: ${name}`);
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Please add ${name} to your .env.local file`);
      }
    }
  }
  
  return value || '';
};

// Server-side Pusher instance - only create if properly configured
let pusherServer: PusherServer | null = null;

if (isPusherConfigured()) {
  try {
    pusherServer = new PusherServer({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
      secret: process.env.PUSHER_APP_SECRET!,
      cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER!,
      useTLS: true,
    });
    console.log('[PUSHER DEBUG] Server-side Pusher configured successfully');
  } catch (error) {
    console.error('[PUSHER DEBUG] Failed to initialize Pusher server:', error);
    pusherServer = null;
  }
} else {
  console.warn('[PUSHER DEBUG] Pusher server not configured - missing environment variables');
}

export { pusherServer };

// Only initialize client-side Pusher if running in browser and properly configured
let pusherClient: PusherClient | null = null;

if (typeof window !== 'undefined') {
  const pusherAppKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
  const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER;
  
  if (pusherAppKey && pusherCluster && pusherAppKey !== 'key_placeholder') {
    try {
      // Configure PusherClient to use WebSocket only and disable client-side triggering
      pusherClient = new PusherClient(
        pusherAppKey, 
        {
          cluster: pusherCluster,
          forceTLS: true,
          // IMPORTANT: Only enable WebSocket transport to avoid CORS issues with XHR
          enabledTransports: ['ws', 'wss'],
          disableStats: true,
          // Use standard Pusher hosts instead of custom hosts
          // Remove undefined wsHost and wsPort to use Pusher's default infrastructure
          // Don't attempt to trigger events from the client - use server-side only
          userAuthentication: {
            endpoint: '/api/pusher/auth/user',
            transport: 'ajax',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            }
          },
          // Channel authentication settings
          channelAuthorization: {
            endpoint: '/api/pusher/auth',
            transport: 'ajax',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        }
      );

      console.log('[PUSHER DEBUG] Client-side Pusher configured successfully');

      // Add DEBUG EVENT LOGGING - Log all received events for debugging
      pusherClient.connection.bind('message', (params: any) => {
        if (params && params.event) {
          console.log(`[PUSHER DEBUG] Event received: ${params.event}`, params.data);
        }
      });
      
      // Add connection error handling
      pusherClient.connection.bind('error', (error: any) => {
        console.error('[PUSHER DEBUG] Connection error:', error);
        if (error.type === 'PusherError' && error.data?.code === 4001) {
          console.error('Pusher configuration error: Check your app key and cluster settings');
        }
      });
      
      pusherClient.connection.bind('state_change', (states: any) => {
        console.log(`[PUSHER DEBUG] Connection state changed: ${states.previous} -> ${states.current}`);
      });
      
    } catch (error) {
      console.error('[PUSHER DEBUG] Failed to initialize Pusher client:', error);
      pusherClient = null;
    }
  } else {
    debugEnvVars();
    console.warn('[PUSHER DEBUG] Pusher client not configured. Environment variables not available in browser.');
  }
}

export { pusherClient }; 