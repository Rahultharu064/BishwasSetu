import { io, type Socket } from "socket.io-client";
import { API_BASE } from "./api";

// The API client talks to `${origin}/api/v1`; Socket.IO attaches to the same
// HTTP server but at its own path, so it connects to the bare origin.
const SOCKET_ORIGIN = API_BASE.replace(/\/api\/v1\/?$/, "");

let socket: Socket | null = null;

/** Opens (or reuses) the single shared socket connection for this tab. */
export function connectSocket(token: string): Socket {
  if (socket?.connected && socket.auth && (socket.auth as { token?: string }).token === token) {
    return socket;
  }
  if (socket) socket.disconnect();

  socket = io(SOCKET_ORIGIN, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
  });

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

export function getSocket(): Socket | null {
  return socket;
}
