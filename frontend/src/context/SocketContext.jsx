import React, { createContext, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const socketURL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    const socket = io(socketURL);

    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.on('NEW_VIOLATION', (violation) => {
      if (user?.role === 'ADMIN' || (user?.role === 'STATION' && user?.station_id === violation.station_id)) {
        toast.error(`🚨 New Violation Detected: ${violation.station_id}`, {
          style: {
            background: '#450a0a', 
            color: '#fecaca', 
            border: '1px solid #7f1d1d',
          },
          duration: 6000,
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{}}>
      {children}
    </SocketContext.Provider>
  );
};
