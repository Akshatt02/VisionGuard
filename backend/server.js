require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const violationRoutes = require('./routes/violationRoutes');

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

// Enable CORS
app.use(cors());
app.use(express.json());

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for Netlify frontend
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  }
});

io.on('connection', (socket) => {
  console.log(`Socket Connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`Socket Disconnected: ${socket.id}`);
  });

  socket.on('STREAM_FRAME', (data) => {
    socket.broadcast.emit('LIVE_FRAME', data);
  });
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

const authRoutes = require('./routes/authRoutes');
const stationRoutes = require('./routes/stationRoutes');

// Mount routes
app.use('/api/violations', violationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/stations', stationRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('VisionGuard API is running...');
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
