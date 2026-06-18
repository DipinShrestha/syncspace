// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

// Routes
const authRoutes = require('./routes/authRoutes');
const workspaceRoutes = require('./routes/workspaceRoutes');
const boardRoutes = require('./routes/boardRoutes');
const cardRoutes = require('./routes/cardRoutes');        // FIX: was missing – caused all /api/cards/* to 404
const documentRoutes = require('./routes/documentRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const uploadRoute = require('./routes/uploadRoute');      // NEW: file upload endpoint

// Socket handlers
const chatSocket = require('./sockets/chatSocket');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5500;

// ---------- Middleware ----------
app.use(express.json());
app.use(cors());

// Serve uploaded files as static assets  →  GET /uploads/<filename>
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------- MongoDB Connection ----------
mongoose.connect(process.env.MONGO_URI, {
  autoSelectFamily: false,
  serverSelectionTimeoutMS: 30000,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});

// ---------- API Routes ----------
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/cards', cardRoutes);          // FIX: added – frontend calls PUT/DELETE/PATCH /api/cards/:id
app.use('/api/documents', documentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/upload', uploadRoute);        // POST /api/upload

app.get('/', (_req, res) => {
  res.send('SyncSpace API is running');
});

// ---------- Global Error Handler ----------
app.use((err, _req, res, _next) => {
  console.error('❌ Global error:', err.stack);
  res.status(500).json({ 
    message: err.message,
    // stack: err.stack  // optional, remove in production
  });
});

// ---------- HTTP & Socket.io ----------
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
chatSocket(io);

// ---------- Start Server ----------
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});