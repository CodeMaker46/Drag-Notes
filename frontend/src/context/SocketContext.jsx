import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

const SocketContext = createContext({
  socket: null,
  isConnected: false
});

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    let newSocket = null;

    const initSocket = () => {
      if (!user) return null;

      const socket = io(SOCKET_URL, {
        auth: {
          token: localStorage.getItem('token')
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000
      });

      socket.on('connect', () => {
        console.log('Socket connected successfully');
        setIsConnected(true);
        if (user.course && user.branch) {
          socket.emit('join_room', {
            course: user.course,
            branch: user.branch
          });
        }
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
        setIsConnected(false);
      });

      socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setIsConnected(false);
      });

      socket.on('reconnect', (attemptNumber) => {
        console.log('Socket reconnected after', attemptNumber, 'attempts');
        setIsConnected(true);
      });

      socket.on('reconnect_error', (error) => {
        console.error('Socket reconnection error:', error.message);
        setIsConnected(false);
      });

      return socket;
    };

    if (user && !socket) {
      console.log('Initializing socket connection...');
      newSocket = initSocket();
      if (newSocket) {
        setSocket(newSocket);
      }
    }

    return () => {
      if (newSocket) {
        console.log('Cleaning up socket connection');
        newSocket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, [user]);

  const contextValue = {
    socket,
    isConnected
  };

  return (
    <SocketContext.Provider value={contextValue}>
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
