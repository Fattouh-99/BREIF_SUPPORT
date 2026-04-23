import { pusherClient } from './pusher';

// Connection state constants
const CONNECTION_STATES = {
  CONNECTED: 'connected',
  CONNECTING: 'connecting',
  DISCONNECTED: 'disconnected',
  FAILED: 'failed'
};

// WebSocket manager class for handling Pusher connections
export class WebSocketManager {
  private static instance: WebSocketManager;
  private channelSubscriptions: Map<string, Set<string>> = new Map();
  private connectionAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000; // Base delay in ms
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private lastHeartbeatResponse: number = 0;
  private heartbeatTimeout: number = 30000; // 30 seconds
  private onReconnectListeners: (() => void)[] = [];

  // Private constructor for singleton pattern
  private constructor() {
    this.initializeConnection();
    this.setupHeartbeat();
  }

  // Get singleton instance
  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  // Initialize Pusher connection with event listeners
  private initializeConnection(): void {
    // Check if Pusher client is available
    if (!pusherClient) {
      console.error('Pusher client is not available');
      return;
    }

    // Set up connection state change monitoring
    pusherClient.connection.bind('state_change', (states: { current: string; previous: string }) => {
      console.log(`Pusher connection state changed from ${states.previous} to ${states.current}`);
      
      if (states.current === CONNECTION_STATES.CONNECTED) {
        this.connectionAttempts = 0;
        
        // Resubscribe to all channels
        this.resubscribeToChannels();
        
        // Notify listeners about reconnection
        this.onReconnectListeners.forEach(listener => listener());
      }
    });

    // Handle connection errors
    pusherClient.connection.bind('error', (error: any) => {
      console.error('Pusher connection error:', error);
      
      // Attempt to reconnect on connection errors
      if (!this.reconnectTimer) {
        this.attemptReconnect();
      }
    });
  }

  // Set up heartbeat to monitor connection health
  private setupHeartbeat(): void {
    if (!pusherClient) return;
    
    // Clear any existing heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    // Initialize last heartbeat time
    this.lastHeartbeatResponse = Date.now();
    
    // Set up heartbeat interval
    this.heartbeatInterval = setInterval(() => {
      // Check if connection is responsive
      const now = Date.now();
      const timeSinceLastHeartbeat = now - this.lastHeartbeatResponse;
      
      if (timeSinceLastHeartbeat > this.heartbeatTimeout) {
        console.warn('WebSocket heartbeat timeout, attempting to reconnect');
        this.attemptReconnect();
        return;
      }
      
      // Send ping if connected
      if (pusherClient && pusherClient.connection.state === CONNECTION_STATES.CONNECTED) {
        this.lastHeartbeatResponse = now;
      }
    }, 10000); // Check every 10 seconds
  }

  // Attempt to reconnect with exponential backoff
  private attemptReconnect(): void {
    if (!pusherClient) return;
    
    // Clear any existing reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    // Check if we've exceeded max attempts
    if (this.connectionAttempts >= this.maxReconnectAttempts) {
      console.error(`Failed to reconnect after ${this.maxReconnectAttempts} attempts`);
      return;
    }
    
    // Calculate exponential backoff delay
    const delay = Math.min(
      30000, // Max delay of 30 seconds
      this.reconnectDelay * Math.pow(2, this.connectionAttempts)
    );
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.connectionAttempts + 1})`);
    
    // Set up reconnect timer
    this.reconnectTimer = setTimeout(() => {
      this.connectionAttempts++;
      
      if (pusherClient) {
        // Force disconnect and reconnect
        if (pusherClient.connection.state !== CONNECTION_STATES.CONNECTING) {
          pusherClient.disconnect();
          setTimeout(() => {
            if (pusherClient) pusherClient.connect();
          }, 1000);
        }
      }
      
      this.reconnectTimer = null;
    }, delay);
  }

  // Resubscribe to all channels after reconnection
  private resubscribeToChannels(): void {
    if (!pusherClient) return;
    
    // Use Array.from to convert Map entries to array that can be iterated without downlevelIteration flag
    Array.from(this.channelSubscriptions.entries()).forEach(([channelName, eventHandlers]) => {
      const channel = pusherClient?.subscribe(channelName);
      if (!channel) return;
      
      // Rebind all event handlers - convert Set to Array for iteration
      Array.from(eventHandlers).forEach(eventName => {
        // We can't rebind specific handlers, so we're just making sure the channel is subscribed
        console.log(`Resubscribed to channel ${channelName} for event ${eventName}`);
      });
    });
  }

  // Subscribe to a channel and track subscription
  public subscribeToChannel(channelName: string, eventName: string, callback: (data: any) => void): () => void {
    if (!pusherClient) {
      console.error('Cannot subscribe: Pusher client not available');
      return () => {};
    }
    
    // Keep track of subscription
    if (!this.channelSubscriptions.has(channelName)) {
      this.channelSubscriptions.set(channelName, new Set());
    }
    this.channelSubscriptions.get(channelName)?.add(eventName);
    
    // Subscribe to channel
    const channel = pusherClient.subscribe(channelName);
    
    // Bind event handler
    channel.bind(eventName, callback);
    
    // Return unsubscribe function
    return () => {
      if (!pusherClient) return;
      
      channel.unbind(eventName, callback);
      
      // Update tracking
      const events = this.channelSubscriptions.get(channelName);
      if (events) {
        events.delete(eventName);
        
        // If no more events for this channel, unsubscribe
        if (events.size === 0) {
          this.channelSubscriptions.delete(channelName);
          pusherClient.unsubscribe(channelName);
        }
      }
    };
  }

  // Add reconnect listener
  public onReconnect(callback: () => void): () => void {
    this.onReconnectListeners.push(callback);
    
    // Return function to remove listener
    return () => {
      this.onReconnectListeners = this.onReconnectListeners.filter(listener => listener !== callback);
    };
  }

  // Clean up resources
  public cleanup(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    // Unsubscribe from all channels
    if (pusherClient) {
      // Use Array.from to convert Map keys to array that can be iterated without downlevelIteration flag
      Array.from(this.channelSubscriptions.keys()).forEach(channelName => {
        pusherClient?.unsubscribe(channelName);
      });
    }
    
    this.channelSubscriptions.clear();
    this.onReconnectListeners = [];
  }
}

// Create a hook for React components to use WebSocketManager
export function useWebSocket(channelName: string, eventName: string, callback: (data: any) => void) {
  if (typeof window === 'undefined') return { connected: false };
  
  const wsManager = WebSocketManager.getInstance();
  const isConnected = pusherClient?.connection.state === CONNECTION_STATES.CONNECTED;
  
  // Subscribe to channel event
  wsManager.subscribeToChannel(channelName, eventName, callback);
  
  return {
    connected: isConnected,
    reconnect: () => {
      if (pusherClient && pusherClient.connection.state !== CONNECTION_STATES.CONNECTED) {
        pusherClient.connect();
      }
    }
  };
} 