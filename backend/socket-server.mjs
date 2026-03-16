import { createServer } from "http";
import { Server } from "socket.io";

const port = parseInt(process.env.PORT || "4000", 10);
const CORS_ORIGIN = process.env.FRONTEND_URL || "http://localhost:3000";
const EMIT_SECRET = process.env.SOCKET_EMIT_SECRET || "dev-secret";

const httpServer = createServer((req, res) => {
    // Health check
    if (req.method === "GET" && req.url === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok" }));
        return;
    }

    // HTTP relay endpoint — Vercel server actions POST here to emit events
    if (req.method === "POST" && req.url === "/emit") {
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", () => {
            try {
                const { secret, room, event, data } = JSON.parse(body);
                if (secret !== EMIT_SECRET) {
                    res.writeHead(401, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: "Unauthorized" }));
                    return;
                }
                io.to(room).emit(event, data);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ ok: true }));
            } catch (err) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Bad request" }));
            }
        });
        return;
    }

    res.writeHead(404);
    res.end();
});

const io = new Server(httpServer, {
    cors: {
        origin: CORS_ORIGIN,
        methods: ["GET", "POST"],
        credentials: true,
    },
});

io.on("connection", (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join user notification room: "user:student:5" or "user:faculty:3"
    socket.on("join:user", ({ userId, userRole }) => {
        const room = `user:${userRole}:${userId}`;
        socket.join(room);
        console.log(`[Socket.IO] ${socket.id} joined room ${room}`);
    });

    // Join group discussion room: "group:12"
    socket.on("join:group", ({ groupId }) => {
        const room = `group:${groupId}`;
        socket.join(room);
        console.log(`[Socket.IO] ${socket.id} joined room ${room}`);
    });

    // Leave group room
    socket.on("leave:group", ({ groupId }) => {
        const room = `group:${groupId}`;
        socket.leave(room);
    });

    // Typing indicators
    socket.on("typing", ({ groupId, userId, userName, isTyping }) => {
        const room = `group:${groupId}`;
        socket.to(room).emit("typing:update", { userId, userName, isTyping });
    });

    socket.on("disconnect", () => {
        console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
});

httpServer.listen(port, "0.0.0.0", () => {
    console.log(`> Socket.IO server ready on http://0.0.0.0:${port}`);
    console.log(`> Accepting connections from: ${CORS_ORIGIN}`);
});
