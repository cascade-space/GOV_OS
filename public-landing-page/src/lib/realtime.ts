import { io, Socket } from 'socket.io-client';

const getRealtimeUrl = () => {
  const raw = process.env.NEXT_PUBLIC_REALTIME_URL || 'http://127.0.0.1:3001';
  return raw.replace('localhost:3001', '127.0.0.1:3001');
};
const REALTIME_URL = getRealtimeUrl();

let socketInstance: Socket | null = null;

export function getRealtimeSocket(token?: string): Socket {
  if (!socketInstance) {
    socketInstance = io(REALTIME_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 10000,
      auth: token ? { token: `Bearer ${token}` } : undefined,
    });

    socketInstance.on('connect', () => {
      console.log('[Realtime] Socket connected to', REALTIME_URL);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('[Realtime] Socket disconnected:', reason);
    });
  }

  return socketInstance;
}

export function subscribeToComplaint(complaintNumber: string, onUpdate: (data: any) => void) {
  const socket = getRealtimeSocket();

  const join = () => {
    socket.emit('join:complaint', { complaintNumber });
    console.log(`[Realtime] Joined complaint room: complaint:${complaintNumber}`);
  };

  if (socket.connected) {
    join();
  } else {
    socket.once('connect', join);
  }

  const handler = (data: any) => {
    if (data?.complaintNumber === complaintNumber || data?.id === complaintNumber) {
      onUpdate(data);
    }
  };

  socket.on('complaint:status_changed', handler);
  socket.on('complaint:rework_requested', handler);

  return () => {
    socket.off('complaint:status_changed', handler);
    socket.off('complaint:rework_requested', handler);
  };
}
