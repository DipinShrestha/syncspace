const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// Routes
const authRoutes = require('./routes/authRoutes');
const workspaceRoutes = require('./routes/workspaceRoutes');
const boardRoutes = require('./routes/boardRoutes');
const documentRoutes = require('./routes/documentRoutes');

// Socket handler
const chatSocket = require('./sockets/chatSocket');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5500;

// Middleware
app.use(express.json());
app.use(cors()); // Allow frontend to connect

// MongoDB connection
// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  autoSelectFamily: false,
  serverSelectionTimeoutMS: 30000,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});
// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/documents', documentRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('SyncSpace Backend is running!');
});

// Global error handler (must be before server start but after routes)
app.use((err, req, res, next) => {
  console.error('GLOBAL ERROR:', err.stack);
  res.status(500).json({ message: err.message, stack: err.stack });
});

// Create HTTP server and attach Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins (update for production)
    methods: ['GET', 'POST'],
  },
});

// Initialize Socket.io handlers
chatSocket(io);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});