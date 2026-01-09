import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { useWorkspaceStore } from './mock-data';

interface SocketStore {
  socket: Socket | null;
  isConnected: boolean;

  connect: (url: string, userId: string, projectId: string) => void;
  disconnect: () => void;
  sendMessage: (channelId: string, content: string, senderId: string, type?: string) => void;
  joinHuddle: (roomId: string, user: { id: string, name: string }) => void;
  leaveHuddle: (roomId: string) => void;
  updateHuddleState: (roomId: string, micOn: boolean, videoOn: boolean) => void;

  // WebRTC Signaling
  sendOffer: (targetSocketId: string, sdp: RTCSessionDescriptionInit) => void;
  sendAnswer: (targetSocketId: string, sdp: RTCSessionDescriptionInit) => void;
  sendCandidate: (targetSocketId: string, candidate: RTCIceCandidate) => void;
}

export const useSocketStore = create<SocketStore>((set, get) => ({
  socket: null,
  isConnected: false,

  connect: (url, userId, projectId) => {
    if (get().socket) return;

    const socket = io(url);

    socket.on('connect', () => {
      console.log('Socket Connected');
      set({ isConnected: true });
      socket.emit('join', { userId, projectId });
    });

    socket.on('disconnect', () => {
      console.log('Socket Disconnected');
      set({ isConnected: false });
    });

    // Handle Chat Messages
    socket.on('chat:message', (message) => {
       const workspaceStore = useWorkspaceStore.getState();
       // Avoid duplicates if we optimistically added it?
       // For now, let's assume server is truth and we append.
       // Filter out if ID already exists (if we did optimistic UI)
       // But workspaceStore.sendMessage does a local append.
       // We should separate local optimistic update vs server confirm.
       // For simple demo: We will use the workspaceStore's method to "Receive" it.
       // We need to slightly modify workspaceStore or just append manually here:

       // Using the existing sendMessage action in workspaceStore actually appends to local state.
       // But that action is meant for "User Sent".
       // Let's create specific incoming handler or just use the same store structure.

       useWorkspaceStore.setState(state => ({
           messages: [...state.messages, {
               id: message.id,
               channelId: message.channelId,
               content: message.content,
               senderId: message.senderId,
               type: message.type,
               timestamp: message.timestamp
           }]
       }));
    });

    set({ socket });
  },

  disconnect: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  sendMessage: (channelId, content, senderId, type = 'user') => {
    const socket = get().socket;
    if (socket) {
      socket.emit('chat:message', { channelId, content, senderId, type });
    }
  },

  joinHuddle: (roomId, user) => {
      const socket = get().socket;
      if (socket) {
          socket.emit('huddle:join', { roomId, user });
      }
  },

  leaveHuddle: (roomId) => {
      const socket = get().socket;
      if(socket) {
          socket.emit('huddle:leave', { roomId });
      }
  },

  updateHuddleState: (roomId, micOn, videoOn) => {
      const socket = get().socket;
      if(socket) {
          socket.emit('huddle:update-state', { roomId, micOn, videoOn });
      }
  },

  sendOffer: (targetSocketId, sdp) => {
      get().socket?.emit('huddle:offer', { targetSocketId, sdp });
  },

  sendAnswer: (targetSocketId, sdp) => {
      get().socket?.emit('huddle:answer', { targetSocketId, sdp });
  },

  sendCandidate: (targetSocketId, candidate) => {
      get().socket?.emit('huddle:candidate', { targetSocketId, candidate });
  }

}));
