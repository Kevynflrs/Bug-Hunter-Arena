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

      socket.on('new_question', ({ question, roomId }) => {
        // Diffuser la nouvelle question à tous les joueurs de la room
        io.to(roomId).emit('question_updated', question);
      });

      // Handle room joining
      socket.on('join_room', async (roomId, name, sessionID, team) => { // Add async here
        socket.join(roomId);

        socket.data.user = {
          sessionID,
          name,
          team,
        };

        const socketsInRoom = await io.in(roomId).fetchSockets();
        const playersInRoom = socketsInRoom.map((s) => s.data?.user);

        // Notify the user that they have joined the room
        socket.emit('room_joined', playersInRoom);
        // Notify other users in the room that a new user has joined
        socket.to(roomId).emit('user_joined', { name, sessionID, team });
      });
 
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

      socket.on('start_game', (roomId, settings) => {
        console.log('Game starting in room:', roomId, 'with settings:', settings);
        io.to(roomId).emit('game_starting', settings);
      });

      socket.on('change_question', ({ roomId, settings }) => {
        io.to(roomId).emit('change_question', { settings });
      });

      socket.on('sync_timer', ({ roomId, timeLeft }) => {
        socket.to(roomId).emit('sync_timer', timeLeft);
      });

      socket.on('correct_answer', ({ roomId, team }) => {
        io.to(roomId).emit('update_score', { team });
      });

      socket.on('return_to_room', ({ roomId, team }) => {
        socket.join(roomId);
        socket.data.team = team;
        
        // Notifier les autres joueurs du retour
        socket.to(roomId).emit('user_joined', {
          name: socket.data.user?.name,
          team: team,
          sessionID: socket.data.user?.sessionID
        });
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