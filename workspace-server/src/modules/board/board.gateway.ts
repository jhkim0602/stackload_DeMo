import { Server, Socket } from 'socket.io';

export const setupBoardGateway = (io: Server) => {
  io.on('connection', (socket: Socket) => {

    // Draw update
    socket.on('board:update', (payload: { roomId: string; elements: any[] }) => {
       // Broadcast to everyone else in the room
       socket.to(payload.roomId).emit('board:update', {
         elements: payload.elements
       });
    });

    socket.on('board:join', ({ roomId }) => {
        socket.join(roomId);
    });
  });
};
