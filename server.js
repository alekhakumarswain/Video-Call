const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('join-room', (roomId) => {
    console.log(`User joined room: ${roomId}`);
    socket.join(roomId);
    socket.to(roomId).emit('user-connected');
  });

  socket.on('offer', ({ offer, room }) => {
    console.log(`Offer received for room: ${room}`);
    socket.to(room).emit('offer', offer);
  });

  socket.on('answer', ({ answer, room }) => {
    console.log(`Answer received for room: ${room}`);
    socket.to(room).emit('answer', answer);
  });

  socket.on('ice-candidate', ({ candidate, room }) => {
    console.log(`ICE candidate received for room: ${room}`);
    socket.to(room).emit('ice-candidate', candidate);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});