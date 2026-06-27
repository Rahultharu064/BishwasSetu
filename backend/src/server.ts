import { createServer } from 'http';
import app from "./app";
import { prisma } from "./config/db";
import { initializeSocket } from "./config/socketConfig";
import { setSocketIO } from "./config/socketHandlers";

const port = process.env.PORT;

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
const io = initializeSocket(httpServer);
setSocketIO(io);

httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`WebSocket server initialized`);
});
