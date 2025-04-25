import { createServer } from 'http';
import next from 'next';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import Room from './src/models/Room.ts';

// Initialize Next.js app
const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();


async function deleteOldRooms() {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // Temps actuel - 1 heure
    const result = await Room.deleteMany({ createdAt: { $lt: oneHourAgo } });
    if (result.deletedCount > 0) {
      console.log(`Deleted ${result.deletedCount} old rooms.`);
    }
  } catch (error) {
    console.error('Error deleting old rooms:', error);
  }
}

app.prepare().then(async () => {
  try {
    // Connect to MongoDB
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Connected to MongoDB');
    }

    const server = createServer((req, res) => {
      handle(req, res); // Let Next.js handle routing
    });

    // Initialize Socket.IO on top of the Next.js server
    const io = new Server(server);

    // Manage socket connections
    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Handle UUID requests
      socket.on('request_uuid', () => {
        const sessionID = uuidv4();
        socket.emit('assign_uuid', sessionID);
      });

      socket.on('save_content', (data) => {
        console.log(`Saving content for ${socket.id}:`, data);
        // Handle saving content logic here
      });

      socket.on('disconnect', (reason) => {
        console.log(`User disconnected: ${socket.id}, Reason: ${reason}`);
      });
    });

    // Set up periodic deletion of old rooms
    setInterval(deleteOldRooms, 60 * 60 * 1000);

    server.listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('Shutting down server...');
      process.exit(0);
    });
  } catch (error) {
    console.error('Error during server initialization:', error);
    process.exit(1);
  }
});