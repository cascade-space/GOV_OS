import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/auth.store';
import { useNotificationStore } from '../store/notification.store';

export function useRealtime() {
  const { accessToken, tenant, user } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!accessToken || !tenant || !user) return;

    // Connect to the Socket.IO gateway via Vite Proxy (/socket.io) or directly to the Realtime microservice port
    // Vite proxy handles /socket.io -> Nginx -> govos-realtime
    const socket = io('/', {
      path: '/socket.io',
      auth: { token: accessToken },
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('Realtime socket connected!');
      // RealtimeEngineer microservice should automatically join tenant/user rooms upon validating the JWT.
    });

    // Listen for new notifications
    socket.on('notification:new', (payload: any) => {
      addNotification({
        id: crypto.randomUUID(),
        title: payload.title || 'New Notification',
        message: payload.message || 'You have a new update.',
        type: payload.type || 'info',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    });

    // Listen for SLA breaches
    socket.on('sla:breach', (payload: any) => {
      addNotification({
        id: crypto.randomUUID(),
        title: 'SLA Breach Alert',
        message: `Complaint ${payload.complaintNumber} has breached SLA.`,
        type: 'error',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [accessToken, tenant, user, addNotification]);

  return socketRef.current;
}
