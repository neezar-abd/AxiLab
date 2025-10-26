'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  joinPracticum: (practicumId: string) => void;
  leavePracticum: (practicumId: string) => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback?: (...args: any[]) => void) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.warn('[Socket] No authentication token found');
      return;
    }

    // Use SOCKET_URL if available, fallback to API_URL without /api suffix
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 
                      process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 
                      'http://localhost:5000';
    
    console.log('[Socket] Connecting to:', socketUrl);

    // Connect to Socket.io server
    const socketInstance = io(socketUrl, {
      path: '/socket.io',
      auth: {
        token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      autoConnect: true,
      forceNew: false,
      upgrade: true
    });

    // Connection event handlers
    socketInstance.on('connect', () => {
      console.log('✅ [Socket] Connected to server:', socketInstance.id);
      setConnected(true);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('❌ [Socket] Disconnected:', reason);
      setConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('❌ [Socket] Connection error:', error.message);
      console.error('[Socket] Error details:', {
        message: error.message,
        description: (error as any).description,
        context: (error as any).context
      });
      setConnected(false);
      
      // If authentication error, clear token
      if (error.message.includes('token') || error.message.includes('Authentication')) {
        console.warn('[Socket] Authentication error, token may be invalid');
      }
    });

    socketInstance.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 [Socket] Reconnection attempt ${attemptNumber}`);
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log(`✅ [Socket] Reconnected after ${attemptNumber} attempts`);
      setConnected(true);
    });

    socketInstance.on('reconnect_failed', () => {
      console.error('❌ [Socket] Reconnection failed');
      setConnected(false);
    });

    // Handle server errors
    socketInstance.on('error', (error: any) => {
      console.error('⚠️  [Socket] Server error:', error);
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      console.log('[Socket] Disconnecting...');
      socketInstance.disconnect();
    };
  }, []);

  const joinPracticum = useCallback((practicumId: string) => {
    if (!socket) {
      console.warn('[Socket] Socket not initialized');
      return;
    }

    console.log(`[Socket] Joining practicum room: ${practicumId}`);
    socket.emit('join-practicum', practicumId);

    // Listen for confirmation
    socket.once('joined-practicum', (data) => {
      console.log(`✅ [Socket] Joined practicum: ${data.practicumId}`);
    });
  }, [socket]);

  const leavePracticum = useCallback((practicumId: string) => {
    if (!socket) return;

    console.log(`[Socket] Leaving practicum room: ${practicumId}`);
    socket.emit('leave-practicum', practicumId);
  }, [socket]);

  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    if (!socket) return;
    
    socket.on(event, callback);
  }, [socket]);

  const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
    if (!socket) return;
    
    if (callback) {
      socket.off(event, callback);
    } else {
      socket.off(event);
    }
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, connected, joinPracticum, leavePracticum, on, off }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  
  return context;
}
