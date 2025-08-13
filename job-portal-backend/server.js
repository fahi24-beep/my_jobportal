import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';

import recruiterRoutes from './routes/recruiterRoutes.js';

import jobRoutes from './routes/jobRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

// Import the cron starter
import { startDeadlineNotificationCron } from './utils/notificationScheduler.js';
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/jobportal')
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.log('MongoDB connection error:', err));


// Create HTTP server and Socket.io server
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' } // adjust to your frontend URL in production
});

const connectedUsers = new Map();

// START THE CRON JOB HERE:
startDeadlineNotificationCron(io, connectedUsers);

io.on('connection', (socket) => {
  const userId = socket.handshake.auth?.userId;
  if (!userId) {
    console.log('User connected without userId, disconnecting...');
    socket.disconnect();
    return;
  }
  connectedUsers.set(userId, socket.id);
  console.log(`User connected: ${userId}`);

  socket.on('disconnect', () => {
    connectedUsers.delete(userId);
    console.log(`User disconnected: ${userId}`);
  });
});

// Make io and connectedUsers accessible in routes/controllers
app.set('io', io);
app.set('connectedUsers', connectedUsers);

// Routes
app.use('/api/recruiters', recruiterRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Job Portal API is running!',
    timestamp: new Date().toISOString(),
    port: 1485
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = 1485;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

