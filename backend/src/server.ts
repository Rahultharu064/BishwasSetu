import { createServer } from 'http';
import app from "./app.ts";
import prismaClient from "./config/db.ts";
import { initializeSocket } from "./config/socketConfig.ts";
import { setSocketIO } from "./config/socketHandlers.ts";

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
