
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({ 
  socket: null, 
  connected: false 
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // For development purposes, we'll use a mock server
    // In production, this would connect to your actual backend
    const socketConnection = io('https://virtual-lab-mock-server.glitch.me', {
      transports: ['websocket'],
      autoConnect: true,
    });

    socketConnection.on('connect', () => {
      console.log('Socket connected!');
      setConnected(true);
    });

    socketConnection.on('disconnect', () => {
      console.log('Socket disconnected!');
      setConnected(false);
    });

    socketConnection.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      // In a real app, you'd want to handle this error more gracefully
      // For now, we'll just use mock data
      setConnected(true); // Fake connection for demo purposes
    });

    setSocket(socketConnection);

    return () => {
      socketConnection.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
