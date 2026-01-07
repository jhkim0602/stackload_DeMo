# Workspace Server Handover & Architecture Guide

## 1. Project Overview
This `workspace-server` is a dedicated Node.js server for handling real-time collaboration features of the StackLoad platform. It separates these I/O-bound concerns from the CPU-bound AI backend.

### Core Responsibilities
- **Chat**: Real-time messaging, room management (Socket.io).
- **Whiteboard**: Real-time collaborative drawing, state synchronization (Yjs + Hocuspocus).
- **Presence**: User online status, typing indicators.
- **Persistence**: Ownership of collaboration data (saving to DB).

## 2. Directory Structure

The project follows a modular structure to ensure separation of concerns.

```
workspace-server/
├── src/
│   ├── config/              # Configuration (Environment variables, Constants)
│   │   └── env.ts
│   ├── modules/             # Feature Modules
│   │   ├── auth/            # Authentication Logic
│   │   │   ├── auth.middleware.ts  # JWT Verification
│   │   │   └── types.ts
│   │   ├── chat/            # Chat Module (Socket.io)
│   │   │   ├── chat.gateway.ts     # Socket Event Handlers
│   │   │   ├── chat.service.ts     # Business Logic
│   │   │   └── chat.types.ts
│   │   └── whiteboard/      # Whiteboard Module (Yjs/Hocuspocus)
│   │       ├── whiteboard.server.ts # Hocuspocus Server Setup
│   │       └── whiteboard.hook.ts   # Persistence Hooks
│   ├── common/              # Shared Utilities
│   │   ├── logger.ts
│   │   └── types.ts
│   └── index.ts             # Application Entry Point
├── package.json
├── tsconfig.json
└── HANDOVER.md              # This file
```

## 3. Technology Stack Decisions (Immutable)
- **Runtime**: Node.js (v20+ recommended)
- **Language**: TypeScript
- **Chat Engine**: `socket.io` (v4+)
- **Whiteboard Engine**: `@hocuspocus/server` + `yjs`
- **Validation**: `zod`

## 4. Implementation Steps (Next Actions)

### Step 1: Dependency Installation
Run the following in `workspace-server/`:
```bash
npm init -y
npm install socket.io @hocuspocus/server yjs zod dotenv winston
npm install -D typescript @types/node @types/socket.io ts-node nodemon
```

### Step 2: Auth Middleware Implementation (`src/modules/auth/`)
- Implement `validateToken(token: string)` function.
- It must verify the JWT issued by the Frontend/Supabase.
- **Critical**: It must NOT start its own session management; purely verify signatures.

### Step 3: Chat Gateway (`src/modules/chat/`)
- Initialize `Socket.io` server.
- Implement basic events: `join_room`, `send_message`, `typing`.
- Ensure `room_id` aligns with the existing Group IDs from the AI server.

### Step 4: Whiteboard Server (`src/modules/whiteboard/`)
- Configure `Hocuspocus` server.
- Implement `onStoreDocument` hook to save Yjs updates to the database (or a file for MVP).

### Step 5: Entry Point (`src/index.ts`)
- Combine `Socket.io` (Chat) and `Hocuspocus` (Whiteboard) into a single executable or run them on separate ports/paths.
- Recommended:
    - Chat: `port 4000` (path: `/socket.io`)
    - Whiteboard: `port 4001` (ws path: `/collaboration`)

## 5. Migration Notes
- **AI Server Cleanup**: Once this server is live, remove `draw-update` handlers from `ai/src/websocket_handler.py`.
- **Frontend Update**: Update `web/components/features/workspace/detail/idea-board.tsx` to connect to this new server URL.
