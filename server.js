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
      socket.on('request_uuid', (connectionId) => {
        const sessionID = uuidv4();
        socket.emit('assign_uuid', sessionID);
        socket.join(connectionId);
        // let team = 'none';
        // socket.to(connectionId).emit('user_joined', {
        //   sessionID,
        //   name,
        //   team,
        //   // avatar: `https://api.dicebear.com/5.x/thumbs/svg?seed=${name}`,
        // });
      });

      // Handle room joining
      socket.on('join_room', async (roomId, name, sessionID) => {
        console.log(`User ${socket.id} joining room: ${roomId}`);
        socket.join(roomId);

        // Get all sockets in the room
        const socketsInRoom = await io.in(roomId).fetchSockets();
        const playersInRoom = socketsInRoom.map((s) => s.data?.name);

        // Notify the user that they have joined the room
        socket.emit('room_joined', playersInRoom);

        let team = 'none';
        // Notify other users in the room that a new user has joined
        socket.to(roomId).emit('user_joined', { name, sessionID, team });

        // Store the player's name in the socket's data for future reference
        socket.data.name = name;
      });

      // socket.on('join_room', async (roomId, name, sessionID) => {
      //   console.log(`User ${socket.id} joining room: ${roomId}`);
      //   socket.join(roomId);

      //   console.log(`User ${name} with session ID ${sessionID} joined room: ${roomId}`);

      //   // Notify the user that they have joined the room
      //   socket.emit('room_joined', roomId);

      //   // Notify other users in the room that a new user has joined
      //   socket.to(roomId).emit('user_joined', name, sessionID);

      //   // Handle team selection
      //   socket.on('choose_team', (team) => {
      //     if (team === 'red' || team === 'blue') {
      //       console.log(`User ${name} chose team: ${team} in room: ${roomId}`);

      //       // Notify all users in the room about the team choice
      //       io.to(roomId).emit('team_chosen', { sessionID: sessionID, team });
      //     } else {
      //       console.log(`Invalid team choice by user ${sessionID}: ${team}`);
      //       socket.emit('invalid_team', 'Please choose either "red" or "blue".');
      //     }
      //   });
      // });

      const teams = {
        red: new Set(),
        blue: new Set(),
        spectator: new Set(),
        admin: new Set(),
      };

      socket.on('join_team', ({ team, sessionID }) => {
        if (!['red', 'blue', 'spectator', 'admin'].includes(team)) {
          socket.emit('invalid_team', 'Invalid team selected.');
          return;
        }

        // Remove user from all other teams
        for (const t of Object.keys(teams)) {
          teams[t].delete(sessionID);
        }

        if (teams[team].size >= 5) {
          socket.emit('team_full', `The ${team} team is full.`);
          return;
        }

        // Add user to the selected team
        teams[team].add(sessionID);

        // Emit updated team list to all clients
        const allTeams = {};
        for (const t of Object.keys(teams)) {
          allTeams[t] = Array.from(teams[t]);
        }
        io.emit('team_update_full', allTeams);

        console.log(`User ${sessionID} joined team ${team}`);
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