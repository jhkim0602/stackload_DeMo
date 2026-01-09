import { Server, Socket } from 'socket.io';

interface HuddleParticipant {
  socketId: string;
  userId: string;
  name: string;
  micOn: boolean;
  videoOn: boolean;
}

const huddleParticipants = new Map<string, HuddleParticipant>(); // roomId -> List? No, socketId -> Data

// We need to track which room users are in.
const roomParticipants = new Map<string, Set<string>>(); // roomId -> Set<socketId>

export const setupHuddleGateway = (io: Server) => {
  io.on('connection', (socket: Socket) => {

    socket.on('huddle:join', ({ roomId, user }) => {
      console.log(`[Huddle] User ${user.name} joining ${roomId}`);

      const participant: HuddleParticipant = {
        socketId: socket.id,
        userId: user.id,
        name: user.name,
        micOn: true,
        videoOn: true
      };

      huddleParticipants.set(socket.id, participant);

      if (!roomParticipants.has(roomId)) {
        roomParticipants.set(roomId, new Set());
      }
      roomParticipants.get(roomId)!.add(socket.id);

      socket.join(roomId);

      // Notify others in the room
      socket.to(roomId).emit('huddle:user-joined', participant);

      // Send list of existing participants to the new user
      const existingParticipants = Array.from(roomParticipants.get(roomId)!)
        .filter(id => id !== socket.id)
        .map(id => huddleParticipants.get(id));

      socket.emit('huddle:existing-participants', existingParticipants);
    });

    socket.on('huddle:leave', ({ roomId }) => {
      handleLeave(socket, io, roomId);
    });

    socket.on('disconnect', () => {
      // Find which room they were in (inefficient but works for demo)
      roomParticipants.forEach((participants, roomId) => {
        if (participants.has(socket.id)) {
          handleLeave(socket, io, roomId);
        }
      });
    });

    // Signaling
    socket.on('huddle:offer', (payload) => {
        io.to(payload.targetSocketId).emit('huddle:offer', {
            sdp: payload.sdp,
            senderSocketId: socket.id
        });
    });

    socket.on('huddle:answer', (payload) => {
        io.to(payload.targetSocketId).emit('huddle:answer', {
            sdp: payload.sdp,
            senderSocketId: socket.id
        });
    });

    socket.on('huddle:candidate', (payload) => {
        io.to(payload.targetSocketId).emit('huddle:candidate', {
            candidate: payload.candidate,
            senderSocketId: socket.id
        });
    });

    // Device state updates
    socket.on('huddle:update-state', ({ roomId, micOn, videoOn }) => {
        const participant = huddleParticipants.get(socket.id);
        if (participant) {
            participant.micOn = micOn;
            participant.videoOn = videoOn;
            socket.to(roomId).emit('huddle:user-updated', { socketId: socket.id, micOn, videoOn });
        }
    });

  });
};

function handleLeave(socket: Socket, io: Server, roomId: string) {
    if (roomParticipants.has(roomId)) {
        roomParticipants.get(roomId)!.delete(socket.id);
        if (roomParticipants.get(roomId)!.size === 0) {
            roomParticipants.delete(roomId);
        }
    }
    huddleParticipants.delete(socket.id);
    socket.leave(roomId);
    io.to(roomId).emit('huddle:user-left', { socketId: socket.id });
}
