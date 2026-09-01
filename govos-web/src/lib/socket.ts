import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/auth.store';

let socket: Socket | null = null;

export const initializeSocket = () => {
  if (socket) return socket;

  const token = useAuthStore.getState().accessToken;
  if (!token) return null;

  socket = io('/', {
    auth: {
      token: `Bearer ${token}`
    },
    path: '/socket.io'
  });

  socket.on('connect', () => {
    console.log('Connected to Realtime Gateway');
    // Force join tenant room immediately
    socket?.emit('join:tenant', (response: any) => {
      console.log('Joined tenant rooms:', response);
    });
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from Realtime Gateway');
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
