import { createServer } from 'http';
import app from "./app";
import { prisma } from "./config/db";
import { initializeSocket } from "./config/socketConfig";
import { setSocketIO } from "./config/socketHandlers";
import './jobs/trustJob'
import './jobs/moderationJob'

// Schedule daily decay at 2 AM
import cron from 'node-cron'
import { trustQueue } from './jobs/queue'

const port = process.env.PORT;

// Create HTTP server
const httpServer = createServer(app);


cron.schedule('0 2 * * *', async () => {
  console.log('⏰ Scheduling daily trust decay job...')
  await trustQueue.add('decay-all', {}, { attempts: 2 })
})

// Initialize Socket.IO
const io = initializeSocket(httpServer);
setSocketIO(io);

httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`WebSocket server initialized`);
});
