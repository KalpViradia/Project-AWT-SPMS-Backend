# 🚀 Studionex Real-Time Backend

This is the real-time communication engine for **Studionex**, powered by Socket.IO. It handles instant messaging, notifications, and live activity updates across the platform using a secure event-driven architecture.

## ⚡ Features

- **Live Discussion & Announcements** – Real-time message delivery for project groups across 2 WebSocket room types (`user:{role}:{id}` and `group:{groupId}`).
- **Global Notifications** – Instant alerts across **16 real-time trigger workflows** including task assignments, meeting schedules, proposal reviews, and document status updates.
- **Typing Indicators** – Visual feedback when team members are active in a discussion, with debounced broadcasts.
- **HTTP Relay Endpoint** – Secret-authenticated POST endpoint allowing the Next.js server (Vercel) to broadcast events to connected clients without direct WebSocket access.
- **Health Monitoring** – Lightweight `GET /health` endpoint for deployment validation and uptime checks.

## 📊 Real-Time Backend Metrics

| Metric | Value |
|---|---|
| Socket.IO Event Types | 7 |
| Notification Workflows | 16 |
| WebSocket Room Types | 2 |
| Security | CORS + Shared Secret Authentication |
| Deployment | Render (Standalone Node.js) |

## 📡 Socket.IO Event Reference

| Event | Direction | Purpose |
|---|---|---|
| `join:user` | Client → Server | Join user notification room (`user:faculty:3`) |
| `join:group` | Client → Server | Join group discussion room (`group:12`) |
| `leave:group` | Client → Server | Leave group discussion room |
| `typing` | Client → Server | Emit typing status with userId and groupId |
| `typing:update` | Server → Client | Broadcast typing indicator to group room |
| `notification:new` | Server → Client | Push real-time notification to user room |
| `discussion:message` | Server → Client | Broadcast chat message to group room |

## 🛠️ Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Library**: [Socket.IO](https://socket.io/)
- **Communication**: WebSockets with Long Polling fallback

## ⚙️ Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=4000
FRONTEND_URL="http://localhost:3000"
SOCKET_EMIT_SECRET="your-secure-shared-secret"
```

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Server
```bash
# Production/Development
npm start
```

## 📡 API Reference

### Health Check
- **Endpoint**: `GET /health`
- **Response**: `{ "status": "ok" }`

### HTTP Relay (Internal)
Allows the server-side Next.js actions to emit socket events.
- **Endpoint**: `POST /emit`
- **Payload**:
  ```json
  {
    "secret": "SOCKET_EMIT_SECRET",
    "room": "group:123",
    "event": "message:new",
    "data": { ... }
  }
  ```

## 🔒 Security

- **CORS Protection**: Only allows connections from the specified `FRONTEND_URL` (production: `studionex-spms.vercel.app`).
- **Shared Secret**: The `/emit` endpoint is protected by a `SOCKET_EMIT_SECRET` key shared only between the backend and the Next.js server — prevents unauthorized event emission.
- **Preflight Handling**: Full CORS preflight (`OPTIONS`) support for cross-origin HTTP relay from Vercel serverless functions.

## 📁 Architecture

```
┌──────────────────────┐       POST /emit        ┌─────────────────────────┐
│  Next.js Server      │ ──────────────────────▶  │  This Socket.IO Server  │
│  (Vercel — SSR)      │  { secret, room, event } │  (Render — port 4000)   │
└──────────────────────┘                          └─────────────────────────┘
                                                            │
                                                  WebSocket ↕ connections
                                                            │
                                                  ┌─────────┴─────────┐
                                                  │  Browser Clients   │
                                                  │  (React frontend)  │
                                                  └───────────────────┘
```

- `socket-server.mjs` – Main entry point: HTTP server, CORS handler, Socket.IO event handlers, and `/emit` relay endpoint.
- `package.json` – Dependencies (`socket.io@4.8`) and startup script.

### Notification Workflow (16 trigger types)

Each notification from the Next.js server follows this path:
1. **Server Action** creates a `notification` DB record via Prisma
2. **Socket Emitter** sends `POST /emit` to this server with the target room and event data
3. **This server** broadcasts `notification:new` to the user's WebSocket room
4. **Browser client** receives the event and refreshes the notification bell UI

| # | Trigger | Recipients |
|---|---|---|
| 1 | Group created with guide | Faculty guide |
| 2 | Proposal approved | All group members |
| 3 | Proposal rejected | All group members |
| 4 | Report submitted | Faculty guide |
| 5 | Report reviewed (with marks) | All group members |
| 6 | Meeting scheduled | All group members |
| 7 | Guide assigned by student | Faculty guide |
| 8 | Guide assigned by admin | Faculty + all members |
| 9 | Member invited | Invited student |
| 10 | Invitation accepted | Group leader |
| 11 | Document uploaded | Faculty guide |
| 12 | Document status updated | All group members |
| 13 | Task assigned | Assigned student |
| 14 | Task reassigned | New assignee |
| 15 | Task moved to review/done | Faculty guide |
| 16 | Project details updated | Faculty guide |
