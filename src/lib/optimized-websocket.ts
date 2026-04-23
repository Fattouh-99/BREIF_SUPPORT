import { useEffect, useState, useRef, useCallback } from 'react';

// Configuration options for WebSocket connection
interface WebSocketOptions {
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  onOpen?: (event: Event) => void;
  onMessage?: (event: MessageEvent) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
}

// Hook return values
interface UseWebSocketReturn {
  socket: WebSocket | null;
  isConnected: boolean;
  reconnectAttempts: number;
  lastMessage: any;
  sendMessage: (data: any) => void;
  connect: () => void;
  disconnect: () => void;
}

/**
 * Custom hook for optimized WebSocket connections with reconnection,
 * heartbeat, and message handling
 */
export const useOptimizedWebSocket = (
  url: string,
  options: WebSocketOptions = {}
): UseWebSocketReturn => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [reconnectAttempts, setReconnectAttempts] = useState<number>(0);
  const [lastMessage, setLastMessage] = useState<any>(null);
  
  // Configuration with defaults
  const config = {
    reconnectInterval: options.reconnectInterval || 3000,
    maxReconnectAttempts: options.maxReconnectAttempts || 5,
    heartbeatInterval: options.heartbeatInterval || 30000,
    onOpen: options.onOpen,
    onMessage: options.onMessage,
    onClose: options.onClose,
    onError: options.onError,
  };
  
  // Use refs to avoid stale closures in callbacks
  const socketRef = useRef<WebSocket | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const attemptsRef = useRef<number>(0);
  
  // Function to create a new WebSocket connection
  const connect = useCallback(() => {
    // Close existing connection if any
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.close();
    }
    
    try {
      const newSocket = new WebSocket(url);
      
      newSocket.onopen = (event) => {
        setIsConnected(true);
        attemptsRef.current = 0;
        setReconnectAttempts(0);
        
        // Start heartbeat
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }
        
        heartbeatIntervalRef.current = setInterval(() => {
          if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type: 'heartbeat' }));
          }
        }, config.heartbeatInterval);
        
        if (config.onOpen) config.onOpen(event);
      };
      
      newSocket.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data);
          setLastMessage(parsedData);
        } catch (e) {
          setLastMessage(event.data);
        }
        
        if (config.onMessage) config.onMessage(event);
      };
      
      newSocket.onclose = (event) => {
        setIsConnected(false);
        
        // Clear heartbeat
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }
        
        // Attempt reconnection if not intentionally closed
        if (!event.wasClean && attemptsRef.current < config.maxReconnectAttempts) {
          attemptsRef.current += 1;
          setReconnectAttempts(attemptsRef.current);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, config.reconnectInterval);
        }
        
        if (config.onClose) config.onClose(event);
      };
      
      newSocket.onerror = (event) => {
        if (config.onError) config.onError(event);
      };
      
      socketRef.current = newSocket;
      setSocket(newSocket);
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  }, [url, config]);
  
  // Function to disconnect WebSocket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close(1000, 'User initiated disconnect');
    }
    
    // Clean up timers
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    setIsConnected(false);
  }, []);
  
  // Function to send messages
  const sendMessage = useCallback((data: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      socketRef.current.send(message);
    } else {
      console.error('WebSocket is not connected');
    }
  }, []);
  
  // Set up connection on mount, clean up on unmount
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);
  
  return {
    socket,
    isConnected,
    reconnectAttempts,
    lastMessage,
    sendMessage,
    connect,
    disconnect
  };
}; 