import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocket = (token: string): Socket => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
    auth: {
      token,
    },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket?.id);
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinPracticum = (practicumId: string) => {
  if (socket) {
    socket.emit('join-practicum', practicumId);
  }
};

export const leavePracticum = (practicumId: string) => {
  if (socket) {
    socket.emit('leave-practicum', practicumId);
  }
};

export const joinSubmission = (submissionId: string) => {
  if (socket) {
    socket.emit('join-submission', submissionId);
  }
};

export const leaveSubmission = (submissionId: string) => {
  if (socket) {
    socket.emit('leave-submission', submissionId);
  }
};
