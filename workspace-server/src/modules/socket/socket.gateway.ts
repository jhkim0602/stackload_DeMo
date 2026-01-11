import { Server, Socket } from 'socket.io';
import { setupChatGateway } from '../chat/chat.gateway';
// import { setupHuddleGateway } from '../huddle/huddle.gateway'; // Removed
import { setupBoardGateway } from '../board/board.gateway';

interface ConnectedUser {
  socketId: string;
  userId: string;
  projectId: string;
  online: boolean;
}

// In-memory store for connected users (for demo purposes)
export const connectedUsers = new Map<string, ConnectedUser>();

export const setupSocketGateway = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Handle initial join/auth
    socket.on('join', ({ userId, projectId }) => {
      console.log(`User ${userId} joined project ${projectId}`);

      connectedUsers.set(socket.id, {
        socketId: socket.id,
        userId,
        projectId,
        online: true
      });

      // Join project room
      socket.join(projectId);

      // Broadcast presence update
      io.to(projectId).emit('presence:update', {
        userId,
        status: 'online'
      });
    });

    socket.on('disconnect', () => {
      const user = connectedUsers.get(socket.id);
      if (user) {
        console.log(`User ${user.userId} disconnected`);
        io.to(user.projectId).emit('presence:update', {
          userId: user.userId,
          status: 'offline'
        });
        connectedUsers.delete(socket.id);
      }
    });
  });

  // Setup functional namespaces/modules
  setupChatGateway(io);
  // setupHuddleGateway(io); // Removed
  setupBoardGateway(io);
};
