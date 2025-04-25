import { createServer } from 'http';
import next from 'next';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid'; // Import UUID generator

// Initialize Next.js app
const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
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

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
