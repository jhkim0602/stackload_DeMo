import { Server, Socket } from 'socket.io';

export const setupChatGateway = (io: Server) => {
  io.on('connection', (socket: Socket) => {

    // Handle sending messages
    socket.on('chat:message', (payload: { channelId: string; content: string; senderId: string; type: string }) => {
      // In a real app, save to DB here
      console.log(`[Chat] Message in ${payload.channelId}: ${payload.content}`);

      // Broadcast to everyone in the project (simulated by broadcasting to all for now or specific room if joined)
      // Assuming clients joined a room named after the project or channel.
      // For simplicity, we broadcast to the client's connected project room if we had the context,
      // but here we trust the client logic to filter or room logic.
      // Better: io.to(payload.channelId).emit(...) if we joined channel rooms.
      // Let's assume we join project rooms. We will broadcast to the project room.
      // But we need to know WHICH project this socket belongs to.

      // Since we don't have easy access to the `connectedUsers` map here without exporting it or passing state,
      // we'll just emit to everyone for this demo or rely on the client to filter.
      // IMPROVEMENT: Client joins `channelId` room.

      io.emit('chat:message', {
        ...payload,
        id: `m-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    });

    // Handle typing indicators
    socket.on('chat:typing', (payload: { channelId: string; userId: string; isTyping: boolean }) => {
      socket.broadcast.emit('chat:typing', payload);
    });
  });
};
