# 🚀 Studionex Real-Time Backend

This is the real-time communication engine for **Studionex**, powered by Socket.IO. It handles instant messaging, notifications, and live activity updates across the platform.

## ⚡ Features

- **Live Discussion & Announcements** – Real-time message delivery for project groups.
- **Global Notifications** – Instant alerts for task assignments, meeting schedules, and status updates.
- **Typing Indicators** – Visual feedback when team members are active in a discussion.
- **HTTP Relay Endpoint** – Securely allows the main Next.js application to broadcast events to clients.
- **Health Monitoring** – Lightweight status endpoint for deployment validation.

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

- **CORS Protection**: Only allows connections from the specified `FRONTEND_URL`.
- **Shared Secret**: The `/emit` endpoint is protected by a secret key shared only between the backend and the frontend server.

## 📁 Architecture

- `socket-server.mjs` – Main entry point containing socket logic and HTTP server.
- `package.json` – Dependencies and scripts.
