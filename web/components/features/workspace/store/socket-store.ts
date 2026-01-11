import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface SocketStore {
  socket: Socket | null;
  isConnected: boolean;

  // Chat
  connectSocket: (url: string, userId: string, projectId: string) => void;
  disconnectSocket: () => void;
  sendMessage: (channelId: string, content: string, senderId: string) => void;
}

export const useSocketStore = create<SocketStore>((set, get) => ({
  socket: null,
  isConnected: false,

  connectSocket: (url, userId, projectId) => {
    if (get().socket) return;

    // console.log(`Connecting to socket at ${url} for project ${projectId}`);
    const socket = io(url, {
        path: '/socket.io',
        transports: ['websocket'],
    });

    socket.on('connect', () => {
    //   console.log('Socket connected:', socket.id);
      set({ isConnected: true });

      // Join Project Room & Identity
      socket.emit('join', { userId, projectId });
    });

    socket.on('disconnect', () => {
    //   console.log('Socket disconnected');
      set({ isConnected: false });
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  sendMessage: (channelId, content, senderId) => {
    const socket = get().socket;
    if (socket) {
      socket.emit('chat:message', { channelId, content, senderId });
    }
  },
}));
