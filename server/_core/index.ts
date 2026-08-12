import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { Server as SocketIOServer } from "socket.io";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { upsertUserStatus } from "../db";
import session from "express-session";
import passport from "./auth";
import cors from "cors";
function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

// Store active user connections for real-time updates
const userConnections = new Map<number, string[]>();

async function startServer() {
  const app = express();
  const server = createServer(app);
  app.use(
  cors({
    origin: [
      "https://pqc-messager.vercel.app",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);
  
  // Initialize Socket.io
  const io = new SocketIOServer(server, {
  cors: {
    origin: "https://pqc-messager.vercel.app",
    methods: ["GET", "POST"],
    credentials: true,
  },
  });

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.set("trust proxy", 1);

  app.set("trust proxy", 1);

  app.use(
    session({
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      proxy: true,
      cookie: {
        secure: true,
        httpOnly: true,
        sameSite: "lax",
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Socket.io event handlers
  io.on("connection", (socket) => {
    console.log(`[Socket.io] User connected: ${socket.id}`);

    // When a user joins, register their connection
    socket.on("user_join", async (userId: number) => {
      console.log(`[Socket.io] User ${userId} joined with socket ${socket.id}`);
      
      // Store the connection
      if (!userConnections.has(userId)) {
        userConnections.set(userId, []);
      }
      userConnections.get(userId)!.push(socket.id);
      
      // Update user status to online
      await upsertUserStatus(userId, true);
      
      // Broadcast user online status to all connected clients
      io.emit("user_status_changed", {
        userId,
        isOnline: true,
      });
      
      // Join a room named after the user ID for targeted messaging
      socket.join(`user_${userId}`);
    });

    // Handle incoming messages
    socket.on("send_message", async (data: { senderId: number; receiverId: number; content: string }) => {
      console.log(`[Socket.io] Message from ${data.senderId} to ${data.receiverId}: ${data.content}`);
      
      // Broadcast message to the receiver
      io.to(`user_${data.receiverId}`).emit("receive_message", {
        senderId: data.senderId,
        content: data.content,
        timestamp: new Date(),
      });
    });

    // Handle typing indicator
    socket.on("user_typing", (data: { senderId: number; receiverId: number }) => {
      console.log(`[Socket.io] ${data.senderId} is typing to ${data.receiverId}`);
      
      // Broadcast typing indicator to the receiver
      io.to(`user_${data.receiverId}`).emit("user_typing", {
        senderId: data.senderId,
      });
    });

    // Handle stop typing
    socket.on("user_stop_typing", (data: { senderId: number; receiverId: number }) => {
      console.log(`[Socket.io] ${data.senderId} stopped typing to ${data.receiverId}`);
      
      // Broadcast stop typing to the receiver
      io.to(`user_${data.receiverId}`).emit("user_stop_typing", {
        senderId: data.senderId,
      });
    });

    // Handle disconnection
    socket.on("disconnect", async () => {
      console.log(`[Socket.io] User disconnected: ${socket.id}`);
      
      // Find and remove the user from connections
      for (const [userId, socketIds] of Array.from(userConnections.entries())) {
        const index = socketIds.indexOf(socket.id);
        if (index > -1) {
          socketIds.splice(index, 1);
          
          // If no more connections for this user, mark as offline
          if (socketIds.length === 0) {
            userConnections.delete(userId);
            await upsertUserStatus(userId, false);
            
            // Broadcast user offline status
            io.emit("user_status_changed", {
              userId,
              isOnline: false,
            });
          }
          break;
        }
      }
    });

    // Handle explicit user logout
    socket.on("user_logout", async (userId: number) => {
      console.log(`[Socket.io] User ${userId} logged out`);
      
      // Remove all connections for this user
      userConnections.delete(userId);
      await upsertUserStatus(userId, false);
      
      // Broadcast user offline status
      io.emit("user_status_changed", {
        userId,
        isOnline: false,
      });
      
      socket.disconnect();
    });
  });

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
