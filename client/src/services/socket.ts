import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function initializeSocket(): Socket {
  if (!socket) {
    socket = io("http://localhost:3000", {
      transports: ["websocket"],
      withCredentials: true,
    });
  }

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

export function emitUserJoin(userId: number) {
  socket?.emit("user_join", userId);
}

export function emitMessage(
  senderId: number,
  receiverId: number,
  content: string
) {
  socket?.emit("send_message", {
    senderId,
    receiverId,
    content,
  });
}

export function emitTyping(senderId: number, receiverId: number) {
  socket?.emit("user_typing", {
    senderId,
    receiverId,
  });
}

export function emitStopTyping(senderId: number, receiverId: number) {
  socket?.emit("user_stop_typing", {
    senderId,
    receiverId,
  });
}

export function emitLogout(userId: number) {
  socket?.emit("user_logout", userId);
}

export function onReceiveMessage(
  callback: (data: {
    senderId: number;
    content: string;
    timestamp: string;
  }) => void
) {
  socket?.on("receive_message", callback);
}

export function onUserStatusChanged(
  callback: (data: {
    userId: number;
    isOnline: boolean;
  }) => void
) {
  socket?.on("user_status_changed", callback);
}

export function onUserTyping(
  callback: (data: {
    senderId: number;
  }) => void
) {
  socket?.on("user_typing", callback);
}

export function onUserStopTyping(
  callback: (data: {
    senderId: number;
  }) => void
) {
  socket?.on("user_stop_typing", callback);
}